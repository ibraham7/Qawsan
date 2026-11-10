// Filters -> a small condition tree -> either a Supabase (PostgREST) query or an in-memory test.
// Both run from the same tree, so the demo mode and the tests check the same meaning the
// database applies.

import {
    CITIES,
    EMPLOYEE_BANDS,
    REVENUE_BANDS,
    SCORE_GRADES,
    TITLE_SYNONYMS,
    since,
} from "./options.ts";
import type { CompanyRow, Filters, IncExc, Location, Range, Tab } from "./types.ts";

/* ------------------------------------------------------------------ */
/* condition tree                                                       */

export type Op =
    | "eq" // equals
    | "in" // one of
    | "nin" // none of
    | "has" // contains text, case-insensitive
    | "nhas" // does not contain text
    | "gte"
    | "lte"
    | "null"
    | "notnull"
    | "ov" // array overlaps
    | "nov" // array does not overlap
    | "filled" // text not '' / array not empty
    | "blank"; // text '' / array empty

export interface Leaf {
    f: string; // column, "company.<column>" for the person's company
    op: Op;
    v?: string | number | boolean | string[];
}
export type Cond = Leaf | { or: Cond[] } | { and: Cond[] };

const ARRAY_FIELDS = new Set([
    "keywords", "sic_codes", "naics_codes", "technologies", "intent_topics", "signals", "sequence_ids", "languages",
    "emails", "place_types",
]);

export interface Context {
    now: Date;
    /** ids that belong to the included / excluded saved lists */
    listIds?: { inc: string[] | null; exc: string[] };
    /** the company named in "lookalikes", or null when it is not in the database */
    lookalike?: CompanyRow | null;
}

export interface Compiled {
    conds: Cond[];
    /** true when the filters can never match (e.g. an empty included list) */
    empty: boolean;
    /** true when a person search needs an inner join on the company */
    needsCompany: boolean;
    warnings: string[];
}

/* ------------------------------------------------------------------ */
/* helpers                                                              */

const nonEmpty = (x?: IncExc) => !!x && (x.inc.length > 0 || x.exc.length > 0);
const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);
const day = (iso: string) => iso.slice(0, 10);

function range(f: string, r: Range | undefined, out: Cond[]) {
    if (!r) return;
    if (isNum(r.min)) out.push({ f, op: "gte", v: r.min });
    if (isNum(r.max)) out.push({ f, op: "lte", v: r.max });
}

/** OR of [min,max] bands plus an optional custom range */
function bands(f: string, chosen: string[], table: Record<string, [number, number | null]>, custom: Range, out: Cond[]) {
    const alts: Cond[] = [];
    for (const key of chosen) {
        const b = table[key];
        if (!b) continue;
        const parts: Cond[] = [{ f, op: "gte", v: b[0] }];
        if (b[1] !== null) parts.push({ f, op: "lte", v: b[1] });
        alts.push(parts.length === 1 ? parts[0] : { and: parts });
    }
    const c: Cond[] = [];
    range(f, custom, c);
    if (c.length) alts.push(c.length === 1 ? c[0] : { and: c });
    if (alts.length === 1) out.push(alts[0]);
    else if (alts.length > 1) out.push({ or: alts });
}

function incExc(f: string, x: IncExc | undefined, out: Cond[]) {
    if (!x) return;
    if (x.inc.length) out.push({ f, op: "in", v: x.inc });
    if (x.exc.length) out.push({ f, op: "nin", v: x.exc });
}

/** titles, expanded with synonyms when "similar" is on */
export function expandTitles(titles: string[], similar: boolean): string[] {
    if (!similar) return titles;
    const out = new Set(titles);
    for (const t of titles) {
        const low = t.toLowerCase();
        for (const group of TITLE_SYNONYMS) {
            if (group.some((g) => g.toLowerCase() === low)) group.forEach((g) => out.add(g));
        }
    }
    return [...out];
}

function location(p: string, cols: { country: string; region: string; city: string; lat: string; lng: string }, loc: Location | undefined, out: Cond[], warnings: string[]) {
    if (!loc) return;
    incExc(p + cols.country, loc.countries, out);
    incExc(p + cols.region, loc.regions, out);
    incExc(p + cols.city, loc.cities, out);
    if (loc.radius && loc.radius.km > 0) {
        const city = CITIES.find((c) => c.name.toLowerCase() === loc.radius!.city.toLowerCase());
        if (!city) {
            warnings.push(`المدينة «${loc.radius.city}» غير معروفة لفلتر النطاق.`);
            return;
        }
        // bounding box: close enough for "within N km" and works with plain indexes
        const dLat = loc.radius.km / 111;
        const dLng = loc.radius.km / (111 * Math.cos((city.lat * Math.PI) / 180));
        out.push(
            { f: p + cols.lat, op: "gte", v: +(city.lat - dLat).toFixed(5) },
            { f: p + cols.lat, op: "lte", v: +(city.lat + dLat).toFixed(5) },
            { f: p + cols.lng, op: "gte", v: +(city.lng - dLng).toFixed(5) },
            { f: p + cols.lng, op: "lte", v: +(city.lng + dLng).toFixed(5) }
        );
    }
}

const looksLikeDomain = (s: string) => /^[^\s]+\.[a-z]{2,}$/i.test(s.trim());
export const normDomain = (s: string) =>
    s.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

/* ------------------------------------------------------------------ */
/* compile                                                              */

export function compile(tab: Tab, f: Filters, ctx: Context): Compiled {
    const out: Cond[] = [];
    const warnings: string[] = [];
    let empty = false;
    const P = tab === "people" ? "company." : "";

    // ---------- person ----------
    if (tab === "people") {
        if (f.titles && nonEmpty(f.titles)) {
            const inc = expandTitles(f.titles.inc, !!f.titles.similar);
            const exc = expandTitles(f.titles.exc, !!f.titles.similar);
            if (inc.length) out.push(inc.length === 1 ? { f: "title", op: "has", v: inc[0] } : { or: inc.map((t) => ({ f: "title", op: "has", v: t }) as Leaf) });
            for (const t of exc) out.push({ f: "title", op: "nhas", v: t });
        }
        incExc("seniority", f.seniority, out);
        incExc("department", f.departments, out);
        location("", { country: "country", region: "region", city: "city", lat: "lat", lng: "lng" }, f.personLocation, out, warnings);
        if (f.name?.trim()) out.push({ f: "full_name", op: "has", v: f.name.trim() });
        if (f.emailStatus?.length) out.push({ f: "email_status", op: "in", v: f.emailStatus });
        if (f.phoneStatus?.length) {
            const alts: Cond[] = [];
            if (f.phoneStatus.includes("mobile")) alts.push({ f: "phone_mobile", op: "filled" });
            if (f.phoneStatus.includes("direct")) alts.push({ f: "phone_direct", op: "filled" });
            if (f.phoneStatus.includes("none")) alts.push({ and: [{ f: "phone_mobile", op: "blank" }, { f: "phone_direct", op: "blank" }] });
            if (alts.length === 1) out.push(alts[0]);
            else if (alts.length) out.push({ or: alts });
        }
        if (f.roleTenure) {
            // started at least `min` months ago and at most `max` months ago
            const at = (months: number) => {
                const d = new Date(ctx.now.getTime());
                d.setUTCMonth(d.getUTCMonth() - months);
                return day(d.toISOString());
            };
            if (isNum(f.roleTenure.min)) out.push({ f: "role_started_on", op: "lte", v: at(f.roleTenure.min) });
            if (isNum(f.roleTenure.max)) out.push({ f: "role_started_on", op: "gte", v: at(f.roleTenure.max) });
        }
        range("experience_years", f.experience, out);
        if (f.jobChange) {
            const s = since(f.jobChange, ctx.now);
            if (s) out.push({ f: "job_changed_at", op: "gte", v: day(s) });
        }
        if (f.languages?.length) out.push({ f: "languages", op: "ov", v: f.languages });
    }

    // ---------- company (the person's company on the people tab) ----------
    const companyStart = out.length;

    if (f.company && nonEmpty(f.company)) {
        const match = (v: string, neg: boolean): Leaf =>
            looksLikeDomain(v)
                ? { f: P + "domain", op: neg ? "nhas" : "has", v: normDomain(v) }
                : { f: P + "name", op: neg ? "nhas" : "has", v: v.trim() };
        const inc = f.company.inc.filter((v) => v.trim());
        if (inc.length === 1) out.push(match(inc[0], false));
        else if (inc.length > 1) out.push({ or: inc.map((v) => match(v, false)) });
        for (const v of f.company.exc) if (v.trim()) out.push(match(v, true));
    }
    location(P, { country: "hq_country", region: "hq_region", city: "hq_city", lat: "hq_lat", lng: "hq_lng" }, f.hqLocation, out, warnings);
    if (f.employees) bands(P + "employees", f.employees.presets, EMPLOYEE_BANDS, f.employees, out);
    incExc(P + "industry", f.industry, out);
    if (f.keywords && nonEmpty(f.keywords)) {
        const alts: Cond[] = [];
        for (const k of f.keywords.inc) alts.push({ f: P + "keywords", op: "ov", v: [k] }, { f: P + "description", op: "has", v: k });
        if (alts.length) out.push({ or: alts });
        for (const k of f.keywords.exc) out.push({ f: P + "keywords", op: "nov", v: [k] }, { f: P + "description", op: "nhas", v: k });
    }
    if (f.codes && (f.codes.sic.length || f.codes.naics.length)) {
        const alts: Cond[] = [];
        if (f.codes.sic.length) alts.push({ f: P + "sic_codes", op: "ov", v: f.codes.sic });
        if (f.codes.naics.length) alts.push({ f: P + "naics_codes", op: "ov", v: f.codes.naics });
        out.push(alts.length === 1 ? alts[0] : { or: alts });
    }
    if (f.technologies) {
        if (f.technologies.inc.length) out.push({ f: P + "technologies", op: "ov", v: f.technologies.inc });
        if (f.technologies.exc.length) out.push({ f: P + "technologies", op: "nov", v: f.technologies.exc });
    }
    if (f.revenue) bands(P + "revenue_usd", f.revenue.presets, REVENUE_BANDS, f.revenue, out);
    if (f.funding) {
        range(P + "funding_total_usd", f.funding.total, out);
        if (f.funding.types.length) out.push({ f: P + "last_funding_type", op: "in", v: f.funding.types });
        const s = f.funding.since && since(f.funding.since, ctx.now);
        if (s) out.push({ f: P + "last_funding_date", op: "gte", v: day(s) });
    }
    if (f.jobPostings) {
        const j = f.jobPostings;
        if (j.active) out.push({ f: P + "open_jobs", op: "gte", v: 1 });
        if (j.titles.length) out.push(j.titles.length === 1 ? { f: P + "job_titles", op: "has", v: j.titles[0] } : { or: j.titles.map((t) => ({ f: P + "job_titles", op: "has", v: t }) as Leaf) });
        if (j.locations.length) out.push(j.locations.length === 1 ? { f: P + "job_locations", op: "has", v: j.locations[0] } : { or: j.locations.map((t) => ({ f: P + "job_locations", op: "has", v: t }) as Leaf) });
        const s = j.since && since(j.since, ctx.now);
        if (s) out.push({ f: P + "last_job_posted_at", op: "gte", v: day(s) });
    }
    if (f.headcountGrowth) range(`${P}headcount_growth_${f.headcountGrowth.period}`, f.headcountGrowth, out);
    range(P + "founded_year", f.founded, out);
    range(P + "retail_locations", f.retail, out);
    if (f.lookalike?.trim()) {
        const target = ctx.lookalike;
        if (!target) {
            warnings.push(`لم نجد «${normDomain(f.lookalike)}» في قاعدة البيانات، فتجاهلنا فلتر الشركات المشابهة.`);
        } else {
            if (target.industry) out.push({ f: P + "industry", op: "eq", v: target.industry });
            if (isNum(target.employees)) {
                out.push({ f: P + "employees", op: "gte", v: Math.floor(target.employees / 2) });
                out.push({ f: P + "employees", op: "lte", v: Math.ceil(target.employees * 2) });
            }
            out.push({ f: P + "id", op: "nin", v: [target.id] });
            if (!target.industry && !isNum(target.employees)) warnings.push("الشركة المرجعية بلا قطاع أو عدد موظفين، فالتشابه ضعيف.");
        }
    }

    const CONTACT_COL: Record<string, string> = { website: "website", phone: "phone", email: "emails", whatsapp: "whatsapp" };
    for (const k of f.contactData ?? []) if (CONTACT_COL[k]) out.push({ f: P + CONTACT_COL[k], op: "filled" });
    range(P + "rating", f.googleRating, out);
    if (f.searches?.length) out.push({ f: P + "search_id", op: "in", v: f.searches });

    // ---------- intent & signals (company-level) ----------
    if (f.intent) {
        if (f.intent.topics.length) out.push({ f: P + "intent_topics", op: "ov", v: f.intent.topics });
        if (f.intent.levels.length) out.push({ f: P + "intent_level", op: "in", v: f.intent.levels });
    }
    if (f.signals) {
        if (f.signals.types.length) out.push({ f: P + "signals", op: "ov", v: f.signals.types });
        const s = f.signals.since && since(f.signals.since, ctx.now);
        if (s) out.push({ f: P + "last_signal_at", op: "gte", v: s });
    }
    if (f.visitors) {
        const s = since(f.visitors, ctx.now);
        if (s) out.push({ f: P + "last_visit_at", op: "gte", v: s });
    }

    const needsCompany = tab === "people" && out.length > companyStart;

    // ---------- the row itself (person or company) ----------
    if (f.leadScore) {
        bands("lead_score", f.leadScore.grades, SCORE_GRADES, {}, out);
        range("lead_score", f.leadScore, out);
    }
    if (f.lists && nonEmpty(f.lists)) {
        const ids = ctx.listIds;
        if (f.lists.inc.length) {
            if (!ids?.inc?.length) empty = true;
            else out.push({ f: "id", op: "in", v: ids.inc });
        }
        if (f.lists.exc.length && ids?.exc.length) out.push({ f: "id", op: "nin", v: ids.exc });
    }
    incExc(tab === "people" ? "contact_stage" : "account_stage", f.stage, out);
    if (f.owner?.length) out.push({ f: "owner", op: "in", v: f.owner });
    if (f.sequences) {
        const { mode, ids } = f.sequences;
        if (mode === "in_any") out.push({ f: "sequence_ids", op: "filled" });
        if (mode === "in_none") out.push({ f: "sequence_ids", op: "blank" });
        if (mode === "in" && ids.length) out.push({ f: "sequence_ids", op: "ov", v: ids });
        if (mode === "not_in" && ids.length) out.push({ f: "sequence_ids", op: "nov", v: ids });
    }
    if (f.exclusions?.includes("contacted")) out.push({ f: "contacted_at", op: "null" });
    if (f.exclusions?.includes("in_crm")) out.push({ f: "in_crm", op: "eq", v: false });
    if (f.exclusions?.includes("saved")) out.push({ f: "saved", op: "eq", v: false });

    return { conds: out, empty, needsCompany, warnings };
}

/* ------------------------------------------------------------------ */
/* in-memory evaluation (demo mode and tests)                           */

function get(row: Record<string, unknown>, path: string): unknown {
    let cur: unknown = row;
    for (const part of path.split(".")) {
        if (cur === null || cur === undefined) return undefined;
        cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
}

function cmp(a: unknown, b: unknown): number | null {
    if (a === null || a === undefined) return null;
    if (typeof a === "number" && typeof b === "number") return a - b;
    const x = Date.parse(String(a));
    const y = Date.parse(String(b));
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    return x - y;
}

export function test(c: Cond, row: Record<string, unknown>): boolean {
    if ("or" in c) return c.or.some((x) => test(x, row));
    if ("and" in c) return c.and.every((x) => test(x, row));
    const val = get(row, c.f);
    const low = (s: unknown) => String(s).toLowerCase();
    switch (c.op) {
        case "eq":
            return val !== null && val !== undefined && val === c.v;
        case "in":
            return val !== null && val !== undefined && (c.v as string[]).includes(String(val));
        case "nin":
            return val !== null && val !== undefined && !(c.v as string[]).includes(String(val));
        case "has":
            return typeof val === "string" && low(val).includes(low(c.v));
        case "nhas":
            return typeof val === "string" && !low(val).includes(low(c.v));
        case "gte": {
            const d = cmp(val, c.v);
            return d !== null && d >= 0;
        }
        case "lte": {
            const d = cmp(val, c.v);
            return d !== null && d <= 0;
        }
        case "null":
            return val === null || val === undefined;
        case "notnull":
            return val !== null && val !== undefined;
        case "ov":
            return Array.isArray(val) && val.some((x) => (c.v as string[]).includes(x));
        case "nov":
            return Array.isArray(val) && !val.some((x) => (c.v as string[]).includes(x));
        case "filled":
            return Array.isArray(val) ? val.length > 0 : typeof val === "string" && val !== "";
        case "blank":
            return Array.isArray(val) ? val.length === 0 : val === "";
    }
}

export function matches(compiled: Compiled, row: Record<string, unknown>): boolean {
    if (compiled.empty) return false;
    if (compiled.needsCompany && !row.company) return false; // mirrors the inner join
    return compiled.conds.every((c) => test(c, row));
}

/* ------------------------------------------------------------------ */
/* PostgREST                                                            */

const RESERVED = /[,.:()"\\\s{}*]/;
const quote = (v: string) => (RESERVED.test(v) ? `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : v);
const clean = (v: unknown) => String(v).replace(/[*%]/g, "");
const arr = (v: string[]) => `{${v.map((x) => `"${x.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",")}}`;
const list = (v: string[]) => `(${v.map(quote).join(",")})`;

/** "operator" and "value" for one leaf, as PostgREST expects them */
export function opValue(l: Leaf, col: string, inOr: boolean): [string, string] {
    // inside or=(...) values with reserved characters must be quoted; a plain filter takes
    // the value literally (quotes would become part of it)
    const q = (v: string) => (inOr ? quote(v) : v);
    switch (l.op) {
        case "eq":
            return ["eq", typeof l.v === "string" ? q(l.v) : String(l.v)];
        case "in":
            return ["in", list(l.v as string[])];
        case "nin":
            return ["not.in", list(l.v as string[])];
        case "has":
            return ["ilike", q(`*${clean(l.v)}*`)];
        case "nhas":
            return ["not.ilike", q(`*${clean(l.v)}*`)];
        case "gte":
            return ["gte", q(String(l.v))];
        case "lte":
            return ["lte", q(String(l.v))];
        case "null":
            return ["is", "null"];
        case "notnull":
            return ["not.is", "null"];
        case "ov":
            return ["ov", arr(l.v as string[])];
        case "nov":
            return ["not.ov", arr(l.v as string[])];
        case "filled":
            return ["neq", ARRAY_FIELDS.has(col) ? "{}" : inOr ? '""' : ""];
        case "blank":
            return ["eq", ARRAY_FIELDS.has(col) ? "{}" : inOr ? '""' : ""];
    }
}

/** the table prefix of every leaf under c ("company." or "") */
function prefixes(c: Cond, acc = new Set<string>()): Set<string> {
    if ("or" in c) c.or.forEach((x) => prefixes(x, acc));
    else if ("and" in c) c.and.forEach((x) => prefixes(x, acc));
    else acc.add(c.f.includes(".") ? c.f.slice(0, c.f.indexOf(".") + 1) : "");
    return acc;
}

function orString(c: Cond, strip: string): string {
    if ("or" in c) return `or(${c.or.map((x) => orString(x, strip)).join(",")})`;
    if ("and" in c) return `and(${c.and.map((x) => orString(x, strip)).join(",")})`;
    const col = c.f.slice(strip.length);
    const [op, v] = opValue(c, col, true);
    return `${col}.${op}.${v}`;
}

/** the minimal piece of a supabase-js query builder we need */
export interface Filterable<T> {
    filter(column: string, operator: string, value: string): T;
    or(filters: string, opts?: { referencedTable?: string }): T;
}

export function applyTo<T extends Filterable<T>>(q: T, conds: Cond[]): T {
    for (const c of conds) {
        if ("or" in c || "and" in c) {
            const pre = [...prefixes(c)];
            if (pre.length !== 1) throw new Error("mixed tables inside one OR group");
            const inner = orString(c, pre[0]);
            // a top-level "or(...)" is passed without its wrapper; an "and(...)" becomes or(and(...))
            const body = "or" in c ? inner.slice(3, -1) : inner;
            q = pre[0] ? q.or(body, { referencedTable: pre[0].slice(0, -1) }) : q.or(body);
        } else {
            const col = c.f;
            const [op, v] = opValue(c, col.split(".").pop()!, false);
            q = q.filter(col, op, v);
        }
    }
    return q;
}
