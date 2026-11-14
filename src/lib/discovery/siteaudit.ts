// Is this company's website weak? Pure string work on the page we already download: no network, no
// paid API. The result is a hint with reasons, not a verdict: the page is read the way a search
// engine reads it, so a site drawn entirely by JavaScript looks empty and is reported as
// "unreadable" instead of being scored.

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
    | "unreadable";

export interface SiteAudit {
    /** 0-100, or null when the page could not be judged */
    score: number | null;
    issues: IssueCode[];
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

export function auditPage(page: PageFacts, now = new Date()): SiteAudit {
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
    if (page.ms > 4000) issues.push("slow");
    const scripts = (html.match(/<script\b/gi) ?? []).length;
    const images = (html.match(/<img\b/gi) ?? []).length;
    if (page.bytes > 700_000 || scripts > 40 || images > 70) issues.push("heavy");

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
    social_only: "«موقعها» حساب سوشيال فقط",
    unreachable: "الموقع لا يفتح",
    unreadable: "يعتمد على جافاسكربت: تعذّر الحكم عليه",
};
