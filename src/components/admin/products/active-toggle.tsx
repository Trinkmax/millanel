"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleProductActive } from "@/lib/actions/admin";
import { friendlyError } from "@/lib/admin/errors";
import { cn } from "@/lib/utils";

/* Acción rápida por fila: mostrar u ocultar un producto en la tienda sin
   tener que abrir el formulario. Es optimista (cambia al toque) y, si el
   guardado falla, vuelve atrás y avisa con un toast. Vive dentro de la fila
   que linkea al producto, así que freno la navegación del Link al tocarlo. */

export function ActiveToggle({
  id,
  active,
  className,
}: {
  id: string;
  active: boolean;
  /** Etiqueta accesible (nombre del producto) para el lector de pantalla. */
  className?: string;
}) {
  const [value, setValue] = React.useState(active);
  const [saving, setSaving] = React.useState(false);

  // Si el listado se revalida y cambia el estado del lado del server, lo
  // reflejamos (salvo que justo estemos guardando). Lo hacemos en render
  // con el patrón "prop anterior" en vez de un efecto (evita renders en
  // cascada y es lo recomendado por React).
  const [prevActive, setPrevActive] = React.useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (!saving) setValue(active);
  }

  async function handleChange(next: boolean) {
    const prev = value;
    setValue(next); // optimista
    setSaving(true);
    try {
      const r = await toggleProductActive(id, next);
      if (!r.ok) {
        setValue(prev); // revertir
        toast.error(r.error);
        return;
      }
      toast.success(next ? "Ahora se ve en la tienda." : "Quedó oculto en la tienda.");
    } catch (e) {
      setValue(prev);
      toast.error(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <label
      // Freno la navegación de la fila: tocar el switch no abre el producto.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={cn(
        "flex select-none items-center gap-2.5",
        className,
      )}
    >
      <Switch
        checked={value}
        onCheckedChange={handleChange}
        disabled={saving}
        aria-label={value ? "Quitar de la tienda" : "Mostrar en la tienda"}
      />
      <span
        className={cn(
          "min-w-[4.5rem] text-xs font-medium",
          value ? "text-navy-700" : "text-mute",
        )}
      >
        {value ? "En la tienda" : "Oculto"}
      </span>
    </label>
  );
}
