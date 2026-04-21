alter table public.inquiries
  drop constraint if exists inquiries_privacy_consent_required;

alter table public.inquiries
  add constraint inquiries_privacy_consent_required
  check (privacy_consent = true);

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries
for insert
to public
with check (true);
