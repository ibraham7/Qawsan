-- Prospect discovery: Google Places search results and website enrichment.
--
-- * qawsan_searches logs every Google Places search (who, what, how many requests) and is
--   the source of the monthly request cap enforced by /api/prospects/search.
-- * Companies found on Google are keyed by their place id, so repeating a search refreshes
--   the Google fields instead of creating duplicates.
-- * Branches of one chain share a website, so the domain index is no longer unique.

create table if not exists public.qawsan_searches (
    id uuid primary key default gen_random_uuid(),
    query text not null check (char_length(query) between 1 and 300),
    params jsonb not null default '{}'::jsonb,
    requests smallint not null default 0 check (requests >= 0),
    found integer not null default 0,
    inserted integer not null default 0,
    status text not null default 'done' check (status in ('done', 'failed')),
    error text not null default '',
    created_by uuid,
    created_at timestamptz not null default now()
);

create index if not exists qawsan_searches_created_idx on public.qawsan_searches (created_at desc);

alter table public.qawsan_companies
    add column if not exists google_place_id text,
    add column if not exists google_maps_url text not null default '',
    add column if not exists address text not null default '',
    add column if not exists rating numeric(2, 1) check (rating is null or rating between 0 and 5),
    add column if not exists rating_count integer check (rating_count is null or rating_count >= 0),
    add column if not exists place_types text[] not null default '{}',
    add column if not exists search_id uuid references public.qawsan_searches (id) on delete set null,
    add column if not exists emails text[] not null default '{}',
    add column if not exists socials jsonb not null default '{}'::jsonb,
    add column if not exists whatsapp text not null default '',
    add column if not exists enrich_status text not null default ''
        check (enrich_status in ('', 'done', 'nothing_found', 'no_website', 'failed')),
    add column if not exists enriched_at timestamptz;

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'qawsan_companies_google_place_id_key') then
        alter table public.qawsan_companies add constraint qawsan_companies_google_place_id_key unique (google_place_id);
    end if;
end $$;

drop index if exists public.qawsan_companies_domain_uidx;
create index if not exists qawsan_companies_domain_idx on public.qawsan_companies (lower(domain)) where domain <> '';
create index if not exists qawsan_companies_search_idx on public.qawsan_companies (search_id);

alter table public.qawsan_searches enable row level security;
drop policy if exists qawsan_searches_admin_all on public.qawsan_searches;
create policy qawsan_searches_admin_all on public.qawsan_searches for all to authenticated
    using ((select public.is_qawsan_admin()))
    with check ((select public.is_qawsan_admin()));
