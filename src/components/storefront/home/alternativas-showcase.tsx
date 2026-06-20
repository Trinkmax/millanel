"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Search, ArrowRight, ArrowUpRight, Sparkles, X } from "lucide-react";
import { publicUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlternativeItem } from "@/lib/queries/products";

const EASE = [0.22, 1, 0.36, 1] as const;

const PLACEHOLDERS = [
  "212",
  "Flower",
  "One Million",
  "Good Girl",
  "La Vie est Belle",
  "Acqua di Giò",
  "Lady Million",
  "Black Opium",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const GRAD: Record<AlternativeItem["genero"], string> = {
  mujer: "from-blush-100 via-cream-50 to-sky-100",
  hombre: "from-sky-200 via-cream-50 to-cream-100",
  unisex: "from-cream-100 via-pearl to-sky-100",
};

export function AlternativasShowcase({
  alternatives,
}: {
  alternatives: AlternativeItem[];
}) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [phIndex, setPhIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (q || brand) return; // pause the rotating hint while the user is engaged
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 2600);
    return () => clearInterval(id);
  }, [q, brand]);

  const fromPrice = useMemo(
    () =>
      alternatives.reduce((min, a) => Math.min(min, a.price), Infinity) || 0,
    [alternatives],
  );

  // Top brands by count, for the quick-filter chips.
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of alternatives) {
      if (!a.marca) continue;
      counts.set(a.marca, (counts.get(a.marca) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9)
      .map(([name, count]) => ({ name, count }));
  }, [alternatives]);

  const results = useMemo(() => {
    const nq = normalize(q);
    if (nq) {
      return alternatives.filter(
        (a) => normalize(a.perfume).includes(nq) || normalize(a.marca).includes(nq),
      );
    }
    if (brand) return alternatives.filter((a) => a.marca === brand);
    // Default: photo-first, then by number — a curated, visual mix.
    return [...alternatives].sort(
      (a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0) || a.n - b.n,
    );
  }, [q, brand, alternatives]);

  const filtering = !!q.trim() || !!brand;
  const cap = filtering ? 12 : 8;
  const visible = results.slice(0, cap);

  return (
    <section className="relative overflow-hidden border-t border-line bg-cream-50/40">
      <div className="paper-grain absolute inset-0 opacity-60" aria-hidden />
      {/* soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blush-100/40 blur-3xl"
      />

      <div className="container-page relative py-20 md:py-28">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="eyebrow text-navy-700 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Perfumería alternativa · {alternatives.length} fragancias
          </p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-navy-900">
            ¿Usás un perfume de diseñador?{" "}
            <em className="italic font-normal text-navy-700">Lo tenemos.</em>
          </h2>
          <p className="mt-4 text-base md:text-lg text-navy-900/70 leading-relaxed">
            Las mismas notas que amás, en su versión Millanel — elegí 30, 60 o 100&nbsp;ml.
            {fromPrice > 0 && (
              <>
                {" "}
                Desde{" "}
                <span className="font-medium text-navy num-display">
                  {formatPrice(fromPrice)}
                </span>
                .
              </>
            )}
          </p>
        </div>

        {/* Finder */}
        <div className="mt-9 max-w-xl">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-500 transition-colors group-focus-within:text-navy" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setBrand(null);
              }}
              placeholder={
                mounted
                  ? `Buscá tu perfume…  ej: ${PLACEHOLDERS[phIndex]}`
                  : "Buscá tu perfume…"
              }
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active={!brand && !q} onClick={() => { setBrand(null); setQ(""); }}>
              Todas
            </Chip>
            {brands.map((b) => (
              <Chip
                key={b.name}
                active={brand === b.name}
                onClick={() => {
                  setBrand((cur) => (cur === b.name ? null : b.name));
                  setQ("");
                }}
              >
                {b.name}
              </Chip>
            ))}
          </div>
        </div>

        {/* Result meta */}
        <div className="mt-8 flex items-end justify-between gap-4">
          <p className="text-sm text-mute">
            {filtering ? (
              <>
                <span className="num-display font-medium text-navy">
                  {results.length}
                </span>{" "}
                {results.length === 1 ? "coincidencia" : "coincidencias"}
                {brand && <> en {brand}</>}
              </>
            ) : (
              <>Una selección para descubrir — buscá la tuya arriba.</>
            )}
          </p>
        </div>

        {/* Grid */}
        {results.length === 0 ? (
          <NoMatch query={q} />
        ) : (
          <motion.div
            layout
            className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((a, i) => (
                <AlternativaCard key={a.id} a={a} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          {results.length > visible.length && (
            <p className="text-sm text-mute">
              {results.length - visible.length} más en esta búsqueda.
            </p>
          )}
          <Link
            href="/productos?cat=perfumes-mujer"
            className="group inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-medium text-cream shadow-medium transition-all duration-300 hover:bg-navy-700 hover:shadow-deep active:scale-[0.98]"
          >
            Ver las {alternatives.length} alternativas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-mute-soft">
            Misma esencia · 30 · 60 · 100 ml · Retiro en Frías o envío a todo el país
          </p>
        </div>
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 active:scale-95",
        active
          ? "border-navy bg-navy text-cream shadow-soft"
          : "border-line bg-pearl text-navy-700 hover:border-navy-300 hover:text-navy",
      )}
    >
      {children}
    </button>
  );
}

function AlternativaCard({ a, index }: { a: AlternativeItem; index: number }) {
  const img = publicUrl(a.image);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: EASE, delay: Math.min(index * 0.03, 0.25) }}
    >
      <Link
        href={`/productos/${a.slug}`}
        className="group block overflow-hidden rounded-2xl border border-line bg-pearl shadow-whisper transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-medium"
      >
        {/* Visual */}
        <div
          className={cn(
            "relative aspect-[5/4] overflow-hidden bg-gradient-to-br",
            GRAD[a.genero],
          )}
        >
          <span className="pointer-events-none absolute -right-1 -top-5 select-none font-display italic leading-none text-[5.5rem] md:text-[6.5rem] text-navy-900/[0.07]">
            {a.n}
          </span>
          <span className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.22em] text-navy-700/70">
            N°{a.n}
          </span>
          {img ? (
            <Image
              src={img}
              alt={`Alternativa a ${a.perfume}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display italic text-2xl text-navy-900/25 transition-transform duration-700 group-hover:-translate-y-0.5">
                millanel
              </span>
            </div>
          )}
          <span className="absolute bottom-3 left-3 rounded-full bg-pearl/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-navy-700 backdrop-blur-sm">
            {a.genero}
          </span>
        </div>

        {/* Body */}
        <div className="space-y-2 p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mute-soft truncate">
            {a.marca || "Fragancia"}
          </p>
          <h3 className="font-display text-lg md:text-xl leading-tight text-navy-900 line-clamp-2 min-h-[2.4em]">
            {a.perfume}
          </h3>
          <div className="h-px bg-line" />
          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-mute">
                Versión Millanel
              </p>
              <p className="num-display text-navy">
                <span className="text-[11px] text-mute">Desde </span>
                <span className="font-medium">{formatPrice(a.price)}</span>
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-navy-700 transition-colors group-hover:text-navy">
              Elegir
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function NoMatch({ query }: { query: string }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-pearl/50 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-sky-100">
        <Search className="h-6 w-6 text-navy-700" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="font-display text-2xl text-navy-900">
          No encontramos «{query}»
        </p>
        <p className="text-sm text-mute">
          Puede estar con otro nombre — escribinos y te decimos al toque, o explorá
          toda la línea.
        </p>
      </div>
      <Link
        href="/productos?cat=perfumes-mujer"
        className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-pearl px-5 py-2.5 text-sm font-medium text-navy hover:bg-cream-100 transition-colors"
      >
        Ver todas las alternativas
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
