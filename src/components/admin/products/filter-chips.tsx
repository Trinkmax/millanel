"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/* Filtros de estado en chips con lenguaje llano. Cada chip arma un link que
   CONSERVA los demás filtros de la URL (q, categoria) y resetea la página.
   Sólo toca las dimensiones status/stock — que son mutuamente excluyentes
   acá: "En la tienda", "Ocultos" y "Poco stock" no se combinan entre sí. */

type ChipKey = "todos" | "active" | "inactive" | "low";

const CHIPS: { key: ChipKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "active", label: "En la tienda" },
  { key: "inactive", label: "Ocultos" },
  { key: "low", label: "Poco stock" },
];

export function FilterChips() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const stock = searchParams.get("stock");

  // ¿Cuál chip está activo hoy?
  const current: ChipKey =
    stock === "low"
      ? "low"
      : status === "active"
        ? "active"
        : status === "inactive"
          ? "inactive"
          : "todos";

  function hrefFor(key: ChipKey): string {
    const params = new URLSearchParams(searchParams.toString());
    // Limpio las dimensiones que controlo y la página.
    params.delete("status");
    params.delete("stock");
    params.delete("page");
    if (key === "active" || key === "inactive") params.set("status", key);
    if (key === "low") params.set("stock", "low");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div
      role="tablist"
      aria-label="Filtrar productos"
      className="-mx-1 flex flex-wrap gap-2 px-1"
    >
      {CHIPS.map((chip) => {
        const active = current === chip.key;
        return (
          <Link
            key={chip.key}
            href={hrefFor(chip.key)}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm font-medium transition-colors",
              active
                ? "bg-navy text-cream shadow-soft"
                : "border border-line bg-pearl text-navy-700 hover:bg-cream-100",
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
