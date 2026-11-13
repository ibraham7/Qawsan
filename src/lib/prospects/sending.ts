// Rules for automatic email sending that do not need the network, so they can be tested:
// the day boundary, how many messages may still go out today, and which recipients must NOT
// be sent to even though they are still "pending".

export const BATCH_MAX = 5;

/** midnight (start of today) in the given time zone, as an ISO instant */
export function dayStart(now: Date, timeZone: string): string {
    const parts = (d: Date) =>
        Object.fromEntries(
            new Intl.DateTimeFormat("en-CA", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
                .formatToParts(d)
                .map((p) => [p.type, Number(p.value)])
        ) as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;
    // offset of the zone at a given instant, in ms (zone time minus UTC)
    const offset = (d: Date) => {
        const p = parts(d);
        return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(d.getTime() / 1000) * 1000;
    };
    const p = parts(now);
    const localMidnightAsUtc = Date.UTC(p.year, p.month - 1, p.day);
    let start = localMidnightAsUtc - offset(new Date(localMidnightAsUtc));
    start = localMidnightAsUtc - offset(new Date(start)); // second pass settles daylight-saving edges
    return new Date(start).toISOString();
}

/** how many more messages may be sent now: what is left of today's limit, at most one batch */
export const batchSize = (sentToday: number, dailyLimit: number, max = BATCH_MAX) => Math.max(0, Math.min(max, dailyLimit - sentToday));

export type SendSkip = "company_gone" | "company_not_approved" | "blocked";

export interface CompanyLite {
    status: string;
    emails: string[];
    phone: string;
}

/**
 * Last check before a message goes out. A recipient that was valid when the campaign was
 * created may have been blocked, rejected or deleted since.
 */
export function mustSkip(target: string, company: CompanyLite | undefined, blocked: Set<string>): SendSkip | null {
    if (!company) return "company_gone";
    if (company.status !== "approved") return "company_not_approved";
    const phone = company.phone.replace(/\D/g, "").replace(/^00/, "");
    if (blocked.has(target.toLowerCase()) || company.emails.some((e) => blocked.has(e.toLowerCase())) || (phone && blocked.has(phone))) return "blocked";
    return null;
}

/** SMTP errors: 5xx = the address or message is refused for good; auth = wrong credentials */
export function classifyError(err: { code?: string; responseCode?: number; message?: string }): "auth" | "permanent" | "temporary" {
    if (err.code === "EAUTH") return "auth";
    if (typeof err.responseCode === "number" && err.responseCode >= 500 && err.responseCode < 600) return "permanent";
    return "temporary";
}

/** a short, safe reason to keep with a failed recipient (never contains credentials) */
export const shortError = (err: { message?: string }) => (err.message ?? "unknown error").replace(/\s+/g, " ").slice(0, 200);
