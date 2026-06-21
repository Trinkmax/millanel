"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* Filtro por categoría. Cambia ?categoria=<slug> en la URL conservando los
   demás filtros (q, status, stock) y reseteando la paginación, así nunca se
   "pierde" lo que la dueña venía mirando. */

const ALL = "__todas__";

export function CategoryFilter({
  categories,
  value,
}: {
  categories: { slug: string; name: string }[];
  /** slug actualmente seleccionado, o undefined si es "Todas". */
  value?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) params.delete("categoria");
    else params.set("categoria", next);
    params.delete("page"); // siempre arrancamos de la primera página
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select value={value ?? ALL} onValueChange={handleChange}>
      <SelectTrigger
        aria-label="Filtrar por categoría"
        className="h-11 w-full sm:w-56"
      >
        <SelectValue placeholder="Todas las categorías" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todas las categorías</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.slug} value={c.slug}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
