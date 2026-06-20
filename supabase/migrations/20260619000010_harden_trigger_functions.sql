-- ============================================================================
-- Millanel · 10 · Harden trigger functions
-- ----------------------------------------------------------------------------
-- set_updated_at() and handle_new_user() are trigger functions — they fire as
-- the table owner from triggers and must never be reachable as PostgREST RPCs.
-- Revoke API execute to remove them from the exposed surface (the triggers keep
-- working). The remaining SECURITY DEFINER functions stay callable on purpose:
--   • is_admin()                 — required by RLS policies (anon/authenticated
--                                  must be able to evaluate it)
--   • get_products_for_checkout / get_order_public — guest-checkout RPCs
--   • dashboard_metrics          — self-guards with is_admin()
-- ============================================================================

revoke execute on function public.set_updated_at()   from public, anon, authenticated;
revoke execute on function public.handle_new_user()   from public, anon, authenticated;
