"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/storefront/product-image";
import { useCart, cartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const items = useCart((s) => s.items);
  const close = useCart((s) => s.close);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const { count, subtotal } = cartTotals(items);

  // Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Sheet open={mounted && isOpen} onOpenChange={(v) => (v ? null : close())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md bg-cream-50"
      >
        <SheetHeader className="border-b border-line pb-4">
          <SheetTitle className="flex items-center gap-3">
            <span className="text-3xl">Tu bolso</span>
            <span className="text-xs uppercase tracking-[0.2em] text-mute">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </SheetTitle>
          <SheetDescription>
            Revisá tu selección y finalizá el pedido.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyState onClose={close} />
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="divide-y divide-line">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
                      className="flex gap-4 px-6 py-4"
                    >
                      <Link
                        href={`/productos/${item.slug}`}
                        onClick={close}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <ProductImage
                            src={null}
                            alt={item.name}
                            seed={item.id}
                            className="rounded-md"
                          />
                        )}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/productos/${item.slug}`}
                            onClick={close}
                            className="text-sm font-medium text-navy-900 line-clamp-2 hover:text-navy-700"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            aria-label="Quitar"
                            className="text-mute hover:text-destructive transition-colors p-1 -mt-1 -mr-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {item.code && (
                          <p className="text-[11px] uppercase tracking-wider text-mute-soft mt-0.5">
                            COD {item.code}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <QuantityStepper
                            value={item.quantity}
                            onChange={(q) => setQuantity(item.id, q)}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-navy num-display">
                            {formatPrice(
                              (item.salePrice ?? item.price) * item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </ScrollArea>

            <SheetFooter className="flex-col gap-4 !p-6 border-t border-line bg-cream-50">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-mute">Subtotal</span>
                  <span className="font-medium text-navy num-display">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Separator />
                <p className="text-xs text-mute leading-relaxed">
                  Costo de envío y descuentos se calculan en el siguiente paso.
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-2">
                <Button size="lg" asChild>
                  <Link href="/checkout" onClick={close}>
                    Ir al checkout
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" asChild size="sm">
                  <Link href="/carrito" onClick={close}>
                    Ver carrito completo
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-sky/40">
        <ShoppingBag className="h-7 w-7 text-navy-700" />
      </div>
      <div className="space-y-2">
        <p className="font-display text-2xl text-navy-900">Tu bolso está vacío</p>
        <p className="text-sm text-mute max-w-xs">
          Sumá productos del catálogo para verlos acá. Te esperamos.
        </p>
      </div>
      <Button asChild className="mt-2">
        <Link href="/productos" onClick={onClose}>
          Descubrir productos
        </Link>
      </Button>
    </div>
  );
}
