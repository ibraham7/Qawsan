// Checks for the ready-made message templates and the saved ones. Run: node scripts/test-templates.ts
import assert from "node:assert/strict";

import { renderMessage, validateTemplate, variantCount } from "../src/lib/prospects/campaigns.ts";
import { MAX_SAVED, PRESETS, defaultPreset, parseSaved, presetsFor, withSaved } from "../src/lib/prospects/templates.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("every built-in template is valid and renders without leftovers", () => {
    assert.equal(new Set(PRESETS.map((p) => p.id)).size, PRESETS.length, "unique ids");
    for (const p of PRESETS) {
        assert.equal(validateTemplate(p.message), null, p.id);
        assert.ok(p.message.includes("{name}"), `${p.id} names the company`);
        assert.ok(variantCount(p.message) >= 2, `${p.id} varies its wording`);
        if (p.channel === "email") assert.equal(validateTemplate(`${p.subject} ......`), null, `${p.id} subject`);
        else assert.equal(p.subject, "", `${p.id} has no subject`);
        // rendered for a company with a confirmed problem, nothing is left in braces
        for (const text of [renderMessage(p.message, "عيادة الأمل", "للإيقاف أرسل «إيقاف».", "seed", "لا يظهر بشكل مريح على الجوال"), renderMessage(p.subject, "عيادة الأمل", "", "seed:s", "x")]) {
            assert.ok(!/[{}]/.test(text), `${p.id}: ${text}`);
        }
    }
});

it("first-message rules: one question, no links or numbers in WhatsApp, kept short", () => {
    for (const p of PRESETS) {
        assert.equal((p.message.match(/؟/g) ?? []).length, 1, `${p.id}: exactly one question`);
        if (p.channel === "whatsapp") {
            assert.ok(!/https?:|www\.|\d{5,}/.test(p.message), `${p.id}: no link or phone number in a WhatsApp first message`);
            assert.ok(p.message.length <= 420, `${p.id}: short`);
        }
    }
});

it("{issue} is declared exactly where it is used", () => {
    for (const p of PRESETS) assert.equal(p.usesIssue, p.message.includes("{issue}") || p.subject.includes("{issue}"), p.id);
    assert.deepEqual(PRESETS.filter((p) => p.usesIssue).map((p) => p.id), ["wa-weak-issue", "mail-weak-issue"]);
});

it("{custom} is declared exactly where it is used, on one template per channel", () => {
    for (const p of PRESETS) assert.equal(p.usesCustom, p.message.includes("{custom}") || p.subject.includes("{custom}"), p.id);
    assert.deepEqual(PRESETS.filter((p) => p.usesCustom).map((p) => p.id), ["wa-custom", "mail-custom"]);
    // a custom template never also asks for the confirmed problem (the two work differently)
    for (const p of PRESETS.filter((x) => x.usesCustom)) assert.equal(p.usesIssue, false, p.id);
});

it("nothing is claimed that the audit did not confirm", () => {
    // the only website problem a template may state is {issue}; guesses such as "no booking" or "old design" are never written in
    for (const p of PRESETS) assert.ok(!/قديم|بلا حجز|ضعيف|سيئ|مهمل/.test(p.message), p.id);
});

it("five templates per channel, general first", () => {
    assert.equal(presetsFor("whatsapp").length, 5);
    assert.equal(presetsFor("email").length, 5);
    assert.equal(defaultPreset("whatsapp").id, "wa-general");
    assert.equal(defaultPreset("email").id, "mail-general");
});

it("saved templates: bad storage never breaks, bad entries are dropped", () => {
    assert.deepEqual(parseSaved(null), []);
    assert.deepEqual(parseSaved(""), []);
    assert.deepEqual(parseSaved("not json"), []);
    assert.deepEqual(parseSaved('{"a":1}'), []);
    const good = { id: "1", name: " قالبي ", channel: "whatsapp", subject: "", message: "مرحبًا {name}، هل يناسبكم؟" };
    const raw = JSON.stringify([good, { id: "2", name: "", channel: "whatsapp", message: "x" }, { id: "3", name: "n", channel: "sms", message: "x" }, { name: "n", channel: "email", message: "x" }, null, "str", { ...good, id: "4", message: "x".repeat(1501) }]);
    assert.deepEqual(parseSaved(raw), [{ ...good, name: "قالبي" }]);
});

it("saving a template replaces the same name on the same channel and keeps a limit", () => {
    const a = withSaved([], { name: "عيادات", channel: "whatsapp", subject: "", message: "one" }, "1");
    assert.equal(a.length, 1);
    const b = withSaved(a, { name: "عيادات", channel: "whatsapp", subject: "", message: "two" }, "2");
    assert.deepEqual(b.map((x) => [x.id, x.message]), [["2", "two"]]);
    // the same name on the other channel is a different template
    assert.equal(withSaved(b, { name: "عيادات", channel: "email", subject: "s", message: "m" }, "3").length, 2);
    let many: ReturnType<typeof withSaved> = [];
    for (let i = 0; i < MAX_SAVED + 5; i++) many = withSaved(many, { name: `t${i}`, channel: "email", subject: "", message: "m" }, String(i));
    assert.equal(many.length, MAX_SAVED);
    assert.equal(many[0].name, `t${MAX_SAVED + 4}`, "newest first");
});

console.log(`\n${passed} checks passed`);
