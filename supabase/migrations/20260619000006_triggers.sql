-- ============================================================================
-- Millanel · 06 · Triggers
-- ----------------------------------------------------------------------------
-- updated_at maintenance on every mutable table + auth → profiles mirroring.
-- ============================================================================

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger shipping_zones_set_updated_at
  before update on public.shipping_zones
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- New auth user → create matching profile row.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
