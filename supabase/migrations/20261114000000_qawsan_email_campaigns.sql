-- Email campaigns reuse the campaign tables, with assisted manual sending: the page opens
-- Gmail / the mail app with the message filled in, and the admin presses send there.
-- Nothing is connected or sent automatically.
--
-- Changes: channel 'email', a subject on campaigns, an email column on recipients, and a phone
-- that may be empty for email recipients. Uniqueness is per number (WhatsApp) or per address (email).

do $$
declare c record;
begin
    -- drop the old channel check, the phone length check and the (campaign_id, phone) unique rule
    for c in
        select con.conname, rel.relname
        from pg_constraint con
        join pg_class rel on rel.oid = con.conrelid
        join pg_namespace ns on ns.oid = rel.relnamespace
        where ns.nspname = 'public'
          and (
              (rel.relname = 'qawsan_campaigns' and con.contype = 'c' and pg_get_constraintdef(con.oid) ilike '%channel%')
              or (rel.relname = 'qawsan_campaign_recipients' and con.contype in ('c', 'u') and pg_get_constraintdef(con.oid) ilike '%phone%')
          )
    loop
        execute format('alter table public.%I drop constraint %I', c.relname, c.conname);
    end loop;
end $$;

alter table public.qawsan_campaigns
    add column if not exists subject text not null default '' check (char_length(subject) <= 200);
alter table public.qawsan_campaigns
    add constraint qawsan_campaigns_channel_check check (channel in ('whatsapp', 'email'));

alter table public.qawsan_campaign_recipients
    add column if not exists email text not null default '' check (char_length(email) <= 320);
alter table public.qawsan_campaign_recipients
    add constraint qawsan_campaign_recipients_phone_check check (phone = '' or char_length(phone) between 6 and 20);
alter table public.qawsan_campaign_recipients
    add constraint qawsan_campaign_recipients_target_check check (phone <> '' or email <> '');

create unique index if not exists qawsan_campaign_recipients_target_uidx
    on public.qawsan_campaign_recipients (campaign_id, (case when phone <> '' then phone else lower(email) end));
