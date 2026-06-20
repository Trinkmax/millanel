"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Search, X, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT_SOFT } from "@/lib/motion";
import type { InspiredOption, InspiredRef } from "@/lib/asesoria/types";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function InspiredSearch({
  options,
  value,
  onSelect,
  onSkip,
}: {
  options: InspiredOption[];
  value: InspiredRef | null;
  onSelect: (ref: InspiredRef) => void;
  onSkip: () => void;
}) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string | null>(null);

  const brands = useMemo(() => {
    const c = new Map<string, number>();
    for (const o of options) if (o.brand) c.set(o.brand, (c.get(o.brand) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([n]) => n);
  }, [options]);

  const results = useMemo(() => {
    const nq = norm(q);
    let list = options;
    if (brand) list = list.filter((o) => o.brand === brand);
    if (nq)
      list = list.filter(
        (o) => norm(o.name).includes(nq) || (o.brand && norm(o.brand).includes(nq)),
      );
    return list.slice(0, 18);
  }, [q, brand, options]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Search */}
      <div className="group relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-500 transition-colors group-focus-within:text-navy" />
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setBrand(null);
          }}
          placeholder="Buscá el perfume… ej: Good Girl, One Million, La Vie est Belle"
          aria-label="Buscar perfume de diseñador"
          className="w-full rounded-full border border-line bg-pearl/90 py-4 pl-12 pr-12 text-base text-navy-900 shadow-whisper outline-none transition-all duration-300 placeholder:text-mute-soft focus:border-navy-300 focus:bg-pearl focus:shadow-soft"
        />
        <AnimatePresence>
          {q && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setQ("")}
              aria-label="Limpiar"
              className="absolute right-3.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-cream-100 hover:text-navy transition-colors"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Brand chips */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {brands.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => {
              setBrand((cur) => (cur === b ? null : b));
              setQ("");
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95",
              brand === b
                ? "border-navy bg-navy text-cream shadow-soft"
                : "border-line bg-pearl text-navy-700 hover:border-navy-300 hover:text-navy",
            )}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-6 max-h-[44vh] overflow-y-auto rounded-2xl">
        {results.length === 0 ? (
          <p className="py-10 text-center text-sm text-mute">
            No lo encontramos por ese nombre — probá la marca, o seguí y te guiamos igual.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.map((o, i) => {
              const selected = !!value && norm(value.name) === norm(o.name);
              return (
                <motion.button
                  key={o.name + (o.brand ?? "")}
                  type="button"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_SOFT, delay: reduce ? 0 : Math.min(i * 0.02, 0.2) }}
                  onClick={() => onSelect({ name: o.name, brand: o.brand ?? "" })}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border bg-pearl px-4 py-3 text-left transition-all duration-200 active:scale-[0.99]",
                    selected
                      ? "border-navy ring-2 ring-navy/15 shadow-soft"
                      : "border-line shadow-whisper hover:border-navy-300 hover:shadow-soft",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base leading-tight text-navy-900">
                      {o.name}
                    </span>
                    {o.brand && (
                      <span className="block truncate text-[11px] uppercase tracking-[0.16em] text-mute-soft">
                        {o.brand}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full transition-all",
                      selected ? "bg-navy text-cream" : "text-mute-soft",
                    )}
                  >
                    {selected ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <ArrowRight className="h-3.5 w-3.5" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Skip */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onSkip}
          className="group inline-flex items-center gap-2 text-sm font-medium text-navy-700 transition-colors hover:text-navy"
        >
          No estoy segura — mostrame opciones
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
