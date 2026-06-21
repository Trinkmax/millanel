"use client";

import * as React from "react";

/* Helpers de campo en sentence-case (sin micro-labels en MAYÚSCULA), para
   que todo se lea grande y claro. Mismo lenguaje visual que el resto del
   panel (ver product-form). */

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-navy-900"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}

/* Fila de interruptor: título + explicación de una línea + Switch a la
   derecha. Pensada para los métodos de pago y similares. */
export function ToggleRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-mute">{hint}</span>}
      </span>
      <span className="shrink-0">{children}</span>
    </div>
  );
}
