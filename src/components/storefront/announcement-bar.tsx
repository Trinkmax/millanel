"use client";

import { motion } from "motion/react";
import { Truck, Sparkles, MapPin } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Envío a todo el país" },
  { icon: Sparkles, label: "Productos originales Millanel" },
  { icon: MapPin, label: "Retiro en Frías · Rivadavia 664" },
];

export function AnnouncementBar() {
  return (
    <div className="bg-navy text-cream overflow-hidden">
      <div className="relative flex h-9 items-center">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center gap-12 whitespace-nowrap pl-12"
        >
          {[...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.label}-${idx}`}
                className="flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase font-medium opacity-90"
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
