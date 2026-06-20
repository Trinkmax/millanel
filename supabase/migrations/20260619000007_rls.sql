-- ============================================================================
-- Millanel · 07 · Row Level Security
-- ----------------------------------------------------------------------------
-- Model:
--   • Public catalog (products / categories / shipping_zones / settings) is
--     world-readable for active rows; only admins write.
--   • orders / order_items are admin-only. Guest checkout never touches these
--     tables directly: writes go through the trusted server action using the
--     service-role key (bypasses RLS), and guests read their own order through
--     the SECURITY DEFINER get_order_public() RPC.
--   • profiles: a user sees only their own row; admins see/manage all.
-- is_admin() is wrapped in a scalar sub-select so the planner evaluates it once
-- per statement (Supabase performance-advisor recommendation).
-- ============================================================================

alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.settings       enable row level security;
alter table public.profiles       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

-- ── Privilege grants (RLS gates the rows; GRANT gates the verbs) ─────────────
grant select on public.categories, public.products, public.shipping_zones, public.settings
  to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.shipping_zones, public.settings
  to authenticated;
grant select, insert, update, delete on public.profiles, public.orders, public.order_items
  to authenticated;
grant usage, select on sequence public.order_number_seq to authenticated, service_role;

-- ── categories ──────────────────────────────────────────────────────────────
create policy categories_select_public on public.categories
  for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy categories_insert_admin on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy categories_update_admin on public.categories
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy categories_delete_admin on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- ── products ────────────────────────────────────────────────────────────────
create policy products_select_public on public.products
  for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy products_insert_admin on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy products_update_admin on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy products_delete_admin on public.products
  for delete to authenticated using ((select public.is_admin()));

-- ── shipping_zones ──────────────────────────────────────────────────────────
create policy shipping_zones_select_public on public.shipping_zones
  for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy shipping_zones_insert_admin on public.shipping_zones
  for insert to authenticated with check ((select public.is_admin()));
create policy shipping_zones_update_admin on public.shipping_zones
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy shipping_zones_delete_admin on public.shipping_zones
  for delete to authenticated using ((select public.is_admin()));

-- ── settings (public read-only config) ──────────────────────────────────────
create policy settings_select_public on public.settings
  for select to anon, authenticated using (true);
create policy settings_insert_admin on public.settings
  for insert to authenticated with check ((select public.is_admin()));
create policy settings_update_admin on public.settings
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy settings_delete_admin on public.settings
  for delete to authenticated using ((select public.is_admin()));

-- ── profiles (self + admin) ─────────────────────────────────────────────────
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_insert_admin on public.profiles
  for insert to authenticated with check ((select public.is_admin()));
create policy profiles_update_admin on public.profiles
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy profiles_delete_admin on public.profiles
  for delete to authenticated using ((select public.is_admin()));

-- ── orders (admin-only; guests go through service role + RPC) ────────────────
create policy orders_select_admin on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy orders_insert_admin on public.orders
  for insert to authenticated with check ((select public.is_admin()));
create policy orders_update_admin on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy orders_delete_admin on public.orders
  for delete to authenticated using ((select public.is_admin()));

-- ── order_items (admin-only) ─────────────────────────────────────────────────
create policy order_items_select_admin on public.order_items
  for select to authenticated using ((select public.is_admin()));
create policy order_items_insert_admin on public.order_items
  for insert to authenticated with check ((select public.is_admin()));
create policy order_items_update_admin on public.order_items
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy order_items_delete_admin on public.order_items
  for delete to authenticated using ((select public.is_admin()));
