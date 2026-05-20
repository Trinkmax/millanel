import Image from "next/image";
import { cn } from "@/lib/utils";
import { MillanelMark } from "@/components/brand/millanel-mark";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Override aspect ratio. Defaults to square. */
  aspect?: "square" | "portrait" | "landscape";
  /** Cycle a hue for the placeholder; provide a stable string (e.g. product.id). */
  seed?: string;
}

const ASPECT = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
} as const;

const PLACEHOLDER_GRADIENTS = [
  "from-sky-200 via-cream-100 to-blush-100",
  "from-blush-100 via-cream-50 to-sky-200",
  "from-cream-100 via-sky-200 to-cream-200",
  "from-sky-100 via-blush-50 to-cream-100",
  "from-blush-200 via-cream-50 to-sky-100",
] as const;

function gradientFor(seed?: string) {
  if (!seed) return PLACEHOLDER_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority,
  aspect = "square",
  seed,
}: ProductImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden bg-gradient-to-br",
          ASPECT[aspect],
          gradientFor(seed),
          className,
        )}
        aria-hidden
      >
        <div className="paper-grain absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MillanelMark
            size={84}
            className="text-navy-900/15 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6"
          />
        </div>
        <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.2em] text-navy-900/30 font-display italic">
          millanel
        </span>
      </div>
    );
  }
  return (
    <div className={cn("relative w-full overflow-hidden", ASPECT[aspect], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
    </div>
  );
}
