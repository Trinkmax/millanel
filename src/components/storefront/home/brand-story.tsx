"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Quote } from "lucide-react";
import { MillanelMark } from "@/components/brand/millanel-mark";
import { useSiteInfo } from "@/components/storefront/site-info-provider";

export function BrandStory() {
  const site = useSiteInfo();

  return (
    <section className="container-page py-16 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
          className="lg:col-span-6 relative"
        >
          <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0">
            <div className="absolute -inset-3 md:-inset-5 rounded-[22px] bg-blush-100 -rotate-3 paper-grain" />
            <div className="relative h-full w-full overflow-hidden rounded-[20px] shadow-deep">
              <Image
                src="/cintia.jpg"
                alt="Cintia Barletta — distribuidora oficial Millanel"
                fill
                sizes="(max-width: 1024px) 80vw, 45vw"
                className="object-cover"
              />
            </div>
            {/* Floating signature card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="absolute -right-3 md:-right-8 bottom-8 md:bottom-16 rotate-3"
            >
              <div className="bg-cream-50 rounded-2xl shadow-medium border border-line p-4 md:p-5 max-w-[200px]">
                <MillanelMark size={28} />
                <p className="font-display italic text-lg leading-tight mt-2 text-navy-900">
                  «Cuidá tu día a día con productos que te abracen.»
                </p>
                <p className="eyebrow mt-3 text-navy-700">— Cintia</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <span className="eyebrow">Sobre nosotros</span>
            <span className="h-px flex-1 max-w-[60px] bg-navy-200" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-navy-900">
            Detrás de cada producto,{" "}
            <em className="italic font-normal text-navy-700">
              una historia hecha a mano.
            </em>
          </h2>
          <Quote className="h-7 w-7 text-champagne-300 -mb-2" />
          <p className="text-base md:text-lg text-mute leading-relaxed">
            Soy <strong className="text-navy-900 font-medium">{site.owner.name}</strong>,
            distribuidora oficial Millanel en Frías. Desde mi local en {site.contact.address}{" "}
            elijo, pruebo y recomiendo cada uno de los productos que llegan a tus manos.
            Atiendo con confianza, conocimiento y cariño — como si te recibiera en mi propia casa.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-2 text-xs uppercase tracking-[0.18em] text-mute">
            <div>
              <p className="num-display font-display text-3xl text-navy normal-case tracking-normal leading-none">
                +12
              </p>
              <p className="mt-1">años acompañándote</p>
            </div>
            <div>
              <p className="num-display font-display text-3xl text-navy normal-case tracking-normal leading-none">
                +550
              </p>
              <p className="mt-1">productos en catálogo</p>
            </div>
          </div>
          <div className="pt-4">
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-navy hover:text-navy-700 group"
            >
              Leer la historia completa
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
