-- Website audit: a quality score and the reasons behind it, written by /api/prospects/audit.
--   site_score        0-100, null when the site could not be judged (or was never checked)
--   site_issues       codes such as no_viewport, no_https, slow (see src/lib/discovery/siteaudit.ts)
--   site_checked_at   when it was last checked; null = never
alter table public.qawsan_companies
    add column if not exists site_score smallint check (site_score is null or site_score between 0 and 100),
    add column if not exists site_issues text[] not null default '{}',
    add column if not exists site_checked_at timestamptz;

create index if not exists qawsan_companies_site_score_idx on public.qawsan_companies (site_score);
