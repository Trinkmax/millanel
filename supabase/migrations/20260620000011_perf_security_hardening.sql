-- ============================================================================
-- Millanel · performance + security hardening
-- Generated 2026-06-20 from a perf/security audit of project jlrbwuxjwsbudrhcodlm.
-- Idempotent and safe to run more than once.
-- ============================================================================

-- ── 1. HOMEPAGE INDEX COVERAGE ──────────────────────────────────────────────
-- The homepage runs getProducts({featured}) and getProducts({isNew}) with the
-- default "newest" sort = ORDER BY featured DESC, is_new DESC, created_at DESC.
-- The existing products_active_sort_idx (featured, is_new, created_at) WHERE
-- active can only seek its leading column, so the is_new list scans the active
-- partition. These partial indexes let each list seek its filter AND read rows
-- pre-sorted, stopping at LIMIT 8. Negligible at 556 rows today; matters as the
-- catalog grows.
create index if not exists products_featured_home_idx
  on public.products (is_new desc, created_at desc)
  where active = true and featured = true;

create index if not exists products_is_new_home_idx
  on public.products (featured desc, created_at desc)
  where active = true and is_new = true;

-- categories featured list (getCategories({featured})). ~16 rows; future-proofing.
create index if not exists categories_featured_sort_idx
  on public.categories (sort_order)
  where active = true and featured = true;

-- NOTE: product text search is already covered by products_search_idx (GIN) and
-- category filtering by products_category_idx. No new indexes needed there.


-- ── 2. SECURITY: shrink the anon-callable RPC surface ───────────────────────
-- get_products_for_checkout() is a SECURITY DEFINER function (flagged by
-- get_advisors). It is ONLY ever called by placeOrder() via the service-role
-- client (src/lib/actions/orders.ts), which is unaffected by role GRANTs.
-- Revoking anon/authenticated EXECUTE removes a needless public REST RPC
-- endpoint without touching checkout.
revoke execute on function public.get_products_for_checkout(uuid[]) from anon, authenticated;

-- DELIBERATELY NOT REVOKED: public.is_admin().
-- Although the advisor flags it, the RLS policies on products/categories/
-- shipping_zones/settings reference `(select public.is_admin())` in their USING
-- clause. Revoking EXECUTE from anon would risk "permission denied for function
-- is_admin" when the policy predicate is evaluated against non-active rows
-- (the `active OR is_admin()` short-circuit is not guaranteed for every row
-- before the caller's own filters apply). Leaving the GRANT intact is the safe
-- choice; is_admin() only returns a boolean and leaks nothing.


-- ── 3. SECURITY (HIGH, NOT APPLIED HERE): gate get_order_public() PII ────────
-- get_order_public(p_order_number text) returns customer name/email/phone/
-- address to anon with NO second factor, and order_number is sequentially
-- enumerable (order_number_seq) → today the endpoint can be scraped for PII.
--
-- The fix requires a COORDINATED frontend change (the guest order-confirmation
-- page + fetchOrderByNumber in src/lib/actions/orders.ts must pass the gate),
-- so it is intentionally left as a template rather than applied blind:
--
--   create or replace function public.get_order_public(
--     p_order_number text,
--     p_email        text
--   )
--   returns json
--   language sql
--   stable
--   security definer
--   set search_path = ''
--   as $$
--     select json_build_object( /* ...same shape as today... */ )
--     from public.orders o
--     where o.order_number = p_order_number
--       and lower(o.customer_email) = lower(p_email);
--   $$;
--   revoke execute on function public.get_order_public(text) from anon, authenticated;
--   grant  execute on function public.get_order_public(text, text) to anon, authenticated;
--   -- then drop the old 1-arg overload once all callers pass the email.
--
-- Owner decision required: gate on customer_email (above) or DNI.
