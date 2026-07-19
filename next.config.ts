import type { NextConfig } from "next";

// Live Supabase project host for next/image remotePatterns.
// Derive from env; the fallback must point at the LIVE project, never the
// abandoned `tfwrpjabiucopmhuyydi` ref (its DNS no longer resolves → broken images).
const supabaseHost =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "") ??
  "jlrbwuxjwsbudrhcodlm.supabase.co";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Sin optimizador de Vercel: el plan Hobby tiene 5K transformaciones/mes y al
    // agotarse /_next/image devuelve 402 y rompe TODAS las imágenes en producción.
    // Las imágenes se sirven tal cual desde el CDN de Supabase.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "date-fns"],
  },
};

export default nextConfig;
