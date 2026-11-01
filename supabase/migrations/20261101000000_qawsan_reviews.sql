-- Customer reviews submitted from /review.
--
-- Flow: a customer fills in /review -> the serverless function /api/review (which holds the
-- service-role key and runs the spam checks) inserts a row with approved = false -> an admin
-- approves it in /admin -> only approved rows are readable by the public site.
--
-- Nobody can insert from the browser: there is deliberately no insert policy for anon /
-- authenticated; the service role bypasses RLS.

create table if not exists public.qawsan_reviews (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 2 and 80),
    role text not null default '' check (char_length(role) <= 120),
    rating smallint not null check (rating between 1 and 5),
    text text not null check (char_length(text) between 10 and 1000),
    -- language the customer wrote in (ar | en | tr)
    locale text not null default 'ar' check (locale in ('ar', 'en', 'tr')),
    -- the customer agreed to have this shown publicly
    consent boolean not null default false check (consent),
    approved boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists qawsan_reviews_public_idx
    on public.qawsan_reviews (approved, created_at desc);

alter table public.qawsan_reviews enable row level security;

-- the public site reads approved reviews only
create policy "qawsan_reviews_public_read" on public.qawsan_reviews
    for select to anon, authenticated using (approved);

-- admins see everything (to moderate) and may approve, hide, edit or delete
create policy "qawsan_reviews_admin_read" on public.qawsan_reviews
    for select to authenticated using ((select public.is_qawsan_admin()));

create policy "qawsan_reviews_admin_update" on public.qawsan_reviews
    for update to authenticated
    using ((select public.is_qawsan_admin()))
    with check ((select public.is_qawsan_admin()));

create policy "qawsan_reviews_admin_delete" on public.qawsan_reviews
    for delete to authenticated using ((select public.is_qawsan_admin()));
