"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { ProductCard } from "@/components/storefront/product-card";
import { FAMILY_META } from "@/lib/asesoria/families";
import { submitQuizLead } from "@/lib/actions/quiz";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EASE_OUT_SOFT } from "@/lib/motion";
import type { QuizAnswers, QuizResult } from "@/lib/asesoria/types";

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

function MatchRing({ pct, run }: { pct: number; run: boolean }) {
  const value = useCountUp(pct, 950, run);
  const R = 52;
  const C = 2 * Math.PI * R;
  const off = C * (1 - value / 100);
  return (
    <div className="relative grid h-32 w-32 place-items-center">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" className="text-line" stroke="currentColor" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          className="text-navy"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute text-center">
        <span className="num-display text-3xl font-medium text-navy">
          {value}
          <span className="text-lg">%</span>
        </span>
        <span className="block text-[10px] uppercase tracking-[0.2em] text-mute">match</span>
      </div>
    </div>
  );
}

export function ResultReveal({
  result,
  answers,
  onRestart,
}: {
  result: QuizResult;
  answers: QuizAnswers;
  onRestart: () => void;
}) {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(!!reduce);
  const sent = useRef(false);

  const { archetype, recommendations } = result;
  const top = recommendations[0];
  const rest = recommendations.slice(1);
  const fam = FAMILY_META[archetype.family];

  // calculating beat → reveal (done starts true under reduced motion)
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setDone(true), 1150);
    return () => clearTimeout(t);
  }, [reduce]);

  // persist lead once
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    submitQuizLead({
      answers: answers as unknown as Record<string, unknown>,
      archetype: archetype.name,
      recommendedProductIds: recommendations.map((r) => r.product.id),
      consent: false,
      source: "asesoria",
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!top) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h2 className="font-display text-3xl text-navy-900">Estamos afinando tu match</h2>
        <p className="mt-3 text-mute">
          Mientras tanto, explorá la línea completa — o escribinos y te asesoramos.
        </p>
        <Link
          href="/productos?cat=perfumes-mujer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-cream"
        >
          Ver perfumes <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const waMessage = [
    "Hola Cintia! Hice la asesoría de aroma de Millanel ✨",
    `Mi perfil: ${archetype.name} — ${archetype.tagline}`,
    "",
    "Me recomendó:",
    ...recommendations.map(
      (r) =>
        `• ${r.product.name}${r.product.inspired_by_name ? ` (inspirado en ${r.product.inspired_by_name})` : ""}`,
    ),
    "",
    "Me gustaría más info 💛",
  ].join("\n");
  const waUrl = `https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(waMessage)}`;

  if (!done) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
          className="grid h-16 w-16 place-items-center rounded-full border border-line bg-pearl shadow-soft"
        >
          <Sparkles className="h-7 w-7 text-navy" />
        </motion.div>
        <p className="mt-6 font-display text-2xl text-navy-900">Armando tu perfil de aroma…</p>
        <p className="mt-2 text-sm text-mute">Cruzando tus respuestas con cientos de fragancias.</p>
      </div>
    );
  }

  const stagger = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE_OUT_SOFT, delay: i * 0.08 },
        };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Archetype header */}
      <motion.div {...stagger(0)} className="text-center">
        <p className="eyebrow text-navy-700 flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Tu perfil de aroma
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[1.02] tracking-tight text-navy-900">
          {archetype.name}
        </h2>
        <p className="mt-3 font-display italic text-xl md:text-2xl text-navy-700">
          {archetype.tagline}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-mute leading-relaxed">
          {archetype.description}
        </p>
      </motion.div>

      {/* Hero match */}
      <motion.div
        {...stagger(0.12)}
        className={cn(
          "relative mt-10 overflow-hidden rounded-[28px] border border-line bg-pearl shadow-lift",
        )}
      >
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-50", fam.gradient)}
        />
        <div className="relative grid gap-6 p-5 md:grid-cols-[minmax(0,300px)_1fr] md:gap-8 md:p-8">
          <div className="mx-auto w-full max-w-[280px]">
            <ProductCard product={top.product} index={0} />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <MatchRing pct={top.matchPct} run={!reduce} />
              <div>
                <p className="eyebrow text-navy-700">
                  {top.isExact ? "Tu match exacto" : "Tu mejor match"}
                </p>
                <p className="mt-1 font-display text-2xl md:text-3xl leading-tight text-navy-900">
                  {top.product.name}
                </p>
                {top.product.inspired_by_name && (
                  <p className="mt-1 text-sm text-navy-700">
                    Inspirado en{" "}
                    <span className="font-medium">{top.product.inspired_by_name}</span>
                    {top.product.inspired_by_brand ? ` de ${top.product.inspired_by_brand}` : ""}
                  </p>
                )}
              </div>
            </div>

            <ul className="mt-5 flex flex-wrap gap-2">
              {top.reasons.map((r) => (
                <li
                  key={r}
                  className="rounded-full border border-navy-100 bg-cream-50/80 px-3 py-1.5 text-xs text-navy-700"
                >
                  {r}
                </li>
              ))}
            </ul>

            {/* Note pyramid */}
            {(top.product.notes_top?.length ||
              top.product.notes_heart?.length ||
              top.product.notes_base?.length) ? (
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line/70 pt-5">
                {(
                  [
                    ["Salida", top.product.notes_top],
                    ["Corazón", top.product.notes_heart],
                    ["Fondo", top.product.notes_base],
                  ] as const
                ).map(([label, notes]) => (
                  <div key={label}>
                    <p className="eyebrow text-[10px] text-navy-700">{label}</p>
                    <p className="mt-1.5 text-xs leading-snug text-mute first-letter:capitalize">
                      {notes && notes.length ? notes.slice(0, 3).join(" · ") : "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-[12px] bg-[#25D366] px-6 py-4 text-sm font-medium text-white shadow-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1DAE54] hover:shadow-deep active:scale-[0.99]"
              >
                <WhatsAppIcon size={18} className="text-white" />
                Recibí tu asesoría por WhatsApp
              </a>
              <Link
                href={`/productos/${top.product.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-navy px-6 py-4 text-sm font-medium text-navy transition-colors hover:bg-navy hover:text-cream"
              >
                Ver fragancia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Other recommendations */}
      {rest.length > 0 && (
        <motion.div {...stagger(0.2)} className="mt-14">
          <p className="eyebrow text-navy-700 text-center">También van con vos</p>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-8">
            {rest.map((r, i) => (
              <ProductCard key={r.product.id} product={r.product} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Restart */}
      <motion.div {...stagger(0.28)} className="mt-12 text-center">
        <button
          type="button"
          onClick={onRestart}
          className="group inline-flex items-center gap-2 text-sm font-medium text-mute transition-colors hover:text-navy"
        >
          <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-90" />
          Rehacer la asesoría
        </button>
      </motion.div>
    </div>
  );
}
