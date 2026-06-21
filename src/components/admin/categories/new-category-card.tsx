"use client";

import { useState } from "react";
import { Plus, Eye, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryImage } from "./category-image";
import { type CategoryDraft, emptyDraft } from "./types";

/* Card UNIFICADA para crear una categoría completa en un solo paso: mismos
   campos que la edición (nombre, descripción, imagen, visible, destacada).
   Nada de "creá primero y editá después". El slug se arma solo. */

interface NewCategoryCardProps {
  /** sort_order que le toca a la nueva (va al final de la lista). */
  nextSortOrder: number;
  saving: boolean;
  onCreate: (draft: CategoryDraft) => void;
}

export function NewCategoryCard({
  nextSortOrder,
  saving,
  onCreate,
}: NewCategoryCardProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CategoryDraft>(emptyDraft(nextSortOrder));
  const nameMissing = draft.name.trim().length < 2;

  function patch(p: Partial<CategoryDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function reset() {
    setDraft(emptyDraft(nextSortOrder));
    setOpen(false);
  }

  function submit() {
    if (nameMissing) return;
    // El sort_order siempre apunta al final actual de la lista.
    onCreate({ ...draft, sort_order: nextSortOrder });
  }

  // Plegada: una invitación grande y clara a sumar una sección.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(emptyDraft(nextSortOrder));
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-cream-50 px-4 py-5 text-sm font-medium text-navy-700 transition-colors hover:border-navy-300 hover:text-navy-900"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-pearl text-navy">
          <Plus className="h-4 w-4" />
        </span>
        Agregar una sección nueva
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-champagne-200 bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b border-line bg-champagne-50/50 px-4 py-3 md:px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-champagne-100 text-champagne-400">
          <Plus className="h-4 w-4" />
        </span>
        <h3 className="font-display text-lg text-navy-900">
          Nueva sección de la tienda
        </h3>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-navy-800">
            Nombre de la sección
          </label>
          <Input
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Ej: Cremas y cuidado de la piel"
            autoFocus
            className="font-display text-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-navy-800">
            Descripción{" "}
            <span className="font-normal text-mute">(opcional)</span>
          </label>
          <Textarea
            rows={2}
            value={draft.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Una frase corta que cuente qué hay en esta sección."
            className="min-h-[64px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-navy-800">
            Imagen de la sección
          </label>
          <CategoryImage
            value={draft.image_path}
            onChange={(path) => patch({ image_path: path })}
            folder="nuevas"
            disabled={saving}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-cream-50 p-3">
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                draft.active ? "bg-sky-100 text-navy" : "bg-cream-100 text-mute",
              )}
            >
              <Eye className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-navy-800">
              Visible en la tienda
            </span>
            <Switch
              checked={draft.active}
              onCheckedChange={(v) => patch({ active: v })}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-cream-50 p-3">
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                draft.featured
                  ? "bg-champagne-100 text-champagne-400"
                  : "bg-cream-100 text-mute",
              )}
            >
              <Star
                className={cn("h-4 w-4", draft.featured && "fill-current")}
              />
            </span>
            <span className="flex-1 text-sm font-medium text-navy-800">
              Destacada
            </span>
            <Switch
              checked={draft.featured}
              onCheckedChange={(v) => patch({ featured: v })}
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={reset}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="md"
            onClick={submit}
            disabled={saving || nameMissing}
          >
            <Plus className="h-4 w-4" />
            {saving ? "Creando…" : "Crear sección"}
          </Button>
        </div>
      </div>
    </div>
  );
}
