// Follow-ups: companies we messaged a few days ago that have not answered, so the first message is
// not the only one they get. Pure rules (no network), used by the follow-up card in the reports tab.
//
// Safety rules, all checked here:
//   - one follow-up per company, never a second (followup_status is set once);
//   - nobody who answered, asked to stop, or is on the do-not-contact list;
//   - a daily cap, so a few clicks cannot turn into a burst of messages.

import { phoneDigits, renderMessage } from "./campaigns.ts";
import type { Campaign, Recipient } from "./campaigns.ts";
import { dayStart } from "./sending.ts";

export const FOLLOWUP_DAILY_LIMIT = 20;
export const FOLLOWUP_DAYS = [2, 3, 5, 7];
export const DEFAULT_FOLLOWUP_DAYS = 3;

export const DEFAULT_FOLLOWUP_WHATSAPP = "{السلام عليكم|مرحبًا} {name}، أتابع رسالتي السابقة. إن كان الموضوع يناسبكم يسعدني أن أرسل لكم التفاصيل، وإن لم يناسب فلا مشكلة.";
export const DEFAULT_FOLLOWUP_EMAIL = "{مرحبًا|أهلًا} فريق {name}،\n\nأتابع رسالتي السابقة. إن كان الموضوع يناسبكم يسعدني أن أرسل لكم التفاصيل، وإن لم يناسب فلا مشكلة.\n\nمع التحية،\nإبراهيم - قوسان";

const DAY_MS = 86_400_000;

export interface FollowUp {
    recipient: Recipient;
    campaign: Pick<Campaign, "id" | "name" | "channel" | "subject" | "stop_line" | "status">;
    /** whole days since the first message */
    daysAgo: number;
}

/** whole days between a past moment and now (never negative) */
export const daysSince = (iso: string, now: Date) => Math.max(0, Math.floor((now.getTime() - Date.parse(iso)) / DAY_MS));

/**
 * The recipients to follow up, oldest first: sent at least `days` days ago, no answer, no earlier
 * follow-up (done or skipped), campaign not cancelled, and not on the do-not-contact list.
 */
export function dueFollowUps(
    recipients: Recipient[],
    campaigns: Pick<Campaign, "id" | "name" | "channel" | "subject" | "stop_line" | "status">[],
    opts: { now: Date; days: number; blocked: Set<string> }
): FollowUp[] {
    const byId = new Map(campaigns.map((c) => [c.id, c]));
    const out: FollowUp[] = [];
    for (const r of recipients) {
        const campaign = byId.get(r.campaign_id);
        if (!campaign || campaign.status === "cancelled") continue;
        if (r.status !== "sent" || !r.sent_at) continue;
        if ((r.followup_status ?? "") !== "") continue;
        if (opts.now.getTime() - Date.parse(r.sent_at) < opts.days * DAY_MS) continue;
        const phone = r.phone ? phoneDigits(r.phone) : "";
        if ((phone && opts.blocked.has(phone)) || (r.email && opts.blocked.has(r.email.toLowerCase()))) continue;
        out.push({ recipient: r, campaign, daysAgo: daysSince(r.sent_at, opts.now) });
    }
    return out.sort((a, b) => Date.parse(a.recipient.sent_at!) - Date.parse(b.recipient.sent_at!));
}

/** follow-ups already done today (the day starts at midnight in the given time zone) */
export function followUpsToday(recipients: Recipient[], now: Date, timeZone = "Europe/Istanbul"): number {
    const start = Date.parse(dayStart(now, timeZone));
    return recipients.filter((r) => r.followup_status === "sent" && r.followup_at && Date.parse(r.followup_at) >= start).length;
}

/** the follow-up text for one recipient: the template with their name and confirmed website problem, then the stop line */
export function followUpText(template: string, f: FollowUp): string {
    return renderMessage(template, f.recipient.name, f.campaign.stop_line, `${f.recipient.company_id ?? f.recipient.id}:f`, f.recipient.issue ?? "");
}

/** the follow-up subject for an email: "Re:" plus the first subject, so it threads with it */
export function followUpSubject(f: FollowUp): string {
    const first = renderMessage(f.campaign.subject, f.recipient.name, "", `${f.recipient.company_id ?? f.recipient.id}:s`, f.recipient.issue ?? "");
    return /^re:/i.test(first) ? first : `Re: ${first}`;
}
