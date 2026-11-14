-- Enrichment can now report "socials_only": the company's site is just a social profile, or the
-- site has social links but no email or WhatsApp. The old check allowed only four values.
alter table public.qawsan_companies drop constraint if exists qawsan_companies_enrich_status_check;
alter table public.qawsan_companies
    add constraint qawsan_companies_enrich_status_check
    check (enrich_status in ('', 'done', 'socials_only', 'nothing_found', 'no_website', 'failed'));
