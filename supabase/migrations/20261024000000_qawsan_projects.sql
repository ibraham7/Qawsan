-- Qawsan portfolio: projects table, admin list and public image bucket.
-- Lives in the shared ward-platform project, so every object is prefixed with qawsan_.

create table if not exists public.qawsan_admins (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table public.qawsan_admins enable row level security;

-- an admin may only see their own row (used by the admin page to check access)
create policy "qawsan_admins_self_read" on public.qawsan_admins
    for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_qawsan_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.qawsan_admins where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_qawsan_admin() from public;
revoke execute on function public.is_qawsan_admin() from anon;
grant execute on function public.is_qawsan_admin() to authenticated;

create table if not exists public.qawsan_projects (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 120),
    category text not null default '' check (char_length(category) <= 120),
    description text not null default '' check (char_length(description) <= 1000),
    link text not null default '' check (char_length(link) <= 500),
    images text[] not null default '{}',
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists qawsan_projects_sort_idx
    on public.qawsan_projects (sort_order, created_at);

alter table public.qawsan_projects enable row level security;

create policy "qawsan_projects_public_read" on public.qawsan_projects
    for select to anon, authenticated using (true);

create policy "qawsan_projects_admin_insert" on public.qawsan_projects
    for insert to authenticated with check ((select public.is_qawsan_admin()));

create policy "qawsan_projects_admin_update" on public.qawsan_projects
    for update to authenticated
    using ((select public.is_qawsan_admin()))
    with check ((select public.is_qawsan_admin()));

create policy "qawsan_projects_admin_delete" on public.qawsan_projects
    for delete to authenticated using ((select public.is_qawsan_admin()));

create or replace function public.qawsan_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists qawsan_projects_touch on public.qawsan_projects;
create trigger qawsan_projects_touch
    before update on public.qawsan_projects
    for each row execute function public.qawsan_touch_updated_at();

-- public bucket for screenshots, 5 MB images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'qawsan-projects',
    'qawsan-projects',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

create policy "qawsan_images_admin_insert" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'qawsan-projects' and (select public.is_qawsan_admin()));

create policy "qawsan_images_admin_update" on storage.objects
    for update to authenticated
    using (bucket_id = 'qawsan-projects' and (select public.is_qawsan_admin()));

create policy "qawsan_images_admin_delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'qawsan-projects' and (select public.is_qawsan_admin()));

-- seed with the projects that were hard-coded in the site
insert into public.qawsan_projects (title, category, description, link, images, sort_order)
select * from (values
    ('Clinova', 'UI/UX · Development',
     'نظام متكامل لإدارة العيادات: المواعيد، ملفات المرضى، والتقارير في تجربة واحدة سلسة وسهلة الاستخدام.',
     'https://clinova.novanoai.online/', array['/images/projects/clinova.png'], 1),
    ('NovaSales', 'UI/UX · Development',
     'منصة لإدارة المبيعات والعملاء، تمنح الفرق رؤية واضحة للأداء وتختصر الوقت في المهام اليومية.',
     'https://sales.novanoai.online/', array['/images/projects/novasales.png'], 2),
    ('نظام الجامعة', 'System Design · Development',
     'نظام جامعي شامل لإدارة الطلاب والمقررات والأقسام، مبني بمعمارية قابلة للتوسع.',
     'https://uni.novanoai.online/', array['/images/projects/university-system.png'], 3),
    ('ورد لتعليم القرآن الكريم', 'Branding · UI/UX · Development',
     'منصة رقمية لتعليم القرآن الكريم وعلومه، صُممت لتقديم تجربة تعليمية بسيطة وواضحة تجمع بين الهوية البصرية الهادئة وسهولة الاستخدام.',
     'https://wird-platform.vercel.app/', array['/images/projects/wird.jpg'], 4),
    ('مركز ربانيون', 'Development',
     'تطوير موقع رقمي لمركز ربانيون، مع تنفيذ الواجهة برمجيًا وبناء تجربة عربية متجاوبة تعمل بسلاسة على مختلف أحجام الشاشات.',
     'https://rpanyon.com/', array['/images/projects/rabbanioon.jpg'], 5)
) as seed (title, category, description, link, images, sort_order)
where not exists (select 1 from public.qawsan_projects);
