"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/storefront/product-image";
import { publicUrl } from "@/lib/storage";
import { parseSizes, minSizePrice } from "@/lib/variants";
import { useCart } from "@/lib/cart-store";
import { formatPrice, formatDiscount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    code: string | null;
    name: string;
    price: number;
    sale_price?: number | null;
    images?: unknown;
    sizes?: unknown;
    promotion?: string | null;
    is_new?: boolean;
    featured?: boolean;
    categories?: { name: string; slug: string } | null;
    tags?: string[];
  };
  className?: string;
  variant?: "default" | "compact";
  index?: number;
}

function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first && "path" in first) {
    return (first as { path?: string }).path ?? null;
  }
  return null;
}

export function ProductCard({
  product,
  className,
  variant = "default",
  index = 0,
}: ProductCardProps) {
  const add = useCart((s) => s.add);
  const image = firstImage(product.images);
  const sizes = parseSizes(product.sizes);
  const hasSizes = sizes.length > 0;
  const fromPrice = hasSizes ? minSizePrice(sizes) : product.price;
  const discount =
    !hasSizes && product.sale_price
      ? formatDiscount(product.price, product.sale_price)
      : null;
  const isOutOfPrice = (hasSizes ? fromPrice : product.price) === 0;

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfPrice) {
      toast.info("Consultá disponibilidad de este producto.");
      return;
    }
    const v = hasSizes ? sizes[0] : null;
    add({
      id: v ? `${product.id}::${v.ml}` : product.id,
      productId: product.id,
      slug: product.slug,
      code: product.code,
      name: product.name,
      size: v?.label ?? null,
      sizeMl: v?.ml ?? null,
      price: v ? v.price : product.price,
      salePrice: v ? (v.sale_price ?? null) : (product.sale_price ?? null),
      image: publicUrl(image),
    });
    toast.success("Sumado al carrito", {
      description: product.name,
      duration: 2000,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: Math.min(index * 0.04, 0.4),
      }}
      className={cn("group relative", className)}
    >
      <Link
        href={`/productos/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-[6px]"
      >
        <div className="relative overflow-hidden rounded-[6px] bg-pearl shadow-whisper transition-shadow duration-500 group-hover:shadow-medium">
          <ProductImage
            src={publicUrl(image)}
            alt={product.name}
            seed={product.id}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
          />

          {/* Badges overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.is_new && <Badge variant="new">Nuevo</Badge>}
            {discount && (
              <Badge variant="promo">-{discount}%</Badge>
            )}
            {product.promotion && !discount && (
              <Badge variant="champagne">Promo</Badge>
            )}
          </div>

          {/* Quick add (desktop only) */}
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Agregar ${product.name} al carrito`}
            className="absolute bottom-3 right-3 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-navy text-cream shadow-medium opacity-0 translate-y-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:translate-y-0 hover:bg-navy-700 active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("mt-3.5 px-0.5", variant === "compact" && "mt-2.5")}>
          {product.categories?.name && (
            <p className="eyebrow text-mute-soft mb-1">
              {product.categories.name}
            </p>
          )}
          <h3
            className={cn(
              "font-display leading-tight text-navy-900 line-clamp-2",
              variant === "compact" ? "text-base" : "text-[17px] md:text-lg",
            )}
          >
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            {isOutOfPrice ? (
              <span className="text-sm text-mute italic">Consultar</span>
            ) : hasSizes ? (
              <span className="text-base font-medium text-navy num-display">
                Desde {formatPrice(fromPrice)}
              </span>
            ) : product.sale_price ? (
              <>
                <span className="text-base font-medium text-navy num-display">
                  {formatPrice(product.sale_price)}
                </span>
                <span className="text-sm text-mute-soft line-through num-display">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-base font-medium text-navy num-display">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={onAdd}
        aria-label={`Agregar ${product.name} al carrito`}
        className="mt-2.5 md:hidden inline-flex items-center justify-center gap-1.5 w-full text-xs font-medium tracking-[0.16em] uppercase text-navy hover:text-navy-700 py-1.5"
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        Agregar
      </button>
    </motion.div>
  );
}
