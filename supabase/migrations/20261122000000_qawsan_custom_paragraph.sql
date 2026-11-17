-- A paragraph written by hand for each recipient ("{custom}" in the message) is longer than the one-line
-- website problem the column first held (200 characters). Allow up to 800.
alter table public.qawsan_campaign_recipients drop constraint if exists qawsan_campaign_recipients_issue_check;
alter table public.qawsan_campaign_recipients
    add constraint qawsan_campaign_recipients_issue_check check (char_length(issue) <= 800);
