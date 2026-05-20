"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  size = "md",
}: QuantityStepperProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  const btn =
    size === "sm"
      ? "h-7 w-7"
      : "h-9 w-9";
  const text = size === "sm" ? "text-sm w-7" : "text-base w-10";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-pearl",
        className,
      )}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={value <= min}
        aria-label="Restar"
        className={cn(
          "flex items-center justify-center rounded-l-full text-navy transition-colors hover:bg-cream-100 disabled:opacity-30 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "select-none text-center font-medium text-navy num-display",
          text,
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={value >= max}
        aria-label="Sumar"
        className={cn(
          "flex items-center justify-center rounded-r-full text-navy transition-colors hover:bg-cream-100 disabled:opacity-30 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
