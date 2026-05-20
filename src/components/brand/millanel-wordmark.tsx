import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MillanelMark } from "./millanel-mark";

interface MillanelWordmarkProps {
  /** "logo" uses the official PNG; "mark" uses the SVG flower only. */
  variant?: "logo" | "mark" | "stacked" | "inline";
  /** Use on dark backgrounds — applies a filter to make the navy logo cream. */
  tone?: "light" | "dark";
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const HEIGHTS = {
  sm: "h-9",
  md: "h-12",
  lg: "h-20",
  xl: "h-28 md:h-36",
} as const;

const MARK_SIZE = {
  sm: 22,
  md: 30,
  lg: 56,
  xl: 96,
} as const;

export function MillanelWordmark({
  variant = "inline",
  tone = "light",
  className,
  href = "/",
  size = "md",
}: MillanelWordmarkProps) {
  // "mark" → just the SVG flower (used for tiny spaces, favicons-in-CTAs)
  if (variant === "mark") {
    const mark = (
      <MillanelMark
        size={MARK_SIZE[size]}
        className={cn(
          tone === "dark" ? "text-cream" : "text-[var(--color-logo)]",
          className,
        )}
      />
    );
    if (!href) return <span>{mark}</span>;
    return (
      <Link
        href={href}
        aria-label="Millanel · Inicio"
        className="inline-flex items-center"
      >
        {mark}
      </Link>
    );
  }

  // Default: the official square PNG logo (flower + wordmark)
  const img = (
    <Image
      src="/logo-millanel.png"
      alt="Millanel"
      width={1080}
      height={1080}
      priority={size === "lg" || size === "xl"}
      className={cn(
        "w-auto select-none",
        HEIGHTS[size],
        tone === "dark" && "logo-on-dark",
      )}
    />
  );

  if (!href) {
    return <span className={cn("inline-flex", className)}>{img}</span>;
  }

  return (
    <Link
      href={href}
      aria-label="Millanel · Inicio"
      className={cn(
        "inline-flex items-center transition-opacity duration-300 hover:opacity-80",
        className,
      )}
    >
      {img}
    </Link>
  );
}

// Kept for callers that prefer the explicit image API
export function MillanelLogoImage({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-millanel.png"
      alt="Millanel"
      width={1080}
      height={1080}
      priority={priority}
      className={cn("h-auto w-auto", className)}
    />
  );
}
