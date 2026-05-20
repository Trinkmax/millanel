"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductImage } from "@/components/storefront/product-image";
import { SectionHeading } from "@/components/storefront/section-heading";
import { useCart, cartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { count, subtotal } = cartTotals(items);

  if (!mounted) {
    return <div className="py-24" />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <>
      <SectionHeading
        eyebrow={`${count} ${count === 1 ? "item" : "items"}`}
        title={
          <>
            Tu bolso{" "}
            <em className="italic font-normal text-navy-700">
              hasta acá.
            </em>
          </>
        }
        description="Revisá los productos antes de finalizar el pedido."
      />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Items list */}
        <ul className="lg:col-span-8 divide-y divide-line">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                className="flex gap-4 md:gap-6 py-6 first:pt-0"
              >
                <Link
                  href={`/productos/${item.slug}`}
                  className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-lg"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <ProductImage
                      src={null}
                      alt={item.name}
                      seed={item.id}
                      className="rounded-lg"
                    />
                  )}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/productos/${item.slug}`}
                      className="font-display text-lg md:text-xl text-navy-900 hover:text-navy-700 leading-tight"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label="Quitar"
                      className="text-mute hover:text-destructive transition-colors p-1 -mt-1 -mr-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.code && (
                    <p className="text-[11px] uppercase tracking-wider text-mute-soft mt-1">
                      COD {item.code}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.id, q)}
                    />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-mute">
                        {item.quantity} × {formatPrice(item.salePrice ?? item.price)}
                      </span>
                      <span className="text-lg font-medium text-navy num-display">
                        {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>

          <li className="pt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={clear}>
              Vaciar carrito
            </Button>
            <Button variant="link" asChild size="sm">
              <Link href="/productos">
                Seguir comprando
              </Link>
            </Button>
          </li>
        </ul>

        {/* Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <div className="rounded-2xl border border-line bg-cream-50 p-6 md:p-8 space-y-5">
            <h3 className="font-display text-2xl text-navy-900">Resumen</h3>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-mute">Subtotal ({count} items)</span>
              <span className="font-medium text-navy num-display">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-mute">Envío</span>
              <span className="text-mute italic">
                Se calcula en el checkout
              </span>
            </div>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-display text-xl text-navy-900">Total estimado</span>
              <span className="font-display text-3xl text-navy num-display">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">
                Continuar al checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-start gap-2 rounded-lg bg-blush-50 border border-blush-200 px-3.5 py-3">
              <Sparkles className="h-4 w-4 text-blush-400 shrink-0 mt-0.5" />
              <p className="text-xs text-navy-900/80 leading-relaxed">
                Aceptamos MercadoPago (tarjeta, transferencia o efectivo) y también
                podés coordinar el pedido por WhatsApp.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-24">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-sky/40">
        <ShoppingBag className="h-8 w-8 text-navy-700" />
      </div>
      <div className="space-y-3 max-w-md">
        <h1 className="font-display text-4xl md:text-5xl text-navy-900">
          Tu bolso está vacío
        </h1>
        <p className="text-mute leading-relaxed">
          Sumá productos del catálogo para verlos acá. Te esperamos.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/productos">
          Descubrir productos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
