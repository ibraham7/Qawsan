// Checks for the reports numbers. Run: node scripts/test-reports.ts
import assert from "node:assert/strict";

import { pct, sentOf, totals } from "../src/lib/prospects/reports.ts";
import type { Campaign } from "../src/lib/prospects/campaigns.ts";

const camp = (counts: Partial<Campaign["counts"]>): Campaign => ({
    id: "x", name: "x", channel: "whatsapp", subject: "", message: "m", stop_line: "", daily_limit: 20, status: "active",
    approved_at: "", created_at: "", counts: { pending: 0, sent: 0, skipped: 0, replied: 0, stopped: 0, failed: 0, ...counts },
});

assert.equal(sentOf({ pending: 5, sent: 3, skipped: 2, replied: 4, stopped: 1, failed: 6 }), 8, "replied and stopped were sent first; failed ones were not");
assert.equal(pct(1, 3), 33);
assert.equal(pct(5, 0), 0, "no division by zero");

const t = totals([camp({ sent: 6, replied: 3, stopped: 1, pending: 10, failed: 2 }), camp({ sent: 0, replied: 0, skipped: 2 })]);
assert.deepEqual(t, { campaigns: 2, sent: 10, replied: 3, stopped: 1, skipped: 2, failed: 2, pending: 10 });
assert.deepEqual(totals([]), { campaigns: 0, sent: 0, replied: 0, stopped: 0, skipped: 0, failed: 0, pending: 0 });

console.log("ok - reports numbers\n\n1 checks passed");
