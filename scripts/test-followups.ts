// Checks for the follow-up rules. Run: node scripts/test-followups.ts
import assert from "node:assert/strict";

import type { Campaign, Recipient } from "../src/lib/prospects/campaigns.ts";
import { DEFAULT_FOLLOWUP_WHATSAPP, dueFollowUps, followUpSubject, followUpText, followUpsToday, daysSince } from "../src/lib/prospects/followups.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const NOW = new Date("2026-11-20T12:00:00Z");
const ago = (days: number, extraHours = 0) => new Date(NOW.getTime() - days * 86_400_000 - extraHours * 3_600_000).toISOString();

const camp = (id: string, over: Partial<Campaign> = {}) =>
    ({ id, name: `حملة ${id}`, channel: "whatsapp", subject: "اقتراح لموقع {name}", stop_line: "للإيقاف أرسل «إيقاف».", status: "active", ...over }) as Campaign;
const rec = (id: string, over: Partial<Recipient> = {}): Recipient => ({
    id, campaign_id: "c1", company_id: `co-${id}`, name: `عيادة ${id}`, phone: "966501110000", email: "", status: "sent", sent_at: ago(4), issue: "", followup_status: "", followup_at: null, ...over,
});
const none = new Set<string>();
const ids = (l: ReturnType<typeof dueFollowUps>) => l.map((x) => x.recipient.id);

it("only sent, unanswered messages old enough are due", () => {
    const list = [
        rec("old", { sent_at: ago(4) }),
        rec("exactly3", { sent_at: ago(3) }),
        rec("almost3", { sent_at: new Date(NOW.getTime() - 3 * 86_400_000 + 60_000).toISOString() }),
        rec("fresh", { sent_at: ago(1) }),
        rec("replied", { status: "replied" }),
        rec("stopped", { status: "stopped" }),
        rec("pending", { status: "pending", sent_at: null }),
        rec("failed", { status: "failed" }),
        rec("skipped", { status: "skipped" }),
    ];
    assert.deepEqual(ids(dueFollowUps(list, [camp("c1")], { now: NOW, days: 3, blocked: none })).sort(), ["exactly3", "old"]);
    // a shorter wait brings the fresher ones in
    assert.deepEqual(ids(dueFollowUps(list, [camp("c1")], { now: NOW, days: 1, blocked: none })).sort(), ["almost3", "exactly3", "fresh", "old"]);
});

it("one follow-up only: done or skipped ones never come back", () => {
    const list = [rec("done", { followup_status: "sent", followup_at: ago(1) }), rec("skip", { followup_status: "skipped" }), rec("new")];
    assert.deepEqual(ids(dueFollowUps(list, [camp("c1")], { now: NOW, days: 3, blocked: none })), ["new"]);
});

it("do-not-contact list: by phone (any format) and by email, any case", () => {
    const list = [rec("a", { phone: "966501110000" }), rec("b", { phone: "905551112233", email: "" }), rec("c", { phone: "", email: "Info@Clinic.example" }), rec("d", { phone: "966502220000" })];
    const blocked = new Set(["966501110000", "info@clinic.example"]);
    assert.deepEqual(ids(dueFollowUps(list, [camp("c1")], { now: NOW, days: 3, blocked })).sort(), ["b", "d"]);
});

it("cancelled campaigns and unknown campaigns are left out; paused and done ones are kept", () => {
    const list = [rec("a", { campaign_id: "c1" }), rec("b", { campaign_id: "c2" }), rec("c", { campaign_id: "c3" }), rec("d", { campaign_id: "c4" })];
    const camps = [camp("c1", { status: "done" }), camp("c2", { status: "cancelled" }), camp("c3", { status: "paused" })];
    assert.deepEqual(ids(dueFollowUps(list, camps, { now: NOW, days: 3, blocked: none })).sort(), ["a", "c"]);
});

it("oldest first, with whole days", () => {
    const list = [rec("five", { sent_at: ago(5) }), rec("nine", { sent_at: ago(9, 5) }), rec("three", { sent_at: ago(3) })];
    const due = dueFollowUps(list, [camp("c1")], { now: NOW, days: 3, blocked: none });
    assert.deepEqual(ids(due), ["nine", "five", "three"]);
    assert.deepEqual(due.map((x) => x.daysAgo), [9, 5, 3]);
    assert.equal(daysSince(ago(0, 5), NOW), 0);
});

it("follow-ups done today use the Istanbul day (UTC+3)", () => {
    // 12:00 UTC on the 20th is 15:00 Istanbul; the day began at 21:00 UTC on the 19th
    const list = [
        rec("a", { followup_status: "sent", followup_at: "2026-11-19T21:00:00.000Z" }), // exactly midnight: today
        rec("b", { followup_status: "sent", followup_at: "2026-11-19T20:59:59.000Z" }), // one second before: yesterday
        rec("c", { followup_status: "sent", followup_at: "2026-11-20T10:00:00.000Z" }),
        rec("d", { followup_status: "skipped", followup_at: "2026-11-20T10:00:00.000Z" }), // skipping is not sending
        rec("e", { followup_status: "" }),
    ];
    assert.equal(followUpsToday(list, NOW), 2);
});

it("follow-up text: name, confirmed problem, stop line, and the Re: subject", () => {
    const due = dueFollowUps([rec("a", { issue: "لا يظهر بشكل مريح على الجوال" })], [camp("c1")], { now: NOW, days: 3, blocked: none })[0];
    const text = followUpText("{مرحبًا|أهلًا} {name}، بخصوص موقعكم الذي {issue}.", due);
    assert.ok(text.includes("عيادة a، بخصوص موقعكم الذي لا يظهر بشكل مريح على الجوال."));
    assert.ok(text.endsWith("للإيقاف أرسل «إيقاف»."));
    assert.ok(!followUpText(DEFAULT_FOLLOWUP_WHATSAPP, due).includes("{"));
    assert.equal(followUpSubject(due), "Re: اقتراح لموقع عيادة a");
    const already = dueFollowUps([rec("b")], [camp("c1", { subject: "Re: hello" })], { now: NOW, days: 3, blocked: none })[0];
    assert.equal(followUpSubject(already), "Re: hello");
});

console.log(`\n${passed} checks passed`);
