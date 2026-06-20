import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cookieless, read-only anon client for PUBLIC catalog reads ONLY
 * (categories, products, settings, shipping zones).
 *
 * Why this exists: the cookie-bound SSR client (`@/lib/supabase/server`) reads
 * `cookies()`, which is a Request-time API that opts every route into DYNAMIC
 * rendering — defeating `export const revalidate` and ISR. This client carries
 * no session, never touches cookies, and its reads are wrapped in
 * `unstable_cache` (see `@/lib/queries/*`), so storefront pages can be
 * statically rendered / ISR-cached instead of hitting the DB on every request.
 *
 * Safe because RLS (20260619000007_rls.sql) already exposes the public catalog
 * to the `anon` role: products/categories/shipping_zones return only `active`
 * rows, and settings is `using (true)`. The store renders identically for any
 * logged-out visitor today, so reading as anon returns the same data.
 *
 * DO NOT use for admin mutations, checkout, or anything that must see inactive
 * rows or per-user session/auth — those keep the cookie client (`server.ts`)
 * or the service-role client (`admin.ts`).
 */
let client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createPublicClient() {
  if (client) return client;
  client = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return client;
}
