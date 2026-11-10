// Filter registry, cleaning, active counts, chips and URL encoding.

import {
    ACCOUNT_STAGES,
    CONTACT_DATA,
    CONTACT_STAGES,
    EMAIL_STATUS,
    EXCLUSIONS,
    FUNDING_TYPES,
    GROWTH_PERIODS,
    INTENT_LEVELS,
    JOB_CHANGE,
    PHONE_STATUS,
    SCORE_GRADE_OPTS,
    SEQUENCE_MODES,
    SIGNALS,
    SINCE,
    VISIT_PERIODS,
} from "./options.ts";
import type { Opt } from "./options.ts";
import type { FilterKey, Filters, IncExc, Location, Range, Tab } from "./types.ts";

export type Group = "person" | "company" | "intent" | "account";

export const GROUPS: { id: Group; label: string }[] = [
    { id: "person", label: "فلاتر الشخص" },
    { id: "company", label: "فلاتر الشركة" },
    { id: "intent", label: "النية والإشارات" },
    { id: "account", label: "خاصة بحسابي" },
];

export interface FilterMeta {
    key: FilterKey;
    label: string;
    group: Group;
    tabs: Tab[];
}

const both: Tab[] = ["people", "companies"];
const people: Tab[] = ["people"];

export const FILTERS: FilterMeta[] = [
    { key: "titles", label: "المسمى الوظيفي", group: "person", tabs: people },
    { key: "seniority", label: "المستوى الإداري", group: "person", tabs: people },
    { key: "departments", label: "القسم والوظيفة", group: "person", tabs: people },
    { key: "personLocation", label: "موقع الشخص", group: "person", tabs: people },
    { key: "name", label: "الاسم", group: "person", tabs: people },
    { key: "emailStatus", label: "حالة البريد", group: "person", tabs: people },
    { key: "phoneStatus", label: "حالة الهاتف", group: "person", tabs: people },
    { key: "roleTenure", label: "المدة في الوظيفة الحالية", group: "person", tabs: people },
    { key: "experience", label: "سنوات الخبرة", group: "person", tabs: people },
    { key: "jobChange", label: "تغيير وظيفي حديث", group: "person", tabs: people },
    { key: "languages", label: "اللغات", group: "person", tabs: people },

    { key: "searches", label: "عملية البحث (Google)", group: "company", tabs: both },
    { key: "contactData", label: "بيانات التواصل", group: "company", tabs: both },
    { key: "googleRating", label: "تقييم Google", group: "company", tabs: both },
    { key: "company", label: "الشركة", group: "company", tabs: both },
    { key: "hqLocation", label: "مقر الشركة", group: "company", tabs: both },
    { key: "employees", label: "عدد الموظفين", group: "company", tabs: both },
    { key: "industry", label: "القطاع", group: "company", tabs: both },
    { key: "keywords", label: "كلمات مفتاحية", group: "company", tabs: both },
    { key: "codes", label: "SIC / NAICS", group: "company", tabs: both },
    { key: "technologies", label: "التقنيات المستخدمة", group: "company", tabs: both },
    { key: "revenue", label: "الإيرادات السنوية", group: "company", tabs: both },
    { key: "funding", label: "التمويل", group: "company", tabs: both },
    { key: "jobPostings", label: "الوظائف الشاغرة", group: "company", tabs: both },
    { key: "headcountGrowth", label: "نمو عدد الموظفين", group: "company", tabs: both },
    { key: "founded", label: "سنة التأسيس", group: "company", tabs: both },
    { key: "retail", label: "عدد الفروع", group: "company", tabs: both },
    { key: "lookalike", label: "شركات مشابهة", group: "company", tabs: both },

    { key: "intent", label: "نية الشراء", group: "intent", tabs: both },
    { key: "signals", label: "الإشارات", group: "intent", tabs: both },
    { key: "visitors", label: "زوار موقعي", group: "intent", tabs: both },
    { key: "leadScore", label: "تقييم العميل", group: "intent", tabs: both },

    { key: "lists", label: "القوائم", group: "account", tabs: both },
    { key: "stage", label: "مرحلة التواصل", group: "account", tabs: both },
    { key: "owner", label: "المسؤول", group: "account", tabs: both },
    { key: "sequences", label: "حملات التواصل", group: "account", tabs: people },
    { key: "exclusions", label: "الاستثناءات", group: "account", tabs: people },
];

export const metaFor = (key: FilterKey, tab: Tab) => {
    const m = FILTERS.find((x) => x.key === key)!;
    return key === "stage" && tab === "companies" ? { ...m, label: "مرحلة الحساب" } : m;
};

/** person filters a persona stores */
export const PERSONA_KEYS: FilterKey[] = FILTERS.filter((m) => m.group === "person").map((m) => m.key);

/* ------------------------------------------------------------------ */
/* emptiness and cleaning                                               */

const n = (x: unknown) => typeof x === "number" && Number.isFinite(x);
const ie = (x?: IncExc) => !!x && (x.inc.length > 0 || x.exc.length > 0);
const rg = (x?: Range) => !!x && (n(x.min) || n(x.max));
const loc = (x?: Location) => !!x && (ie(x.countries) || ie(x.regions) || ie(x.cities) || (!!x.radius && x.radius.km > 0 && !!x.radius.city));

export function isActive(f: Filters, key: FilterKey): boolean {
    switch (key) {
        case "titles":
        case "seniority":
        case "departments":
        case "company":
        case "industry":
        case "keywords":
        case "technologies":
        case "lists":
        case "stage":
            return ie(f[key]);
        case "personLocation":
        case "hqLocation":
            return loc(f[key]);
        case "name":
        case "lookalike":
            return !!f[key]?.trim();
        case "jobChange":
        case "visitors":
            return !!f[key];
        case "emailStatus":
        case "phoneStatus":
        case "languages":
        case "owner":
        case "exclusions":
        case "contactData":
        case "searches":
            return !!f[key]?.length;
        case "googleRating":
            return rg(f.googleRating);
        case "roleTenure":
        case "experience":
        case "founded":
        case "retail":
            return rg(f[key]);
        case "employees":
        case "revenue":
            return !!f[key] && (f[key]!.presets.length > 0 || rg(f[key]));
        case "codes":
            return !!f.codes && (f.codes.sic.length > 0 || f.codes.naics.length > 0);
        case "funding":
            return !!f.funding && (rg(f.funding.total) || f.funding.types.length > 0 || !!f.funding.since);
        case "jobPostings":
            return !!f.jobPostings && (!!f.jobPostings.active || f.jobPostings.titles.length > 0 || f.jobPostings.locations.length > 0 || !!f.jobPostings.since);
        case "headcountGrowth":
            return rg(f.headcountGrowth);
        case "intent":
            return !!f.intent && (f.intent.topics.length > 0 || f.intent.levels.length > 0);
        case "signals":
            return !!f.signals && (f.signals.types.length > 0 || !!f.signals.since);
        case "leadScore":
            return !!f.leadScore && (f.leadScore.grades.length > 0 || rg(f.leadScore));
        case "sequences":
            return !!f.sequences && (f.sequences.mode === "in_any" || f.sequences.mode === "in_none" || f.sequences.ids.length > 0);
    }
}

/** only the filters that are set and that belong to the tab */
export function clean(f: Filters, tab: Tab): Filters {
    const out: Filters = {};
    for (const m of FILTERS) {
        if (m.tabs.includes(tab) && isActive(f, m.key)) (out as Record<string, unknown>)[m.key] = f[m.key];
    }
    return out;
}

export const activeCount = (f: Filters, tab: Tab) => Object.keys(clean(f, tab)).length;

/* ------------------------------------------------------------------ */
/* chips                                                                */

export interface Chip {
    id: string;
    label: string;
    exclude?: boolean;
    remove: (f: Filters) => Filters;
}

const labelOf = (opts: Opt[], v: string) => opts.find((o) => o.value === v)?.label.split(" · ")[0] ?? v;
const without = <T,>(a: T[], v: T) => a.filter((x) => x !== v);
const fmtRange = (r: Range, unit = "") =>
    n(r.min) && n(r.max) ? `${r.min}–${r.max}${unit}` : n(r.min) ? `≥ ${r.min}${unit}` : `≤ ${r.max}${unit}`;
const money = (v: number) => (v >= 1e9 ? `$${v / 1e9}B` : v >= 1e6 ? `$${v / 1e6}M` : v >= 1e3 ? `$${v / 1e3}K` : `$${v}`);

function set<K extends FilterKey>(f: Filters, key: K, v: Filters[K] | undefined): Filters {
    const next = { ...f };
    if (v === undefined) delete next[key];
    else next[key] = v;
    return next;
}

const NONE: IncExc = { inc: [], exc: [] };

/** chips for include/exclude values; removal always edits the current value, not a snapshot */
function incExcChips(
    id: string,
    label: string,
    get: (f: Filters) => IncExc | undefined,
    f0: Filters,
    put: (f: Filters, x: IncExc) => Filters,
    show: (v: string) => string = (v) => v
): Chip[] {
    const x = get(f0);
    if (!x) return [];
    const drop = (side: "inc" | "exc", v: string) => (f: Filters) => {
        const cur = get(f) ?? NONE;
        return put(f, { ...cur, [side]: without(cur[side], v) });
    };
    return [
        ...x.inc.map((v) => ({ id: `${id}+${v}`, label: `${label}: ${show(v)}`, remove: drop("inc", v) })),
        ...x.exc.map((v) => ({ id: `${id}-${v}`, label: `${label}: ${show(v)}`, exclude: true, remove: drop("exc", v) })),
    ];
}

function locationChips(key: "personLocation" | "hqLocation", label: string, f0: Filters): Chip[] {
    const l = f0[key];
    if (!l) return [];
    const part = (p: "countries" | "regions" | "cities") => [
        (f: Filters) => f[key]?.[p],
        f0,
        (f: Filters, x: IncExc) => set(f, key, { ...f[key], [p]: x }),
    ] as const;
    const out = [
        ...incExcChips(`${key}.c`, label, ...part("countries")),
        ...incExcChips(`${key}.r`, label, ...part("regions")),
        ...incExcChips(`${key}.ci`, label, ...part("cities")),
    ];
    if (l.radius && l.radius.km > 0) {
        out.push({ id: `${key}.radius`, label: `${label}: ${l.radius.km} كم حول ${l.radius.city}`, remove: (f) => set(f, key, { ...f[key], radius: null }) });
    }
    return out;
}

export function chips(f: Filters, tab: Tab, names: { lists: Record<string, string>; sequences: Record<string, string>; searches?: Record<string, string> }): Chip[] {
    const c = clean(f, tab);
    const out: Chip[] = [];
    const L = (k: FilterKey) => metaFor(k, tab).label;
    const arrayChips = (key: "emailStatus" | "phoneStatus" | "languages" | "owner" | "exclusions" | "contactData", opts: Opt[] = []) =>
        (c[key] ?? []).forEach((v) =>
            out.push({ id: `${key}.${v}`, label: key === "exclusions" || key === "contactData" ? labelOf(opts, v) : `${L(key)}: ${labelOf(opts, v)}`, remove: (g) => set(g, key, without(g[key] ?? [], v)) })
        );
    const rangeChip = (key: "roleTenure" | "experience" | "founded" | "retail", unit = "") => {
        const r = c[key];
        if (r) out.push({ id: key, label: `${L(key)}: ${fmtRange(r, unit)}`, remove: (g) => set(g, key, undefined) });
    };

    if (c.titles) {
        out.push(...incExcChips("titles", L("titles"), (g) => g.titles, c, (g, x) => set(g, "titles", { ...g.titles, ...x })));
        if (c.titles.similar) out.push({ id: "titles.similar", label: "يشمل المسميات المشابهة", remove: (g) => set(g, "titles", { ...g.titles!, similar: false }) });
    }
    out.push(...incExcChips("seniority", L("seniority"), (g) => g.seniority, c, (g, x) => set(g, "seniority", x)));
    out.push(...incExcChips("departments", L("departments"), (g) => g.departments, c, (g, x) => set(g, "departments", x)));
    out.push(...locationChips("personLocation", L("personLocation"), c));
    if (c.name) out.push({ id: "name", label: `${L("name")}: ${c.name}`, remove: (g) => set(g, "name", undefined) });
    arrayChips("emailStatus", EMAIL_STATUS);
    arrayChips("phoneStatus", PHONE_STATUS);
    rangeChip("roleTenure", " شهر");
    rangeChip("experience", " سنة");
    if (c.jobChange) out.push({ id: "jobChange", label: `${L("jobChange")}: ${labelOf(JOB_CHANGE, c.jobChange)}`, remove: (g) => set(g, "jobChange", undefined) });
    arrayChips("languages");

    (c.searches ?? []).forEach((id) =>
        out.push({ id: `search.${id}`, label: `بحث: ${names.searches?.[id] ?? "Google"}`, remove: (g) => set(g, "searches", without(g.searches ?? [], id)) })
    );
    arrayChips("contactData", CONTACT_DATA);
    if (c.googleRating) out.push({ id: "googleRating", label: `${L("googleRating")}: ${fmtRange(c.googleRating, "★")}`, remove: (g) => set(g, "googleRating", undefined) });
    out.push(...incExcChips("company", L("company"), (g) => g.company, c, (g, x) => set(g, "company", x)));
    out.push(...locationChips("hqLocation", L("hqLocation"), c));
    for (const key of ["employees", "revenue"] as const) {
        const e = c[key];
        if (!e) continue;
        e.presets.forEach((p) => out.push({ id: `${key}.${p}`, label: `${L(key)}: ${p}`, remove: (g) => set(g, key, { ...g[key]!, presets: without(g[key]!.presets, p) }) }));
        if (rg(e)) {
            const r = key === "revenue" ? { min: e.min, max: e.max } : e;
            const text = key === "revenue" ? fmtRange({ min: r.min, max: r.max }).replace(/\d+/g, (d) => money(Number(d))) : fmtRange(r);
            out.push({ id: `${key}.custom`, label: `${L(key)}: ${text}`, remove: (g) => set(g, key, { presets: g[key]!.presets }) });
        }
    }
    out.push(...incExcChips("industry", L("industry"), (g) => g.industry, c, (g, x) => set(g, "industry", x)));
    out.push(...incExcChips("keywords", L("keywords"), (g) => g.keywords, c, (g, x) => set(g, "keywords", x)));
    if (c.codes) {
        c.codes.sic.forEach((v) => out.push({ id: `sic.${v}`, label: `SIC: ${v}`, remove: (g) => set(g, "codes", { ...g.codes!, sic: without(g.codes!.sic, v) }) }));
        c.codes.naics.forEach((v) => out.push({ id: `naics.${v}`, label: `NAICS: ${v}`, remove: (g) => set(g, "codes", { ...g.codes!, naics: without(g.codes!.naics, v) }) }));
    }
    out.push(...incExcChips("technologies", L("technologies"), (g) => g.technologies, c, (g, x) => set(g, "technologies", x)));
    if (c.funding) {
        const fu = c.funding;
        if (rg(fu.total)) out.push({ id: "funding.total", label: `إجمالي التمويل: ${fmtRange(fu.total!).replace(/\d+/g, (d) => money(Number(d)))}`, remove: (g) => set(g, "funding", { ...g.funding!, total: {} }) });
        fu.types.forEach((t) => out.push({ id: `funding.${t}`, label: `آخر جولة: ${labelOf(FUNDING_TYPES, t)}`, remove: (g) => set(g, "funding", { ...g.funding!, types: without(g.funding!.types, t) }) }));
        if (fu.since) out.push({ id: "funding.since", label: `جولة تمويل: ${labelOf(SINCE, fu.since)}`, remove: (g) => set(g, "funding", { ...g.funding!, since: undefined }) });
    }
    if (c.jobPostings) {
        const j = c.jobPostings;
        if (j.active) out.push({ id: "jobs.active", label: "لديها وظائف شاغرة", remove: (g) => set(g, "jobPostings", { ...g.jobPostings!, active: false }) });
        j.titles.forEach((t) => out.push({ id: `jobs.t.${t}`, label: `وظيفة شاغرة: ${t}`, remove: (g) => set(g, "jobPostings", { ...g.jobPostings!, titles: without(g.jobPostings!.titles, t) }) }));
        j.locations.forEach((t) => out.push({ id: `jobs.l.${t}`, label: `موقع الوظيفة: ${t}`, remove: (g) => set(g, "jobPostings", { ...g.jobPostings!, locations: without(g.jobPostings!.locations, t) }) }));
        if (j.since) out.push({ id: "jobs.since", label: `نُشرت: ${labelOf(SINCE, j.since)}`, remove: (g) => set(g, "jobPostings", { ...g.jobPostings!, since: undefined }) });
    }
    if (c.headcountGrowth) out.push({ id: "growth", label: `${L("headcountGrowth")} (${labelOf(GROWTH_PERIODS, c.headcountGrowth.period)}): ${fmtRange(c.headcountGrowth, "%")}`, remove: (g) => set(g, "headcountGrowth", undefined) });
    rangeChip("founded");
    rangeChip("retail");
    if (c.lookalike) out.push({ id: "lookalike", label: `${L("lookalike")}: ${c.lookalike}`, remove: (g) => set(g, "lookalike", undefined) });

    if (c.intent) {
        c.intent.topics.forEach((t) => out.push({ id: `intent.${t}`, label: `${L("intent")}: ${t}`, remove: (g) => set(g, "intent", { ...g.intent!, topics: without(g.intent!.topics, t) }) }));
        c.intent.levels.forEach((t) => out.push({ id: `intentl.${t}`, label: `مستوى النية: ${labelOf(INTENT_LEVELS, t)}`, remove: (g) => set(g, "intent", { ...g.intent!, levels: without(g.intent!.levels, t) }) }));
    }
    if (c.signals) {
        c.signals.types.forEach((t) => out.push({ id: `signal.${t}`, label: `${L("signals")}: ${labelOf(SIGNALS, t)}`, remove: (g) => set(g, "signals", { ...g.signals!, types: without(g.signals!.types, t) }) }));
        if (c.signals.since) out.push({ id: "signal.since", label: `إشارات: ${labelOf(SINCE, c.signals.since)}`, remove: (g) => set(g, "signals", { ...g.signals!, since: undefined }) });
    }
    if (c.visitors) out.push({ id: "visitors", label: `${L("visitors")}: ${labelOf(VISIT_PERIODS, c.visitors)}`, remove: (g) => set(g, "visitors", undefined) });
    if (c.leadScore) {
        c.leadScore.grades.forEach((t) => out.push({ id: `score.${t}`, label: `${L("leadScore")}: ${labelOf(SCORE_GRADE_OPTS, t)}`, remove: (g) => set(g, "leadScore", { ...g.leadScore!, grades: without(g.leadScore!.grades, t) }) }));
        if (rg(c.leadScore)) out.push({ id: "score.range", label: `${L("leadScore")}: ${fmtRange(c.leadScore)}`, remove: (g) => set(g, "leadScore", { grades: g.leadScore!.grades }) });
    }

    out.push(...incExcChips("lists", L("lists"), (g) => g.lists, c, (g, x) => set(g, "lists", x), (v) => names.lists[v] ?? "قائمة"));
    out.push(...incExcChips("stage", L("stage"), (g) => g.stage, c, (g, x) => set(g, "stage", x), (v) => labelOf(tab === "people" ? CONTACT_STAGES : ACCOUNT_STAGES, v)));
    arrayChips("owner");
    if (c.sequences) {
        const s = c.sequences;
        const names2 = s.ids.map((id) => names.sequences[id] ?? "حملة").join("، ");
        const text = s.mode === "in" || s.mode === "not_in" ? `${labelOf(SEQUENCE_MODES, s.mode)}: ${names2}` : labelOf(SEQUENCE_MODES, s.mode);
        out.push({ id: "sequences", label: text, exclude: s.mode === "in_none" || s.mode === "not_in", remove: (g) => set(g, "sequences", undefined) });
    }
    arrayChips("exclusions", EXCLUSIONS);
    return out;
}

/* ------------------------------------------------------------------ */
/* URL                                                                  */

export interface UrlState {
    tab: Tab;
    people: Filters;
    companies: Filters;
}

function toB64(s: string) {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64(s: string) {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
}

export function encodeState(s: UrlState): string {
    const p = new URLSearchParams();
    p.set("tab", s.tab);
    const pe = clean(s.people, "people");
    const co = clean(s.companies, "companies");
    if (Object.keys(pe).length || Object.keys(co).length) p.set("f", toB64(JSON.stringify({ p: pe, c: co })));
    return p.toString();
}

export function decodeState(search: string): UrlState {
    const p = new URLSearchParams(search);
    const tab: Tab = p.get("tab") === "companies" ? "companies" : "people";
    try {
        const raw = p.get("f");
        if (raw) {
            const o = JSON.parse(fromB64(raw));
            return { tab, people: clean(o.p ?? {}, "people"), companies: clean(o.c ?? {}, "companies") };
        }
    } catch {
        /* a damaged link falls back to no filters */
    }
    return { tab, people: {}, companies: {} };
}

export const pickPersona = (f: Filters): Filters => {
    const out: Filters = {};
    for (const k of PERSONA_KEYS) if (isActive(f, k)) (out as Record<string, unknown>)[k] = f[k];
    return out;
};
