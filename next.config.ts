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
