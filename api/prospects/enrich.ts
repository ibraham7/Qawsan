/**
 * POST /api/prospects/enrich  (admins only)   body: { ids: string[] }  (at most 25)
 *
 * Opens each company's own website (and one contact page) and saves the emails, social
 * profiles and WhatsApp number found there. Free: it does not use Google. Internal and
 * private addresses are refused. Companies not reached before the time budget runs out are
 * returned in `pending` so the page can ask again.
 */
import { extractContacts, merge } from "../../src/lib/discovery/extract.js";
import type { Extracted } from "../../src/lib/discovery/extract.js";
import { normDomain } from "../../src/lib/discovery/places.js";
import { HttpError, body, fetchPage, handle, requireAdmin, rest } from "../_lib/server.js";

const MAX_IDS = 25;
const PARALLEL = 6;
const BUDGET_MS = 45_000;

interface Row {
    id: string;
    website: string;
    domain: string;
}

type Outcome = { id: string; status: "done" | "nothing_found" | "no_website" | "failed"; emails: number; socials: number; whatsapp: boolean };

async function enrichOne(c: Row): Promise<{ outcome: Outcome; patch: Record<string, unknown> }> {
    const now = new Date().toISOString();
    const site = c.website || (c.domain ? `https://${c.domain}` : "");
    if (!site) {
        return { outcome: { id: c.id, status: "no_website", emails: 0, socials: 0, whatsapp: false }, patch: { enrich_status: "no_website", enriched_at: now } };
    }
    let home;
    try {
        home = await fetchPage(site);
    } catch {
        home = null;
    }
    if (!home) {
        return { outcome: { id: c.id, status: "failed", emails: 0, socials: 0, whatsapp: false }, patch: { enrich_status: "failed", enriched_at: now } };
    }
    let found: Extracted = extractContacts(home.html, home.url);
    // one contact page when the home page had no email
    if (!found.emails.length && found.contactLinks[0]) {
        try {
            const contact = await fetchPage(found.contactLinks[0]);
            if (contact) found = merge(found, extractContacts(contact.html, contact.url));
        } catch {
            /* the home page result still counts */
        }
    }
    const nSocial = Object.keys(found.socials).length;
    const any = found.emails.length > 0 || nSocial > 0 || !!found.whatsapp;
    const status = any ? "done" : "nothing_found";
    return {
        outcome: { id: c.id, status, emails: found.emails.length, socials: nSocial, whatsapp: !!found.whatsapp },
        patch: {
            emails: found.emails,
            socials: found.socials,
            whatsapp: found.whatsapp,
            enrich_status: status,
            enriched_at: now,
            ...(c.domain ? {} : { domain: normDomain(home.url) }),
        },
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
            const { outcome, patch } = await enrichOne(c);
            await rest(`qawsan_companies?id=eq.${c.id}`, { method: "PATCH", body: patch });
            results.push(outcome);
        }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, rows.length) }, worker));

    res.status(200).json({ ok: true, results, pending: queue.map((c) => c.id) });
});
