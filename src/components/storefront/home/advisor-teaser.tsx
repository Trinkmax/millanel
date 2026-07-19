"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { FAMILY_CHOICES, FAMILY_META } from "@/lib/asesoria/families";
import { quizIcon } from "@/components/storefront/asesoria/icons";
import { cn } from "@/lib/utils";
import { EASE_OUT_SOFT } from "@/lib/motion";

export function AdvisorTeaser() {
  const reduce = useReducedMotion();

  return (
    <section className="container-page py-20 md:py-28 border-t border-line">
      <div className="relative overflow-hidden rounded-[32px] border border-line bg-cream-50/70 px-6 py-12 shadow-soft md:px-14 md:py-16">
        <div aria-hidden className="halo-sky pointer-events-none absolute inset-0 opacity-80" />
        <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blush-100/40 blur-3xl"
        />

        <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* Copy */}
          <div>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE_OUT_SOFT }}
              className="eyebrow text-navy-700 flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Asesoría de aroma
            </motion.p>

            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE_OUT_SOFT, delay: 0.05 }}
              className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-navy-900"
            >
              ¿No sabés cuál elegir?{" "}
              <em className="italic font-normal text-navy-700">
                Te encontramos el tuyo.
              </em>
            </motion.h2>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE_OUT_SOFT, delay: 0.1 }}
              className="mt-4 max-w-md text-base md:text-lg text-navy-900/70 leading-relaxed"
            >
              Respondé 5 preguntas rápidas y te armamos tu perfil de aroma con las
              fragancias que más van con vos — inspiradas en los perfumes que amás.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE_OUT_SOFT, delay: 0.16 }}
              className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <Link
                href="/asesoria"
                className="group inline-flex items-center gap-2.5 rounded-[12px] bg-navy px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-cream shadow-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-navy-700 hover:shadow-deep active:translate-y-0"
              >
                Empezá tu asesoría
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-xs text-mute">
                45 segundos · gratis · <span className="num-display">+1.000</span> ya la hicieron
              </p>
            </motion.div>
          </div>

          {/* Visual — Image with overlaid floating family pills */}
          <div className="relative">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE_OUT_SOFT, delay: 0.1 }}
              className="relative mx-auto aspect-[4/3] md:aspect-[3/4] w-full max-w-md overflow-hidden rounded-[24px] shadow-medium border border-line"
            >
              {/* The gorgeous teaser image */}
              <img
                src="/images/asesoria/advisor-teaser.webp"
                alt="Encontrá tu perfume ideal"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/45 via-transparent to-transparent pointer-events-none" />

              {/* Absolute positioned floating family pills */}
              <div className="absolute inset-0 p-6 pointer-events-none">
                {FAMILY_CHOICES.map((key, i) => {
                  const meta = FAMILY_META[key];
                  const Icon = quizIcon(meta.icon);

                  // Coordinate positions to scatter them nicely over the image
                  const positions = [
                    "top-[12%] left-[8%]",
                    "top-[28%] right-[8%]",
                    "top-[46%] left-[6%]",
                    "bottom-[36%] right-[8%]",
                    "bottom-[20%] left-[12%]",
                  ];

                  return (
                    <motion.span
                      key={key}
                      animate={
                        reduce
                          ? undefined
                          : { y: [0, i % 2 === 0 ? -5 : 5, 0] }
                      }
                      transition={
                        reduce
                          ? undefined
                          : {
                              duration: 5 + i,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.25,
                            }
                      }
                      className={cn(
                        "absolute inline-flex items-center gap-1.5 rounded-full border border-line bg-pearl/90 px-3 py-2 text-xs font-semibold text-navy shadow-whisper backdrop-blur-sm",
                        positions[i] || "top-0 left-0"
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-5.5 w-5.5 place-items-center rounded-full bg-gradient-to-br",
                          meta.gradient,
                        )}
                      >
                        <Icon className="h-3 w-3 text-navy" strokeWidth={2} />
                      </span>
                      {meta.short}
                    </motion.span>
                  );
                })}

                {/* center match badge */}
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: EASE_OUT_SOFT, delay: 0.35 }}
                  className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-pearl px-4 py-2.5 shadow-soft"
                >
                  <span className="num-display text-xl font-bold text-navy">98%</span>
                  <span className="text-left text-[9px] leading-tight text-mute">
                    de match con
                    <br />
                    <span className="font-display italic text-navy-700">tu perfil</span>
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
