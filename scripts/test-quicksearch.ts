// Checks for the quick search box on the companies page. Run: node scripts/test-quicksearch.ts
import assert from "node:assert/strict";

import { compile } from "../src/lib/prospects/query.ts";
import { quickListSize, quickTerm, withQuickTerm } from "../src/lib/prospects/quicksearch.ts";
import type { Filters } from "../src/lib/prospects/types.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

it("typing a term sets the name filter, and clearing removes it", () => {
    const f = withQuickTerm({ siteQuality: ["weak"] }, "  Maya ");
    assert.deepEqual(f.company, { inc: ["Maya"], exc: [] });
    assert.deepEqual(f.siteQuality, ["weak"]);
    assert.equal(quickTerm(f), "Maya");
    const cleared = withQuickTerm(f, "   ");
    assert.equal("company" in cleared, false);
    assert.deepEqual(cleared.siteQuality, ["weak"]);
});

it("excluded names survive typing and clearing", () => {
    const f: Filters = { company: { inc: [], exc: ["spam"] } };
    assert.deepEqual(withQuickTerm(f, "dent").company, { inc: ["dent"], exc: ["spam"] });
    assert.deepEqual(withQuickTerm(withQuickTerm(f, "dent"), "").company, { inc: [], exc: ["spam"] });
});

it("a loaded list is reported as a list, not as a typed term", () => {
    const f: Filters = { company: { inc: ["a", "b", "c"], exc: [] } };
    assert.equal(quickTerm(f), "");
    assert.equal(quickListSize(f), 3);
    assert.equal(quickListSize({ company: { inc: ["a"], exc: [] } }), 0);
    assert.equal(quickListSize({}), 0);
    // typing replaces the whole list, which is what the box is for
    assert.deepEqual(withQuickTerm(f, "x").company, { inc: ["x"], exc: [] });
});

it("the term reaches the query as a name match on the companies tab", () => {
    const { conds } = compile("companies", withQuickTerm({}, "Dentaland"), { now: new Date() });
    assert.ok(JSON.stringify(conds).includes("Dentaland"));
});

console.log(`\n${passed} checks passed`);
