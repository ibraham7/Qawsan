// WhatsApp campaign logic: who is eligible, how the message is built, the wa.me link.
// Pure functions (no network), so they are easy to test.

import type { CompanyRow } from "./types.ts";

export const STOP_LINE_DEFAULT = "لإيقاف الرسائل، أرسل كلمة «إيقاف».";

/** digits only, country code included, no leading 00 */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, "").replace(/^00/, "");

/** number to chat with: a WhatsApp number found on the website, else a mobile number */
export function whatsappNumber(c: Pick<CompanyRow, "whatsapp" | "phone" | "phone_kind">): string {
    if (c.whatsapp) return phoneDigits(c.whatsapp);
    if (c.phone && c.phone_kind === "mobile") return phoneDigits(c.phone);
    return "";
}

export type SkipReason = "not_approved" | "no_whatsapp" | "no_email" | "blocked" | "already_contacted";

export interface Eligibility {
    eligible: { company: CompanyRow; phone: string }[];
    skipped: { company: CompanyRow; reason: SkipReason }[];
}

/**
 * Approved companies with a WhatsApp-capable number, not on the do-not-contact list and not
 * contacted before. Landlines and companies without a mobile number are skipped, and two
 * companies sharing a number are reached once.
 */
export function eligibility(companies: CompanyRow[], blocked: Set<string>): Eligibility {
    const eligible: Eligibility["eligible"] = [];
    const skipped: Eligibility["skipped"] = [];
    const seen = new Set<string>();
    for (const company of companies) {
        const phone = whatsappNumber(company);
        let reason: SkipReason | null = null;
        if (company.status !== "approved") reason = company.status === "contacted" ? "already_contacted" : "not_approved";
        else if (!phone) reason = "no_whatsapp";
        else if (blocked.has(phone) || company.emails.some((e) => blocked.has(e.toLowerCase()))) reason = "blocked";
        else if (seen.has(phone)) reason = "already_contacted";
        if (reason) skipped.push({ company, reason });
        else {
            seen.add(phone);
            eligible.push({ company, phone });
        }
    }
    return { eligible, skipped };
}

export interface EmailEligibility {
    eligible: { company: CompanyRow; email: string }[];
    skipped: { company: CompanyRow; reason: SkipReason }[];
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/i;
/** addresses that are not a person or a business inbox worth writing to */
const NO_REPLY = /^(no-?reply|donotreply|do-not-reply|mailer-daemon|postmaster)@/i;

/** the best address of a company: personal-looking ones before info@/support@ style ones */
export function bestEmail(emails: string[]): string {
    const ok = emails.filter((e) => EMAIL_RE.test(e) && !NO_REPLY.test(e));
    return (ok.find((e) => !/^(info|contact|support|admin|sales|hello|office|mail)@/i.test(e)) ?? ok[0] ?? "").toLowerCase();
}

/** Approved companies with a usable email address, not blocked (by address or phone), not contacted, one mail per address. */
export function emailEligibility(companies: CompanyRow[], blocked: Set<string>): EmailEligibility {
    const eligible: EmailEligibility["eligible"] = [];
    const skipped: EmailEligibility["skipped"] = [];
    const seen = new Set<string>();
    for (const company of companies) {
        const email = bestEmail(company.emails);
        let reason: SkipReason | null = null;
        if (company.status !== "approved") reason = company.status === "contacted" ? "already_contacted" : "not_approved";
        else if (!email) reason = "no_email";
        else if (blocked.has(email) || company.emails.some((e) => blocked.has(e.toLowerCase())) || (!!company.phone && blocked.has(phoneDigits(company.phone)))) reason = "blocked";
        else if (seen.has(email)) reason = "already_contacted";
        if (reason) skipped.push({ company, reason });
        else {
            seen.add(email);
            eligible.push({ company, email });
        }
    }
    return { eligible, skipped };
}

export const gmailLink = (email: string, subject: string, body: string) =>
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const mailtoLink = (email: string, subject: string, body: string) =>
    `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const STOP_LINE_EMAIL_DEFAULT = "إن لم ترغب باستلام رسائلنا، ردّ على هذا البريد بكلمة «إيقاف» ولن نراسلك مجددًا.";

export const SKIP_LABEL: Record<SkipReason, string> = {
    not_approved: "غير معتمدة",
    no_whatsapp: "بلا رقم جوال أو واتساب",
    no_email: "بلا إيميل",
    blocked: "في قائمة «لا ترسل»",
    already_contacted: "تم التواصل معها أو رقم مكرر",
};

/** stable pseudo-random number from a string, so a recipient always gets the same wording */
function hash(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/** every `{a|b|c}` group in the template (not `{name}`) */
const GROUP = /\{([^{}|]*\|[^{}]*)\}/g;

/** number of different messages a template can produce (capped) */
export function variantCount(template: string): number {
    let n = 1;
    for (const m of template.matchAll(GROUP)) n = Math.min(1e6, n * m[1].split("|").length);
    return n;
}

/** `{name}` -> the company's name, `{a|b|c}` -> one of the options, then the stop line */
export function renderMessage(template: string, name: string, stopLine: string, seed: string): string {
    let i = 0;
    const body = template
        .replace(GROUP, (_m, inner: string) => {
            const opts = inner.split("|").map((x) => x.trim());
            return opts[hash(`${seed}:${i++}`) % opts.length];
        })
        .replace(/\{name\}/g, name.trim());
    return [body.trim(), stopLine.trim()].filter(Boolean).join("\n\n");
}

export const waLink = (phone: string, text: string) => `https://wa.me/${phoneDigits(phone)}?text=${encodeURIComponent(text)}`;

/** problems that stop a campaign from being created (Arabic messages) */
export function validateTemplate(template: string): string | null {
    if (template.trim().length < 10) return "اكتب رسالة من 10 أحرف على الأقل.";
    if (template.length > 1500) return "الرسالة طويلة جدًا (الحد 1500 حرف).";
    const open = (template.match(/\{/g) ?? []).length;
    const close = (template.match(/\}/g) ?? []).length;
    if (open !== close) return "عدد الأقواس { } غير متطابق.";
    return null;
}

export interface Recipient {
    id: string;
    campaign_id: string;
    company_id: string | null;
    name: string;
    phone: string;
    email: string;
    status: "pending" | "sent" | "skipped" | "replied" | "stopped" | "failed";
    sent_at: string | null;
    /** why a message failed (or was skipped at the last check), when known */
    error?: string;
}

export interface Campaign {
    id: string;
    name: string;
    channel: "whatsapp" | "email";
    subject: string;
    message: string;
    stop_line: string;
    daily_limit: number;
    status: "active" | "paused" | "done" | "cancelled";
    approved_at: string;
    created_at: string;
    counts: { pending: number; sent: number; skipped: number; replied: number; stopped: number; failed: number };
}

export const RECIPIENT_LABEL: Record<Recipient["status"], string> = {
    pending: "بانتظار الإرسال",
    sent: "أُرسلت",
    skipped: "تخطّيت",
    replied: "ردّ",
    stopped: "طلب الإيقاف",
    failed: "فشلت",
};

/** messages sent today (local time) out of the campaign's daily limit */
export function sentToday(recipients: Pick<Recipient, "sent_at">[], now = new Date()): number {
    const day = now.toDateString();
    return recipients.filter((r) => r.sent_at && new Date(r.sent_at).toDateString() === day).length;
}
