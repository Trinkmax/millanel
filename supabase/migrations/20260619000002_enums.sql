-- ============================================================================
-- Millanel · 02 · Enums
-- ----------------------------------------------------------------------------
-- Values are mirrored 1:1 from src/lib/supabase/types.ts (Database["Enums"]).
-- Changing any label here breaks the typed client, so keep them in sync.
-- ============================================================================

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
);

create type public.payment_method as enum (
  'mercadopago',
  'whatsapp',
  'transfer',
  'pickup_cash'
);

create type public.payment_status as enum (
  'pending',
  'in_process',
  'paid',
  'failed',
  'refunded'
);

create type public.shipping_method as enum (
  'pickup',
  'shipping'
);
