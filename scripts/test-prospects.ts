// Checks for the prospect filter logic. Run: node scripts/test-prospects.ts
import assert from "node:assert/strict";

import { makeDemo } from "../src/lib/prospects/demo.ts";
import { PRESETS } from "../src/lib/prospects/options.ts";
import { applyTo, compile, matches } from "../src/lib/prospects/query.ts";
import type { Filterable } from "../src/lib/prospects/query.ts";
import { activeCount, chips, clean, decodeState, encodeState } from "../src/lib/prospects/state.ts";
import type { Filters, PersonRow } from "../src/lib/prospects/types.ts";

let passed = 0;
const it = (name: string, fn: () => void) => {
    fn();
    passed++;
    console.log("ok -", name);
};

const now = new Date("2026-11-10T00:00:00Z");
const demo = makeDemo();
const run = (f: Filters) => {
    const c = compile("people", f, { now });
    return demo.people.filter((p) => matches(c, p as unknown as Record<string, unknown>));
};

/** records what the query builder receives */
class Rec implements Filterable<Rec> {
    calls: string[] = [];
    filter(c: string, o: string, v: string) {
        this.calls.push(`${c}=${o}.${v}`);
        return this;
    }
    or(f: string, opts?: { referencedTable?: string }) {
        this.calls.push(`${opts?.referencedTable ? opts.referencedTable + "." : ""}or=(${f})`);
        return this;
    }
}

it("preset matches exactly the rows a hand-written check accepts", () => {
    const preset = PRESETS[0].filters;
    const got = run(preset);
    const want = demo.people.filter(
        (p) =>
            p.country === "Saudi Arabia" &&
            ["Riyadh", "Jeddah", "Dammam"].includes(p.city) &&
            ["Owner", "Founder", "C-Suite", "Director"].includes(p.seniority) &&
            ["Marketing", "Management"].includes(p.department) &&
            p.email_status === "verified" &&
            p.company !== null &&
            p.company.employees !== null &&
            p.company.employees >= 11 &&
            p.company.employees <= 200
    );
    assert.deepEqual(got.map((p) => p.id), want.map((p) => p.id));
    console.log(`   preset: ${got.length} of ${demo.people.length} demo people`);
});

it("exclude keeps rows with an empty value and drops matching ones", () => {
    const got = run({ titles: { inc: [], exc: ["Manager"] } });
    assert.ok(got.length > 0);
    assert.ok(got.every((p) => !p.title.toLowerCase().includes("manager")));
});

it("similar titles widen the match (CEO -> Managing Director etc.)", () => {
    const exact = run({ titles: { inc: ["CEO"], exc: [] } }).length;
    const similar = run({ titles: { inc: ["CMO"], exc: [], similar: true } });
    assert.ok(exact > 0);
    assert.ok(similar.some((p) => p.title === "Head of Marketing" || p.title === "Marketing Director"));
});

it("phone status options are OR'ed", () => {
    const got = run({ phoneStatus: ["mobile", "none"] });
    assert.ok(got.every((p) => p.phone_mobile !== "" || (p.phone_mobile === "" && p.phone_direct === "")));
    assert.ok(got.length > run({ phoneStatus: ["mobile"] }).length);
});

it("radius keeps only people near the city", () => {
    const got = run({ personLocation: { radius: { city: "Riyadh", km: 50 } } });
    assert.ok(got.length > 0);
    assert.ok(got.every((p) => p.city === "Riyadh"));
});

it("company filters drop people with no company (inner join)", () => {
    const got = run({ industry: { inc: [], exc: ["Retail"] } });
    assert.ok(got.every((p: PersonRow) => p.company && p.company.industry !== "Retail"));
});

it("lookalike without a known company only warns", () => {
    const c = compile("companies", { lookalike: "nowhere.example" }, { now, lookalike: null });
    assert.equal(c.conds.length, 0);
    assert.equal(c.warnings.length, 1);
});

it("an included list with no items can never match", () => {
    const c = compile("people", { lists: { inc: ["x"], exc: [] } }, { now, listIds: { inc: [], exc: [] } });
    assert.equal(c.empty, true);
});

it("PostgREST output for the preset", () => {
    const c = compile("people", PRESETS[0].filters, { now });
    const q = applyTo(new Rec(), c.conds);
    assert.deepEqual(q.calls, [
        "seniority=in.(Owner,Founder,C-Suite,Director)",
        "department=in.(Marketing,Management)",
        'country=in.("Saudi Arabia")',
        "city=in.(Riyadh,Jeddah,Dammam)",
        "email_status=in.(verified)",
        "company.or=(and(employees.gte.11,employees.lte.20),and(employees.gte.21,employees.lte.50),and(employees.gte.51,employees.lte.100),and(employees.gte.101,employees.lte.200))",
    ]);
    assert.equal(c.needsCompany, true);
});

it("PostgREST quoting: ilike, arrays, empty text", () => {
    const c = compile("people", {
        titles: { inc: ["Sales, Manager", "CEO"], exc: ['Head "X"'] },
        technologies: { inc: ["Next.js"], exc: ["Wix"] },
        phoneStatus: ["none"],
    }, { now });
    const q = applyTo(new Rec(), c.conds);
    assert.deepEqual(q.calls, [
        'or=(title.ilike."*Sales, Manager*",title.ilike."*CEO*")',
        'title=not.ilike.*Head "X"*',
        'or=(and(phone_mobile.eq."",phone_direct.eq.""))',
        'company.technologies=ov.{"Next.js"}',
        'company.technologies=not.ov.{"Wix"}',
    ]);
});

it("URL round trip keeps Arabic and drops empty filters", () => {
    const s = { tab: "companies" as const, people: { name: "محمد", seniority: { inc: [], exc: [] } }, companies: { keywords: { inc: ["عيادة"], exc: [] } } };
    const back = decodeState("?" + encodeState(s));
    assert.equal(back.tab, "companies");
    assert.deepEqual(back.people, { name: "محمد" });
    assert.deepEqual(back.companies, { keywords: { inc: ["عيادة"], exc: [] } });
    assert.deepEqual(decodeState("?f=%%%broken"), { tab: "people", people: {}, companies: {} });
});

it("active count, chips and chip removal", () => {
    const f = PRESETS[0].filters;
    assert.equal(activeCount(f, "people"), 5);
    assert.equal(activeCount(f, "companies"), 1); // only employees applies to companies
    const cs = chips(f, "people", { lists: {}, sequences: {} });
    assert.equal(cs.length, 1 + 3 + 4 + 2 + 4 + 1);
    let g: Filters = f;
    for (const c of chips(g, "people", { lists: {}, sequences: {} })) g = c.remove(g);
    assert.deepEqual(clean(g, "people"), {});
});

console.log(`\n${passed} checks passed`);
