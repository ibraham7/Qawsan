/**
 * POST /api/prospects/audit  (admins only)   body: { ids: string[] }  (at most 25)
 *
 * Opens each company's website once and scores it (mobile support, HTTPS, speed, search basics, age,
 * booking and contact buttons). Free: it does not use Google. Internal and private addresses are
 * refused. Companies not reached before the time budget runs out are returned in `pending`.
 */
import { auditPage, bucket, socialOnly } from "../../src/lib/discovery/siteaudit.js";
import type { SiteAudit } from "../../src/lib/discovery/siteaudit.js";
import { HttpError, body, fetchForAudit, handle, requireAdmin, rest } from "../_lib/server.js";

const MAX_IDS = 25;
const PARALLEL = 5;
const BUDGET_MS = 45_000;

interface Row {
    id: string;
    website: string;
    domain: string;
}

type Outcome = { id: string; quality: "weak" | "medium" | "good" | "unreadable" | "no_website"; score: number | null };

async function auditOne(c: Row): Promise<{ outcome: Outcome; patch: Record<string, unknown> }> {
    const now = new Date().toISOString();
    const site = c.website || (c.domain ? `https://${c.domain}` : "");
    // nothing to audit: leave the columns alone, it is a "no website" lead already
    if (!site) return { outcome: { id: c.id, quality: "no_website", score: null }, patch: {} };

    let result: SiteAudit;
    if (socialOnly(site)) {
        result = { score: 10, issues: ["social_only"] };
    } else {
        const page = await fetchForAudit(site);
        if (page.kind === "ok") result = auditPage(page);
        else if (page.kind === "dead") result = { score: 0, issues: ["unreachable"] };
        else result = { score: null, issues: ["unreadable"] };
    }
    return {
        outcome: { id: c.id, quality: bucket(result.score), score: result.score },
        patch: { site_score: result.score, site_issues: result.issues, site_checked_at: now },
    };
}

export default handle(async (req, res) => {
    await requireAdmin(req);
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const b = body(req) as { ids?: unknown } | null;
    const ids = Array.isArray(b?.ids) ? [...new Set(b.ids.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x)))] : [];
    if (!ids.length) throw new HttpError(400, "اختر جهة واحدة على الأقل.");
    if (ids.length > MAX_IDS) throw new HttpError(400, `الحد ${MAX_IDS} جهة في المرة الواحدة.`);

    const rows = await rest<Row[]>(`qawsan_companies?select=id,website,domain&id=in.(${ids.join(",")})`);
    const started = Date.now();
    const results: Outcome[] = [];
    const queue = [...rows];
    const worker = async () => {
        while (queue.length && Date.now() - started < BUDGET_MS) {
            const c = queue.shift()!;
            const { outcome, patch } = await auditOne(c);
            if (Object.keys(patch).length) await rest(`qawsan_companies?id=eq.${c.id}`, { method: "PATCH", body: patch });
            results.push(outcome);
        }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, rows.length) }, worker));

    res.status(200).json({ ok: true, results, pending: queue.map((c) => c.id) });
});
