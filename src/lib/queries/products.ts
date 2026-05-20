import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/supabase/types";

type ProductWithCategory = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

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
}

export async function getProducts(opts: ProductListOptions = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .eq("active", true);

  if (opts.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", opts.categorySlug)
      .maybeSingle();
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
  if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("[products] query error:", error);
    return { products: [], count: 0 };
  }
  return {
    products: (data ?? []) as unknown as ProductWithCategory[],
    count: count ?? 0,
  };
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.error("[product] query error:", error);
    return null;
  }
  return data as unknown as ProductWithCategory | null;
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("active", true)
    .neq("id", productId)
    .limit(limit);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as unknown as ProductWithCategory[];
}
