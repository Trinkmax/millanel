-- ============================================================================
-- Millanel · 04 · Indexes
-- ----------------------------------------------------------------------------
-- Tuned to the exact access patterns in src/lib/queries and src/app/admin.
-- Includes FK-covering indexes (Supabase performance advisor flags missing ones)
-- and trigram indexes for the admin order ILIKE search.
-- ============================================================================

create extension if not exists pg_trgm with schema extensions;

-- ── products ────────────────────────────────────────────────────────────────
-- Storefront listing: WHERE active = true ORDER BY featured, is_new, created_at.
create index products_active_sort_idx
  on public.products (featured desc, is_new desc, created_at desc)
  where active = true;
-- Admin list: ORDER BY created_at DESC over ALL products (no active filter),
-- so this index must NOT be partial.
create index products_admin_created_idx on public.products (created_at desc);
-- Category landing pages + FK coverage + getCategoriesWithCount() which counts
-- ALL products per category (incl. inactive) — full, non-partial on the FK.
create index products_category_idx on public.products (category_id);
-- Full-text search (.textSearch on search_vector).
create index products_search_idx on public.products using gin (search_vector);
-- Tag filter (.contains("tags", [tag])).
create index products_tags_idx on public.products using gin (tags);
-- Admin product search: name ILIKE '%q%' (leading wildcard → trigram GIN).
create index products_name_trgm_idx on public.products using gin (name extensions.gin_trgm_ops);
-- Price sort.
create index products_price_idx on public.products (price) where active = true;
-- Low-stock dashboard widget (track_stock AND stock <= 5).
create index products_low_stock_idx on public.products (stock) where track_stock = true;

-- ── categories ──────────────────────────────────────────────────────────────
create index categories_active_sort_idx on public.categories (sort_order) where active = true;
create index categories_parent_idx on public.categories (parent_id);

-- ── shipping_zones ──────────────────────────────────────────────────────────
create index shipping_zones_active_sort_idx on public.shipping_zones (sort_order) where active = true;

-- ── orders ──────────────────────────────────────────────────────────────────
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_user_id_idx on public.orders (user_id);
create index orders_shipping_zone_idx on public.orders (shipping_zone_id);
-- Admin search: order_number / customer_name / customer_email ILIKE '%q%'.
create index orders_order_number_trgm_idx on public.orders using gin (order_number extensions.gin_trgm_ops);
create index orders_customer_name_trgm_idx on public.orders using gin (customer_name extensions.gin_trgm_ops);
create index orders_customer_email_trgm_idx on public.orders using gin (customer_email extensions.gin_trgm_ops);

-- ── order_items ─────────────────────────────────────────────────────────────
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);
