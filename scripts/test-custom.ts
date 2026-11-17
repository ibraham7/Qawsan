// Checks for the paragraph written by hand for each recipient ({custom}). Run: node scripts/test-custom.ts
import assert from "node:assert/strict";

import { MAX_ISSUE, renderMessage, usesCustom, usesPersonal, validateTemplate } from "../src/lib/prospects/campaigns.ts";
import { PRESETS } from "../src/lib/prospects/templates.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("{custom} is replaced by the recipient's paragraph, like {issue}", () => {
    const t = "مرحبًا {name}.\n\n{custom}\n\nهل يناسبكم؟";
    const out = renderMessage(t, "عيادة الأمل", "للإيقاف ردّ.", "seed", "عندكم نظام حجز يحتاج ربطًا بالواتساب.");
    assert.equal(out, "مرحبًا عيادة الأمل.\n\nعندكم نظام حجز يحتاج ربطًا بالواتساب.\n\nهل يناسبكم؟\n\nللإيقاف ردّ.");
    assert.equal(renderMessage("{issue}", "x", "", "s", "same text"), renderMessage("{custom}", "x", "", "s", "same text"));
    // both in one message are both filled
    assert.equal(renderMessage("{custom} / {issue}", "x", "", "s", "T"), "T / T");
    // the paragraph is trimmed, and a missing one leaves no braces
    assert.equal(renderMessage("[{custom}]", "x", "", "s", "  T  "), "[T]");
    assert.ok(!renderMessage("a {custom} b", "x", "", "s").includes("{"));
});

it("which messages need text written for each recipient", () => {
    assert.equal(usesPersonal("بلا متغيرات"), false);
    assert.equal(usesPersonal("{name} فقط"), false);
    assert.equal(usesPersonal("{issue}"), true);
    assert.equal(usesPersonal("x", "y {custom}"), true);
    assert.equal(usesCustom("{issue}"), false);
    assert.equal(usesCustom("{custom}"), true);
    assert.equal(usesCustom("subject", "body {custom}"), true);
    assert.equal(usesPersonal(), false);
});

it("the paragraph limit is 800 characters (the database allows the same)", () => {
    assert.equal(MAX_ISSUE, 800);
});

it("the custom presets are valid messages that name the company and ask one question", () => {
    for (const p of PRESETS.filter((x) => x.usesCustom)) {
        assert.equal(validateTemplate(p.message), null, p.id);
        assert.ok(p.message.includes("{name}"), p.id);
        assert.equal((p.message.match(/؟/g) ?? []).length, 1, p.id);
        const text = renderMessage(p.message, "عيادة الأمل", "", "seed", "فقرة خاصة بالعيادة.");
        assert.ok(text.includes("فقرة خاصة بالعيادة."), p.id);
        assert.ok(!/[{}]/.test(text), p.id);
    }
});

console.log(`\n${passed} checks passed`);
