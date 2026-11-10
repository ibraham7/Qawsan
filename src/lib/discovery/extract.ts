// Contact details from a company's own web page: emails, social profiles, WhatsApp and the
// links worth opening next (a contact page). Pure string work, no network.

export type Socials = Partial<Record<"facebook" | "instagram" | "linkedin" | "x" | "tiktok" | "youtube" | "snapchat", string>>;

export interface Extracted {
    emails: string[];
    socials: Socials;
    whatsapp: string;
    contactLinks: string[];
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
const BAD_EMAIL = /\.(png|jpe?g|gif|webp|svg|avif|css|js)$|@(?:example\.|sentry|wixpress|domain\.|email\.com$|yourdomain|test\.)|^(?:name|user|your|email)@/i;
const CONTACT_WORDS = /contact|about|تواصل|اتصل|اتصال|من-نحن|iletisim|iletişim|hakkimizda/i;

function decodeEntities(s: string) {
    return s
        .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#64;|&commat;/g, "@");
}

export function extractContacts(html: string, pageUrl: string): Extracted {
    const text = decodeEntities(html);
    const base = new URL(pageUrl);
    const emails = new Set<string>();
    const socials: Socials = {};
    let whatsapp = "";
    const contactLinks = new Set<string>();

    const hrefs = [...text.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1].trim());
    for (const href of hrefs) {
        if (/^mailto:/i.test(href)) {
            const e = decodeURIComponent(href.slice(7).split("?")[0]).trim().toLowerCase();
            if (/^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i.test(e) && !BAD_EMAIL.test(e)) emails.add(e);
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
        for (const [key, re] of SOCIAL_HOSTS) {
            if (!socials[key] && re.test(host) && u.pathname.length > 1 && !NOT_A_PROFILE.test(u.pathname + u.search)) {
                socials[key] = `https://${host.replace(/^(m|web)\./, "www.")}${u.pathname.replace(/\/+$/, "")}`;
            }
        }
        if (host === base.hostname && CONTACT_WORDS.test(decodeURIComponent(u.pathname)) && u.pathname !== base.pathname) {
            contactLinks.add(`${u.origin}${u.pathname}`);
        }
    }

    // visible text (also catches addresses written without mailto)
    const plain = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ");
    for (const m of plain.matchAll(EMAIL_RE)) {
        const e = m[0].toLowerCase().replace(/\.$/, "");
        if (!BAD_EMAIL.test(e)) emails.add(e);
    }

    return { emails: [...emails].slice(0, 10), socials, whatsapp, contactLinks: [...contactLinks].slice(0, 3) };
}

export function merge(a: Extracted, b: Extracted): Extracted {
    return {
        emails: [...new Set([...a.emails, ...b.emails])].slice(0, 10),
        socials: { ...b.socials, ...a.socials },
        whatsapp: a.whatsapp || b.whatsapp,
        contactLinks: a.contactLinks,
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
