-- Prospecting (lead generation): companies, people, lists, sequences and saved searches.
-- Used only by the hidden /prospects page. Every table is readable and writable by qawsan
-- admins only (public.is_qawsan_admin()); anon has no access at all.
--
-- Text columns are NOT NULL DEFAULT '' and arrays default to '{}' so "exclude" filters
-- (not ilike / not overlaps) keep rows whose value is simply empty. Numeric and date columns
-- stay nullable: NULL means "unknown", and range filters leave unknown rows out.

create table if not exists public.qawsan_companies (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 200),
    domain text not null default '' check (char_length(domain) <= 200),
    website text not null default '' check (char_length(website) <= 500),
    linkedin_url text not null default '' check (char_length(linkedin_url) <= 500),
    phone text not null default '' check (char_length(phone) <= 40),
    description text not null default '' check (char_length(description) <= 4000),

    hq_country text not null default '',
    hq_region text not null default '',
    hq_city text not null default '',
    hq_lat double precision,
    hq_lng double precision,

    employees integer check (employees is null or employees >= 0),
    industry text not null default '',
    keywords text[] not null default '{}',
    sic_codes text[] not null default '{}',
    naics_codes text[] not null default '{}',
    technologies text[] not null default '{}',
    revenue_usd bigint check (revenue_usd is null or revenue_usd >= 0),

    funding_total_usd bigint check (funding_total_usd is null or funding_total_usd >= 0),
    last_funding_type text not null default '',
    last_funding_date date,

    open_jobs integer check (open_jobs is null or open_jobs >= 0),
    job_titles text not null default '',      -- open positions, joined for text search
    job_locations text not null default '',
    last_job_posted_at date,

    headcount_growth_6m numeric,             -- percent, e.g. 12.5
    headcount_growth_12m numeric,
    headcount_growth_24m numeric,
    founded_year integer check (founded_year is null or founded_year between 1800 and 2100),
    retail_locations integer check (retail_locations is null or retail_locations >= 0),

    intent_topics text[] not null default '{}',
    intent_level text not null default '' check (intent_level in ('', 'high', 'medium', 'low')),
    signals text[] not null default '{}',     -- funding | hiring | new_exec | new_branch | news
    last_signal_at timestamptz,
    last_visit_at timestamptz,                -- last visit to qawsan.website, when known

    lead_score smallint check (lead_score is null or lead_score between 0 and 100),
    account_stage text not null default 'cold'
        check (account_stage in ('cold', 'prospect', 'current_client', 'churned', 'competitor', 'other')),
    owner text not null default '',
    sequence_ids uuid[] not null default '{}',
    contacted_at timestamptz,
    in_crm boolean not null default false,
    saved boolean not null default false,

    source text not null default 'manual',    -- manual | csv | google_places | enrichment
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists qawsan_companies_domain_uidx
    on public.qawsan_companies (lower(domain)) where domain <> '';
create index if not exists qawsan_companies_created_idx on public.qawsan_companies (created_at desc);
create index if not exists qawsan_companies_tech_idx on public.qawsan_companies using gin (technologies);
create index if not exists qawsan_companies_keywords_idx on public.qawsan_companies using gin (keywords);

create table if not exists public.qawsan_people (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references public.qawsan_companies (id) on delete set null,
    full_name text not null check (char_length(full_name) between 1 and 200),
    title text not null default '' check (char_length(title) <= 200),
    seniority text not null default '',
    department text not null default '',
    country text not null default '',
    region text not null default '',
    city text not null default '',
    lat double precision,
    lng double precision,
    email text not null default '' check (char_length(email) <= 320),
    email_status text not null default 'unavailable'
        check (email_status in ('verified', 'unverified', 'likely', 'unavailable')),
    phone_mobile text not null default '' check (char_length(phone_mobile) <= 40),
    phone_direct text not null default '' check (char_length(phone_direct) <= 40),
    linkedin_url text not null default '' check (char_length(linkedin_url) <= 500),
    role_started_on date,
    experience_years smallint check (experience_years is null or experience_years between 0 and 80),
    job_changed_at date,
    languages text[] not null default '{}',

    lead_score smallint check (lead_score is null or lead_score between 0 and 100),
    contact_stage text not null default 'cold'
        check (contact_stage in ('cold', 'new', 'approaching', 'replied', 'interested', 'not_interested',
                                 'unresponsive', 'do_not_contact', 'bad_data', 'changed_job')),
    owner text not null default '',
    sequence_ids uuid[] not null default '{}',
    contacted_at timestamptz,
    in_crm boolean not null default false,
    saved boolean not null default false,

    source text not null default 'manual',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists qawsan_people_company_idx on public.qawsan_people (company_id);
create index if not exists qawsan_people_created_idx on public.qawsan_people (created_at desc);
create index if not exists qawsan_people_languages_idx on public.qawsan_people using gin (languages);

create table if not exists public.qawsan_lists (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 120),
    kind text not null check (kind in ('people', 'companies')),
    created_at timestamptz not null default now()
);

create table if not exists public.qawsan_list_items (
    list_id uuid not null references public.qawsan_lists (id) on delete cascade,
    item_id uuid not null,
    added_at timestamptz not null default now(),
    primary key (list_id, item_id)
);

create table if not exists public.qawsan_sequences (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 120),
    created_at timestamptz not null default now()
);

-- saved searches and personas (a persona is a saved set of person filters)
create table if not exists public.qawsan_saved_searches (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 120),
    kind text not null check (kind in ('people', 'companies', 'persona')),
    filters jsonb not null default '{}'::jsonb,
    created_by uuid default auth.uid(),
    created_at timestamptz not null default now()
);

-- admin-only access on every table
do $$
declare t text;
begin
    foreach t in array array['qawsan_companies', 'qawsan_people', 'qawsan_lists', 'qawsan_list_items',
                             'qawsan_sequences', 'qawsan_saved_searches']
    loop
        execute format('alter table public.%I enable row level security', t);
        execute format('drop policy if exists %I on public.%I', t || '_admin_all', t);
        execute format(
            'create policy %I on public.%I for all to authenticated
                 using ((select public.is_qawsan_admin()))
                 with check ((select public.is_qawsan_admin()))',
            t || '_admin_all', t);
    end loop;
end $$;

drop trigger if exists qawsan_companies_touch on public.qawsan_companies;
create trigger qawsan_companies_touch
    before update on public.qawsan_companies
    for each row execute function public.qawsan_touch_updated_at();

drop trigger if exists qawsan_people_touch on public.qawsan_people;
create trigger qawsan_people_touch
    before update on public.qawsan_people
    for each row execute function public.qawsan_touch_updated_at();
