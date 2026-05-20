import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://millanel-frias.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin", "/ingreso", "/api", "/checkout", "/orden", "/carrito"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
