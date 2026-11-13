// Checks for automatic email sending rules and the unsubscribe link. Run: node scripts/test-sending.ts
import assert from "node:assert/strict";

import { batchSize, classifyError, dayStart, mustSkip, shortError } from "../src/lib/prospects/sending.ts";
import { unsubscribeUrl, verifyToken, withFooter } from "../src/lib/prospects/unsubscribe.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("start of today in Istanbul (UTC+3, no daylight saving)", () => {
    assert.equal(dayStart(new Date("2026-11-13T10:00:00Z"), "Europe/Istanbul"), "2026-11-12T21:00:00.000Z"); // 13:00 local
    assert.equal(dayStart(new Date("2026-11-13T22:30:00Z"), "Europe/Istanbul"), "2026-11-13T21:00:00.000Z"); // 01:30 on the 14th local
    assert.equal(dayStart(new Date("2026-11-13T21:00:00Z"), "Europe/Istanbul"), "2026-11-13T21:00:00.000Z"); // exactly midnight
    assert.equal(dayStart(new Date("2026-11-13T20:59:59Z"), "Europe/Istanbul"), "2026-11-12T21:00:00.000Z"); // one second before
});

it("start of today follows daylight saving (New York)", () => {
    assert.equal(dayStart(new Date("2026-07-01T12:00:00Z"), "America/New_York"), "2026-07-01T04:00:00.000Z"); // UTC-4
    assert.equal(dayStart(new Date("2026-12-01T12:00:00Z"), "America/New_York"), "2026-12-01T05:00:00.000Z"); // UTC-5
});

it("batch size never passes the daily limit or the batch maximum", () => {
    assert.equal(batchSize(0, 30), 5);
    assert.equal(batchSize(27, 30), 3);
    assert.equal(batchSize(30, 30), 0);
    assert.equal(batchSize(35, 30), 0, "already over the limit");
    assert.equal(batchSize(0, 3), 3);
    assert.equal(batchSize(0, 30, 2), 2);
});

it("last check before sending", () => {
    const ok = { status: "approved", emails: ["info@a.com"], phone: "+90 545 000 00 01" };
    assert.equal(mustSkip("info@a.com", ok, new Set()), null);
    assert.equal(mustSkip("info@a.com", undefined, new Set()), "company_gone");
    assert.equal(mustSkip("info@a.com", { ...ok, status: "not_fit" }, new Set()), "company_not_approved");
    assert.equal(mustSkip("info@a.com", { ...ok, status: "contacted" }, new Set()), "company_not_approved");
    assert.equal(mustSkip("Info@A.com", ok, new Set(["info@a.com"])), "blocked", "the address, any case");
    assert.equal(mustSkip("info@a.com", { ...ok, emails: ["info@a.com", "x@a.com"] }, new Set(["x@a.com"])), "blocked", "another address of the company");
    assert.equal(mustSkip("info@a.com", ok, new Set(["905450000001"])), "blocked", "the company's phone");
});

it("SMTP errors are classified", () => {
    assert.equal(classifyError({ code: "EAUTH", responseCode: 535 }), "auth");
    assert.equal(classifyError({ responseCode: 550 }), "permanent");
    assert.equal(classifyError({ responseCode: 553 }), "permanent");
    assert.equal(classifyError({ responseCode: 451 }), "temporary");
    assert.equal(classifyError({ code: "ETIMEDOUT" }), "temporary");
    assert.ok(shortError({ message: "a\n\nb   c" + "x".repeat(400) }).length <= 200);
});

it("unsubscribe link: signed, tamper-proof, tied to the recipient and the secret", () => {
    const id = "6f574263-166b-43a8-ac52-2c139b67b771";
    const url = new URL(unsubscribeUrl("https://qawsan.website/", "secret-key", id));
    assert.equal(url.origin + url.pathname, "https://qawsan.website/api/unsubscribe");
    assert.equal(url.searchParams.get("r"), id);
    const t = url.searchParams.get("t")!;
    assert.equal(verifyToken("secret-key", id, t), true);
    assert.equal(verifyToken("other-secret", id, t), false);
    assert.equal(verifyToken("secret-key", "49e84ebf-892c-4f1a-bee2-4b0e4cb231bf", t), false, "a different recipient");
    assert.equal(verifyToken("secret-key", id, t.slice(0, -1) + (t.endsWith("A") ? "B" : "A")), false, "one character changed");
    assert.equal(verifyToken("secret-key", id, ""), false);
    assert.equal(verifyToken("secret-key", "not-an-id", t), false);
    assert.equal(verifyToken("secret-key", id + "'; drop", t), false);
});

it("footer adds the link after the stop line", () => {
    const text = withFooter("مرحبًا\n\nللإيقاف ردّ بكلمة إيقاف", "https://qawsan.website/api/unsubscribe?r=1&t=2");
    assert.ok(text.endsWith("https://qawsan.website/api/unsubscribe?r=1&t=2"));
    assert.ok(text.includes("للإيقاف ردّ بكلمة إيقاف\n\n"));
});

console.log(`\n${passed} checks passed`);
