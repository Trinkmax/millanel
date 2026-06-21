"use client";

import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/* "Así lo ve el cliente al pagar." Reproduce, en chico, la opción de
   envío tal como aparece en el checkout: nombre, costo (o "Gratis") y
   los días estimados. Es sólo lectura, para que la dueña confirme que
   lo que cargó tiene sentido antes de guardar. */

export function ZonePreview({
  name,
  baseCost,
  freeThreshold,
  estimatedDays,
  active,
  className,
}: {
  name: string;
  baseCost: number;
  freeThreshold: number | null;
  estimatedDays: string;
  active: boolean;
  className?: string;
}) {
  const displayName = name.trim() || "Tu zona de envío";
  const costLabel =
    baseCost <= 0 ? "Gratis" : formatPrice(baseCost);
  const days = estimatedDays.trim();

  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-cream-50 p-4",
        !active && "opacity-60",
        className,
      )}
    >
      <p className="mb-2.5 text-xs text-mute">Así lo ve el cliente al pagar</p>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-pearl px-4 py-3 shadow-whisper">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-100 text-navy">
          <Truck className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-navy-900">{displayName}</p>
          {days && <p className="text-xs text-mute">Llega en {days}</p>}
        </div>
        <span
          className={cn(
            "shrink-0 font-display text-lg",
            baseCost <= 0 ? "text-[#3F6B3F]" : "text-navy-900",
          )}
        >
          {costLabel}
        </span>
      </div>

      {freeThreshold != null && freeThreshold > 0 && (
        <p className="mt-2.5 text-xs text-navy-700">
          Y si la compra supera {formatPrice(freeThreshold)}, el envío le sale
          gratis.
        </p>
      )}
      {!active && (
        <p className="mt-2.5 text-xs text-[#922C2C]">
          Esta zona está pausada: por ahora el cliente no la puede elegir.
        </p>
      )}
    </div>
  );
}
