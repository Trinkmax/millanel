import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product, Category } from "@/lib/supabase/types";

/**
 * Public product reads. Cookieless + `unstable_cache` (see categories.ts for the
 * caching/error contract). Invalidated via `revalidateTag("products")` from the
 * admin mutations.
 */

const REVALIDATE = 300; // seconds

type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export interface ProductListResult {
  products: ProductWithCategory[];
  count: number;
}

export interface ProductListOptions {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  isNew?: boolean;
  tag?: string;
  promo?: boolean;
  limit?: number;
  offset?: number;
  sort?: "name-asc" | "name-desc" | "price-asc" | "price-desc" | "newest";
  /** Request an exact COUNT (for pagination/totals). Off by default to skip the
   * extra COUNT pass on hot paths like the homepage that never read `.count`. */
  withCount?: boolean;
}

async function _getProducts(opts: ProductListOptions): Promise<ProductListResult> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select(
      "*, categories(id, name, slug)",
      opts.withCount ? { count: "exact" } : undefined,
    )
    .eq("active", true);

  if (opts.categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", opts.categorySlug)
      .maybeSingle();
    if (catErr) throw catErr;
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }
  if (opts.search) {
    query = query.textSearch("search_vector", opts.search, {
      type: "websearch",
      config: "spanish",
    });
  }
  if (opts.featured) query = query.eq("featured", true);
  if (opts.isNew) query = query.eq("is_new", true);
  if (opts.tag) query = query.contains("tags", [opts.tag]);
  if (opts.promo) query = query.not("promotion", "is", null);

  const sort = opts.sort ?? "newest";
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    case "name-desc":
      query = query.order("name", { ascending: false });
      break;
    default:
      query = query
        .order("featured", { ascending: false })
        .order("is_new", { ascending: false })
        .order("created_at", { ascending: false });
  }

  if (opts.limit) query = query.limit(opts.limit);
  if (opts.offset)
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    products: (data ?? []) as unknown as ProductWithCategory[],
    count: count ?? 0,
  };
}

const getProductsCached = unstable_cache(
  (opts: ProductListOptions) => _getProducts(opts),
  ["products:list"],
  { tags: ["products"], revalidate: REVALIDATE },
);

export async function getProducts(
  opts: ProductListOptions = {},
): Promise<ProductListResult> {
  try {
    // Free-text search produces unbounded cache keys → bypass the persistent
    // cache and query live (these pages are dynamic via searchParams anyway).
    if (opts.search) return await _getProducts(opts);
    return await getProductsCached(opts);
  } catch (error) {
    console.error("[products] query error:", error);
    return { products: [], count: 0 };
  }
}

async function _getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as ProductWithCategory | null;
}

const getProductBySlugCached = unstable_cache(
  (slug: string) => _getProductBySlug(slug),
  ["products:bySlug"],
  { tags: ["products"], revalidate: REVALIDATE },
);

export async function getProductBySlug(slug: string) {
  try {
    return await getProductBySlugCached(slug);
  } catch (error) {
    console.error("[product] query error:", error);
    return null;
  }
}

async function _getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit: number,
): Promise<ProductWithCategory[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("active", true)
    .neq("id", productId)
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithCategory[];
}

const getRelatedProductsCached = unstable_cache(
  (productId: string, categoryId: string | null, limit: number) =>
    _getRelatedProducts(productId, categoryId, limit),
  ["products:related"],
  { tags: ["products"], revalidate: REVALIDATE },
);

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
) {
  try {
    return await getRelatedProductsCached(productId, categoryId, limit);
  } catch {
    return [];
  }
}

/* ── Alternativas (home showcase) ───────────────────────────────────────────
   Lightweight DTO of the "Fragancias Alternativas" line (one per number, with
   sizes) for the interactive home finder. Roll-ons are excluded. */
export interface AlternativeItem {
  id: string;
  slug: string;
  n: number;
  perfume: string;
  marca: string;
  price: number;
  image: string | null;
  genero: "mujer" | "hombre" | "unisex";
}

async function _getAlternatives(): Promise<AlternativeItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, fragrance_number, alternativa_a, alternativa_marca, price, images, sizes, tags",
    )
    .eq("active", true)
    .not("fragrance_number", "is", null)
    .order("fragrance_number", { ascending: true });
  if (error) throw error;

  const out: AlternativeItem[] = [];
  for (const p of data ?? []) {
    const sizes = Array.isArray(p.sizes) ? p.sizes : [];
    if (sizes.length === 0) continue; // skip roll-ons (single format)
    if (!p.alternativa_a || p.fragrance_number == null) continue;
    const imgs = Array.isArray(p.images) ? (p.images as { path?: string }[]) : [];
    const tags = (p.tags ?? []) as string[];
    out.push({
      id: p.id,
      slug: p.slug,
      n: p.fragrance_number,
      perfume: p.alternativa_a,
      marca: p.alternativa_marca ?? "",
      price: Number(p.price),
      image: imgs[0]?.path ?? null,
      genero: tags.includes("hombre")
        ? "hombre"
        : tags.includes("unisex")
          ? "unisex"
          : "mujer",
    });
  }
  return out;
}

const getAlternativesCached = unstable_cache(
  () => _getAlternatives(),
  ["products:alternatives"],
  { tags: ["products"], revalidate: REVALIDATE },
);

export async function getAlternatives(): Promise<AlternativeItem[]> {
  try {
    return await getAlternativesCached();
  } catch (error) {
    console.error("[alternatives] query error:", error);
    return [];
  }
}
