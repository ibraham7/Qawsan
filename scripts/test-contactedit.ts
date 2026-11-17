// Checks for entering a WhatsApp number by hand. Run: node scripts/test-contactedit.ts
import assert from "node:assert/strict";

import { eligibility, whatsappNumber } from "../src/lib/prospects/campaigns.ts";
import { cleanWhatsapp } from "../src/lib/prospects/contactedit.ts";
import type { CompanyRow } from "../src/lib/prospects/types.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("a number written any usual way becomes international, by the clinic's country", () => {
    assert.deepEqual(cleanWhatsapp("0555062831", "Saudi Arabia"), { ok: true, number: "+966555062831" });
    assert.deepEqual(cleanWhatsapp("055 506 2831", "Saudi Arabia"), { ok: true, number: "+966555062831" });
    assert.deepEqual(cleanWhatsapp("+966 56 158 1495", "Saudi Arabia"), { ok: true, number: "+966561581495" });
    assert.deepEqual(cleanWhatsapp("00966561581495", ""), { ok: true, number: "+966561581495" });
    assert.deepEqual(cleanWhatsapp("0532 111 22 33", "Türkiye"), { ok: true, number: "+905321112233" });
    // an explicit + beats the clinic's country
    assert.deepEqual(cleanWhatsapp("+971 50 123 4567", "Saudi Arabia"), { ok: true, number: "+971501234567" });
});

it("empty clears the number; a bad number is an error", () => {
    assert.deepEqual(cleanWhatsapp("", "Saudi Arabia"), { ok: true, number: "" });
    assert.deepEqual(cleanWhatsapp("   ", "Saudi Arabia"), { ok: true, number: "" });
    for (const bad of ["123", "abc", "0555", "12345678901234567890"]) assert.equal(cleanWhatsapp(bad, "Saudi Arabia").ok, false, bad);
    // no country and no + : cannot be made international
    assert.equal(cleanWhatsapp("0555062831", "").ok, false);
});

it("a landline is accepted but warned about", () => {
    const r = cleanWhatsapp("013 834 4428", "Saudi Arabia");
    assert.equal(r.ok, true);
    assert.equal(r.ok && r.number, "+966138344428");
    assert.ok(r.ok && r.warning && r.warning.includes("ثابتًا"));
    assert.ok(!(cleanWhatsapp("0555062831", "Saudi Arabia") as { warning?: string }).warning);
});

it("a company with only a landline is skipped by a WhatsApp campaign, and joins it once the number is entered", () => {
    const base = {
        id: "c1", name: "عيادة", status: "approved", phone: "+966 13 834 4428", phone_kind: "landline", whatsapp: "", emails: [], hq_country: "Saudi Arabia",
    } as unknown as CompanyRow;
    const before = eligibility([base], new Set());
    assert.equal(before.eligible.length, 0);
    assert.equal(before.skipped[0].reason, "no_whatsapp");
    const r = cleanWhatsapp("0555062831", base.hq_country);
    assert.ok(r.ok);
    const after = eligibility([{ ...base, whatsapp: r.ok ? r.number : "" }], new Set());
    assert.deepEqual(after.eligible.map((e) => e.phone), ["966555062831"]);
    assert.equal(whatsappNumber({ ...base, whatsapp: "+966555062831" }), "966555062831");
});

console.log(`\n${passed} checks passed`);
