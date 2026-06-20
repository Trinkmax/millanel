"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { MatchCard } from "./match-card";
import { submitQuizLead } from "@/lib/actions/quiz";
import { SITE } from "@/lib/constants";
import { EASE_OUT_SOFT } from "@/lib/motion";
import type { QuizAnswers, QuizResult } from "@/lib/asesoria/types";

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

  // calculating beat → reveal (done starts true under reduced motion)
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setDone(true), 1150);
    return () => clearTimeout(t);
  }, [reduce]);

  // persist the lead once
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

  if (recommendations.length === 0) {
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

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE_OUT_SOFT, delay },
        };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Archetype header */}
      <motion.div {...fade(0)} className="text-center">
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

      {/* 3 recommended perfumes */}
      <motion.p {...fade(0.08)} className="eyebrow mt-12 text-center text-navy-700">
        Tus 3 fragancias ideales
      </motion.p>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-7">
        {recommendations.slice(0, 3).map((rec, i) => (
          <MatchCard key={rec.product.id} rec={rec} index={i} best={i === 0} />
        ))}
      </div>

      {/* WhatsApp CTA */}
      <motion.div
        {...fade(0.4)}
        className="mx-auto mt-12 max-w-xl rounded-[24px] border border-line bg-pearl/70 p-6 text-center shadow-soft md:p-8"
      >
        <p className="font-display text-2xl text-navy-900">¿Te ayudamos a elegir?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mute">
          Mandanos tu resultado y Cintia te asesora 1 a 1 — sin compromiso.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="group mt-5 inline-flex items-center justify-center gap-2.5 rounded-[12px] bg-[#25D366] px-7 py-4 text-sm font-medium text-white shadow-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1DAE54] hover:shadow-deep active:scale-[0.99]"
        >
          <WhatsAppIcon size={18} className="text-white" />
          Recibí tu asesoría por WhatsApp
        </a>
      </motion.div>

      {/* Restart */}
      <motion.div {...fade(0.5)} className="mt-10 text-center">
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
