import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

export async function getCategories(opts?: { featured?: boolean }) {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (opts?.featured) query = query.eq("featured", true);
  const { data, error } = await query;
  if (error) {
    console.error("[categories] query error:", error);
    return [];
  }
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data as Category | null;
}

export async function getCategoriesWithCount() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (
    (data ?? []) as unknown as (Category & {
      products: [{ count: number }];
    })[]
  ).map((c) => ({
    ...c,
    productCount: c.products?.[0]?.count ?? 0,
  }));
}
