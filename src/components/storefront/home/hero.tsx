"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { Button } from "@/components/ui/button";
import { MillanelMark } from "@/components/brand/millanel-mark";
import { useSiteInfo } from "@/components/storefront/site-info-provider";

const EASE = [0.22, 1, 0.36, 1] as const;
const FADE_UP = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, ease: EASE },
};

export function Hero() {
  const site = useSiteInfo();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Decorative halos */}
      <div className="absolute inset-0 pointer-events-none halo-sky" aria-hidden />
      <div className="absolute inset-0 paper-grain" aria-hidden />

      {/* Floating marks */}
      <motion.div
        animate={{
          y: [0, -18, 0],
          rotate: [0, 8, 0],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[6%] top-[15%] hidden md:block pointer-events-none"
        aria-hidden
      >
        <MillanelMark size={140} className="text-navy-200/60" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, 14, 0],
          rotate: [0, -10, 0],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[4%] bottom-[15%] hidden md:block pointer-events-none"
        aria-hidden
      >
        <MillanelMark size={90} className="text-blush-200/60" />
      </motion.div>

      <div className="container-page relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <div className="lg:col-span-7 space-y-7 md:space-y-9">
          <motion.div {...FADE_UP} transition={{ ...FADE_UP.transition, delay: 0.05 }} className="flex items-center gap-3">
            <span className="num-eyebrow text-navy-700 text-base">N°06 · 2026</span>
            <span className="h-px flex-1 max-w-[80px] bg-navy-200" />
            <span className="eyebrow">Frías · Santiago del Estero</span>
          </motion.div>

          <motion.h1
            {...FADE_UP}
            transition={{ ...FADE_UP.transition, delay: 0.15 }}
            className="font-display text-[12vw] sm:text-[9vw] md:text-[7.5vw] lg:text-[6.5vw] xl:text-[100px] leading-[0.95] tracking-[-0.02em] text-navy-900"
          >
            Una invitación{" "}
            <em className="italic font-normal text-navy-700">a tu propio</em>{" "}
            <span className="relative inline-block">
              ritual.
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.8, ease: EASE }}
                viewBox="0 0 200 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full overflow-visible"
                aria-hidden
              >
                <motion.path
                  d="M 5 8 Q 50 14 100 7 T 195 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  className="text-blush-300"
                />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            {...FADE_UP}
            transition={{ ...FADE_UP.transition, delay: 0.3 }}
            className="max-w-xl text-base md:text-lg text-mute leading-relaxed"
          >
            Perfumería, cosmética y cuidado para mujeres que se eligen cada día.
            Productos originales <strong className="text-navy-900 font-medium">Millanel</strong>{" "}
            con la atención personal de Cintia.
          </motion.p>

          <motion.div
            {...FADE_UP}
            transition={{ ...FADE_UP.transition, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="/productos">
                Descubrir el catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="whatsapp">
              <a
                href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent("Hola Cintia, me gustaría consultar por…")}`}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon size={16} />
                Hablanos por WhatsApp
              </a>
            </Button>
          </motion.div>

          <motion.div
            {...FADE_UP}
            transition={{ ...FADE_UP.transition, delay: 0.6 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-2 pt-2 text-xs text-mute"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-champagne-300" />
              + 550 productos
            </span>
            <span>·</span>
            <span>Envío a todo el país</span>
            <span>·</span>
            <span>Retiro en Rivadavia 664</span>
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
          className="lg:col-span-5 relative"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[6/7] w-full max-w-md mx-auto">
      {/* Soft background card peeking out */}
      <motion.div
        animate={{ rotate: [-3, -1, -3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[28px] bg-sky shadow-lift"
      />
      {/* Campaign cover photo */}
      <motion.div
        initial={{ rotate: 5 }}
        animate={{ rotate: [5, 3, 5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[28px] shadow-deep overflow-hidden border border-cream-200"
      >
        <Image
          src="/portada-c06.jpg"
          alt="Campaña Millanel C06 · Día del Padre"
          fill
          sizes="(max-width: 1024px) 90vw, 45vw"
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Floating editorial tag — stays steady while the photo card rotates */}
      <motion.div
        initial={{ opacity: 0, y: 12, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
        className="absolute -bottom-3 -left-3 md:-bottom-5 md:-left-5 rotate-[-6deg]"
      >
        <div className="flex items-center gap-3 bg-cream-50 rounded-2xl shadow-medium border border-line px-4 py-3">
          <MillanelMark size={26} />
          <div className="leading-none">
            <p className="num-eyebrow text-navy-700 text-xs">N°06 · 2026</p>
            <p className="font-display italic text-navy-900 text-base mt-0.5">
              Edición vigente
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
