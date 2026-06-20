import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category } from "@/lib/supabase/types";

/**
 * Public catalog reads. Cookieless + `unstable_cache` so storefront routes can
 * be ISR/static instead of dynamic. Inner `_fns` THROW on DB error so failures
 * are NOT cached (no poisoning the cache with an empty catalog after a blip);
 * the exported wrappers catch and degrade gracefully to an empty result.
 * Invalidated on demand via `revalidateTag("categories" | "products")` from the
 * admin mutations in `@/lib/actions/admin`.
 */

const REVALIDATE = 300; // seconds

async function _getCategories(featured: boolean): Promise<Category[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (featured) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Category[];
}

const getCategoriesCached = unstable_cache(
  (featured: boolean) => _getCategories(featured),
  ["categories:list"],
  { tags: ["categories"], revalidate: REVALIDATE },
);

export async function getCategories(opts?: { featured?: boolean }) {
  try {
    return await getCategoriesCached(opts?.featured ?? false);
  } catch (error) {
    console.error("[categories] query error:", error);
    return [];
  }
}

async function _getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Category | null;
}

const getCategoryBySlugCached = unstable_cache(
  (slug: string) => _getCategoryBySlug(slug),
  ["categories:bySlug"],
  { tags: ["categories"], revalidate: REVALIDATE },
);

export async function getCategoryBySlug(slug: string) {
  try {
    return await getCategoryBySlugCached(slug);
  } catch {
    return null;
  }
}

async function _getCategoriesWithCount() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (
    (data ?? []) as unknown as (Category & {
      products: [{ count: number }];
    })[]
  ).map((c) => ({
    ...c,
    productCount: c.products?.[0]?.count ?? 0,
  }));
}

const getCategoriesWithCountCached = unstable_cache(
  () => _getCategoriesWithCount(),
  ["categories:withCount"],
  // depends on both categories and products, so either mutation busts it
  { tags: ["categories", "products"], revalidate: REVALIDATE },
);

export async function getCategoriesWithCount() {
  try {
    return await getCategoriesWithCountCached();
  } catch {
    return [];
  }
}
