/**
 * POST /api/prospects/email-send  (admins only)   body: { campaignId }
 *
 * Sends the next small batch (at most 5) of an ACTIVE email campaign over SMTP, spaced a few
 * seconds apart, and never past the campaign's daily limit. The page calls it again for the next
 * batch while it stays open. Before every message it re-checks that the company is still
 * approved and that neither its address nor its number is in do-not-contact.
 *
 * Every message ends with the stop line and a one-click unsubscribe link, and carries the
 * List-Unsubscribe headers. Sent / failed is recorded per recipient, and the company becomes
 * "contacted".
 */
import { renderMessage } from "../../src/lib/prospects/campaigns.js";
import { BATCH_MAX, batchSize, dayStart, mustSkip } from "../../src/lib/prospects/sending.js";
import type { CompanyLite } from "../../src/lib/prospects/sending.js";
import { unsubscribeUrl, withFooter } from "../../src/lib/prospects/unsubscribe.js";
import { createSender, mailConfig, sendTimezone, siteUrl, sleep } from "../_lib/mail.js";
import { HttpError, body, handle, requireAdmin, rest, signingSecret } from "../_lib/server.js";

interface Campaign {
    id: string;
    channel: string;
    status: string;
    subject: string;
    message: string;
    stop_line: string;
    daily_limit: number;
}
interface Recipient {
    id: string;
    company_id: string | null;
    name: string;
    email: string;
}

const GAP_MS = 3000;
const q = (v: string) => encodeURIComponent(v);

export default handle(async (req, res) => {
    await requireAdmin(req);
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const cfg = mailConfig();
    if (!cfg) throw new HttpError(503, "صندوق البريد غير مضاف بعد في Vercel (SMTP_USER وSMTP_PASS).");

    const b = body(req) as { campaignId?: unknown } | null;
    const id = typeof b?.campaignId === "string" && /^[0-9a-f-]{36}$/i.test(b.campaignId) ? b.campaignId : "";
    if (!id) throw new HttpError(400, "حملة غير صالحة.");

    const [campaign] = await rest<Campaign[]>(`qawsan_campaigns?select=id,channel,status,subject,message,stop_line,daily_limit&id=eq.${id}`);
    if (!campaign || campaign.channel !== "email") throw new HttpError(404, "حملة الإيميل غير موجودة.");
    if (campaign.status !== "active") throw new HttpError(409, "الحملة ليست نشطة. استأنفها أولًا.");

    // today's count and what is left of the limit
    const start = dayStart(new Date(), sendTimezone());
    const sentToday = (await rest<{ id: string }[]>(`qawsan_campaign_recipients?select=id&campaign_id=eq.${id}&sent_at=gte.${q(start)}&limit=1000`)).length;
    const room = batchSize(sentToday, campaign.daily_limit, BATCH_MAX);
    const pendingAll = async () => (await rest<{ id: string }[]>(`qawsan_campaign_recipients?select=id&campaign_id=eq.${id}&status=eq.pending&limit=5000`)).length;

    if (room === 0) {
        res.status(200).json({ ok: true, sent: 0, failed: 0, skipped: 0, sentToday, limit: campaign.daily_limit, pending: await pendingAll(), stopped: "limit" });
        return;
    }

    const batch = await rest<Recipient[]>(`qawsan_campaign_recipients?select=id,company_id,name,email&campaign_id=eq.${id}&status=eq.pending&order=name&limit=${room}`);
    const companyIds = [...new Set(batch.map((r) => r.company_id).filter((x): x is string => !!x))];
    const companies = new Map<string, CompanyLite>();
    if (companyIds.length) {
        for (const c of await rest<(CompanyLite & { id: string })[]>(`qawsan_companies?select=id,status,emails,phone&id=in.(${companyIds.join(",")})`)) companies.set(c.id, c);
    }
    const values = new Set<string>();
    for (const r of batch) {
        values.add(r.email.toLowerCase());
        const c = r.company_id ? companies.get(r.company_id) : undefined;
        c?.emails.forEach((e) => values.add(e.toLowerCase()));
        if (c?.phone) values.add(c.phone.replace(/\D/g, "").replace(/^00/, ""));
    }
    const blocked = new Set<string>();
    if (values.size) {
        const list = [...values].map((v) => `"${v.replace(/"/g, "")}"`).join(",");
        for (const s of await rest<{ value: string }[]>(`qawsan_suppressions?select=value&value=in.(${q(list)})`)) blocked.add(s.value);
    }

    const mail = createSender(cfg);
    const secret = signingSecret();
    const site = siteUrl();
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    let stopped: "auth" | "" = "";

    for (let i = 0; i < batch.length; i++) {
        const r = batch[i];
        const company = r.company_id ? companies.get(r.company_id) : undefined;
        const skip = mustSkip(r.email, company, blocked);
        if (skip) {
            await rest(`qawsan_campaign_recipients?id=eq.${r.id}`, { method: "PATCH", body: { status: "skipped", error: skip } });
            skipped++;
            continue;
        }

        const seed = r.company_id ?? r.id;
        const url = unsubscribeUrl(site, secret, r.id);
        const result = await mail.send({
            to: r.email,
            subject: renderMessage(campaign.subject, r.name, "", `${seed}:s`),
            text: withFooter(renderMessage(campaign.message, r.name, campaign.stop_line, seed), url),
            unsubscribe: url,
        });

        if (result.ok) {
            const now = new Date().toISOString();
            await rest(`qawsan_campaign_recipients?id=eq.${r.id}`, { method: "PATCH", body: { status: "sent", sent_at: now, error: "" } });
            if (r.company_id) await rest(`qawsan_companies?id=eq.${r.company_id}`, { method: "PATCH", body: { status: "contacted", contacted_at: now } });
            sent++;
        } else if (result.kind === "auth") {
            // wrong credentials: nothing was sent, leave the recipient pending and stop at once
            stopped = "auth";
            break;
        } else if (result.kind === "permanent") {
            await rest(`qawsan_campaign_recipients?id=eq.${r.id}`, { method: "PATCH", body: { status: "failed", error: result.error } });
            failed++;
        } else {
            // temporary trouble (network, busy server): stop the batch, the recipient stays pending
            res.status(502).json({ ok: false, error: `تعذّر الإرسال مؤقتًا: ${result.error}. حاول بعد قليل.`, sent, failed, skipped });
            return;
        }
        if (i < batch.length - 1) await sleep(GAP_MS);
    }

    if (stopped === "auth" && sent === 0 && failed === 0) {
        throw new HttpError(502, "رفض الخادم اسم المستخدم أو كلمة المرور. في Gmail استخدم «كلمة مرور التطبيقات».");
    }

    const pending = await pendingAll();
    res.status(200).json({ ok: true, sent, failed, skipped, sentToday: sentToday + sent, limit: campaign.daily_limit, pending, stopped: stopped || (pending === 0 ? "done" : "") });
});
