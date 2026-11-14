// Import a list of companies from a CSV file (Excel "save as CSV", Google Sheets download, or a list
// from another tool). Pure string work in the browser: reading the file, guessing which column is
// which, cleaning phone numbers, and dropping rows that are unusable or already in the database. The
// file never leaves the browser until the person confirms the preview.

import { dialFor } from "../discovery/extract.ts";
import { normDomain } from "./query.ts";
import type { NewCompany } from "./data.ts";

export const MAX_ROWS = 500;
export const MAX_FILE_BYTES = 1024 * 1024;

export type Field = "name" | "phone" | "email" | "website" | "city" | "country" | "notes";
export type Mapping = Partial<Record<Field, number>>;

export const FIELD_LABEL: Record<Field, string> = {
    name: "الاسم",
    phone: "الهاتف / الجوال",
    email: "الإيميل",
    website: "الموقع",
    city: "المدينة",
    country: "الدولة",
    notes: "ملاحظات",
};
export const FIELDS = Object.keys(FIELD_LABEL) as Field[];

/** countries the person can pick as the default (English names, as the rest of the page stores them) */
export const COUNTRIES = ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Türkiye", "Egypt", "Jordan", "Lebanon", "Iraq", "Syria"];

/* ------------------------------------------------------------------ */
/* reading the file                                                     */

/** rows of cells; handles quotes, doubled quotes, line breaks inside quotes, BOM, and , ; or tab as the separator */
export function parseCsv(text: string): string[][] {
    const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // drop the byte-order mark Excel adds
    // the separator is whichever of , ; tab appears most in the first line (outside quotes)
    const seen: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
    let q = false;
    for (const ch of src) {
        if (ch === '"') q = !q;
        else if (!q && (ch === "\n" || ch === "\r")) break;
        else if (!q && ch in seen) seen[ch]++;
    }
    const sep = [",", ";", "\t"].reduce((best, c) => (seen[c] > seen[best] ? c : best), ",");

    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (inQuotes) {
            if (ch === '"') {
                if (src[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else inQuotes = false;
            } else cell += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === sep) {
            row.push(cell);
            cell = "";
        } else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && src[i + 1] === "\n") i++;
            row.push(cell);
            cell = "";
            rows.push(row);
            row = [];
        } else cell += ch;
    }
    if (cell !== "" || row.length) {
        row.push(cell);
        rows.push(row);
    }
    // drop completely empty lines
    return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ------------------------------------------------------------------ */
/* which column is which                                                */

const norm = (s: string) =>
    s
        .toLowerCase()
        .replace(/[ً-ٟـ]/g, "")
        .replace(/[أإآ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/[^a-z0-9؀-ۿ]/g, "");

const SYNONYMS: Record<Field, string[]> = {
    name: ["name", "company", "companyname", "clinic", "clinicname", "title", "business", "الاسم", "اسم", "اسمالعياده", "العياده", "اسمالشركه", "الشركه", "اسمالجهه", "الجهه"],
    phone: ["phone", "mobile", "tel", "telephone", "whatsapp", "cell", "phonenumber", "الهاتف", "هاتف", "الجوال", "جوال", "رقم", "رقمالهاتف", "رقمالجوال", "واتساب", "واتسااب"],
    email: ["email", "mail", "emailaddress", "الايميل", "ايميل", "البريد", "بريد", "البريدالالكتروني"],
    website: ["website", "site", "url", "web", "homepage", "الموقع", "موقع", "الرابط", "رابط", "الموقعالالكتروني"],
    city: ["city", "town", "المدينه", "مدينه"],
    country: ["country", "الدوله", "دوله", "البلد", "بلد"],
    notes: ["notes", "note", "comment", "comments", "ملاحظات", "ملاحظه"],
};

/** a guess of the column for each field from the header row (exact match first, then "contains") */
export function detectColumns(headers: string[]): Mapping {
    const h = headers.map(norm);
    const used = new Set<number>();
    const out: Mapping = {};
    const take = (f: Field, test: (header: string, syn: string) => boolean) => {
        if (out[f] !== undefined) return;
        for (let i = 0; i < h.length; i++) {
            if (used.has(i) || !h[i]) continue;
            if (SYNONYMS[f].some((s) => test(h[i], s))) {
                out[f] = i;
                used.add(i);
                return;
            }
        }
    };
    for (const f of FIELDS) take(f, (header, syn) => header === syn);
    for (const f of FIELDS) take(f, (header, syn) => syn.length >= 4 && header.includes(syn));
    return out;
}

/* ------------------------------------------------------------------ */
/* cleaning                                                             */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i;

/**
 * "+9665…" from a number as people write it ("0501234567", "00966 50 123 4567", "+966-50-123-4567").
 * "" when it cannot be made into an international number (too short, too long, or no country known).
 */
export function normalizePhone(raw: string, dial: string): string {
    const s = raw.trim();
    const digits = s.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) return "";
    if (s.startsWith("+")) return `+${digits}`;
    if (digits.startsWith("00")) return digits.length - 2 >= 7 ? `+${digits.slice(2)}` : "";
    if (dial) {
        const full = digits.startsWith(dial) && digits.length >= dial.length + 7 ? digits : dial + digits.replace(/^0/, "");
        return full.length <= 15 ? `+${full}` : "";
    }
    // no country to go by: only accept a number that already looks international
    return digits.length >= 10 && !digits.startsWith("0") ? `+${digits}` : "";
}

/** the website as a full address, "" when the cell is not an address */
export function cleanWebsite(raw: string): string {
    const v = raw.trim();
    if (!v || /\s/.test(v) || !/[a-z0-9؀-ۿ-]\.[a-z؀-ۿ]{2,}/i.test(v)) return "";
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export interface Skipped {
    line: number;
    name: string;
    reason: string;
}

export interface ImportPlan {
    add: NewCompany[];
    skipped: Skipped[];
    /** rows kept, with a cell dropped (e.g. an invalid phone number) */
    warnings: { line: number; name: string; text: string }[];
    tooMany: boolean;
}

export interface Existing {
    domains: Set<string>;
    /** digits only */
    phones: Set<string>;
    emails: Set<string>;
}

const digitsOf = (p: string) => p.replace(/\D/g, "");

/**
 * The companies to add from the rows after the header. `defaultCountry` fills a missing country cell and
 * gives local numbers their country code; a row's own country cell wins for that row.
 */
export function planImport(rows: string[][], mapping: Mapping, defaultCountry: string, existing: Existing): ImportPlan {
    const plan: ImportPlan = { add: [], skipped: [], warnings: [], tooMany: rows.length > MAX_ROWS };
    const seenDomains = new Set<string>();
    const seenPhones = new Set<string>();
    const seenEmails = new Set<string>();
    const cell = (r: string[], f: Field) => (mapping[f] === undefined ? "" : (r[mapping[f] as number] ?? "").trim());

    rows.slice(0, MAX_ROWS).forEach((r, idx) => {
        const line = idx + 2; // 1 is the header
        const name = cell(r, "name").replace(/\s+/g, " ").slice(0, 200);
        const skip = (reason: string) => plan.skipped.push({ line, name: name || "—", reason });
        if (name.length < 2) return skip("بلا اسم");

        const country = cell(r, "country") || defaultCountry;
        const warn = (text: string) => plan.warnings.push({ line, name, text });

        let phone = "";
        const rawPhone = cell(r, "phone");
        if (rawPhone) {
            phone = normalizePhone(rawPhone, dialFor(country));
            if (!phone) warn(`رقم غير صالح حُذف: ${rawPhone}`);
        }
        let email = "";
        const rawEmail = cell(r, "email");
        if (rawEmail) {
            // a cell may hold several: take the first valid one
            email = rawEmail.split(/[;,\s]+/).map((e) => e.toLowerCase()).find((e) => EMAIL_RE.test(e)) ?? "";
            if (!email) warn(`إيميل غير صالح حُذف: ${rawEmail}`);
        }
        let website = "";
        const rawSite = cell(r, "website");
        if (rawSite) {
            website = cleanWebsite(rawSite);
            if (!website) warn(`موقع غير صالح حُذف: ${rawSite}`);
        }
        if (!phone && !email && !website) return skip("لا رقم ولا إيميل ولا موقع صالح");

        const domain = website ? normDomain(website) : "";
        const pd = phone ? digitsOf(phone) : "";
        if ((domain && existing.domains.has(domain)) || (pd && existing.phones.has(pd)) || (email && existing.emails.has(email))) return skip("موجودة في قاعدتك");
        if ((domain && seenDomains.has(domain)) || (pd && seenPhones.has(pd)) || (email && seenEmails.has(email))) return skip("مكررة في الملف");
        if (domain) seenDomains.add(domain);
        if (pd) seenPhones.add(pd);
        if (email) seenEmails.add(email);

        plan.add.push({ name, phone, email, website, country, city: cell(r, "city").slice(0, 100), notes: cell(r, "notes").slice(0, 500) });
    });
    return plan;
}
