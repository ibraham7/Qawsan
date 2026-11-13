// One test case per filter, shared by the offline check (test-filters.ts, against generated
// demo data) and the live check (check-filters-live.ts, against the real database).
// `want` is written independently of the query code: plain JavaScript over the row.

import { CITIES, EMPLOYEE_BANDS, REVENUE_BANDS, SCORE_GRADES } from "../src/lib/prospects/options.ts";
import type { Context } from "../src/lib/prospects/query.ts";
import type { CompanyRow, Filters, PersonRow, Tab } from "../src/lib/prospects/types.ts";

type Row = CompanyRow | PersonRow;
export interface Case {
    name: string;
    tab: Tab;
    filters: Filters;
    /** independent expectation for one row */
    want: (r: Row) => boolean;
    /** true when no demo row can match (the data does not exist in the demo set, or lists are empty) */
    empty?: boolean;
    ctx?: Partial<Context>;
}

const has = (s: string, v: string) => s.toLowerCase().includes(v.toLowerCase());
const inList = (v: string | null, l: string[]) => v !== null && l.includes(v);
const between = (v: number | null, min?: number, max?: number) => v !== null && (min === undefined || v >= min) && (max === undefined || v <= max);
const overlaps = (a: string[], b: string[]) => a.some((x) => b.includes(x));
const ago = (n: number, unit: "d" | "m" | "y", now = new Date()) => {
    const d = new Date(now.getTime());
    if (unit === "d") d.setUTCDate(d.getUTCDate() - n);
    if (unit === "m") d.setUTCMonth(d.getUTCMonth() - n);
    if (unit === "y") d.setUTCFullYear(d.getUTCFullYear() - n);
    return d;
};
const onOrAfter = (v: string | null, limit: Date, dateOnly = false) => v !== null && (dateOnly ? v.slice(0, 10) >= limit.toISOString().slice(0, 10) : new Date(v).getTime() >= limit.getTime());
const box = (lat: number | null, lng: number | null, city: string, km: number) => {
    const c = CITIES.find((x) => x.name === city)!;
    const dLat = km / 111;
    const dLng = km / (111 * Math.cos((c.lat * Math.PI) / 180));
    return lat !== null && lng !== null && lat >= c.lat - dLat && lat <= c.lat + dLat && lng >= c.lng - dLng && lng <= c.lng + dLng;
};
const band = (v: number | null, bands: Record<string, [number, number | null]>, chosen: string[]) =>
    v !== null && chosen.some((k) => v >= bands[k][0] && (bands[k][1] === null || v <= bands[k][1]!));

const C = (r: Row) => r as CompanyRow;
const P = (r: Row) => r as PersonRow;
/** the company of a person row (people filters on company fields go through it) */
const co = (r: Row): CompanyRow | null => P(r).company;

const SEARCH_ID = "00000000-0000-4000-8000-0000000000aa";

export const cases: Case[] = [
    /* ================= companies ================= */
    { name: "q (free text)", tab: "companies", filters: { q: "company 00" }, want: (r) => [C(r).name, C(r).address, C(r).phone, C(r).domain].some((s) => has(s, "company 00")) },
    { name: "status include", tab: "companies", filters: { status: { inc: ["approved", "qualified"], exc: [] } }, want: (r) => ["approved", "qualified"].includes(C(r).status) },
    { name: "status exclude", tab: "companies", filters: { status: { inc: [], exc: ["invalid", "not_fit"] } }, want: (r) => !["invalid", "not_fit"].includes(C(r).status) },
    { name: "contactData website+email", tab: "companies", filters: { contactData: ["website", "email"] }, want: (r) => C(r).website !== "" && C(r).emails.length > 0 },
    { name: "contactData mobile", tab: "companies", filters: { contactData: ["mobile"] }, want: (r) => C(r).phone_kind === "mobile" },
    { name: "contactData phone", tab: "companies", filters: { contactData: ["phone"] }, want: (r) => C(r).phone !== "" },
    { name: "contactData whatsapp", tab: "companies", filters: { contactData: ["whatsapp"] }, want: (r) => C(r).whatsapp !== "" },
    { name: "googleRating range", tab: "companies", filters: { googleRating: { min: 4, max: 4.5 } }, want: (r) => between(C(r).rating, 4, 4.5) },
    { name: "googleRating min only", tab: "companies", filters: { googleRating: { min: 4.8 } }, want: (r) => between(C(r).rating, 4.8) },
    { name: "searches (no demo row has one)", tab: "companies", filters: { searches: [SEARCH_ID] }, want: (r) => inList(C(r).search_id, [SEARCH_ID]), empty: true },
    { name: "company name include", tab: "companies", filters: { company: { inc: ["Company 01"], exc: [] } }, want: (r) => has(C(r).name, "Company 01") },
    { name: "company name exclude", tab: "companies", filters: { company: { inc: [], exc: ["Company 0"] } }, want: (r) => !has(C(r).name, "Company 0") },
    { name: "company by domain", tab: "companies", filters: { company: { inc: ["demo5.example"], exc: [] } }, want: (r) => has(C(r).domain, "demo5.example") },
    { name: "hq country include", tab: "companies", filters: { hqLocation: { countries: { inc: ["Saudi Arabia"], exc: [] } } }, want: (r) => C(r).hq_country === "Saudi Arabia" },
    { name: "hq country exclude", tab: "companies", filters: { hqLocation: { countries: { inc: [], exc: ["Saudi Arabia"] } } }, want: (r) => C(r).hq_country !== "Saudi Arabia" },
    { name: "hq region", tab: "companies", filters: { hqLocation: { regions: { inc: ["Riyadh Province"], exc: [] } } }, want: (r) => C(r).hq_region === "Riyadh Province" },
    { name: "hq cities", tab: "companies", filters: { hqLocation: { cities: { inc: ["Riyadh", "Jeddah"], exc: [] } } }, want: (r) => ["Riyadh", "Jeddah"].includes(C(r).hq_city) },
    { name: "hq radius 60km around Riyadh", tab: "companies", filters: { hqLocation: { radius: { city: "Riyadh", km: 60 } } }, want: (r) => box(C(r).hq_lat, C(r).hq_lng, "Riyadh", 60) },
    { name: "employees presets", tab: "companies", filters: { employees: { presets: ["11-20", "21-50"] } }, want: (r) => band(C(r).employees, EMPLOYEE_BANDS, ["11-20", "21-50"]) },
    { name: "employees open band 1001+", tab: "companies", filters: { employees: { presets: ["1001-2000", "2001-5000", "5001-10000", "10000+"] } }, want: (r) => band(C(r).employees, EMPLOYEE_BANDS, ["1001-2000", "2001-5000", "5001-10000", "10000+"]) },
    { name: "employees custom range", tab: "companies", filters: { employees: { presets: [], min: 100, max: 300 } }, want: (r) => between(C(r).employees, 100, 300) },
    { name: "industry include", tab: "companies", filters: { industry: { inc: ["Retail", "Dental"], exc: [] } }, want: (r) => ["Retail", "Dental"].includes(C(r).industry) },
    { name: "industry exclude", tab: "companies", filters: { industry: { inc: [], exc: ["Retail"] } }, want: (r) => C(r).industry !== "Retail" },
    { name: "keywords include (keywords or description)", tab: "companies", filters: { keywords: { inc: ["clinic"], exc: [] } }, want: (r) => C(r).keywords.includes("clinic") || has(C(r).description, "clinic") },
    { name: "keywords exclude", tab: "companies", filters: { keywords: { inc: [], exc: ["dental"] } }, want: (r) => !C(r).keywords.includes("dental") && !has(C(r).description, "dental") },
    { name: "sic codes", tab: "companies", filters: { codes: { sic: ["__FIRST_SIC__"], naics: [] } }, want: (r) => overlaps(C(r).sic_codes, ["__FIRST_SIC__"]) },
    { name: "technologies include", tab: "companies", filters: { technologies: { inc: ["Shopify", "Salla"], exc: [] } }, want: (r) => overlaps(C(r).technologies, ["Shopify", "Salla"]) },
    { name: "technologies exclude", tab: "companies", filters: { technologies: { inc: [], exc: ["Wix"] } }, want: (r) => !C(r).technologies.includes("Wix") },
    { name: "revenue presets", tab: "companies", filters: { revenue: { presets: ["$1M-$10M", "$10M-$50M"] } }, want: (r) => band(C(r).revenue_usd, REVENUE_BANDS, ["$1M-$10M", "$10M-$50M"]) },
    { name: "revenue custom", tab: "companies", filters: { revenue: { presets: [], min: 5_000_000 } }, want: (r) => between(C(r).revenue_usd, 5_000_000) },
    { name: "funding total range", tab: "companies", filters: { funding: { types: [], total: { min: 1_000_000, max: 50_000_000 } } }, want: (r) => between(C(r).funding_total_usd, 1_000_000, 50_000_000) },
    { name: "funding last round type", tab: "companies", filters: { funding: { types: ["Seed", "Series A"] } }, want: (r) => ["Seed", "Series A"].includes(C(r).last_funding_type) },
    { name: "funding since 1y", tab: "companies", filters: { funding: { types: [], since: "1y" } }, want: (r) => onOrAfter(C(r).last_funding_date, ago(1, "y"), true) },
    { name: "jobs active", tab: "companies", filters: { jobPostings: { active: true, titles: [], locations: [] } }, want: (r) => (C(r).open_jobs ?? 0) >= 1 },
    { name: "jobs by title", tab: "companies", filters: { jobPostings: { titles: ["Developer"], locations: [] } }, want: (r) => has(C(r).job_titles, "Developer") },
    { name: "jobs by title OR title", tab: "companies", filters: { jobPostings: { titles: ["Developer", "Designer"], locations: [] } }, want: (r) => has(C(r).job_titles, "Developer") || has(C(r).job_titles, "Designer") },
    { name: "jobs since 6m", tab: "companies", filters: { jobPostings: { titles: [], locations: [], since: "6m" } }, want: (r) => onOrAfter(C(r).last_job_posted_at, ago(6, "m"), true) },
    { name: "headcount growth 12m", tab: "companies", filters: { headcountGrowth: { period: "12m", min: 20 } }, want: (r) => between(C(r).headcount_growth_12m, 20) },
    { name: "headcount growth 6m range", tab: "companies", filters: { headcountGrowth: { period: "6m", min: 0, max: 30 } }, want: (r) => between(C(r).headcount_growth_6m, 0, 30) },
    { name: "founded range", tab: "companies", filters: { founded: { min: 2000, max: 2010 } }, want: (r) => between(C(r).founded_year, 2000, 2010) },
    { name: "retail locations", tab: "companies", filters: { retail: { min: 5 } }, want: (r) => between(C(r).retail_locations, 5) },
    { name: "lookalike (same industry, half to double employees)", tab: "companies", filters: { lookalike: "__LOOKALIKE__" }, want: (r) => false /* set at run time */ },
    { name: "intent topics", tab: "companies", filters: { intent: { topics: ["CRM", "SEO"], levels: [] } }, want: (r) => overlaps(C(r).intent_topics, ["CRM", "SEO"]) },
    { name: "intent levels", tab: "companies", filters: { intent: { topics: [], levels: ["high", "medium"] } }, want: (r) => ["high", "medium"].includes(C(r).intent_level) },
    { name: "signals types", tab: "companies", filters: { signals: { types: ["funding", "hiring"] } }, want: (r) => overlaps(C(r).signals, ["funding", "hiring"]) },
    { name: "signals since 90d", tab: "companies", filters: { signals: { types: [], since: "90d" } }, want: (r) => onOrAfter(C(r).last_signal_at, ago(90, "d")) },
    { name: "visitors 30d", tab: "companies", filters: { visitors: "30d" }, want: (r) => onOrAfter(C(r).last_visit_at, ago(30, "d")) },
    { name: "leadScore grades", tab: "companies", filters: { leadScore: { grades: ["excellent", "good"] } }, want: (r) => band(C(r).lead_score, SCORE_GRADES, ["excellent", "good"]) },
    { name: "leadScore range", tab: "companies", filters: { leadScore: { grades: [], min: 50, max: 90 } }, want: (r) => between(C(r).lead_score, 50, 90) },
    { name: "lists include (empty list)", tab: "companies", filters: { lists: { inc: ["l1"], exc: [] } }, want: () => false, empty: true, ctx: { listIds: { inc: [], exc: [] } } },
    { name: "lists exclude", tab: "companies", filters: { lists: { inc: [], exc: ["l1"] } }, want: (r) => !["00000000-0000-4000-8000-0000000000bb"].includes(r.id), ctx: { listIds: { inc: null, exc: ["00000000-0000-4000-8000-0000000000bb"] } } },
    { name: "account stage", tab: "companies", filters: { stage: { inc: ["prospect", "current_client"], exc: [] } }, want: (r) => ["prospect", "current_client"].includes(C(r).account_stage) },
    { name: "account stage exclude", tab: "companies", filters: { stage: { inc: [], exc: ["competitor"] } }, want: (r) => C(r).account_stage !== "competitor" },
    { name: "owner", tab: "companies", filters: { owner: ["ibrahim"] }, want: (r) => C(r).owner === "ibrahim" },

    /* ================= people ================= */
    { name: "people q (free text)", tab: "people", filters: { q: "person 000" }, want: (r) => [P(r).full_name, P(r).title, P(r).email, P(r).city].some((s) => has(s, "person 000")) },
    { name: "titles include", tab: "people", filters: { titles: { inc: ["Marketing Manager", "CEO"], exc: [] } }, want: (r) => has(P(r).title, "Marketing Manager") || has(P(r).title, "CEO") },
    { name: "titles exclude", tab: "people", filters: { titles: { inc: [], exc: ["Manager"] } }, want: (r) => !has(P(r).title, "Manager") },
    { name: "titles similar (CMO also finds Head of Marketing)", tab: "people", filters: { titles: { inc: ["CMO"], exc: [], similar: true } }, want: (r) => ["CMO", "Chief Marketing Officer", "Head of Marketing", "Marketing Director", "VP Marketing", "مدير التسويق"].some((t) => has(P(r).title, t)) },
    { name: "seniority", tab: "people", filters: { seniority: { inc: ["Owner", "Founder"], exc: [] } }, want: (r) => ["Owner", "Founder"].includes(P(r).seniority) },
    { name: "seniority exclude", tab: "people", filters: { seniority: { inc: [], exc: ["Intern", "Entry"] } }, want: (r) => !["Intern", "Entry"].includes(P(r).seniority) },
    { name: "departments", tab: "people", filters: { departments: { inc: ["Marketing", "Sales"], exc: [] } }, want: (r) => ["Marketing", "Sales"].includes(P(r).department) },
    { name: "person country", tab: "people", filters: { personLocation: { countries: { inc: ["Saudi Arabia"], exc: [] } } }, want: (r) => P(r).country === "Saudi Arabia" },
    { name: "person cities", tab: "people", filters: { personLocation: { cities: { inc: ["Riyadh", "Dubai"], exc: [] } } }, want: (r) => ["Riyadh", "Dubai"].includes(P(r).city) },
    { name: "person radius 40km Jeddah", tab: "people", filters: { personLocation: { radius: { city: "Jeddah", km: 40 } } }, want: (r) => box(P(r).lat, P(r).lng, "Jeddah", 40) },
    { name: "name", tab: "people", filters: { name: "Person 00" }, want: (r) => has(P(r).full_name, "Person 00") },
    { name: "emailStatus", tab: "people", filters: { emailStatus: ["verified", "likely"] }, want: (r) => ["verified", "likely"].includes(P(r).email_status) },
    { name: "phoneStatus mobile", tab: "people", filters: { phoneStatus: ["mobile"] }, want: (r) => P(r).phone_mobile !== "" },
    { name: "phoneStatus mobile or none", tab: "people", filters: { phoneStatus: ["mobile", "none"] }, want: (r) => P(r).phone_mobile !== "" || (P(r).phone_mobile === "" && P(r).phone_direct === "") },
    { name: "roleTenure 12-60 months", tab: "people", filters: { roleTenure: { min: 12, max: 60 } }, want: (r) => P(r).role_started_on !== null && P(r).role_started_on! <= ago(12, "m").toISOString().slice(0, 10) && P(r).role_started_on! >= ago(60, "m").toISOString().slice(0, 10) },
    { name: "experience", tab: "people", filters: { experience: { min: 10, max: 20 } }, want: (r) => between(P(r).experience_years, 10, 20) },
    { name: "jobChange 6m", tab: "people", filters: { jobChange: "6m" }, want: (r) => onOrAfter(P(r).job_changed_at, ago(6, "m"), true) },
    { name: "languages", tab: "people", filters: { languages: ["Arabic", "English"] }, want: (r) => overlaps(P(r).languages, ["Arabic", "English"]) },
    { name: "person leadScore", tab: "people", filters: { leadScore: { grades: ["excellent"] } }, want: (r) => band(P(r).lead_score, SCORE_GRADES, ["excellent"]) },
    { name: "contact stage", tab: "people", filters: { stage: { inc: ["replied", "interested"], exc: [] } }, want: (r) => ["replied", "interested"].includes(P(r).contact_stage) },
    { name: "contact stage exclude", tab: "people", filters: { stage: { inc: [], exc: ["do_not_contact", "bad_data"] } }, want: (r) => !["do_not_contact", "bad_data"].includes(P(r).contact_stage) },
    { name: "person owner", tab: "people", filters: { owner: ["sales-demo"] }, want: (r) => P(r).owner === "sales-demo" },
    { name: "sequences in any", tab: "people", filters: { sequences: { mode: "in_any", ids: [] } }, want: (r) => P(r).sequence_ids.length > 0 },
    { name: "sequences in none", tab: "people", filters: { sequences: { mode: "in_none", ids: [] } }, want: (r) => P(r).sequence_ids.length === 0 },
    { name: "sequences in specific", tab: "people", filters: { sequences: { mode: "in", ids: ["00000000-0000-4000-8000-000000000001"] } }, want: (r) => P(r).sequence_ids.includes("00000000-0000-4000-8000-000000000001") },
    { name: "sequences not in specific", tab: "people", filters: { sequences: { mode: "not_in", ids: ["00000000-0000-4000-8000-000000000001"] } }, want: (r) => !P(r).sequence_ids.includes("00000000-0000-4000-8000-000000000001") },
    { name: "exclusions contacted", tab: "people", filters: { exclusions: ["contacted"] }, want: (r) => P(r).contacted_at === null },
    { name: "exclusions crm + saved", tab: "people", filters: { exclusions: ["in_crm", "saved"] }, want: (r) => !P(r).in_crm && !P(r).saved },
    // company-level filters on the people tab go through the person's company
    { name: "people: company employees", tab: "people", filters: { employees: { presets: ["11-20", "21-50", "51-100", "101-200"] } }, want: (r) => !!co(r) && band(co(r)!.employees, EMPLOYEE_BANDS, ["11-20", "21-50", "51-100", "101-200"]) },
    { name: "people: company industry exclude (people without a company drop out)", tab: "people", filters: { industry: { inc: [], exc: ["Retail"] } }, want: (r) => !!co(r) && co(r)!.industry !== "Retail" },
    { name: "people: company technologies", tab: "people", filters: { technologies: { inc: ["Shopify"], exc: [] } }, want: (r) => !!co(r) && co(r)!.technologies.includes("Shopify") },
    { name: "people: company hq country", tab: "people", filters: { hqLocation: { countries: { inc: ["Saudi Arabia"], exc: [] } } }, want: (r) => !!co(r) && co(r)!.hq_country === "Saudi Arabia" },
    { name: "people: company name", tab: "people", filters: { company: { inc: ["Company 02"], exc: [] } }, want: (r) => !!co(r) && has(co(r)!.name, "Company 02") },
    { name: "people: company contactData", tab: "people", filters: { contactData: ["website"] }, want: (r) => !!co(r) && co(r)!.website !== "" },
    { name: "people: company intent", tab: "people", filters: { intent: { topics: ["CRM"], levels: ["high"] } }, want: (r) => !!co(r) && co(r)!.intent_topics.includes("CRM") && co(r)!.intent_level === "high" },
    // two filters together must be an AND
    { name: "AND: Saudi + Owner/Founder + verified", tab: "people", filters: { personLocation: { countries: { inc: ["Saudi Arabia"], exc: [] } }, seniority: { inc: ["Owner", "Founder"], exc: [] }, emailStatus: ["verified"] }, want: (r) => P(r).country === "Saudi Arabia" && ["Owner", "Founder"].includes(P(r).seniority) && P(r).email_status === "verified" },
    { name: "AND: companies Saudi + mobile + rating 4+", tab: "companies", filters: { hqLocation: { countries: { inc: ["Saudi Arabia"], exc: [] } }, contactData: ["mobile"], googleRating: { min: 4 } }, want: (r) => C(r).hq_country === "Saudi Arabia" && C(r).phone_kind === "mobile" && between(C(r).rating, 4) },
];
