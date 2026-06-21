"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/* Selector de período del Inicio: Hoy / Semana / Mes.
   Cambia ?period= conservando el resto de la URL. Es un "segmented
   control" sobrio: una sola pieza, sin parecer un montón de botones. */

const OPTIONS = [
  { value: "day", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
] as const;

export type Period = (typeof OPTIONS)[number]["value"];

export function PeriodSwitch({ value }: { value: Period }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(next: Period) {
    if (next === value) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === "month") params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div
      role="group"
      aria-label="Período a mostrar"
      className="inline-flex w-full items-center gap-1 rounded-full border border-line bg-pearl p-1 shadow-whisper sm:w-auto"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            aria-pressed={active}
            className={cn(
              "h-9 flex-1 rounded-full px-4 text-sm font-medium transition-colors sm:flex-none",
              active
                ? "bg-navy text-cream shadow-soft"
                : "text-navy-700 hover:bg-cream-100",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
