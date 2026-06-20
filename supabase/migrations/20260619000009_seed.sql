-- ============================================================================
-- Millanel · 09 · Seed (categories + settings)
-- ----------------------------------------------------------------------------
-- The 16 category slugs MUST match scripts/build-products-sql.ts (its
-- category_lookup CTE resolves products → categories by these slugs), otherwise
-- imported products land uncategorized. Settings."contact".whatsapp powers the
-- WhatsApp checkout path in lib/actions/orders.ts.
-- ============================================================================

insert into public.categories (slug, name, sort_order, featured) values
  ('perfumes-mujer',       'Perfumes Mujer',        1,  true),
  ('perfumes-hombre',      'Perfumes Hombre',       2,  true),
  ('perfumes-infantiles',  'Perfumes Infantiles',   3,  false),
  ('maquillaje',           'Maquillaje',            4,  true),
  ('cuidado-facial',       'Cuidado Facial',        5,  true),
  ('cuidado-corporal',     'Cuidado Corporal',      6,  false),
  ('cabello',              'Cabello',               7,  true),
  ('manos-y-pies',         'Manos y Pies',          8,  false),
  ('boxes-sets',           'Boxes & Sets',          9,  true),
  ('hogar-y-aromas',       'Hogar y Aromas',        10, false),
  ('mate-y-cocina',        'Mate y Cocina',         11, false),
  ('indumentaria',         'Indumentaria',          12, false),
  ('accesorios',           'Accesorios',            13, false),
  ('barber-shop',          'Barber Shop',           14, false),
  ('merchandising',        'Merchandising',         15, false),
  ('outlet',               'Outlet',                16, true)
on conflict (slug) do nothing;

insert into public.settings (key, value) values
  ('contact', jsonb_build_object(
    'whatsapp',  '5492494007008',
    'phone',     '+54 9 2494 00-7008',
    'email',     'cintia-barletta@hotmail.com',
    'address',   'Rivadavia 664',
    'city',      'Frías',
    'province',  'Santiago del Estero',
    'instagram', 'https://instagram.com/millanel.frias',
    'facebook',  'https://facebook.com/millanel.frias'
  )),
  ('store', jsonb_build_object(
    'name',    'Millanel Frías',
    'tagline', 'Perfumería · Cosmética · Cuidado personal',
    'owner',   'Cintia Barletta'
  ))
on conflict (key) do nothing;
