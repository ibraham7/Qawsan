// Generated demo records for trying the filters in development (never bundled into a
// production build: the page imports this file only when import.meta.env.DEV is true).
// Every name says "Demo" so nobody mistakes these rows for real prospects.

import {
    CITIES,
    DEPARTMENTS,
    FUNDING_TYPES,
    INDUSTRIES,
    INTENT_TOPICS,
    LANGUAGES,
    SENIORITY,
    TECHNOLOGIES,
} from "./options.ts";
import type { Meta } from "./data.ts";
import type { CompanyRow, PersonRow } from "./types.ts";

// small deterministic generator so the demo looks the same on every reload
function rng(seed: number) {
    return () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}

const TITLES: Record<string, string[]> = {
    Owner: ["Owner"],
    Founder: ["Founder", "Co-Founder"],
    "C-Suite": ["CEO", "CMO", "CTO", "CFO", "COO"],
    Partner: ["Partner"],
    VP: ["VP Sales", "VP Marketing"],
    Head: ["Head of Marketing", "Head of IT", "Head of Sales"],
    Director: ["Marketing Director", "Sales Director", "IT Director"],
    Manager: ["Marketing Manager", "Sales Manager", "HR Manager", "IT Manager"],
    Senior: ["Senior Developer", "Senior Designer"],
    Entry: ["Sales Associate", "Marketing Coordinator"],
    Intern: ["Marketing Intern"],
};

export function makeDemo(): { companies: CompanyRow[]; people: PersonRow[]; meta: Meta } {
    const r = rng(7);
    const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
    const some = <T,>(a: T[], max: number) => [...new Set(Array.from({ length: Math.floor(r() * (max + 1)) }, () => pick(a)))];
    const maybe = <T,>(v: T, p = 0.7) => (r() < p ? v : null);
    const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

    const SAUDI = CITIES.filter((c) => ["Riyadh", "Jeddah", "Dammam"].includes(c.name));
    const sequences = [
        { id: "00000000-0000-4000-8000-000000000001", name: "Demo sequence · Riyadh clinics" },
        { id: "00000000-0000-4000-8000-000000000002", name: "Demo sequence · E-commerce" },
    ];
    const owners = ["ibrahim", "sales-demo"];

    const companies: CompanyRow[] = Array.from({ length: 240 }, (_, i) => {
        const city = r() < 0.45 ? pick(SAUDI) : pick(CITIES);
        const employees = maybe(Math.round(Math.exp(r() * (r() < 0.7 ? 6 : 9))), 0.9);
        const industry = pick(INDUSTRIES).value;
        const signals = some(["funding", "hiring", "new_exec", "new_branch", "news"], 2);
        return {
            id: `c-${i}`,
            name: `Demo Company ${String(i + 1).padStart(3, "0")}`,
            domain: `demo${i + 1}.example`,
            website: `https://demo${i + 1}.example`,
            linkedin_url: "",
            phone: "",
            description: `Demo ${industry.toLowerCase()} business in ${city.name}`,
            hq_country: city.country,
            hq_region: city.region,
            hq_city: city.name,
            hq_lat: city.lat + (r() - 0.5) * 0.2,
            hq_lng: city.lng + (r() - 0.5) * 0.2,
            employees,
            industry,
            keywords: some(["clinic", "dental", "online store", "b2b", "logistics", "restaurant", "saas"], 2),
            sic_codes: r() < 0.5 ? [String(7000 + Math.floor(r() * 999))] : [],
            naics_codes: r() < 0.5 ? [String(500000 + Math.floor(r() * 99999))] : [],
            technologies: some(TECHNOLOGIES.map((t) => t.value), 4),
            revenue_usd: maybe(Math.round(Math.exp(12 + r() * 9)), 0.6),
            funding_total_usd: maybe(Math.round(Math.exp(11 + r() * 7)), 0.3),
            last_funding_type: r() < 0.3 ? pick(FUNDING_TYPES).value : "",
            last_funding_date: maybe(daysAgo(Math.floor(r() * 900)).slice(0, 10), 0.3),
            open_jobs: maybe(Math.floor(r() * 12), 0.6),
            job_titles: r() < 0.5 ? some(["Marketing Manager", "Developer", "Sales Executive", "Designer"], 2).join(", ") : "",
            job_locations: r() < 0.5 ? city.name : "",
            last_job_posted_at: maybe(daysAgo(Math.floor(r() * 200)).slice(0, 10), 0.5),
            headcount_growth_6m: maybe(Math.round((r() * 60 - 15) * 10) / 10, 0.6),
            headcount_growth_12m: maybe(Math.round((r() * 90 - 20) * 10) / 10, 0.6),
            headcount_growth_24m: maybe(Math.round((r() * 140 - 25) * 10) / 10, 0.6),
            founded_year: maybe(1975 + Math.floor(r() * 50), 0.8),
            retail_locations: maybe(Math.floor(r() * 30), 0.5),
            intent_topics: some(INTENT_TOPICS.map((t) => t.value), 2),
            intent_level: pick(["", "high", "medium", "low"]),
            signals,
            last_signal_at: signals.length ? daysAgo(Math.floor(r() * 365)) : null,
            last_visit_at: maybe(daysAgo(Math.floor(r() * 120)), 0.2),
            lead_score: maybe(Math.floor(r() * 101), 0.8),
            account_stage: pick(["cold", "cold", "prospect", "current_client", "churned", "competitor", "other"]),
            owner: r() < 0.5 ? pick(owners) : "",
            sequence_ids: r() < 0.2 ? [pick(sequences).id] : [],
            contacted_at: maybe(daysAgo(Math.floor(r() * 90)), 0.2),
            in_crm: r() < 0.15,
            saved: r() < 0.2,
            source: "demo",
            created_at: daysAgo(Math.floor(r() * 300)),
        };
    });

    const people: PersonRow[] = Array.from({ length: 900 }, (_, i) => {
        const company = r() < 0.92 ? pick(companies) : null;
        const city = company && r() < 0.8 ? CITIES.find((c) => c.name === company.hq_city)! : pick(CITIES);
        const seniority = r() < 0.4 ? pick(["Owner", "Founder", "C-Suite", "Director"]) : pick(SENIORITY).value;
        const status = pick(["verified", "verified", "verified", "unverified", "likely", "unavailable"]);
        return {
            id: `p-${i}`,
            company_id: company?.id ?? null,
            full_name: `Demo Person ${String(i + 1).padStart(4, "0")}`,
            title: pick(TITLES[seniority]),
            seniority,
            department: r() < 0.35 ? pick(["Marketing", "Management"]) : pick(DEPARTMENTS).value,
            country: city.country,
            region: city.region,
            city: city.name,
            lat: city.lat + (r() - 0.5) * 0.3,
            lng: city.lng + (r() - 0.5) * 0.3,
            email: status === "unavailable" ? "" : `person${i + 1}@demo.example`,
            email_status: status,
            phone_mobile: r() < 0.5 ? "+0000000000" : "",
            phone_direct: r() < 0.3 ? "+0000000000" : "",
            linkedin_url: "",
            role_started_on: maybe(daysAgo(Math.floor(r() * 3000)).slice(0, 10), 0.85),
            experience_years: maybe(Math.floor(r() * 30), 0.85),
            job_changed_at: maybe(daysAgo(Math.floor(r() * 500)).slice(0, 10), 0.4),
            languages: some(LANGUAGES.map((l) => l.value).slice(0, 4), 2),
            lead_score: maybe(Math.floor(r() * 101), 0.8),
            contact_stage: pick(["cold", "cold", "cold", "new", "approaching", "replied", "interested", "not_interested", "unresponsive", "do_not_contact", "bad_data", "changed_job"]),
            owner: r() < 0.5 ? pick(owners) : "",
            sequence_ids: r() < 0.25 ? [pick(sequences).id] : [],
            contacted_at: maybe(daysAgo(Math.floor(r() * 90)), 0.3),
            in_crm: r() < 0.15,
            saved: r() < 0.2,
            source: "demo",
            created_at: daysAgo(Math.floor(r() * 300)),
            company,
        };
    });

    return {
        companies,
        people,
        meta: {
            lists: [{ id: "demo-list", name: "Demo list (empty)", kind: "people" }],
            sequences,
            owners,
        },
    };
}
