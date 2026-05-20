"use client";

import { useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/lib/cart-store";
import { SITE } from "@/lib/constants";
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
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const isOutOfPrice = product.price === 0;

  function onAdd() {
    if (isOutOfPrice) {
      toast.info("Consultá disponibilidad por WhatsApp.");
      return;
    }
    add(
      {
        id: product.id,
        slug: product.slug,
        code: product.code,
        name: product.name,
        price: product.price,
        salePrice: product.sale_price ?? null,
        image: firstImage(product.images),
      },
      qty,
    );
    toast.success("Sumado al carrito", {
      description: `${qty} × ${product.name}`,
      duration: 2200,
    });
  }

  const whatsappMessage = encodeURIComponent(
    `Hola Cintia, me interesa: ${product.name}${product.code ? ` (cod. ${product.code})` : ""}.`,
  );

  return (
    <div className="space-y-3">
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
            href={`https://wa.me/${SITE.contact.whatsapp}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            Consultar
          </a>
        </Button>
      </div>
    </div>
  );
}
