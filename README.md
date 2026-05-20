# Millanel Frías — E-commerce editorial

Tienda online para **Millanel Frías**, distribuidora oficial Millanel en Frías, Santiago del Estero. Atendida por Cintia Barletta.

Construido con **Next.js 16** + **Supabase** + **Tailwind v4** + **Motion**. Diseño editorial estilo revista — navy + celeste pastel + cream.

---

## Stack

- Next.js 16 App Router con Server Components y `proxy.ts`
- TypeScript estricto
- Tailwind v4 con design tokens
- Supabase (Postgres + Auth + Storage + RLS)
- Motion (framer-motion v12)
- MercadoPago Checkout Pro
- Zustand persist para carrito
- Zod + RHF para validación
- Radix UI primitivos accesibles
- Sonner para toasts

## Setup

### 1. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tfwrpjabiucopmhuyydi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-mJTKOjwAgNg_v-AsKO5gA_Dw1bMJVU
# Service role: Supabase dashboard → Settings → API → service_role
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Opcionales — sin esto el checkout cae a WhatsApp/transferencia/efectivo
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
```

### 2. Correr

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### 3. Crear el usuario admin (Cintia)

1. Supabase Dashboard → Authentication → Users → **Add user**
2. Crear con email + password
3. SQL Editor:
   ```sql
   update public.profiles
   set role = 'admin', full_name = 'Cintia Barletta'
   where email = '<email-de-cintia>';
   ```
4. Login en `/ingreso`

### 4. MercadoPago (opcional)

1. https://www.mercadopago.com.ar/developers/panel — crear aplicación
2. Copiar `Access Token` → `MERCADOPAGO_ACCESS_TOKEN`
3. Copiar `Public Key` → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
4. Configurar webhook → `https://tu-dominio.vercel.app/api/mercadopago/webhook` (evento `payment`)

## Base de datos

Migraciones aplicadas vía Supabase MCP:

- `categories` — 16 categorías sembradas
- `products` — 556 productos importados desde `info/Lista_de_Precios_C06-2026.csv`
- `profiles` — extiende `auth.users` (rol `customer`/`admin`)
- `orders` + `order_items` — números tipo `ML-2026-0001`
- `shipping_zones` — 9 zonas AR con costo + envío gratis desde X
- `settings` — config key/value

RLS activa en todo. Storage buckets `product-images` y `category-images` (públicos en lectura, admin escribe).

Helpers SQL:

- `is_admin()`
- `dashboard_metrics(period)`
- `get_order_public(order_number)`
- `get_products_for_checkout(ids)`

## Re-importar catálogo

```bash
pnpm tsx scripts/build-products-sql.ts
```

Genera `supabase/seeds/products_*.sql` (chunks de 100). Aplicalos vía SQL Editor.

## Estructura

```
src/
├── app/
│   ├── (storefront)/        Home, catálogo, producto, cart, checkout, orden, sobre, contacto
│   ├── admin/               Dashboard, productos, órdenes, categorías, envíos, ajustes
│   ├── ingreso/             Login admin
│   ├── api/                 Webhooks (MercadoPago)
│   ├── icon.tsx             Favicon dinámico
│   ├── opengraph-image.tsx  OG image dinámica
│   ├── sitemap.ts           Sitemap desde DB
│   └── robots.ts
├── components/
│   ├── ui/                  Primitivos accesibles
│   ├── brand/               Marca (mark, wordmark, social icons)
│   ├── storefront/          Componentes del front
│   └── admin/               Componentes del panel
├── lib/
│   ├── supabase/            client / server / admin / types
│   ├── schemas/             Zod schemas (separados de actions)
│   ├── actions/             Server actions (orders, admin, auth)
│   ├── queries/             Server-only queries
│   └── cart-store.ts        Zustand store
└── proxy.ts                 Proxy Next.js 16 (auth refresh + admin guard)
```

## Diseño

- **Tipografía**: Cormorant Garamond (display, italic + roman) + Inter (body)
- **Paleta**: Navy `#212F5B` (logo) · Cream `#F8F3EA` · Sky `#D8E6F0` · Blush `#F3D6CD` · Champagne `#C8A878`
- **Tono editorial**: numerales display, ornamentos sutiles, generosa whitespace, animaciones suaves con scroll

## Deploy a Vercel

```bash
vercel link
vercel env pull
vercel deploy
```

Variables necesarias en Vercel: las mismas del `.env.local` excepto `NEXT_PUBLIC_SITE_URL` que apunte al dominio de producción.

---

Privado · Millanel Frías
