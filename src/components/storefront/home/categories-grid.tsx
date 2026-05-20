"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface CategoriesGridProps {
  categories: Category[];
}

const TONES = [
  "bg-sky-200 hover:bg-sky-300",
  "bg-blush-100 hover:bg-blush-200",
  "bg-cream-100 hover:bg-cream-200",
  "bg-navy-100 hover:bg-navy-200",
  "bg-champagne-100 hover:bg-champagne-200",
  "bg-sky-100 hover:bg-sky-200",
] as const;

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
      {categories.map((cat, idx) => (
        <motion.div
          key={cat.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: idx * 0.05,
          }}
        >
          <Link
            href={`/categorias/${cat.slug}`}
            className={cn(
              "group relative block aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-2xl transition-colors",
              TONES[idx % TONES.length],
            )}
          >
            <div className="paper-grain absolute inset-0" />
            {/* number */}
            <span className="absolute top-4 left-4 font-display italic text-2xl text-navy-900/30 num-display">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-navy-900/30 transition-all duration-500 group-hover:rotate-45 group-hover:text-navy-900" />

            <div className="absolute inset-x-5 bottom-5 md:inset-x-6 md:bottom-6">
              <h3 className="font-display text-2xl md:text-3xl lg:text-[28px] leading-[1.05] text-navy-900">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="mt-2 text-xs md:text-sm text-navy-900/60 line-clamp-2 leading-snug">
                  {cat.description}
                </p>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
