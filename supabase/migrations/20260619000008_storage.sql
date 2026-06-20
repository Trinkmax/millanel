-- ============================================================================
-- Millanel · 08 · Storage buckets
-- ----------------------------------------------------------------------------
-- Two public image buckets used by components/admin/image-uploader.tsx
-- (publicUrl + supabase.storage.from(bucket).upload/remove). Public read so the
-- storefront can serve images via the CDN; writes restricted to admins.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images',  'product-images',  true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('category-images', 'category-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

-- Public read (buckets are public; explicit policy also covers authenticated list).
create policy "millanel images are publicly readable" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('product-images', 'category-images'));

-- Admin-only writes.
create policy "admins upload millanel images" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('product-images', 'category-images') and (select public.is_admin()));

create policy "admins update millanel images" on storage.objects
  for update to authenticated
  using (bucket_id in ('product-images', 'category-images') and (select public.is_admin()))
  with check (bucket_id in ('product-images', 'category-images') and (select public.is_admin()));

create policy "admins delete millanel images" on storage.objects
  for delete to authenticated
  using (bucket_id in ('product-images', 'category-images') and (select public.is_admin()));
