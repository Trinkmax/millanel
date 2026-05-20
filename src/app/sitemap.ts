import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://millanel-frias.vercel.app";

  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("active", true),
    supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("active", true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1, changeFrequency: "weekly" },
    { url: `${base}/productos`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${base}/sobre`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/contacto`, priority: 0.7, changeFrequency: "monthly" },
  ];

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${base}/productos/${p.slug}`,
    lastModified: new Date(p.updated_at),
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${base}/categorias/${c.slug}`,
    lastModified: new Date(c.updated_at),
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
