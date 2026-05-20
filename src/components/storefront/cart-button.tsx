"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const open = useCart((s) => s.open);
  const items = useCart((s) => s.items);
  const lastAddedId = useCart((s) => s.lastAddedId);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { count } = cartTotals(items);

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Abrir carrito${count ? ` (${count} items)` : ""}`}
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-100 transition-colors",
        className,
      )}
    >
      <motion.span
        animate={
          lastAddedId && mounted
            ? { scale: [1, 1.18, 1], rotate: [0, -8, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        key={lastAddedId ?? "idle"}
      >
        <ShoppingBag className="h-5 w-5" />
      </motion.span>
      <AnimatePresence mode="popLayout">
        {mounted && count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="absolute -right-1 -top-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-navy text-cream text-[10px] font-semibold leading-none num-display"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
