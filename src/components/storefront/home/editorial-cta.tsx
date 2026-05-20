"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MillanelMark } from "@/components/brand/millanel-mark";
import { SITE } from "@/lib/constants";

export function EditorialCTA() {
  return (
    <section className="container-page py-16 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative overflow-hidden rounded-[28px] bg-navy text-cream"
      >
        <div className="paper-grain absolute inset-0 opacity-50" />

        {/* Decorative marks */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 pointer-events-none"
          aria-hidden
        >
          <MillanelMark size={420} className="text-cream/[0.04]" />
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 px-8 py-16 md:px-16 md:py-24">
          <div className="space-y-6">
            <p className="eyebrow text-cream/70">Te esperamos</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Pasá a saludarnos,{" "}
              <em className="italic font-normal text-blush-200">
                te recibimos con un café.
              </em>
            </h2>
            <p className="text-cream/70 text-base md:text-lg leading-relaxed max-w-md">
              Nuestro local en el centro de Frías está abierto de lunes a sábado.
              Probá las fragancias antes de comprar, conocé los productos en mano y
              llevate las novedades que llegan cada quince días.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                asChild
                size="lg"
                variant="champagne"
                className="!bg-cream !text-navy hover:!bg-blush hover:!text-navy-900"
              >
                <a
                  href={`https://wa.me/${SITE.contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Escribinos por WhatsApp
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="!border-cream/30 !text-cream hover:!bg-cream/10"
              >
                <Link href="/contacto">
                  <MapPin className="h-4 w-4" />
                  Ver mapa
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6 md:border-l md:border-cream/15 md:pl-12">
            <div>
              <p className="eyebrow text-cream/60">Dirección</p>
              <p className="font-display text-2xl md:text-3xl mt-2 leading-tight">
                {SITE.contact.address}
                <br />
                <span className="text-cream/70 text-xl italic font-normal">
                  {SITE.contact.city}, {SITE.contact.province}
                </span>
              </p>
            </div>
            <div>
              <p className="eyebrow text-cream/60">Horarios</p>
              <p className="text-sm text-cream/80 mt-2 leading-relaxed">
                {SITE.contact.hours}
              </p>
            </div>
            <div>
              <p className="eyebrow text-cream/60">Pedidos</p>
              <p className="text-sm text-cream/80 mt-2 leading-relaxed">
                {SITE.contact.phone}
                <br />
                {SITE.contact.email}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
