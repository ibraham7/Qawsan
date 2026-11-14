/**
 * POST /api/prospects/enrich  (admins only)   body: { ids: string[] }  (at most 25)
 *
 * Opens each company's own website (and one contact page) and saves the emails, social
 * profiles and WhatsApp number found there. Free: it does not use Google. Internal and
 * private addresses are refused. Companies not reached before the time budget runs out are
 * returned in `pending` so the page can ask again.
 */
import { dialFor, extractContacts, merge } from "../../src/lib/discovery/extract.js";
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
    hq_country: string;
}

// pages that usually carry the contact details, tried when the home page has no WhatsApp number
const COMMON_PATHS = ["/contact", "/contact-us", "/contactus", "/ar/contact", "/ar/contact-us", "/en/contact", "/about", "/about-us", "/ar/about", "/تواصل-معنا", "/اتصل-بنا", "/iletisim"];
const SOCIAL_ONLY = /^(?:www\.|m\.|web\.)?(?:instagram|facebook|fb|twitter|x|tiktok|snapchat|linkedin|youtube|wa|linktr)\.(?:com|ee|me)$/i;
const MAX_EXTRA_PAGES = 6;

type Outcome = { id: string; status: "done" | "socials_only" | "nothing_found" | "no_website" | "failed"; emails: number; socials: number; whatsapp: boolean };

async function enrichOne(c: Row): Promise<{ outcome: Outcome; patch: Record<string, unknown> }> {
    const now = new Date().toISOString();
    const site = c.website || (c.domain ? `https://${c.domain}` : "");
    if (!site) {
        return { outcome: { id: c.id, status: "no_website", emails: 0, socials: 0, whatsapp: false }, patch: { enrich_status: "no_website", enriched_at: now } };
    }
    // the "website" on Google is often just the business's own social page: nothing to read there
    try {
        const u = new URL(/^https?:\/\//i.test(site) ? site : `https://${site}`);
        const key = Object.entries({ instagram: /instagram\.com$/, facebook: /(facebook|fb)\.com$/, x: /(twitter|x)\.com$/, tiktok: /tiktok\.com$/, snapchat: /snapchat\.com$/, linkedin: /linkedin\.com$/, youtube: /youtube\.com$/ })
            .find(([, re]) => re.test(u.hostname))?.[0];
        if (key && SOCIAL_ONLY.test(u.hostname) && u.pathname.length > 1) {
            return {
                outcome: { id: c.id, status: "socials_only", emails: 0, socials: 1, whatsapp: false },
                patch: { socials: { [key]: `${u.origin}${u.pathname}`.replace(/\/+$/, "") }, enrich_status: "socials_only", enriched_at: now },
            };
        }
    } catch {
        /* a bad address is handled below */
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
    const dial = dialFor(c.hq_country);
    let found: Extracted = extractContacts(home.html, home.url, dial);
    // a short WhatsApp link (wa.link) or a link-in-bio page: the final address holds the number
    const seen = new Set<string>([home.url]);
    const queue: string[] = [...found.followLinks, ...found.contactLinks];
    try {
        const origin = new URL(home.url).origin;
        // when the home page gave no WhatsApp number, also try the usual contact pages
        if (!found.whatsapp) for (const p of COMMON_PATHS) queue.push(origin + encodeURI(p));
    } catch {
        /* keep what we have */
    }
    let opened = 0;
    while (queue.length && opened < MAX_EXTRA_PAGES && !(found.whatsapp && found.emails.length)) {
        const next = queue.shift()!;
        if (seen.has(next)) continue;
        seen.add(next);
        opened++;
        try {
            const page = await fetchPage(next, 4500);
            if (!page) continue;
            const got = extractContacts(page.html, page.url, dial);
            // wa.link and similar redirect straight to wa.me/<number>
            if (!got.whatsapp) {
                const u = new URL(page.url);
                if (/(^|\.)wa\.me$/.test(u.hostname)) {
                    const d = u.pathname.replace(/\D/g, "");
                    if (d.length >= 8) got.whatsapp = `+${d}`;
                } else if (/(^|\.)whatsapp\.com$/.test(u.hostname)) {
                    const d = (u.searchParams.get("phone") ?? "").replace(/\D/g, "");
                    if (d.length >= 8) got.whatsapp = `+${d}`;
                }
            }
            found = merge(found, got);
            for (const l of [...got.followLinks, ...got.contactLinks]) if (!seen.has(l)) queue.unshift(l);
        } catch {
            /* the pages already read still count */
        }
    }
    const nSocial = Object.keys(found.socials).length;
    const status = found.emails.length > 0 || !!found.whatsapp ? "done" : nSocial > 0 ? "socials_only" : "nothing_found";
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

    const rows = await rest<Row[]>(`qawsan_companies?select=id,website,domain,hq_country&id=in.(${ids.join(",")})`);
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
