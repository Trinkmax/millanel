-- ============================================================================
-- Millanel · 05 · Functions
-- ----------------------------------------------------------------------------
-- All functions pin search_path = '' and fully-qualify objects (Supabase
-- security-advisor requirement). RPC return shapes mirror exactly what the app
-- consumes:
--   get_products_for_checkout → PriceCheckRow         (lib/actions/orders.ts)
--   get_order_public          → OrderPage order shape (orden/[id]/page.tsx)
--   dashboard_metrics         → Metrics interface      (admin/page.tsx)
-- ============================================================================

-- ── is_admin(): used by every RLS policy. SECURITY DEFINER so it can read
--    profiles without tripping that table's own RLS (no recursion). ──────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── set_updated_at(): generic updated_at trigger (no extension dependency) ───
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── handle_new_user(): mirror every new auth user into public.profiles ───────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ── get_products_for_checkout(): server-side price/availability source of
--    truth for placeOrder(). Returns every requested id (active or not) so the
--    action can reject inactive items itself. ─────────────────────────────────
create or replace function public.get_products_for_checkout(p_ids uuid[])
returns table (
  id          uuid,
  slug        text,
  code        text,
  name        text,
  price       numeric,
  sale_price  numeric,
  active      boolean,
  stock       integer,
  track_stock boolean,
  images      jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.slug, p.code, p.name, p.price, p.sale_price,
         p.active, p.stock, p.track_stock, p.images
  from public.products p
  where p.id = any(p_ids);
$$;

revoke execute on function public.get_products_for_checkout(uuid[]) from public;
grant execute on function public.get_products_for_checkout(uuid[]) to anon, authenticated;

-- ── get_order_public(): lets a guest view their order by number (no auth),
--    bundling shipping_zone + items into the exact JSON the page expects. ─────
create or replace function public.get_order_public(p_order_number text)
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'id',              o.id,
    'order_number',    o.order_number,
    'customer_name',   o.customer_name,
    'customer_email',  o.customer_email,
    'customer_phone',  o.customer_phone,
    'shipping_method', o.shipping_method,
    'shipping_address',o.shipping_address,
    'shipping_cost',   o.shipping_cost,
    'subtotal',        o.subtotal,
    'total',           o.total,
    'payment_method',  o.payment_method,
    'payment_status',  o.payment_status,
    'status',          o.status,
    'notes',           o.notes,
    'created_at',      o.created_at,
    'shipping_zone', (
      select json_build_object('name', z.name, 'estimated_days', z.estimated_days)
      from public.shipping_zones z
      where z.id = o.shipping_zone_id
    ),
    'items', coalesce((
      select json_agg(
        json_build_object(
          'product_name', i.product_name,
          'product_code', i.product_code,
          'quantity',     i.quantity,
          'unit_price',   i.unit_price,
          'total',        i.total
        ) order by i.created_at
      )
      from public.order_items i
      where i.order_id = o.id
    ), '[]'::json)
  )
  from public.orders o
  where o.order_number = p_order_number;
$$;

revoke execute on function public.get_order_public(text) from public;
grant execute on function public.get_order_public(text) to anon, authenticated;

-- ── dashboard_metrics(): admin KPIs for the dashboard. Self-guards on
--    is_admin() and returns the Metrics interface verbatim. ─────────────────
create or replace function public.dashboard_metrics(period text default 'month')
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_start  timestamptz;
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  v_start := case lower(coalesce(period, 'month'))
    when 'day'   then date_trunc('day', now())
    when 'week'  then now() - interval '7 days'
    when 'month' then date_trunc('month', now())
    when 'year'  then date_trunc('year', now())
    when 'all'   then '-infinity'::timestamptz
    else date_trunc('month', now())
  end;

  select json_build_object(
    'revenue', coalesce((
      select sum(total) from public.orders
      where payment_status = 'paid' and created_at >= v_start), 0),
    'revenue_pending', coalesce((
      select sum(total) from public.orders
      where payment_status in ('pending', 'in_process') and created_at >= v_start), 0),
    'orders_count', (
      select count(*) from public.orders where created_at >= v_start),
    'orders_paid', (
      select count(*) from public.orders
      where payment_status = 'paid' and created_at >= v_start),
    'orders_pending', (
      select count(*) from public.orders
      where status = 'pending' and created_at >= v_start),
    'orders_shipping', (
      select count(*) from public.orders
      where status in ('preparing', 'shipped') and created_at >= v_start),
    'total_customers', (
      select count(distinct customer_email) from public.orders
      where created_at >= v_start),
    'total_products', (
      select count(*) from public.products where active = true),
    'low_stock', (
      select count(*) from public.products
      where active = true and track_stock = true and stock <= 5),
    'top_products', coalesce((
      select json_agg(t order by t.units desc) from (
        select oi.product_name,
               sum(oi.quantity)::int as units,
               sum(oi.total)         as revenue
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        where o.payment_status = 'paid' and o.created_at >= v_start
        group by oi.product_name
        order by units desc
        limit 5
      ) t
    ), '[]'::json),
    'revenue_by_day', coalesce((
      select json_agg(d order by d.day) from (
        select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
               sum(total) as total
        from public.orders
        where payment_status = 'paid' and created_at >= v_start
        group by date_trunc('day', created_at)
      ) d
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.dashboard_metrics(text) from public, anon;
grant execute on function public.dashboard_metrics(text) to authenticated;
