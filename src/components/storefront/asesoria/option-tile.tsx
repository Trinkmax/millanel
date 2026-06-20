"use client";

import { createElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { quizIcon } from "./icons";
import { EASE_OUT_SOFT } from "@/lib/motion";
import type { ChoiceOption } from "@/lib/asesoria/questions";

export function OptionTile({
  option,
  selected,
  index,
  onSelect,
}: {
  option: ChoiceOption;
  selected: boolean;
  index: number;
  onSelect: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: EASE_OUT_SOFT,
        delay: reduce ? 0 : Math.min(index * 0.05, 0.3),
      }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 overflow-hidden rounded-2xl border bg-pearl p-4 md:p-5 text-left transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-navy ring-2 ring-navy/15 shadow-medium -translate-y-0.5"
          : "border-line shadow-whisper hover:border-navy-300 hover:shadow-soft hover:-translate-y-0.5",
      )}
    >
      {option.gradient && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br transition-opacity duration-300",
            option.gradient,
            selected ? "opacity-90" : "opacity-40 group-hover:opacity-70",
          )}
        />
      )}

      <span
        className={cn(
          "relative grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors duration-300",
          selected ? "bg-navy text-cream" : "bg-cream-100 text-navy",
        )}
      >
        {createElement(quizIcon(option.icon), { className: "h-5 w-5", strokeWidth: 1.75 })}
      </span>

      <span className="relative space-y-0.5">
        <span className="block font-display text-base md:text-lg leading-tight text-navy-900">
          {option.label}
        </span>
        {option.sublabel && (
          <span className="block text-[11px] md:text-xs text-mute leading-snug line-clamp-2">
            {option.sublabel}
          </span>
        )}
      </span>

      <span
        className={cn(
          "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-navy text-cream transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    </motion.button>
  );
}
