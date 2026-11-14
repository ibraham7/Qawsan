// Contact details from a company's own web page: emails, social profiles, WhatsApp and the
// links worth opening next (a contact page). Pure string work, no network.

export type Socials = Partial<Record<"facebook" | "instagram" | "linkedin" | "x" | "tiktok" | "youtube" | "snapchat", string>>;

export interface Extracted {
    emails: string[];
    socials: Socials;
    whatsapp: string;
    contactLinks: string[];
    /** short WhatsApp links (wa.link) and link-in-bio pages worth opening to find the number */
    followLinks: string[];
}

const SOCIAL_HOSTS: [keyof Socials, RegExp][] = [
    ["facebook", /^(?:www\.|m\.|web\.)?facebook\.com$/],
    ["instagram", /^(?:www\.)?instagram\.com$/],
    ["linkedin", /^(?:[a-z]{2,3}\.|www\.)?linkedin\.com$/],
    ["x", /^(?:www\.)?(?:twitter|x)\.com$/],
    ["tiktok", /^(?:www\.)?tiktok\.com$/],
    ["youtube", /^(?:www\.|m\.)?youtube\.com$/],
    ["snapchat", /^(?:www\.)?snapchat\.com$/],
];

// paths that are share buttons or the platform itself, not the company's profile
const NOT_A_PROFILE = /^\/(?:sharer|share|intent|dialog|plugins|home|login|signup|tr|p\/?$)|\/sharer|sharearticle|share\?/i;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi;
const BAD_EMAIL = /\.(png|jpe?g|gif|webp|svg|avif|css|js)$|@(?:example\.|sentry|wixpress|domain\.|email\.com$|yourdomain|test\.)|^(?:name|user|username|your[a-z]*|email|test|sample|example|demo|someone)@/i;
const CONTACT_WORDS = /contact|about|تواصل|اتصل|اتصال|من-نحن|iletisim|iletişim|hakkimizda/i;

function decodeEntities(s: string) {
    return s
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#64;|&commat;/g, "@");
}

// link-in-bio services: one page holding all of a business's links, often a WhatsApp button
const BIO_HOSTS = /^(?:www\.)?(?:linktr\.ee|beacons\.ai|linkin\.bio|taplink\.cc|lnk\.bio|bio\.site|campsite\.bio|carrd\.co|linkpop\.com|solo\.to|msha\.ke|wa\.link|l\.wl\.co|lnk\.at|link\.tree|sites\.google\.com)$|\.(?:taplink\.ws|carrd\.co|mybio\.link)$/i;

export function extractContacts(html: string, pageUrl: string, dial = ""): Extracted {
    const text = decodeEntities(html);
    const base = new URL(pageUrl);
    const emails = new Set<string>();
    const socials: Socials = {};
    let whatsapp = "";
    const contactLinks = new Set<string>();
    const followLinks = new Set<string>();

    const hrefs = [...text.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1].trim());
    for (const href of hrefs) {
        if (/^mailto:/i.test(href)) {
            const e = decodeURIComponent(href.slice(7).split("?")[0]).trim().toLowerCase();
            if (/^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i.test(e) && !BAD_EMAIL.test(e)) emails.add(e);
            continue;
        }
        // app link: whatsapp://send?phone=9665...
        if (!whatsapp && /^whatsapp:\/\/send/i.test(href)) {
            const d = (/[?&]phone=([^&]+)/i.exec(href)?.[1] ?? "").replace(/\D/g, "");
            if (d.length >= 8 && d.length <= 15) whatsapp = `+${d}`;
            continue;
        }
        let u: URL;
        try {
            u = new URL(href, base);
        } catch {
            continue;
        }
        if (!/^https?:$/.test(u.protocol)) continue;
        const host = u.hostname.toLowerCase();

        if (!whatsapp) {
            if (host === "wa.me" || host === "www.wa.me") {
                const d = u.pathname.replace(/\D/g, "");
                if (d.length >= 8) whatsapp = `+${d}`;
            } else if (/(^|\.)whatsapp\.com$/.test(host)) {
                const d = (u.searchParams.get("phone") ?? "").replace(/\D/g, "");
                if (d.length >= 8) whatsapp = `+${d}`;
            }
        }
        if (BIO_HOSTS.test(host) && followLinks.size < 3) followLinks.add(u.toString());
        for (const [key, re] of SOCIAL_HOSTS) {
            if (!socials[key] && re.test(host) && u.pathname.length > 1 && !NOT_A_PROFILE.test(u.pathname + u.search)) {
                socials[key] = `https://${host.replace(/^(m|web)\./, "www.")}${u.pathname.replace(/\/+$/, "")}`;
            }
        }
        if (host === base.hostname && CONTACT_WORDS.test(decodeURIComponent(u.pathname)) && u.pathname !== base.pathname) {
            contactLinks.add(`${u.origin}${u.pathname}`);
        }
    }

    // a number kept in a script variable (var WA='9665…') next to a WhatsApp link or word: the link is
    // built in the browser, so it is not in any href
    if (!whatsapp) whatsapp = numberNearWhatsapp(text);

    // visible text (also catches addresses written without mailto)
    const plain = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ");
    // a number written in the page text right next to the word WhatsApp / واتساب
    if (!whatsapp) whatsapp = numberBesideWhatsapp(plain.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " "), dial);
    for (const m of plain.matchAll(EMAIL_RE)) {
        const e = m[0].toLowerCase().replace(/\.$/, "");
        if (!BAD_EMAIL.test(e)) emails.add(e);
    }

    return { emails: [...emails].slice(0, 10), socials, whatsapp, contactLinks: [...contactLinks].slice(0, 5), followLinks: [...followLinks] };
}

// international dialling code of the countries we work in, from the English country name
const DIAL: Record<string, string> = {
    "saudi arabia": "966", "united arab emirates": "971", "uae": "971", "qatar": "974", "kuwait": "965", "bahrain": "973",
    "oman": "968", "türkiye": "90", "turkey": "90", "egypt": "20", "jordan": "962", "syria": "963", "iraq": "964", "lebanon": "961",
};
export const dialFor = (country: string) => DIAL[country.trim().toLowerCase()] ?? "";

// how a local mobile number looks in each country (what is left once the leading 0 is dropped)
const LOCAL_MOBILE: Record<string, RegExp> = {
    "966": /^0?(5\d{8})$/, "971": /^0?(5\d{8})$/, "90": /^0?(5\d{9})$/, "965": /^([569]\d{7})$/, "974": /^([3567]\d{7})$/,
    "973": /^([36]\d{7})$/, "968": /^([79]\d{7})$/, "20": /^0?(1\d{9})$/, "962": /^0?(7\d{8})$/,
};
const MOBILE_START = /^(905|9665|9715|974[3567]|965[569]|9733|968[79]|201|9627|961(3|7[016789]|81))/;

/** "+9665…" for a mobile number written any usual way (05…, +966 5…, 00966…), "" otherwise */
export function toIntlMobile(raw: string, dial = ""): string {
    const trimmed = raw.trim();
    let d = trimmed.replace(/\D/g, "");
    const intl = /^(\+|00)/.test(trimmed);
    if (intl) d = d.replace(/^00/, "");
    let full = "";
    if (intl) full = d;
    else if (dial && LOCAL_MOBILE[dial]) {
        const m = LOCAL_MOBILE[dial].exec(d);
        if (m) full = dial + m[1];
    }
    // already starts with a country code but no plus sign (966501234567)
    if (!full && /^(966|971|974|965|973|968|90|20|962|961)\d{8,10}$/.test(d)) full = d;
    return full.length >= 10 && full.length <= 14 && MOBILE_START.test(full) ? `+${full}` : "";
}

/** a mobile number written within a few words of WhatsApp / واتساب in the visible text */
export function numberBesideWhatsapp(text: string, dial = ""): string {
    const mention = /whats\s?app|wa\.me|واتس\s?آب|واتساب|واتس|وتساب|وتس/gi;
    const spots = [...text.matchAll(mention)].map((m) => m.index ?? 0).slice(0, 40);
    const num = /(?:\+|00)?\d[\d\s\-().]{7,17}\d/g;
    for (const at of spots) {
        const region = text.slice(Math.max(0, at - 60), at + 90);
        for (const m of region.matchAll(num)) {
            // two numbers can sit side by side: try every run of digit groups
            const whole = toIntlMobile(m[0], dial);
            if (whole) return whole;
            const parts = m[0].split(/[\s\-().]+/).filter(Boolean);
            for (let i = 0; i < parts.length; i++) {
                for (let j = i; j < parts.length; j++) {
                    const found = toIntlMobile(parts.slice(i, j + 1).join(""), dial);
                    if (found) return found;
                }
            }
        }
    }
    return "";
}

/** quoted international mobile-looking numbers within 300 characters of a WhatsApp mention */
export function numberNearWhatsapp(text: string): string {
    const mention = /wa\.me|whatsapp|واتس/gi;
    const spots = [...text.matchAll(mention)].map((m) => m.index ?? 0).slice(0, 60);
    if (!spots.length) return "";
    // Gulf, Türkiye, Levant, Egypt, Iraq country codes followed by 8-10 digits, written as a string
    const num = /["']\+?(?:966|971|974|965|973|968|90|20|962|963|964|961)\d{8,10}["']/g;
    for (const m of text.matchAll(num)) {
        const at = m.index ?? 0;
        if (spots.some((p) => Math.abs(p - at) <= 300)) return `+${m[0].replace(/\D/g, "")}`;
    }
    return "";
}

export function merge(a: Extracted, b: Extracted): Extracted {
    return {
        emails: [...new Set([...a.emails, ...b.emails])].slice(0, 10),
        socials: { ...b.socials, ...a.socials },
        whatsapp: a.whatsapp || b.whatsapp,
        contactLinks: a.contactLinks,
        followLinks: [...new Set([...a.followLinks, ...b.followLinks])].slice(0, 3),
    };
}

/** true for loopback, private, link-local, carrier-grade NAT, multicast and reserved addresses */
export function isPrivateAddress(ip: string): boolean {
    const v4 = ip.match(/^(?:::ffff:)?(\d+)\.(\d+)\.(\d+)\.(\d+)$/i);
    if (v4) {
        const [a, b] = [Number(v4[1]), Number(v4[2])];
        return (
            a === 0 || a === 10 || a === 127 || a >= 224 ||
            (a === 100 && b >= 64 && b <= 127) ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            (a === 192 && b === 0 && Number(v4[3]) === 0) ||
            (a === 198 && (b === 18 || b === 19))
        );
    }
    const x = ip.toLowerCase();
    return x === "::" || x === "::1" || /^f[cd]/.test(x) || /^fe[89ab]/.test(x) || /^ff/.test(x) || x.startsWith("64:ff9b:");
}
