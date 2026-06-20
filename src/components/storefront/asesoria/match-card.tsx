"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { publicUrl } from "@/lib/storage";
import { parseSizes, minSizePrice } from "@/lib/variants";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FAMILY_META } from "@/lib/asesoria/families";
import { EASE_OUT_SOFT } from "@/lib/motion";
import type { Recommendation, ScentFamily } from "@/lib/asesoria/types";

function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first && "path" in first) {
    return (first as { path?: string }).path ?? null;
  }
  return null;
}

function useCountUp(target: number, duration = 900, enabled = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return enabled ? v : target;
}

function MatchBadge({ pct }: { pct: number }) {
  const reduce = useReducedMotion();
  const value = useCountUp(pct, 900, !reduce);
  const R = 18;
  const C = 2 * Math.PI * R;
  const off = C * (1 - value / 100);
  return (
    <div className="relative grid h-12 w-12 place-items-center rounded-full bg-pearl/90 shadow-soft backdrop-blur-sm">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={R} fill="none" className="text-line" stroke="currentColor" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r={R}
          fill="none"
          className="text-navy"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
        />
      </svg>
      <span className="num-display absolute text-xs font-medium text-navy">
        {value}
        <span className="text-[8px]">%</span>
      </span>
    </div>
  );
}

export function MatchCard({
  rec,
  index,
  best,
}: {
  rec: Recommendation;
  index: number;
  best: boolean;
}) {
  const reduce = useReducedMotion();
  const add = useCart((s) => s.add);
  const p = rec.product;
  const fam = p.scent_family ? FAMILY_META[p.scent_family as ScentFamily] : null;
  const sizes = parseSizes(p.sizes);
  const hasSizes = sizes.length > 0;
  const fromPrice = hasSizes ? minSizePrice(sizes) : p.price;
  const isOutOfPrice = fromPrice === 0;
  const img = firstImage(p.images);
  const topNotes = (p.notes_top ?? []).slice(0, 3).join(" · ");

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfPrice) {
      toast.info("Consultá disponibilidad de este producto.");
      return;
    }
    const v = hasSizes ? sizes[0] : null;
    add({
      id: v ? `${p.id}::${v.ml}` : p.id,
      productId: p.id,
      slug: p.slug,
      code: p.code,
      name: p.name,
      size: v?.label ?? null,
      sizeMl: v?.ml ?? null,
      price: v ? v.price : p.price,
      salePrice: v ? (v.sale_price ?? null) : (p.sale_price ?? null),
      image: publicUrl(img),
    });
    toast.success("Sumado al carrito", { description: p.name, duration: 2000 });
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_SOFT, delay: reduce ? 0 : 0.1 + index * 0.12 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px] border bg-pearl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1",
        best
          ? "border-navy/40 shadow-medium ring-1 ring-navy/10 hover:shadow-deep"
          : "border-line shadow-whisper hover:shadow-medium",
      )}
    >
      {best && (
        <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-xl bg-navy px-4 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-cream shadow-soft">
          Tu mejor match
        </span>
      )}

      <Link href={`/productos/${p.slug}`} className="block">
        <div className={cn("relative aspect-square overflow-hidden bg-gradient-to-br", fam?.gradient ?? "from-cream-100 to-sky-50")}>
          {p.inspired_by_name && (
            <span className="absolute left-3 top-3 z-10 max-w-[70%] truncate rounded-full bg-pearl/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-navy-700 backdrop-blur-sm">
              {p.inspired_by_name}
            </span>
          )}
          <div className="absolute right-3 top-3 z-10">
            <MatchBadge pct={rec.matchPct} />
          </div>
          {img ? (
            <Image
              src={publicUrl(img)!}
              alt={p.name}
              fill
              sizes="(max-width: 768px) 90vw, 30vw"
              className="object-contain p-7 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display text-2xl italic text-navy-900/25">millanel</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-mute-soft">
          {p.inspired_by_name
            ? `Inspirado en ${p.inspired_by_name}${p.inspired_by_brand ? " · " + p.inspired_by_brand : ""}`
            : fam?.label ?? "Fragancia"}
        </p>
        <Link href={`/productos/${p.slug}`}>
          <h3 className="mt-1 font-display text-lg leading-tight text-navy-900 line-clamp-2 transition-colors group-hover:text-navy-700">
            {p.name}
          </h3>
        </Link>
        {topNotes && (
          <p className="mt-1.5 text-xs leading-snug text-mute first-letter:capitalize">{topNotes}</p>
        )}

        {rec.reasons[0] && (
          <p className="mt-3 inline-flex w-fit rounded-full border border-navy-100 bg-cream-50/80 px-2.5 py-1 text-[11px] text-navy-700">
            {rec.reasons[0]}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-mute">Versión Millanel</p>
            {isOutOfPrice ? (
              <p className="text-sm italic text-mute">Consultar</p>
            ) : (
              <p className="num-display text-navy">
                {hasSizes && <span className="text-[11px] text-mute">Desde </span>}
                <span className="font-medium">{formatPrice(fromPrice)}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Agregar ${p.name} al carrito`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-cream shadow-soft transition-all duration-300 hover:bg-navy-700 hover:shadow-medium active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>

        <Link
          href={`/productos/${p.slug}`}
          className="group/link mt-3 inline-flex items-center gap-1 text-xs font-medium text-navy-700 transition-colors hover:text-navy"
        >
          Ver fragancia
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
