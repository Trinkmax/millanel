"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/lib/cart-store";
import { publicUrl } from "@/lib/storage";
import { parseSizes, effectivePrice } from "@/lib/variants";
import { formatPrice } from "@/lib/format";
import { useSiteInfo } from "@/components/storefront/site-info-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddToCartProps {
  product: {
    id: string;
    slug: string;
    code: string | null;
    name: string;
    price: number;
    sale_price?: number | null;
    images?: unknown;
    sizes?: unknown;
  };
}

function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first && "path" in first)
    return (first as { path?: string }).path ?? null;
  return null;
}

export function AddToCart({ product }: AddToCartProps) {
  const site = useSiteInfo();
  const sizes = parseSizes(product.sizes);
  const hasSizes = sizes.length > 0;
  const [qty, setQty] = useState(1);
  const [selectedMl, setSelectedMl] = useState<number | null>(
    hasSizes ? sizes[0].ml : null,
  );
  const add = useCart((s) => s.add);

  const selectedSize = hasSizes
    ? (sizes.find((s) => s.ml === selectedMl) ?? sizes[0])
    : null;
  const unitPrice = selectedSize
    ? effectivePrice(selectedSize)
    : (product.sale_price ?? product.price);
  const isOutOfPrice = unitPrice <= 0;

  function onAdd() {
    if (isOutOfPrice) {
      toast.info("Consultá disponibilidad por WhatsApp.");
      return;
    }
    add(
      {
        id: selectedSize ? `${product.id}::${selectedSize.ml}` : product.id,
        productId: product.id,
        slug: product.slug,
        code: product.code,
        name: product.name,
        size: selectedSize?.label ?? null,
        sizeMl: selectedSize?.ml ?? null,
        price: selectedSize ? selectedSize.price : product.price,
        salePrice: selectedSize
          ? (selectedSize.sale_price ?? null)
          : (product.sale_price ?? null),
        image: publicUrl(firstImage(product.images)),
      },
      qty,
    );
    toast.success("Sumado al carrito", {
      description: `${qty} × ${product.name}${selectedSize ? ` · ${selectedSize.label}` : ""}`,
      duration: 2200,
    });
  }

  const whatsappMessage = encodeURIComponent(
    `Hola Cintia, me interesa: ${product.name}${
      selectedSize ? ` (${selectedSize.label})` : ""
    }${product.code ? ` (cod. ${product.code})` : ""}.`,
  );

  return (
    <div className="space-y-5">
      {/* Size selector */}
      {hasSizes && (
        <div className="space-y-2.5">
          <p className="eyebrow text-mute">Elegí el tamaño</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const active = s.ml === selectedSize?.ml;
              return (
                <button
                  key={s.ml}
                  type="button"
                  onClick={() => setSelectedMl(s.ml)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start rounded-xl border px-4 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-95",
                    active
                      ? "border-navy bg-navy text-cream shadow-soft"
                      : "border-line bg-pearl text-navy-900 hover:border-navy-300",
                  )}
                >
                  <span className="text-sm font-medium leading-none">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "num-display text-xs mt-1",
                      active ? "text-cream/80" : "text-mute",
                    )}
                  >
                    {formatPrice(effectivePrice(s))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live price for the selected size */}
      {hasSizes && selectedSize && (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-3xl md:text-4xl text-navy num-display">
            {formatPrice(unitPrice)}
          </span>
          {selectedSize.sale_price != null && (
            <span className="text-base text-mute line-through num-display">
              {formatPrice(selectedSize.price)}
            </span>
          )}
          <span className="text-sm text-mute">· {selectedSize.label}</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="eyebrow text-mute">Cantidad</p>
        <QuantityStepper value={qty} onChange={setQty} max={99} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <Button onClick={onAdd} size="lg" className="w-full">
          <ShoppingBag className="h-4 w-4" />
          Agregar al carrito
        </Button>
        <Button asChild size="lg" variant="whatsapp" className="w-full">
          <a
            href={`https://wa.me/${site.contact.whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            <WhatsAppIcon size={16} />
            Consultar
          </a>
        </Button>
      </div>
    </div>
  );
}
