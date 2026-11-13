-- Automatic email sending over SMTP: a recipient can now be "failed" (with the reason kept),
-- e.g. a mistyped address that the mail server rejected. No data is changed or removed.

do $$
declare c record;
begin
    -- replace the old status check on campaign recipients
    for c in
        select con.conname
        from pg_constraint con
        join pg_class rel on rel.oid = con.conrelid
        join pg_namespace ns on ns.oid = rel.relnamespace
        where ns.nspname = 'public'
          and rel.relname = 'qawsan_campaign_recipients'
          and con.contype = 'c'
          and pg_get_constraintdef(con.oid) ilike '%pending%'
    loop
        execute format('alter table public.qawsan_campaign_recipients drop constraint %I', c.conname);
    end loop;
end $$;

alter table public.qawsan_campaign_recipients
    add constraint qawsan_campaign_recipients_status_check
    check (status in ('pending', 'sent', 'skipped', 'replied', 'stopped', 'failed'));

alter table public.qawsan_campaign_recipients
    add column if not exists error text not null default '' check (char_length(error) <= 300);
