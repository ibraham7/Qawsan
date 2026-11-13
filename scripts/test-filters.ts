// Offline check of every filter against the generated demo data.
// Each case compares the result of the real query code with an independent expectation.
// Run: node scripts/test-filters.ts
import assert from "node:assert/strict";

import { makeDemo } from "../src/lib/prospects/demo.ts";
import { compile, matches } from "../src/lib/prospects/query.ts";
import type { Context } from "../src/lib/prospects/query.ts";
import type { CompanyRow, PersonRow } from "../src/lib/prospects/types.ts";
import { cases } from "./filter-cases.ts";

const demo = makeDemo();
const now = new Date();
let failed = 0;
const lines: string[] = [];

// concrete values the cases name with placeholders
const firstSic = demo.companies.find((c) => c.sic_codes.length)!.sic_codes[0];
const look = demo.companies.find((c) => c.industry && c.employees && c.employees > 20)!;

for (const c of cases) {
    const rows: (CompanyRow | PersonRow)[] = c.tab === "people" ? demo.people : demo.companies;
    let filters = JSON.parse(JSON.stringify(c.filters).replaceAll("__FIRST_SIC__", firstSic));
    let want = c.want;
    const ctx: Context = { now, ...c.ctx };
    if (c.name.startsWith("lookalike")) {
        filters = { lookalike: look.domain };
        ctx.lookalike = look;
        want = (r) => {
            const x = r as CompanyRow;
            return x.industry === look.industry && x.employees !== null && x.employees >= Math.floor(look.employees! / 2) && x.employees <= Math.ceil(look.employees! * 2) && x.id !== look.id;
        };
    }
    if (c.name === "sic codes") want = (r) => (r as CompanyRow).sic_codes.includes(firstSic);

    const compiled = compile(c.tab, filters, ctx);
    const got = rows.filter((r) => matches(compiled, r as unknown as Record<string, unknown>)).map((r) => r.id).sort();
    const exp = rows.filter(want).map((r) => r.id).sort();
    try {
        assert.deepEqual(got, exp);
        if (c.empty) assert.equal(got.length, 0, "expected no rows");
        else assert.ok(got.length > 0, "the demo data has no row for this filter, so the check proves nothing");
        if (!c.empty) assert.ok(got.length < rows.length || c.name.includes("exclude") || c.name.includes("not in"), "the filter did not narrow anything");
        lines.push(`ok   ${c.tab.padEnd(9)} ${c.name} -> ${got.length}/${rows.length}`);
    } catch (e) {
        failed++;
        lines.push(`FAIL ${c.tab.padEnd(9)} ${c.name}: got ${got.length}, expected ${exp.length} (${(e as Error).message.split("\n")[0]})`);
    }
}

console.log(lines.join("\n"));
console.log(`\n${cases.length - failed}/${cases.length} filters match their independent expectation`);
if (failed) process.exit(1);
