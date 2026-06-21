"use client";

import { motion, useReducedMotion } from "motion/react";
import { Sparkles, Gift, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT_SOFT } from "@/lib/motion";

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
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-10 md:grid-cols-12 md:gap-14 items-center">
        {/* Left column: Beautiful vertical teaser image */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE_OUT_SOFT }}
          className="md:col-span-5 relative aspect-[4/3] md:aspect-[3/4] w-full overflow-hidden rounded-[24px] shadow-medium border border-line"
        >
          <img
            src="/images/asesoria/quiz-intro.png"
            alt="Perfumes"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/20 to-transparent pointer-events-none" />
        </motion.div>

        {/* Right column: Content */}
        <div className="md:col-span-7 text-left space-y-6">
          <div>
            <motion.p {...fade(0)} className="eyebrow text-navy-700 flex items-center gap-2">
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
          </div>

          {/* Gift toggle & CTA */}
          <div className="space-y-6 pt-2">
            <motion.button
              {...fade(0.24)}
              type="button"
              onClick={() => onToggleGift(!isGift)}
              aria-pressed={isGift}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 active:scale-95",
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

            <motion.div {...fade(0.3)} className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={onStart}
                className="group inline-flex items-center gap-2.5 rounded-[12px] bg-navy px-9 py-4 text-sm font-medium uppercase tracking-[0.18em] text-cream shadow-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-navy-700 hover:shadow-deep hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
              >
                Empezar la asesoría
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <p className="text-xs text-mute-soft">
                Gratis · sin registro · +1.000 personas ya la hicieron
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
