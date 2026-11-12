-- WhatsApp campaigns (assisted manual sending): the page opens a chat per recipient with the
-- message filled in; the admin presses send in WhatsApp and then marks the recipient.
-- Nothing here sends anything by itself.

create table if not exists public.qawsan_campaigns (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 120),
    channel text not null default 'whatsapp' check (channel in ('whatsapp')),
    message text not null check (char_length(message) between 1 and 2000),
    stop_line text not null default '' check (char_length(stop_line) <= 200),
    daily_limit integer not null default 20 check (daily_limit between 1 and 200),
    status text not null default 'active' check (status in ('active', 'paused', 'done', 'cancelled')),
    -- the admin's confirmation at creation time (who and when)
    approved_by uuid default auth.uid(),
    approved_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create table if not exists public.qawsan_campaign_recipients (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid not null references public.qawsan_campaigns (id) on delete cascade,
    company_id uuid references public.qawsan_companies (id) on delete set null,
    -- snapshot, so the campaign still makes sense if the company is edited or deleted
    name text not null default '',
    phone text not null check (char_length(phone) between 6 and 20), -- digits only, with country code
    status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'replied', 'stopped')),
    sent_at timestamptz,
    unique (campaign_id, phone)
);

create index if not exists qawsan_campaign_recipients_campaign_idx on public.qawsan_campaign_recipients (campaign_id, status);
create index if not exists qawsan_campaign_recipients_company_idx on public.qawsan_campaign_recipients (company_id);

alter table public.qawsan_campaigns enable row level security;
alter table public.qawsan_campaign_recipients enable row level security;

drop policy if exists qawsan_campaigns_admin_all on public.qawsan_campaigns;
create policy qawsan_campaigns_admin_all on public.qawsan_campaigns for all to authenticated
    using ((select public.is_qawsan_admin())) with check ((select public.is_qawsan_admin()));

drop policy if exists qawsan_campaign_recipients_admin_all on public.qawsan_campaign_recipients;
create policy qawsan_campaign_recipients_admin_all on public.qawsan_campaign_recipients for all to authenticated
    using ((select public.is_qawsan_admin())) with check ((select public.is_qawsan_admin()));
