-- Website audit, measured numbers from Google PageSpeed Insights (mobile run):
--   site_perf   performance score 0-100
--   site_seo    search basics score 0-100
--   site_a11y   accessibility score 0-100
--   site_lcp_ms time until the main content shows, milliseconds
alter table public.qawsan_companies
    add column if not exists site_perf smallint check (site_perf is null or site_perf between 0 and 100),
    add column if not exists site_seo smallint check (site_seo is null or site_seo between 0 and 100),
    add column if not exists site_a11y smallint check (site_a11y is null or site_a11y between 0 and 100),
    add column if not exists site_lcp_ms integer check (site_lcp_ms is null or site_lcp_ms >= 0);

create index if not exists qawsan_companies_site_perf_idx on public.qawsan_companies (site_perf);
