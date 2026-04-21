create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  company_name text,
  contact_person text not null,
  email text not null,
  phone text,
  inquiry_type text not null default 'other',
  message text,
  privacy_consent boolean not null default false,
  source_page text,
  user_agent text,
  member_id uuid,
  status text not null default 'new',
  admin_note text
);

alter table public.inquiries
  drop constraint if exists inquiries_privacy_consent_required;

alter table public.inquiries
  add constraint inquiries_privacy_consent_required
  check (privacy_consent = true);

comment on table public.inquiries is 'Public inquiry submissions from the website contact form.';

alter table public.inquiries enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries
for insert
to public
with check (true);

drop policy if exists "No public reads of inquiries" on public.inquiries;
create policy "No public reads of inquiries"
on public.inquiries
for select
to public
using (false);

drop policy if exists "No public updates of inquiries" on public.inquiries;
create policy "No public updates of inquiries"
on public.inquiries
for update
to public
using (false)
with check (false);

drop policy if exists "No public deletes of inquiries" on public.inquiries;
create policy "No public deletes of inquiries"
on public.inquiries
for delete
to public
using (false);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_email_idx on public.inquiries (email);
