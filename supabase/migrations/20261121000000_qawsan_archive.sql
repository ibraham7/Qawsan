-- Archive: put a company away without deleting it (it keeps its status, notes and history).
-- Archived companies are hidden from the lists and from new campaigns unless the archive is asked for.
alter table public.qawsan_companies
    add column if not exists archived boolean not null default false;

create index if not exists qawsan_companies_archived_idx on public.qawsan_companies (archived);
