grant usage on schema public to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;

drop policy if exists "No direct access to inquiries" on public.inquiries;

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
