-- ============================================================================
-- Millanel · 03 · Tables
-- ----------------------------------------------------------------------------
-- Schema is derived column-for-column from src/lib/supabase/types.ts and the
-- server actions / queries that read & write each table. Money is numeric(12,2)
-- (ARS, two decimals); the app already wraps every read in Number(...).
-- ============================================================================

-- Immutable wrapper around array_to_string (which Postgres marks STABLE) so the
-- products.search_vector GENERATED column can fold tags into the document.
-- array_to_string is deterministic for text[], so declaring it IMMUTABLE is safe.
create or replace function public.search_array_to_text(arr text[])
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$ select coalesce(array_to_string(arr, ' '), '') $$;

-- ── categories ──────────────────────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  slug          text        not null unique,
  description   text,
  image_path    text,                                   -- public URL or storage path
  parent_id     uuid        references public.categories (id) on delete set null,
  sort_order    integer     not null default 0,
  featured      boolean     not null default false,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint categories_no_self_parent check (parent_id is null or parent_id <> id)
);

comment on table public.categories is 'Product categories (self-nestable via parent_id).';

-- ── shipping_zones ──────────────────────────────────────────────────────────
create table public.shipping_zones (
  id                      uuid primary key default gen_random_uuid(),
  name                    text         not null,
  slug                    text         not null unique,
  provinces               text[]       not null default '{}',
  base_cost               numeric(12,2) not null default 0 check (base_cost >= 0),
  free_shipping_threshold numeric(12,2) check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  estimated_days          text,
  sort_order              integer      not null default 0,
  active                  boolean      not null default true,
  created_at              timestamptz  not null default now(),
  updated_at              timestamptz  not null default now()
);

comment on table public.shipping_zones is 'Shipping zones with base cost and optional free-shipping threshold.';

-- ── products ────────────────────────────────────────────────────────────────
create table public.products (
  id                uuid primary key default gen_random_uuid(),
  code              text unique,                         -- importer relies on ON CONFLICT (code)
  slug              text         not null unique,
  name              text         not null,
  short_description text,
  description       text,
  category_id       uuid         references public.categories (id) on delete set null,
  section           text,
  price             numeric(12,2) not null default 0 check (price >= 0),
  reference_price   numeric(12,2) check (reference_price is null or reference_price >= 0),
  sale_price        numeric(12,2) check (sale_price is null or sale_price >= 0),
  promotion         text,
  stock             integer      not null default 0,
  track_stock       boolean      not null default true,
  featured          boolean      not null default false,
  is_new            boolean      not null default false,
  active            boolean      not null default true,
  tags              text[]       not null default '{}',
  images            jsonb        not null default '[]'::jsonb,  -- [{ path, alt? }]
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now(),
  -- Spanish full-text vector consumed by getProducts() via
  -- .textSearch("search_vector", q, { type: "websearch", config: "spanish" }).
  -- All inputs go through immutable functions so the column can be STORED.
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(short_description, '') || ' ' || coalesce(description, '')), 'B') ||
    setweight(to_tsvector('spanish',
      public.search_array_to_text(tags) || ' ' ||
      coalesce(section, '') || ' ' ||
      coalesce(code, '') || ' ' ||
      coalesce(promotion, '')
    ), 'C')
  ) stored
);

comment on table public.products is 'Catalog products. images is a JSON array of { path, alt? }.';

-- ── profiles ────────────────────────────────────────────────────────────────
-- 1:1 with auth.users. Row is auto-created by the on_auth_user_created trigger.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  role        text        not null default 'customer' check (role in ('admin', 'customer')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'App profile per auth user. role=admin grants dashboard access.';

-- ── orders ──────────────────────────────────────────────────────────────────
-- order_number is auto-generated (ML-YYMMDD-NNNNN) and used as MercadoPago's
-- external_reference, so it must be human-stable and unique.
create sequence if not exists public.order_number_seq start with 1;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text         not null unique
                    default ('ML-' || to_char(now(), 'YYMMDD') || '-' ||
                             lpad(nextval('public.order_number_seq')::text, 5, '0')),
  user_id           uuid         references auth.users (id) on delete set null,

  customer_name     text         not null,
  customer_email    text         not null,
  customer_phone    text         not null,
  customer_dni      text,

  shipping_method   public.shipping_method not null,
  shipping_zone_id  uuid         references public.shipping_zones (id) on delete set null,
  shipping_address  jsonb,
  shipping_cost     numeric(12,2) not null default 0 check (shipping_cost >= 0),

  subtotal          numeric(12,2) not null check (subtotal >= 0),
  discount          numeric(12,2) not null default 0 check (discount >= 0),
  total             numeric(12,2) not null check (total >= 0),

  payment_method    public.payment_method not null,
  payment_status    public.payment_status not null default 'pending',
  status            public.order_status   not null default 'pending',

  mp_preference_id  text,
  mp_payment_id     text,
  mp_status         text,

  notes             text,                               -- customer note
  admin_notes       text,                               -- internal note

  paid_at           timestamptz,
  shipped_at        timestamptz,
  delivered_at      timestamptz,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

comment on table public.orders is 'Customer orders. Created by the trusted server action via service role.';

-- ── order_items ─────────────────────────────────────────────────────────────
-- Line items snapshot product name/code/price at purchase time so historical
-- orders stay correct even if the product later changes or is deleted.
create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid         not null references public.orders (id) on delete cascade,
  product_id     uuid         references public.products (id) on delete set null,
  product_name   text         not null,
  product_code   text,
  product_image  text,
  unit_price     numeric(12,2) not null check (unit_price >= 0),
  quantity       integer      not null check (quantity > 0),
  total          numeric(12,2) not null check (total >= 0),
  created_at     timestamptz  not null default now()
);

comment on table public.order_items is 'Immutable purchase-time snapshot of each ordered product.';

-- ── settings ────────────────────────────────────────────────────────────────
-- Flexible key/value store (contact info, store config). Publicly readable.
create table public.settings (
  key         text primary key,
  value       jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table public.settings is 'Public key/value app settings (e.g. "contact" → { whatsapp }).';
