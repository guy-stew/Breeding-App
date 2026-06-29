-- Storage bucket for dog/puppy photos.
--
-- The app uploads from the browser using the Supabase anon client while the
-- breeder is logged in (so requests run as the `authenticated` role), then
-- displays images via getPublicUrl — hence a public bucket with authenticated
-- write access. Re-runnable: safe to apply more than once.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880, -- 5 MB, matches the client-side limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object-level access policies (RLS is always on for storage.objects).
drop policy if exists "photos_public_read"          on storage.objects;
drop policy if exists "photos_authenticated_insert" on storage.objects;
drop policy if exists "photos_authenticated_update" on storage.objects;
drop policy if exists "photos_authenticated_delete" on storage.objects;

create policy "photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'photos');

create policy "photos_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "photos_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos')
  with check (bucket_id = 'photos');

create policy "photos_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');
