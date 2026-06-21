"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryImage } from "./category-image";
import { type CategoryDraft, previewSlug } from "./types";

/* Tarjeta de UNA categoría existente. Edición en línea de nombre, descripción,
   imagen y toggles, con barra propia de "cambios sin guardar". El orden se
   maneja desde afuera con las flechas ↑/↓ (escriben sort_order detrás de
   escena). El slug vive escondido en "Opciones avanzadas", de sólo lectura. */

interface CategoryCardProps {
  draft: CategoryDraft;
  index: number;
  total: number;
  dirty: boolean;
  saving: boolean;
  /** ¿Esta card está dentro de una operación de reordenado en curso? */
  reordering: boolean;
  onChange: (patch: Partial<CategoryDraft>) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function CategoryCard({
  draft,
  index,
  total,
  dirty,
  saving,
  reordering,
  onChange,
  onSave,
  onDiscard,
  onDelete,
  onMoveUp,
  onMoveDown,
}: CategoryCardProps) {
  const [advanced, setAdvanced] = useState(false);
  const nameMissing = draft.name.trim().length < 2;

  return (
    <motion.div
      layout
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-whisper transition-colors",
        draft.active ? "border-line" : "border-line bg-cream-50",
      )}
    >
      <div className="flex gap-2 p-4 md:p-5">
        {/* Flechas de orden — la dueña nunca escribe un número */}
        <div className="flex shrink-0 flex-col items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0 || reordering || saving}
            aria-label="Subir esta categoría"
            className="grid h-9 w-9 place-items-center rounded-lg text-navy-700 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-25"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <span className="font-display text-sm text-mute tabular-nums">
            {index + 1}
          </span>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1 || reordering || saving}
            aria-label="Bajar esta categoría"
            className="grid h-9 w-9 place-items-center rounded-lg text-navy-700 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-25"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        {/* Contenido editable */}
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-800">
              Nombre de la sección
            </label>
            <Input
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Ej: Perfumes de mujer"
              className={cn(
                "font-display text-lg",
                nameMissing && "border-blush-300 focus-visible:ring-blush-100",
              )}
            />
            {nameMissing && (
              <p className="text-xs text-blush-400">
                Poné un nombre de al menos 2 letras.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-800">
              Descripción{" "}
              <span className="font-normal text-mute">(opcional)</span>
            </label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
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
              onChange={(path) => onChange({ image_path: path })}
              folder={draft.slug || "categorias"}
              disabled={saving}
            />
          </div>

          {/* Toggles claros, con ícono y aviso corto */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Visible en la tienda */}
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                draft.active
                  ? "border-sky-300/50 bg-sky-100/40"
                  : "border-line bg-cream-50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  draft.active
                    ? "bg-sky-100 text-navy"
                    : "bg-cream-100 text-mute",
                )}
              >
                {draft.active ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-navy-800">
                    Visible en la tienda
                  </span>
                  <Switch
                    checked={draft.active}
                    onCheckedChange={(v) => onChange({ active: v })}
                  />
                </span>
                <span className="mt-0.5 block text-xs text-mute">
                  {draft.active
                    ? "Aparece en el menú y en el catálogo."
                    : "Está oculta: nadie la ve en el sitio."}
                </span>
              </span>
            </label>

            {/* Destacada — diferenciada por color/ícono */}
            <label
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                draft.featured
                  ? "border-champagne-200 bg-champagne-50"
                  : "border-line bg-cream-50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  draft.featured
                    ? "bg-champagne-100 text-champagne-400"
                    : "bg-cream-100 text-mute",
                )}
              >
                <Star
                  className={cn("h-4 w-4", draft.featured && "fill-current")}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-navy-800">
                    Destacada
                  </span>
                  <Switch
                    checked={draft.featured}
                    onCheckedChange={(v) => onChange({ featured: v })}
                  />
                </span>
                <span className="mt-0.5 block text-xs text-mute">
                  {draft.featured
                    ? "Tiene un lugar especial en la página de inicio."
                    : "Resaltala en la página de inicio."}
                </span>
              </span>
            </label>
          </div>

          {/* Opciones avanzadas: slug de sólo lectura + eliminar */}
          <div className="rounded-xl border border-line bg-cream-50/60">
            <button
              type="button"
              onClick={() => setAdvanced((v) => !v)}
              className="flex h-11 w-full items-center justify-between px-3.5 text-sm font-medium text-navy-700"
            >
              <span>Opciones avanzadas</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-mute transition-transform",
                  advanced && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {advanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 px-3.5 pb-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-navy-700">
                        Dirección web de la sección
                      </span>
                      <div className="flex h-10 items-center rounded-lg border border-line bg-pearl px-3 text-sm text-mute">
                        /{previewSlug(draft.name) || "se-genera-sola"}
                      </div>
                      <p className="text-xs text-mute">
                        Se arma sola con el nombre. No hace falta tocarla.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={saving}
                      className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar esta categoría
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Barra por fila: aparece sólo si hay cambios sin guardar */}
      <AnimatePresence initial={false}>
        {dirty && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-pearl"
          >
            <div className="flex items-center gap-3 px-4 py-3 md:px-5">
              <span className="flex-1 text-sm font-medium text-navy-800">
                Tenés cambios sin guardar
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={saving}
              >
                Descartar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSave}
                disabled={saving || nameMissing}
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
