"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* Campo de dinero en pesos: muestra "$" y separa los miles, acepta sólo
   números enteros (los precios argentinos no usan centavos) y devuelve un
   number. Mientras se escribe muestra los dígitos crudos; al salir, los
   formatea, para que la dueña vea claro "$14.499" y no se confunda de cero. */

const AR = new Intl.NumberFormat("es-AR");

export function MoneyInput({
  value,
  onChange,
  placeholder,
  className,
  id,
  allowEmpty = true,
  disabled,
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** Si es false, vacío se interpreta como 0. */
  allowEmpty?: boolean;
  disabled?: boolean;
}) {
  // Mientras se escribe usamos `raw` (dígitos crudos); al perder el foco
  // mostramos el valor formateado directo desde `value`. Inicializamos
  // `raw` al enfocar, así no hace falta un efecto que sincronice estado.
  const [focused, setFocused] = React.useState(false);
  const [raw, setRaw] = React.useState("");

  const display = focused
    ? raw
    : value == null || Number.isNaN(value)
      ? ""
      : AR.format(Math.round(value));

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-mute">
        $
      </span>
      <input
        id={id}
        inputMode="numeric"
        disabled={disabled}
        value={display}
        placeholder={placeholder}
        onFocus={() => {
          setRaw(value == null ? "" : String(Math.round(value)));
          setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 12);
          setRaw(digits);
          if (digits === "") onChange(allowEmpty ? null : 0);
          else onChange(parseInt(digits, 10));
        }}
        className="flex h-11 w-full rounded-[8px] border border-line bg-pearl py-2 pl-7 pr-3.5 text-base text-foreground transition-colors duration-200 placeholder:text-mute-soft focus-visible:border-navy-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-100 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]"
      />
    </div>
  );
}
