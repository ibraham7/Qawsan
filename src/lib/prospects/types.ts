// Filter state for the /prospects page. Kept as plain JSON so it can live in the URL,
// in saved searches (jsonb) and in personas.

export type Tab = "people" | "companies";

/** values to include (match any) and values to exclude (match none) */
export interface IncExc {
    inc: string[];
    exc: string[];
}

export interface Range {
    min?: number | null;
    max?: number | null;
}

export interface Location {
    countries?: IncExc;
    regions?: IncExc;
    cities?: IncExc;
    /** approximate radius around a known city (see CITIES) */
    radius?: { city: string; km: number } | null;
}

/** a relative period, e.g. "30d", "6m", "1y" */
export type Period = string;

export interface Filters {
    // ---- person ----
    titles?: IncExc & { similar?: boolean };
    seniority?: IncExc;
    departments?: IncExc;
    personLocation?: Location;
    name?: string;
    emailStatus?: string[];
    phoneStatus?: string[];
    /** time in current role, stored in months */
    roleTenure?: Range;
    experience?: Range;
    jobChange?: Period;
    languages?: string[];

    // ---- company ----
    company?: IncExc;
    hqLocation?: Location;
    employees?: { presets: string[] } & Range;
    industry?: IncExc;
    keywords?: IncExc;
    codes?: { sic: string[]; naics: string[] };
    technologies?: IncExc;
    revenue?: { presets: string[] } & Range;
    funding?: { total?: Range; types: string[]; since?: Period };
    jobPostings?: { active?: boolean; titles: string[]; locations: string[]; since?: Period };
    headcountGrowth?: { period: "6m" | "12m" | "24m" } & Range;
    founded?: Range;
    retail?: Range;
    lookalike?: string;

    // ---- intent & signals ----
    intent?: { topics: string[]; levels: string[] };
    signals?: { types: string[]; since?: Period };
    visitors?: Period;
    leadScore?: { grades: string[] } & Range;

    // ---- my account ----
    lists?: IncExc;
    stage?: IncExc;
    owner?: string[];
    sequences?: { mode: "in_any" | "in_none" | "in" | "not_in"; ids: string[] };
    exclusions?: string[];
}

export type FilterKey = keyof Filters;

export interface CompanyRow {
    id: string;
    name: string;
    domain: string;
    website: string;
    linkedin_url: string;
    phone: string;
    description: string;
    hq_country: string;
    hq_region: string;
    hq_city: string;
    hq_lat: number | null;
    hq_lng: number | null;
    employees: number | null;
    industry: string;
    keywords: string[];
    sic_codes: string[];
    naics_codes: string[];
    technologies: string[];
    revenue_usd: number | null;
    funding_total_usd: number | null;
    last_funding_type: string;
    last_funding_date: string | null;
    open_jobs: number | null;
    job_titles: string;
    job_locations: string;
    last_job_posted_at: string | null;
    headcount_growth_6m: number | null;
    headcount_growth_12m: number | null;
    headcount_growth_24m: number | null;
    founded_year: number | null;
    retail_locations: number | null;
    intent_topics: string[];
    intent_level: string;
    signals: string[];
    last_signal_at: string | null;
    last_visit_at: string | null;
    lead_score: number | null;
    account_stage: string;
    owner: string;
    sequence_ids: string[];
    contacted_at: string | null;
    in_crm: boolean;
    saved: boolean;
    source: string;
    created_at: string;
}

export interface PersonRow {
    id: string;
    company_id: string | null;
    full_name: string;
    title: string;
    seniority: string;
    department: string;
    country: string;
    region: string;
    city: string;
    lat: number | null;
    lng: number | null;
    email: string;
    email_status: string;
    phone_mobile: string;
    phone_direct: string;
    linkedin_url: string;
    role_started_on: string | null;
    experience_years: number | null;
    job_changed_at: string | null;
    languages: string[];
    lead_score: number | null;
    contact_stage: string;
    owner: string;
    sequence_ids: string[];
    contacted_at: string | null;
    in_crm: boolean;
    saved: boolean;
    source: string;
    created_at: string;
    company: CompanyRow | null;
}

export interface SavedSearch {
    id: string;
    name: string;
    kind: Tab | "persona";
    filters: Filters;
    created_at: string;
}

export interface NamedItem {
    id: string;
    name: string;
}
