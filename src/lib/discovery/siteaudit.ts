// Is this company's website weak? Pure string work on the page we already download: no network, no
// paid API. The result is a hint with reasons, not a verdict: the page is read the way a search
// engine reads it, so a site drawn entirely by JavaScript looks empty and is reported as
// "unreadable" instead of being scored.

import type { Measured } from "./pagespeed.ts";

export type IssueCode =
    | "no_https"
    | "no_viewport"
    | "slow"
    | "heavy"
    | "no_title"
    | "no_description"
    | "no_h1"
    | "outdated"
    | "free_builder"
    | "no_booking"
    | "no_contact_action"
    | "thin_content"
    | "no_alt"
    | "social_only"
    | "unreachable"
    | "unreadable"
    // from a real PageSpeed run, the page's own markup and opening its links
    | "slow_mobile"
    | "poor_lcp"
    | "seo_low"
    | "noindex"
    | "no_structured_data"
    | "no_lang"
    | "bad_phone_link"
    | "broken_links"
    | "no_sitemap";

export interface SiteAudit {
    /** 0-100, or null when the page could not be judged */
    score: number | null;
    issues: IssueCode[];
}

/** what opening the site's own links showed */
export interface LinkFacts {
    /** internal links that answered 404 / 410 or whose address does not exist */
    broken: number;
    checked: number;
    /** a sitemap.xml (or a Sitemap line in robots.txt) exists; null = not checked */
    sitemap: boolean | null;
}

export interface Extra {
    measured?: Measured | null;
    links?: LinkFacts | null;
}

export interface PageFacts {
    html: string;
    /** the address we ended up on after redirects */
    url: string;
    /** how long the server took to answer, milliseconds */
    ms: number;
    /** size of the page we downloaded, bytes */
    bytes: number;
}

/** points taken off 100 for each problem */
export const PENALTY: Record<Exclude<IssueCode, "social_only" | "unreachable" | "unreadable">, number> = {
    noindex: 15,
    slow_mobile: 15,
    seo_low: 8,
    broken_links: 8,
    bad_phone_link: 8,
    poor_lcp: 5,
    no_sitemap: 3,
    no_structured_data: 2,
    no_lang: 2,
    no_viewport: 25,
    free_builder: 20,
    no_https: 15,
    outdated: 15,
    no_booking: 10,
    slow: 10,
    no_title: 8,
    no_description: 8,
    no_contact_action: 8,
    heavy: 8,
    thin_content: 8,
    no_h1: 5,
    no_alt: 4,
};

export const WEAK_BELOW = 60;
export const GOOD_FROM = 80;

const FREE_BUILDERS = /(^|\.)(blogspot\.[a-z.]+|wixsite\.com|business\.site|weebly\.com|godaddysites\.com|site123\.me|webnode\.[a-z.]+|jimdosite\.com|jimdofree\.com|mystrikingly\.com|000webhostapp\.com|carrd\.co|sites\.google\.com|webs\.com|yolasite\.com|wordpress\.com)$/i;
const SOCIAL_HOST = /(^|\.)(instagram|facebook|fb|twitter|x|tiktok|snapchat|linkedin|youtube|linktr)\.(com|me|ee)$/i;
const BOOKING = /حجز|احجز|احجزي|موعد|book(ing)?\b|appointment|reserv|randevu|rezervasyon/i;

const strip = (html: string) =>
    html
        .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const attr = (tag: string, name: string) => new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(tag)?.[1] ?? "";

/** the newest year written next to a copyright sign or "all rights reserved" */
function copyrightYear(text: string): number | null {
    let best: number | null = null;
    for (const m of text.matchAll(/(?:©|&copy;|copyright|حقوق|all rights reserved)[^0-9]{0,40}((?:19|20)\d{2})(?:\s*[-–]\s*((?:19|20)\d{2}))?/gi)) {
        const y = Number(m[2] ?? m[1]);
        if (y >= 1995 && y <= 2100 && (best === null || y > best)) best = y;
    }
    return best;
}

export function hostOf(url: string): string {
    try {
        return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.toLowerCase();
    } catch {
        return "";
    }
}

/** a "website" that is just a social profile: nothing to audit, and a strong sign there is no real site */
export function socialOnly(url: string): boolean {
    return SOCIAL_HOST.test(hostOf(url));
}

export function scoreFrom(issues: IssueCode[]): number {
    let s = 100;
    for (const i of issues) if (i in PENALTY) s -= PENALTY[i as keyof typeof PENALTY];
    return Math.max(0, Math.min(100, s));
}

export function bucket(score: number | null): "weak" | "medium" | "good" | "unreadable" {
    if (score === null) return "unreadable";
    return score < WEAK_BELOW ? "weak" : score < GOOD_FROM ? "medium" : "good";
}

/** phone and WhatsApp links that cannot work: too few digits, letters in the number */
export function badPhoneLinks(html: string): number {
    let bad = 0;
    for (const m of html.matchAll(/href\s*=\s*["']\s*tel:([^"']*)["']/gi)) {
        let raw = m[1];
        try {
            raw = decodeURIComponent(raw);
        } catch {
            /* keep it as written */
        }
        raw = raw.trim();
        const digits = raw.replace(/\D/g, "");
        if (!/^[+\d\s().-]+$/.test(raw) || digits.length < 7 || digits.length > 15) bad++;
    }
    for (const m of html.matchAll(/href\s*=\s*["']\s*https?:\/\/wa\.me\/(\d*)/gi)) {
        if (m[1].length < 8 || m[1].length > 15) bad++;
    }
    return bad;
}

/** same-site links worth opening to see whether they work (at most `max`; no anchors, files, mail or phone) */
export function internalLinks(html: string, pageUrl: string, max = 6): string[] {
    let base: URL;
    try {
        base = new URL(pageUrl);
    } catch {
        return [];
    }
    const bare = (h: string) => h.replace(/^www\./, "");
    const out: string[] = [];
    for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"'#]+)["']/gi)) {
        const href = m[1].trim();
        if (/^(?:mailto:|tel:|javascript:|whatsapp:|data:)/i.test(href)) continue;
        let u: URL;
        try {
            u = new URL(href, base);
        } catch {
            continue;
        }
        if (!/^https?:$/.test(u.protocol) || bare(u.hostname) !== bare(base.hostname)) continue;
        if (u.pathname === "/" || u.pathname === base.pathname || /\.(?:pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?|mp4)$/i.test(u.pathname)) continue;
        const key = `${u.origin}${u.pathname}`;
        if (!out.includes(key)) out.push(key);
        if (out.length >= max) break;
    }
    return out;
}

/**
 * Where a tiny "redirect stub" page sends the visitor (<meta http-equiv="refresh"> or a one-line
 * location assignment), as an absolute URL, or null when the page is a real page.
 * Old domains often keep such a stub, and scoring it as the site would call a good site "weak".
 */
export function redirectTarget(html: string, pageUrl: string): string | null {
    if (html.length > 3000) return null;
    let target = "";
    const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => /http-equiv\s*=\s*["']?refresh/i.test(t));
    if (meta) {
        const content = /content\s*=\s*["']([^"']*)["']/i.exec(meta)?.[1] ?? "";
        target = /url\s*=\s*['"]?\s*([^'";\s]+)/i.exec(content)?.[1] ?? "";
    }
    if (!target) {
        const js = /(?:\blocation(?:\.href)?\s*=|\blocation\.(?:replace|assign)\s*\()\s*["']([^"']+)["']/i.exec(html);
        target = js?.[1] ?? "";
    }
    if (!target) return null;
    try {
        const next = new URL(target, pageUrl);
        if (!/^https?:$/.test(next.protocol) || next.href === new URL(pageUrl).href) return null;
        return next.href;
    } catch {
        return null;
    }
}

export function auditPage(page: PageFacts, extra: Extra = {}, now = new Date()): SiteAudit {
    const html = page.html;
    const head = html.slice(0, 60_000);
    const text = strip(html);
    const issues: IssueCode[] = [];
    const host = hostOf(page.url);

    // a page we cannot read the way a visitor sees it is not scored: that would be unfair
    const appShell = /<div[^>]+id=["'](?:root|app|__next|__nuxt)["']/i.test(html);
    if (text.length < 200 && appShell) return { score: null, issues: ["unreadable"] };

    if (/^http:/i.test(page.url)) issues.push("no_https");
    if (!/<meta[^>]+name=["']viewport["']/i.test(head)) issues.push("no_viewport");
    // a measured phone speed (PageSpeed) replaces our rough guesses about speed and weight
    const m = extra.measured ?? null;
    if (m) {
        if (m.perf !== null && m.perf < 50) issues.push("slow_mobile");
        if (m.lcpMs !== null && m.lcpMs > 4000) issues.push("poor_lcp");
        if (m.seo !== null && m.seo < 80) issues.push("seo_low");
    } else {
        if (page.ms > 4000) issues.push("slow");
        const scripts = (html.match(/<script\b/gi) ?? []).length;
        const images = (html.match(/<img\b/gi) ?? []).length;
        if (page.bytes > 700_000 || scripts > 40 || images > 70) issues.push("heavy");
    }

    // search basics and links, read from the page itself
    if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(head) || /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(head)) issues.push("noindex");
    if (!/<script[^>]+type=["']application\/ld\+json["']/i.test(html)) issues.push("no_structured_data");
    if (!/<html[^>]+\blang\s*=\s*["'][a-z]/i.test(head)) issues.push("no_lang");
    if (badPhoneLinks(html) > 0) issues.push("bad_phone_link");
    const links = extra.links ?? null;
    if (links && links.broken > 0) issues.push("broken_links");
    if (links && links.sitemap === false) issues.push("no_sitemap");

    const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
    if (title.length < 10) issues.push("no_title");
    const desc = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]).find((t) => /name=["']description["']/i.test(t));
    if (!desc || attr(desc, "content").trim().length < 30) issues.push("no_description");
    if (!/<h1\b/i.test(html)) issues.push("no_h1");

    // signs of an old site
    const year = copyrightYear(text);
    const jq = /jquery[-./]?(?:min[-.])?(1\.\d|2\.\d)/i.test(html);
    const old = /<frameset|<marquee|<blink|<font\b|\.swf\b|shockwave|macromedia/i.test(html);
    if (old || jq || (year !== null && year <= now.getFullYear() - 3)) issues.push("outdated");

    if (FREE_BUILDERS.test(host)) issues.push("free_builder");

    if (!BOOKING.test(text) && !/<form\b/i.test(html)) issues.push("no_booking");
    if (!/href=["']\s*(?:tel:|https?:\/\/(?:wa\.me|api\.whatsapp\.com|wa\.link)|whatsapp:)/i.test(html) && !/<form\b/i.test(html)) issues.push("no_contact_action");

    if (text.length < 400) issues.push("thin_content");

    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
    if (imgs.length >= 6 && imgs.filter((t) => attr(t, "alt").trim() === "").length > imgs.length / 2) issues.push("no_alt");

    return { score: scoreFrom(issues), issues };
}

/** Arabic reasons, shown to the person deciding whom to contact */
export const ISSUE_LABEL: Record<IssueCode, string> = {
    no_https: "بلا HTTPS (المتصفح يحذّر الزائر)",
    no_viewport: "لا يدعم شاشة الجوال",
    slow: "بطيء في الاستجابة",
    heavy: "صفحة ثقيلة (سكربتات أو صور كثيرة)",
    no_title: "بلا عنوان واضح للصفحة",
    no_description: "بلا وصف يظهر في Google",
    no_h1: "بلا عنوان رئيسي",
    outdated: "تصميم أو تقنية قديمة",
    free_builder: "موقع مجاني جاهز (blogspot / wix…)",
    no_booking: "بلا حجز أو نموذج تواصل",
    no_contact_action: "بلا زر اتصال أو واتساب",
    thin_content: "محتوى قليل جدًا",
    no_alt: "صور بلا وصف",
    slow_mobile: "بطيء جدًا على الجوال (قياس Google)",
    poor_lcp: "المحتوى الرئيسي يظهر متأخرًا (أكثر من 4 ثوانٍ)",
    seo_low: "ضعيف في أساسيات الظهور في Google",
    noindex: "محجوب عن محركات البحث (noindex)",
    no_structured_data: "بلا بيانات منظمة (Schema)",
    no_lang: "لم تُحدد لغة الصفحة",
    bad_phone_link: "رابط اتصال أو واتساب لا يعمل",
    broken_links: "روابط داخلية معطلة (404)",
    no_sitemap: "بلا خريطة موقع (sitemap)",
    social_only: "«موقعها» حساب سوشيال فقط",
    unreachable: "الموقع لا يفتح",
    unreadable: "يعتمد على جافاسكربت: تعذّر الحكم عليه",
};
