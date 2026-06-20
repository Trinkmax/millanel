-- ============================================================================
-- Millanel · 01 · Extensions
-- ----------------------------------------------------------------------------
-- gen_random_uuid() comes from pgcrypto (lives in the `extensions` schema on
-- Supabase). Everything else (updated_at, search_vector) is implemented with
-- plain immutable SQL/plpgsql so we don't depend on optional contrib modules.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
