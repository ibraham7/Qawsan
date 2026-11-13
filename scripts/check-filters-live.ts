// Sends the query of every filter to the real database with the PUBLIC key only (no sign-in).
// The rows are protected (RLS) so nothing comes back, but PostgREST still rejects unknown columns,
// wrong operators and malformed values with an error, so a clean answer proves the query is valid.
// Run: node scripts/check-filters-live.ts
import { createClient } from "@supabase/supabase-js";

import { applyTo, compile } from "../src/lib/prospects/query.ts";
import type { Filterable } from "../src/lib/prospects/query.ts";
import type { CompanyRow } from "../src/lib/prospects/types.ts";
import { cases } from "./filter-cases.ts";

const URL = "https://ghdrumngrpttuihyklnc.supabase.co";
const KEY = "sb_publishable_T_twZtdNi64NoAQJkcz5VQ_GfWl_TyT";
const db = createClient(URL, KEY);

const now = new Date();
const look = { id: "00000000-0000-4000-8000-000000000001", industry: "Retail", employees: 50, domain: "demo.example" } as unknown as CompanyRow;
let bad = 0;

for (const c of cases) {
    const filters = JSON.parse(JSON.stringify(c.filters).replaceAll("__FIRST_SIC__", "7011"));
    if (c.name.startsWith("lookalike")) Object.assign(filters, { lookalike: look.domain });
    const compiled = compile(c.tab, filters, { now, ...c.ctx, lookalike: c.name.startsWith("lookalike") ? look : undefined });
    if (compiled.empty) {
        console.log(`skip ${c.tab.padEnd(9)} ${c.name} (an empty list never reaches the database)`);
        continue;
    }
    const select = c.tab === "people" ? `*, company:qawsan_companies${compiled.needsCompany ? "!inner" : ""}(*)` : "*";
    let q = db.from(c.tab === "people" ? "qawsan_people" : "qawsan_companies").select(select, { count: "exact" });
    q = applyTo(q as unknown as Filterable<typeof q>, compiled.conds) as typeof q;
    const { error, status } = await q.range(0, 4);
    if (error) {
        bad++;
        console.log(`FAIL ${c.tab.padEnd(9)} ${c.name}: ${status} ${error.message}`);
    } else {
        console.log(`ok   ${c.tab.padEnd(9)} ${c.name}`);
    }
}

console.log(bad ? `\n${bad} queries were rejected by the database` : `\nall ${cases.length} queries accepted by the database`);
if (bad) process.exit(1);
