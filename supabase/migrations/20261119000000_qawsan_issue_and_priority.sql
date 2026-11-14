-- 1) Campaign recipients keep the confirmed website problem written for them ("{issue}" in the
--    message), so the wording is fixed when the campaign is created and survives later audits.
alter table public.qawsan_campaign_recipients
    add column if not exists issue text not null default '' check (char_length(issue) <= 200);

-- 2) Company priority (0-100) in lead_score: a busy, well-rated, reachable company whose website is
--    weak comes first. Kept in sync with src/lib/prospects/priority.ts (scripts/test-priority.ts).
--      need      0-45  no website 40; audited: 45 x (100 - score) / 100; has a site not audited 15
--      strength  0-35  rating 3.5 -> 0 ... 5.0 -> 15, plus reviews 0 -> 0 ... 300+ -> 20
--      reach     0-20  mobile or WhatsApp 12 (landline only 4), plus email 8
--    rejected ("not_fit") and invalid companies get 0.
create or replace function public.qawsan_company_priority(
    p_rating numeric,
    p_rating_count integer,
    p_phone_kind text,
    p_whatsapp text,
    p_emails text[],
    p_website text,
    p_site_score smallint,
    p_status text
) returns smallint
language sql
immutable
as $$
    select case
        when p_status in ('not_fit', 'invalid') then 0
        else (
            (case
                when coalesce(p_website, '') = '' then 40
                when p_site_score is not null then round(45::numeric * (100 - p_site_score) / 100)
                else 15
            end)
            + (case
                when p_rating is null then 0
                else round(greatest(0::numeric, least(1::numeric, (p_rating - 3.5) / 1.5)) * 15)
            end)
            + (case
                when p_rating_count is null then 0
                else round(20 * least(1::numeric, ln(1 + p_rating_count::numeric) / ln(301::numeric)))
            end)
            + (case
                when p_phone_kind = 'mobile' or coalesce(p_whatsapp, '') <> '' then 12
                when p_phone_kind = 'landline' then 4
                else 0
            end)
            + (case when coalesce(cardinality(p_emails), 0) > 0 then 8 else 0 end)
        )::smallint
    end;
$$;

create or replace function public.qawsan_companies_set_priority()
returns trigger
language plpgsql
as $$
begin
    new.lead_score := public.qawsan_company_priority(new.rating, new.rating_count, new.phone_kind, new.whatsapp, new.emails, new.website, new.site_score, new.status);
    return new;
end;
$$;

drop trigger if exists qawsan_companies_priority on public.qawsan_companies;
create trigger qawsan_companies_priority
    before insert or update of rating, rating_count, phone_kind, whatsapp, emails, website, site_score, status
    on public.qawsan_companies
    for each row execute function public.qawsan_companies_set_priority();

-- companies already in the table
update public.qawsan_companies
set lead_score = public.qawsan_company_priority(rating, rating_count, phone_kind, whatsapp, emails, website, site_score, status);
