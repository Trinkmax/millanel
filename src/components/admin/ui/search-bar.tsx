"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Buscador con botón "Buscar" visible (no hay que adivinar que se aprieta
   Enter) y una X para limpiar. Conserva los demás filtros de la URL y
   resetea la paginación, así nunca "se pierde" lo que la dueña venía mirando. */

export function SearchBar({
  paramName = "q",
  placeholder = "Buscar…",
  resetParams = ["page"],
  className,
}: {
  paramName?: string;
  placeholder?: string;
  resetParams?: string[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Reflejamos el valor de la URL en el input. Lo hacemos en render con el
  // patrón "valor anterior" (no un efecto) para evitar renders en cascada.
  const current = searchParams.get(paramName) ?? "";
  const [value, setValue] = React.useState(current);
  const [prev, setPrev] = React.useState(current);
  if (current !== prev) {
    setPrev(current);
    setValue(current);
  }

  function navigate(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set(paramName, next.trim());
    else params.delete(paramName);
    for (const r of resetParams) params.delete(r);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate(value);
      }}
      className={cn("flex items-center gap-2", className)}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex h-11 w-full rounded-[8px] border border-line bg-pearl py-2 pl-10 pr-9 text-base text-foreground transition-colors duration-200 placeholder:text-mute-soft focus-visible:border-navy-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-100 md:text-[15px]"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              navigate("");
            }}
            aria-label="Borrar búsqueda"
            className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-cream-100 hover:text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" size="md" className="shrink-0">
        Buscar
      </Button>
    </form>
  );
}
