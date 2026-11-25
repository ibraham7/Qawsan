// Checks for the companies "pages" (views by stage). Run: node scripts/test-views.ts
import assert from "node:assert/strict";

import { NEXT_STEP, VIEWS, applyView, viewOf } from "../src/lib/prospects/views.ts";
import { STATUSES } from "../src/lib/prospects/options.ts";
import type { Filters } from "../src/lib/prospects/types.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("each view sets exactly its statuses, and viewOf recognises it back", () => {
    for (const v of VIEWS) {
        const f = applyView({}, v.id);
        assert.equal(viewOf(f), v.id, v.id);
    }
    assert.deepEqual(applyView({}, "review").status, { inc: ["new", "review"], exc: [] });
    assert.deepEqual(applyView({}, "qualified").status, { inc: ["qualified"], exc: [] });
    assert.deepEqual(applyView({}, "contacted").status, { inc: ["contacted", "replied", "interested"], exc: [] });
    assert.deepEqual(applyView({}, "archived"), { showArchived: "only" });
    assert.deepEqual(applyView({}, "all"), {});
});

it("the other filters are kept when the view changes", () => {
    const f: Filters = { siteQuality: ["weak"], contactData: ["mobile"], status: { inc: ["approved"], exc: [] } };
    const q = applyView(f, "qualified");
    assert.deepEqual(q.siteQuality, ["weak"]);
    assert.deepEqual(q.contactData, ["mobile"]);
    assert.deepEqual(q.status, { inc: ["qualified"], exc: [] });
    // going back to "all" drops only the status
    assert.deepEqual(applyView(q, "all"), { siteQuality: ["weak"], contactData: ["mobile"] });
    // archived replaces the status and the archive choice
    assert.deepEqual(applyView({ ...f, showArchived: "all" }, "archived"), { siteQuality: ["weak"], contactData: ["mobile"], showArchived: "only" });
    // leaving the archive removes it
    assert.equal(applyView({ showArchived: "only" }, "review").showArchived, undefined);
    // the input is not changed
    assert.deepEqual(f.status, { inc: ["approved"], exc: [] });
});

it("viewOf is blank for a status set by hand, a saved search, or 'show everything'", () => {
    assert.equal(viewOf({}), "all");
    assert.equal(viewOf({ status: { inc: [], exc: [] } }), "all");
    assert.equal(viewOf({ status: { inc: ["approved", "qualified"], exc: [] } }), "");
    assert.equal(viewOf({ status: { inc: ["approved"], exc: ["new"] } }), "");
    assert.equal(viewOf({ status: { inc: [], exc: ["new"] } }), "");
    assert.equal(viewOf({ showArchived: "all" }), "");
    assert.equal(viewOf({ showArchived: "only", status: { inc: ["approved"], exc: [] } }), "");
    // the order of the statuses does not matter
    assert.equal(viewOf({ status: { inc: ["review", "new"], exc: [] } }), "review");
    // a subset or a superset is not the view
    assert.equal(viewOf({ status: { inc: ["new"], exc: [] } }), "");
    assert.equal(viewOf({ status: { inc: ["contacted", "replied"], exc: [] } }), "");
});

it("the views do not overlap, so a company is on exactly one page (apart from 'all')", () => {
    const seen = new Map<string, string>();
    for (const v of VIEWS.filter((x) => x.statuses)) {
        for (const s of v.statuses as string[]) {
            assert.equal(seen.get(s), undefined, `${s} is in both ${seen.get(s)} and ${v.id}`);
            seen.set(s, v.id);
        }
    }
});

it("the 'move on' step goes review -> qualified -> approved and nowhere else", () => {
    assert.deepEqual(NEXT_STEP.review, { status: "qualified", label: "تأهيل" });
    assert.deepEqual(NEXT_STEP.qualified, { status: "approved", label: "اعتماد للتواصل" });
    assert.deepEqual(Object.keys(NEXT_STEP), ["review", "qualified"]);
});

it("the status menu lets the admin record a message sent straight from WhatsApp", () => {
    const manual = STATUSES.filter((s) => s.manual).map((s) => s.value);
    for (const v of ["contacted", "replied", "interested", "not_interested"]) assert.ok(manual.includes(v), v);
    // statuses that only the system sets stay out of the menu
    for (const v of ["converted", "unsubscribed"]) assert.ok(!manual.includes(v), v);
});

console.log(`\n${passed} checks passed`);
