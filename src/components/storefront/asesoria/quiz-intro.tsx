"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Wand2, Gift, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT_SOFT } from "@/lib/motion";

const STEPS_PREVIEW = [
  { icon: Wand2, label: "Respondé 5 preguntas" },
  { icon: Sparkles, label: "Descubrí tu perfil de aroma" },
  { icon: Gift, label: "Llevate tu match ideal" },
];

export function QuizIntro({
  isGift,
  onToggleGift,
  onStart,
  candidateCount,
}: {
  isGift: boolean;
  onToggleGift: (v: boolean) => void;
  onStart: () => void;
  candidateCount: number;
}) {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE_OUT_SOFT, delay },
        };

  return (
    <div className="mx-auto max-w-xl text-center">
      <motion.p {...fade(0)} className="eyebrow text-navy-700 flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        Asesoría de aroma
      </motion.p>

      <motion.h1
        {...fade(0.06)}
        className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl leading-[1.04] tracking-tight text-navy-900"
      >
        Encontrá tu fragancia ideal{" "}
        <em className="italic font-normal text-navy-700">en 45 segundos.</em>
      </motion.h1>

      <motion.p {...fade(0.12)} className="mt-5 text-base md:text-lg text-navy-900/70 leading-relaxed">
        Contanos cómo sos y para qué la querés. Te armamos un perfil de aroma y
        te recomendamos, entre {candidateCount}+ fragancias, las que más van con vos.
      </motion.p>

      {/* Mini stepper preview */}
      <motion.ul
        {...fade(0.18)}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2"
      >
        {STEPS_PREVIEW.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.label} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-line bg-pearl/70 px-3.5 py-2 text-xs font-medium text-navy-700">
                <Icon className="h-3.5 w-3.5 text-navy" strokeWidth={1.75} />
                {s.label}
              </span>
              {i < STEPS_PREVIEW.length - 1 && (
                <ArrowRight className="hidden sm:block h-3.5 w-3.5 text-mute-soft" />
              )}
            </li>
          );
        })}
      </motion.ul>

      {/* Gift toggle */}
      <motion.button
        {...fade(0.24)}
        type="button"
        onClick={() => onToggleGift(!isGift)}
        aria-pressed={isGift}
        className={cn(
          "mt-8 inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 active:scale-95",
          isGift
            ? "border-champagne-400 bg-champagne-50 text-navy-900 shadow-soft"
            : "border-line bg-pearl text-mute hover:border-champagne-300 hover:text-navy-700",
        )}
      >
        <Gift className={cn("h-4 w-4", isGift ? "text-champagne-400" : "text-mute")} strokeWidth={1.75} />
        Es para regalar
        <span
          className={cn(
            "ml-1 grid h-4 w-4 place-items-center rounded-full border text-[10px] transition-colors",
            isGift ? "border-champagne-400 bg-champagne-400 text-white" : "border-mute-soft text-transparent",
          )}
        >
          ✓
        </span>
      </motion.button>

      {/* CTA */}
      <motion.div {...fade(0.3)} className="mt-9">
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center gap-2.5 rounded-[12px] bg-navy px-9 py-4 text-sm font-medium uppercase tracking-[0.18em] text-cream shadow-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-700 hover:shadow-deep hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
        >
          Empezar la asesoría
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-4 text-xs text-mute-soft">
          Gratis · sin registro · +1.000 personas ya encontraron su aroma
        </p>
      </motion.div>
    </div>
  );
}
