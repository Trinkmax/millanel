"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminIcon } from "@/components/admin/ui";
import { ORDER_VIEWS } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";

/* Pestañas rápidas de Pedidos: "¿qué tengo que hacer?" en un toque.
   Cada chip apunta a ?view=<key> y CONSERVA la búsqueda activa (q),
   reseteando la paginación. Targets grandes para usar con el dedo. */

export function OrderViewChips({ active }: { active: string }) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ORDER_VIEWS.map((v) => {
        const isActive = v.key === active;
        const params = new URLSearchParams();
        if (v.key !== "todos") params.set("view", v.key);
        if (q) params.set("q", q);
        const qs = params.toString();

        return (
          <Link
            key={v.key}
            href={qs ? `/admin/ordenes?${qs}` : "/admin/ordenes"}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-all duration-200",
              isActive
                ? "border-navy bg-navy text-cream shadow-soft"
                : "border-line bg-pearl text-navy-700 hover:border-navy-200 hover:bg-cream-50",
            )}
          >
            <AdminIcon name={v.icon} className="h-4 w-4" />
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
