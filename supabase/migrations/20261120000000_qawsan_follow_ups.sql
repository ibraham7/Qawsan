-- Follow-ups: one follow-up per recipient, after a few days without an answer.
--   followup_status  '' = none yet, 'sent' = followed up once, 'skipped' = decided not to
--   followup_at      when the follow-up was recorded
alter table public.qawsan_campaign_recipients
    add column if not exists followup_status text not null default '' check (followup_status in ('', 'sent', 'skipped')),
    add column if not exists followup_at timestamptz;

create index if not exists qawsan_campaign_recipients_followup_idx
    on public.qawsan_campaign_recipients (status, followup_status, sent_at);
