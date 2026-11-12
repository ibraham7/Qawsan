-- Marketing page, stage 1: review status for discovered companies, phone type, notes and the
-- "do not contact" list.
--
-- status lifecycle: new -> review -> qualified | not_fit -> approved -> contacted -> replied ->
-- interested | not_interested -> converted; plus unsubscribed and invalid. Admins set
-- new/review/qualified/not_fit/approved/invalid by hand; campaigns set the rest (stage 2).

alter table public.qawsan_companies
    add column if not exists status text not null default 'new'
        check (status in ('new', 'review', 'qualified', 'not_fit', 'approved', 'contacted', 'replied',
                          'interested', 'not_interested', 'converted', 'unsubscribed', 'invalid')),
    add column if not exists phone_kind text not null default ''
        check (phone_kind in ('', 'mobile', 'landline')),
    add column if not exists notes text not null default '' check (char_length(notes) <= 2000);

create index if not exists qawsan_companies_status_idx on public.qawsan_companies (status);

-- mobile / landline from the international number (same rules as phoneKind() in places.ts)
update public.qawsan_companies c
set phone_kind = case
    when d ~ '^(905|9665|9715|974[3567]|965[569]|9733|968[79]|201|9627|9639|9647|961(3|7[016789]|81))' then 'mobile'
    when d ~ '^(90|966|971|974|965|973|968|20|962|963|964|961)' then 'landline'
    else ''
end
from (select id, regexp_replace(regexp_replace(phone, '\D', '', 'g'), '^00', '') as d from public.qawsan_companies) x
where x.id = c.id and c.phone <> '' and c.phone ~ '^\s*(\+|00)';

-- phone numbers (digits only, with country code) and emails (lower case) never to contact
create table if not exists public.qawsan_suppressions (
    id uuid primary key default gen_random_uuid(),
    value text not null unique check (char_length(value) between 3 and 320),
    kind text not null check (kind in ('phone', 'email')),
    reason text not null default 'manual' check (reason in ('manual', 'stop_reply', 'unsubscribe_link')),
    note text not null default '' check (char_length(note) <= 300),
    created_by uuid default auth.uid(),
    created_at timestamptz not null default now()
);

alter table public.qawsan_suppressions enable row level security;
drop policy if exists qawsan_suppressions_admin_all on public.qawsan_suppressions;
create policy qawsan_suppressions_admin_all on public.qawsan_suppressions for all to authenticated
    using ((select public.is_qawsan_admin()))
    with check ((select public.is_qawsan_admin()));
