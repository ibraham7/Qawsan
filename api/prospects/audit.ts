/**
 * POST /api/prospects/audit  (admins only)   body: { ids: string[] }  (at most 25)
 *
 * Audits each company's website:
 *   - the home page is downloaded once and read (mobile support, HTTPS, titles, age, booking and
 *     contact buttons, noindex, language, phone links...);
 *   - a few of its own links and sitemap.xml are opened to see whether they work;
 *   - Google PageSpeed Insights measures the real mobile speed, SEO and accessibility (when a key is set).
 * All free. Internal and private addresses are refused. Companies not reached before the time budget
 * runs out are returned in `pending`, so the page asks again.
 */
import { auditPage, bucket, internalLinks, socialOnly } from "../../src/lib/discovery/siteaudit.js";
import type { Extra, LinkFacts, SiteAudit } from "../../src/lib/discovery/siteaudit.js";
import { pageSpeedKey, runPageSpeed } from "../_lib/pagespeed.js";
import type { PageSpeedResult } from "../_lib/pagespeed.js";
import { HttpError, body, fetchForAudit, handle, probe, requireAdmin, rest } from "../_lib/server.js";

const MAX_IDS = 25;
const PARALLEL = 5;
// a site started late could still need ~24 s: stop starting new ones early enough to finish inside 60 s
const START_BEFORE_MS = 20_000;

interface Row {
    id: string;
    website: string;
    domain: string;
}

export type PageSpeedState = "ok" | "quota" | "blocked" | "failed" | "off";
type Outcome = { id: string; quality: "weak" | "medium" | "good" | "unreadable" | "no_website"; score: number | null; speed: PageSpeedState };

/** opens a few internal links and the sitemap; 404 / 410 and non-existent hosts count as broken */
async function checkLinks(html: string, url: string): Promise<LinkFacts> {
    const links = internalLinks(html, url, 6);
    let origin = "";
    try {
        origin = new URL(url).origin;
    } catch {
        /* no origin: skip the sitemap */
    }
    const codes = await Promise.all(links.map((l) => probe(l, 4500)));
    const broken = codes.filter((c) => c === "dead" || c === 404 || c === 410).length;
    // any of the usual sitemap addresses answering 200 counts; "none" only when every one gave a clear answer
    let sitemap: boolean | null = null;
    if (origin) {
        const answers = await Promise.all(["/sitemap.xml", "/sitemap_index.xml", "/wp-sitemap.xml"].map((p) => probe(origin + p, 4500)));
        if (answers.some((c) => c === 200)) sitemap = true;
        else if (answers.every((c) => typeof c === "number")) sitemap = false;
    }
    return { broken, checked: links.length, sitemap };
}

async function auditOne(c: Row, key: string): Promise<{ outcome: Outcome; patch: Record<string, unknown> }> {
    const now = new Date().toISOString();
    const site = c.website || (c.domain ? `https://${c.domain}` : "");
    // nothing to audit: leave the columns alone, it is a "no website" lead already
    if (!site) return { outcome: { id: c.id, quality: "no_website", score: null, speed: "off" }, patch: {} };

    if (socialOnly(site)) {
        const result: SiteAudit = { score: 10, issues: ["social_only"] };
        return { outcome: { id: c.id, quality: bucket(10), score: 10, speed: "off" }, patch: { site_score: 10, site_issues: result.issues, site_checked_at: now } };
    }

    // Google measures while we read the page and open its links
    const speedP: Promise<PageSpeedResult | null> = key ? runPageSpeed(/^https?:\/\//i.test(site) ? site : `https://${site}`, key) : Promise.resolve(null);
    const pageP = (async () => {
        const page = await fetchForAudit(site);
        if (page.kind !== "ok") return { page, links: null as LinkFacts | null };
        const links = await checkLinks(page.html, page.url).catch(() => null);
        return { page, links };
    })();
    const [speed, { page, links }] = await Promise.all([speedP, pageP]);

    let result: SiteAudit;
    if (page.kind === "ok") {
        const extra: Extra = { measured: speed?.kind === "ok" ? speed.measured : null, links };
        result = auditPage(page, extra);
    } else if (page.kind === "dead") result = { score: 0, issues: ["unreachable"] };
    else result = { score: null, issues: ["unreadable"] };

    const patch: Record<string, unknown> = { site_score: result.score, site_issues: result.issues, site_checked_at: now };
    // keep the last good measurement when this run could not take one
    if (speed?.kind === "ok" && page.kind === "ok") {
        patch.site_perf = speed.measured.perf;
        patch.site_seo = speed.measured.seo;
        patch.site_a11y = speed.measured.a11y;
        patch.site_lcp_ms = speed.measured.lcpMs;
    }
    return { outcome: { id: c.id, quality: bucket(result.score), score: result.score, speed: speed ? speed.kind : "off" }, patch };
}

export default handle(async (req, res) => {
    await requireAdmin(req);
    if (req.method !== "POST") throw new HttpError(405, "Method not allowed");

    const b = body(req) as { ids?: unknown } | null;
    const ids = Array.isArray(b?.ids) ? [...new Set(b.ids.filter((x): x is string => typeof x === "string" && /^[0-9a-f-]{36}$/i.test(x)))] : [];
    if (!ids.length) throw new HttpError(400, "اختر جهة واحدة على الأقل.");
    if (ids.length > MAX_IDS) throw new HttpError(400, `الحد ${MAX_IDS} جهة في المرة الواحدة.`);

    const key = pageSpeedKey();
    const rows = await rest<Row[]>(`qawsan_companies?select=id,website,domain&id=in.(${ids.join(",")})`);
    const started = Date.now();
    const results: Outcome[] = [];
    const queue = [...rows];
    let quotaHit = false;
    const worker = async () => {
        while (queue.length && Date.now() - started < START_BEFORE_MS) {
            const c = queue.shift()!;
            // once the quota is gone, stop asking Google for the rest of this request
            const { outcome, patch } = await auditOne(c, quotaHit ? "" : key);
            if (outcome.speed === "quota") quotaHit = true;
            if (Object.keys(patch).length) await rest(`qawsan_companies?id=eq.${c.id}`, { method: "PATCH", body: patch });
            results.push(outcome);
        }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, rows.length) }, worker));

    res.status(200).json({ ok: true, results, pending: queue.map((c) => c.id), speedConfigured: !!key });
});
