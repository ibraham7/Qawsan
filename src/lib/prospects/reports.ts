// Numbers for the reports tab, computed from campaigns and their recipient counts.

import type { Campaign } from "./campaigns.ts";

export interface Totals {
    campaigns: number;
    /** messages actually sent (sent + replied + stopped all started as "sent") */
    sent: number;
    replied: number;
    stopped: number;
    skipped: number;
    failed: number;
    pending: number;
}

export const sentOf = (c: Campaign["counts"]) => c.sent + c.replied + c.stopped;

/** share of sent messages, as a whole percent (0 when nothing was sent) */
export const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export function totals(list: Campaign[]): Totals {
    const t: Totals = { campaigns: list.length, sent: 0, replied: 0, stopped: 0, skipped: 0, failed: 0, pending: 0 };
    for (const c of list) {
        t.sent += sentOf(c.counts);
        t.replied += c.counts.replied;
        t.stopped += c.counts.stopped;
        t.skipped += c.counts.skipped;
        t.failed += c.counts.failed;
        t.pending += c.counts.pending;
    }
    return t;
}
