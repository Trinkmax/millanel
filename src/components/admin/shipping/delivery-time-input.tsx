"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* Tiempo de entrega guiado: chips de uso frecuente + opción libre.
   Guardamos el texto tal cual (estimated_days es un string que ve el
   cliente), así que los presets sólo escriben en el mismo input. */

const PRESETS = ["24-48 hs", "3-5 días", "5-7 días", "7-10 días"] as const;

export function DeliveryTimeInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const selected = value.trim() === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(selected ? "" : preset)}
              aria-pressed={selected}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors",
                selected
                  ? "border-navy bg-navy text-cream"
                  : "border-line bg-pearl text-navy-700 hover:border-navy-400 hover:bg-cream-100",
              )}
            >
              {preset}
            </button>
          );
        })}
      </div>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="O escribilo a mano. Ej: 2 semanas"
      />
    </div>
  );
}
