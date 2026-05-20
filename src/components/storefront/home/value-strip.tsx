"use client";

import { motion } from "motion/react";
import { Truck, Heart, ShieldCheck, MapPin } from "lucide-react";

const VALUES = [
  {
    icon: Truck,
    title: "Envío nacional",
    desc: "A todo el país por correo seguro.",
  },
  {
    icon: ShieldCheck,
    title: "Productos originales",
    desc: "Distribuidora oficial Millanel.",
  },
  {
    icon: Heart,
    title: "Atención personal",
    desc: "Hablás directamente con Cintia.",
  },
  {
    icon: MapPin,
    title: "Retiro en local",
    desc: "Frías, Santiago del Estero.",
  },
];

export function ValueStrip() {
  return (
    <section className="border-y border-line bg-cream-50">
      <div className="container-page py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          {VALUES.map((v, idx) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.7,
                  delay: idx * 0.08,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="flex items-start gap-3"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sky-100 text-navy">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-display text-lg md:text-xl text-navy-900 leading-tight">
                    {v.title}
                  </p>
                  <p className="text-xs md:text-sm text-mute leading-snug">
                    {v.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
