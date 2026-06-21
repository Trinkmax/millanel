import * as React from "react";
import { cn } from "@/lib/utils";
import { TONE_CHIP } from "./tone";
import { AdminIcon } from "./admin-icon";
import {
  orderStatusMeta,
  paymentStatusMeta,
  type StatusMeta,
} from "@/lib/admin/labels";

/* Chip de estado: ícono + color + etiqueta en español, coherente en
   todo el panel. Server-safe (sin hooks). */

export function StatusChip({
  meta,
  size = "md",
  showIcon = true,
  full = false,
  className,
}: {
  meta: StatusMeta;
  size?: "sm" | "md";
  /** Mostrar el ícono a la izquierda. */
  showIcon?: boolean;
  /** Usar la etiqueta larga aunque exista una corta. */
  full?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONE_CHIP[meta.tone],
        className,
      )}
    >
      {showIcon && (
        <AdminIcon
          name={meta.icon}
          className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
        />
      )}
      {full ? meta.label : (meta.short ?? meta.label)}
    </span>
  );
}

type ChipExtra = {
  size?: "sm" | "md";
  showIcon?: boolean;
  full?: boolean;
  className?: string;
};

export function OrderStatusChip({
  status,
  ...rest
}: { status: string } & ChipExtra) {
  return <StatusChip meta={orderStatusMeta(status)} {...rest} />;
}

export function PaymentStatusChip({
  status,
  ...rest
}: { status: string } & ChipExtra) {
  return <StatusChip meta={paymentStatusMeta(status)} {...rest} />;
}
