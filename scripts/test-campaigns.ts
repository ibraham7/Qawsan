// Checks for WhatsApp campaign logic. Run: node scripts/test-campaigns.ts
import assert from "node:assert/strict";

import { bestEmail, eligibility, emailEligibility, gmailLink, mailtoLink, phoneDigits, renderMessage, sentToday, validateTemplate, variantCount, waLink, whatsappNumber } from "../src/lib/prospects/campaigns.ts";
import { makeDemo } from "../src/lib/prospects/demo.ts";
import type { CompanyRow } from "../src/lib/prospects/types.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const base = makeDemo().companies[0];
const co = (o: Partial<CompanyRow>): CompanyRow => ({ ...base, status: "approved", phone: "", phone_kind: "", whatsapp: "", emails: [], ...o });

it("phone digits and the wa.me link", () => {
    assert.equal(phoneDigits("+90 545 164 51 77"), "905451645177");
    assert.equal(phoneDigits("00966 50 123 4567"), "966501234567");
    const l = waLink("+90 545 164 51 77", "مرحبًا\nكيف الحال؟");
    assert.ok(l.startsWith("https://wa.me/905451645177?text="));
    assert.equal(decodeURIComponent(l.split("?text=")[1]), "مرحبًا\nكيف الحال؟");
});

it("which number is used", () => {
    assert.equal(whatsappNumber(co({ whatsapp: "+966501112222", phone: "+966 11 000 0000", phone_kind: "landline" })), "966501112222");
    assert.equal(whatsappNumber(co({ phone: "+90 545 000 00 01", phone_kind: "mobile" })), "905450000001");
    assert.equal(whatsappNumber(co({ phone: "+90 212 000 00 00", phone_kind: "landline" })), "");
});

it("eligibility: approved + mobile/whatsapp, not blocked, not contacted, no duplicates", () => {
    const list = [
        co({ id: "a", phone: "+90 545 000 00 01", phone_kind: "mobile" }), // ok
        co({ id: "b", phone: "+90 212 000 00 00", phone_kind: "landline" }), // landline
        co({ id: "c", phone: "+90 545 000 00 03", phone_kind: "mobile", status: "review" }), // not approved
        co({ id: "d", phone: "+90 545 000 00 04", phone_kind: "mobile", status: "contacted" }), // already
        co({ id: "e", phone: "+90 545 000 00 05", phone_kind: "mobile" }), // phone blocked
        co({ id: "f", phone: "+90 545 000 00 06", phone_kind: "mobile", emails: ["No@x.com"] }), // email blocked
        co({ id: "g", phone: "+90 545 000 00 01", phone_kind: "mobile" }), // same number as a
        co({ id: "h", whatsapp: "+971500000007" }), // whatsapp from website
    ];
    const r = eligibility(list, new Set(["905450000005", "no@x.com"]));
    assert.deepEqual(r.eligible.map((e) => e.company.id), ["a", "h"]);
    const why = Object.fromEntries(r.skipped.map((s) => [s.company.id, s.reason]));
    assert.deepEqual(why, { b: "no_whatsapp", c: "not_approved", d: "already_contacted", e: "blocked", f: "blocked", g: "already_contacted" });
});

it("message: name, variants, stop line; same recipient always gets the same wording", () => {
    const t = "{مرحبًا|أهلًا|السلام عليكم} {name}، عندنا عرض.";
    assert.equal(variantCount(t), 3);
    assert.equal(variantCount("{name} بلا خيارات"), 1);
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
        const m = renderMessage(t, "عيادة النور", "إيقاف؟", `id-${i}`);
        assert.ok(m.includes("عيادة النور"));
        assert.ok(m.endsWith("\n\nإيقاف؟"));
        assert.ok(!m.includes("{") && !m.includes("|"));
        seen.add(m.split(" ")[0]);
    }
    assert.equal(seen.size, 3, "all three greetings are used across recipients");
    assert.equal(renderMessage(t, "س", "", "same"), renderMessage(t, "س", "", "same"));
    assert.equal(renderMessage("مرحبًا {name}", "س", "", "x"), "مرحبًا س");
});

it("template validation", () => {
    assert.ok(validateTemplate("قصير"));
    assert.ok(validateTemplate("{مرحبًا|أهلًا {name} رسالة طويلة بما يكفي"));
    assert.equal(validateTemplate("مرحبًا {name}، رسالة طويلة بما يكفي"), null);
});

it("messages sent today", () => {
    const now = new Date("2026-11-13T15:00:00");
    const r = [{ sent_at: "2026-11-13T09:00:00" }, { sent_at: "2026-11-13T14:30:00" }, { sent_at: "2026-11-12T23:00:00" }, { sent_at: null }];
    assert.equal(sentToday(r, now), 2);
});

it("best email: personal before info@, skips no-reply and invalid", () => {
    assert.equal(bestEmail(["info@x.com", "Dr.Ali@x.com"]), "dr.ali@x.com");
    assert.equal(bestEmail(["noreply@x.com", "info@x.com"]), "info@x.com");
    assert.equal(bestEmail(["noreply@x.com", "bad@@x", "x"]), "");
    assert.equal(bestEmail([]), "");
});

it("email eligibility: approved + address, not blocked (address or phone), not contacted, one mail per address", () => {
    const list = [
        co({ id: "a", emails: ["info@a.com"] }), // ok
        co({ id: "b", emails: [] }), // no email
        co({ id: "c", emails: ["info@c.com"], status: "review" }), // not approved
        co({ id: "d", emails: ["info@d.com"], status: "contacted" }), // already
        co({ id: "e", emails: ["info@e.com"] }), // address blocked
        co({ id: "f", emails: ["info@f.com"], phone: "+90 545 000 00 06" }), // phone blocked
        co({ id: "g", emails: ["INFO@a.com"] }), // same address as a
        co({ id: "h", emails: ["noreply@h.com"] }), // only a no-reply address
    ];
    const r = emailEligibility(list, new Set(["info@e.com", "905450000006"]));
    assert.deepEqual(r.eligible.map((e) => e.company.id), ["a"]);
    const why = Object.fromEntries(r.skipped.map((x) => [x.company.id, x.reason]));
    assert.deepEqual(why, { b: "no_email", c: "not_approved", d: "already_contacted", e: "blocked", f: "blocked", g: "already_contacted", h: "no_email" });
});

it("gmail and mailto links carry subject and body", () => {
    const g = new URL(gmailLink("a@b.com", "عنوان & مهم", "سطر1\nسطر2"));
    assert.equal(g.hostname, "mail.google.com");
    assert.equal(g.searchParams.get("to"), "a@b.com");
    assert.equal(g.searchParams.get("su"), "عنوان & مهم");
    assert.equal(g.searchParams.get("body"), "سطر1\nسطر2");
    const m = mailtoLink("a@b.com", "عنوان", "نص\nآخر");
    assert.ok(m.startsWith("mailto:a@b.com?subject="));
    assert.equal(decodeURIComponent(m.split("&body=")[1]), "نص\nآخر");
});

console.log(`\n${passed} checks passed`);
