-- ============================================================================
-- Millanel · 09 · Seed (categories + settings)
-- ----------------------------------------------------------------------------
-- The 16 category slugs MUST match scripts/build-products-sql.ts (its
-- category_lookup CTE resolves products → categories by these slugs), otherwise
-- imported products land uncategorized. Settings."contact".whatsapp powers the
-- WhatsApp checkout path in lib/actions/orders.ts.
-- ============================================================================

insert into public.categories (slug, name, sort_order, featured, image_path) values
  ('perfumes-mujer',       'Perfumes Mujer',        1,  true,  '/images/categories/perfumes-mujer.png'),
  ('perfumes-hombre',      'Perfumes Hombre',       2,  true,  '/images/categories/perfumes-hombre.png'),
  ('perfumes-infantiles',  'Perfumes Infantiles',   3,  false, null),
  ('maquillaje',           'Maquillaje',            4,  true,  '/images/categories/maquillaje.png'),
  ('cuidado-facial',       'Cuidado Facial',        5,  true,  '/images/categories/cuidado-facial.png'),
  ('cuidado-corporal',     'Cuidado Corporal',      6,  false, null),
  ('cabello',              'Cabello',               7,  true,  '/images/categories/cabello.png'),
  ('manos-y-pies',         'Manos y Pies',          8,  false, null),
  ('boxes-sets',           'Boxes & Sets',          9,  true,  '/images/categories/boxes-sets.png'),
  ('hogar-y-aromas',       'Hogar y Aromas',        10, false, null),
  ('mate-y-cocina',        'Mate y Cocina',         11, false, null),
  ('indumentaria',         'Indumentaria',          12, false, null),
  ('accesorios',           'Accesorios',            13, false, null),
  ('barber-shop',          'Barber Shop',           14, false, null),
  ('merchandising',        'Merchandising',         15, false, null),
  ('outlet',               'Outlet',                16, true,  '/images/categories/outlet.png')
on conflict (slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  featured = excluded.featured,
  image_path = excluded.image_path;

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
