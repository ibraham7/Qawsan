// Checks for the ready replies. Run: node scripts/test-replies.ts
import assert from "node:assert/strict";

import { MAX_CUSTOM, REPLIES, parseCustom, renderReply, withCustom } from "../src/lib/prospects/replies.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("built-in replies are well formed", () => {
    assert.equal(new Set(REPLIES.map((r) => r.id)).size, REPLIES.length, "unique ids");
    for (const r of REPLIES) {
        assert.ok(r.title.length > 2 && r.hint.length > 10 && r.text.length > 30, r.id);
        assert.ok(r.text.length <= 400, `${r.id}: short enough for WhatsApp`);
        assert.ok(!/https?:|www\./.test(r.text), `${r.id}: no links`);
        // only the placeholders we fill
        for (const m of r.text.matchAll(/\{([^}]*)\}/g)) assert.ok(["name", "price", "issue"].includes(m[1]), `${r.id}: {${m[1]}}`);
    }
});

it("only the closing reply is marked as a stop, and it promises not to write again", () => {
    assert.deepEqual(REPLIES.filter((r) => r.stop).map((r) => r.id), ["no-thanks"]);
    assert.ok(REPLIES.find((r) => r.id === "no-thanks")!.text.includes("لن أراسلكم"));
});

it("the website reply uses only a confirmed problem and the 'who are you' reply is honest about Google Maps", () => {
    assert.ok(REPLIES.find((r) => r.id === "has-site")!.text.includes("{issue}"));
    assert.ok(REPLIES.find((r) => r.id === "who")!.text.includes("خرائط Google"));
    for (const r of REPLIES) assert.ok(!/قديم|ضعيف|سيئ|مهمل/.test(r.text), `${r.id}: no unconfirmed claim`);
});

it("placeholders are filled; a missing price or problem stays visible in brackets and is reported", () => {
    const price = REPLIES.find((r) => r.id === "price")!.text;
    const ok = renderReply(price, { price: "3,000 ريال" });
    assert.ok(ok.text.includes("نبدأ عادةً من 3,000 ريال."));
    assert.deepEqual(ok.missing, []);
    const none = renderReply(price, {});
    assert.ok(none.text.includes("[السعر]"));
    assert.deepEqual(none.missing, ["price"]);
    const site = renderReply(REPLIES.find((r) => r.id === "has-site")!.text, { issue: "لا يظهر بشكل مريح على الجوال" });
    assert.ok(site.text.includes("موقعكم لا يظهر بشكل مريح على الجوال، وهذا"));
    assert.deepEqual(site.missing, []);
    // reported in a fixed order (price, then problem), once each
    assert.deepEqual(renderReply("{issue} و{issue} {price}", {}).missing, ["price", "issue"]);
});

it("{name} is filled, and a missing name leaves no stray space before punctuation", () => {
    assert.equal(renderReply("أهلًا {name}، تفضلوا.", { name: "عيادة الأمل" }).text, "أهلًا عيادة الأمل، تفضلوا.");
    assert.equal(renderReply("أهلًا {name}، تفضلوا.", {}).text, "أهلًا، تفضلوا.");
    assert.equal(renderReply("  مرحبًا   {name} ", { name: "  " }).text, "مرحبًا");
});

it("saved replies: bad storage never breaks, bad entries dropped, same title replaced, limit kept", () => {
    assert.deepEqual(parseCustom(null), []);
    assert.deepEqual(parseCustom("not json"), []);
    assert.deepEqual(parseCustom('{"a":1}'), []);
    const good = { id: "1", title: " ردّي ", text: "نص الرد" };
    const raw = JSON.stringify([good, { id: "2", title: "", text: "x" }, { id: "3", title: "t", text: " " }, { title: "t", text: "x" }, null, { ...good, id: "4", text: "x".repeat(1001) }]);
    assert.deepEqual(parseCustom(raw), [{ ...good, title: "ردّي" }]);
    const a = withCustom([], { title: "ردّي", text: "one" }, "1");
    const b = withCustom(a, { title: "ردّي", text: "two" }, "2");
    assert.deepEqual(b.map((x) => [x.id, x.text]), [["2", "two"]]);
    let many: ReturnType<typeof withCustom> = [];
    for (let i = 0; i < MAX_CUSTOM + 4; i++) many = withCustom(many, { title: `t${i}`, text: "x" }, String(i));
    assert.equal(many.length, MAX_CUSTOM);
    assert.equal(many[0].title, `t${MAX_CUSTOM + 3}`, "newest first");
});

console.log(`\n${passed} checks passed`);
