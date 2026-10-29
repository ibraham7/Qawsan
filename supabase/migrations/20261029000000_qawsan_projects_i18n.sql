-- Translations for the portfolio: English and Turkish copy next to the Arabic originals.
-- All columns are optional; a missing translation falls back to the Arabic text
-- (and to the built-in translations in src/data/projects.ts for the first five projects).
-- Existing rows are not touched.

alter table public.qawsan_projects
    add column if not exists title_en text check (title_en is null or char_length(title_en) <= 120),
    add column if not exists title_tr text check (title_tr is null or char_length(title_tr) <= 120),
    add column if not exists category_en text check (category_en is null or char_length(category_en) <= 120),
    add column if not exists category_tr text check (category_tr is null or char_length(category_tr) <= 120),
    add column if not exists description_en text check (description_en is null or char_length(description_en) <= 1000),
    add column if not exists description_tr text check (description_tr is null or char_length(description_tr) <= 1000);
