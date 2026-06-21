"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoneyInput, useConfirm } from "@/components/admin/ui";
import { ProvincePicker } from "./province-picker";
import { DeliveryTimeInput } from "./delivery-time-input";
import { ZonePreview } from "./zone-preview";

/* Datos editables de una zona (lo que toca la dueña). El sort_order
   queda fuera: lo manejan las flechas en la lista, no este formulario. */
export interface ZoneDraft {
  name: string;
  base_cost: number;
  free_shipping_threshold: number | null;
  estimated_days: string;
  provinces: string[];
  active: boolean;
}

export function emptyZoneDraft(): ZoneDraft {
  return {
    name: "",
    base_cost: 0,
    free_shipping_threshold: null,
    estimated_days: "",
    provinces: [],
    active: true,
  };
}

interface Props {
  open: boolean;
  /** Borrador inicial; null mientras está cerrado. */
  initial: ZoneDraft | null;
  /** true si estamos editando una zona ya guardada (cambia textos). */
  isEdit: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (draft: ZoneDraft) => void;
}

/* Validación amable en cliente: nombramos el campo exacto, sin Zod crudo.
   Refleja el schema (name min 2, base_cost >= 0). */
function validate(draft: ZoneDraft): string | null {
  if (draft.name.trim().length < 2) {
    return "Poné un nombre para la zona (al menos 2 letras). Ej: CABA.";
  }
  if (draft.base_cost < 0) {
    return "El costo de envío no puede ser negativo.";
  }
  if (
    draft.free_shipping_threshold != null &&
    draft.free_shipping_threshold < 0
  ) {
    return "El monto para envío gratis no puede ser negativo.";
  }
  return null;
}

export function ZoneFormDialog({
  open,
  initial,
  isEdit,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const confirm = useConfirm();
  const [draft, setDraft] = useState<ZoneDraft>(emptyZoneDraft());

  // Cada vez que se ABRE, cargamos el borrador inicial. Lo detectamos en
  // render con el patrón "transición de apertura" (no un efecto) para
  // evitar renders en cascada.
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    if (initial) setDraft(initial);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  function update<K extends keyof ZoneDraft>(key: K, val: ZoneDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  // ¿Cambió algo respecto de lo que entró? Sirve para avisar al cerrar.
  const dirty = useMemo(
    () => (initial ? JSON.stringify(draft) !== JSON.stringify(initial) : false),
    [draft, initial],
  );

  function submit() {
    // El botón ya queda deshabilitado si hay un problema, pero validamos
    // igual por las dudas y mostramos el aviso en pantalla (no cerramos).
    if (validate(draft)) return;
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      estimated_days: draft.estimated_days.trim(),
    });
  }

  // Cierre seguro: si hay ediciones sin guardar, preguntamos antes.
  async function handleClose() {
    if (saving) return;
    if (dirty) {
      const ok = await confirm({
        title: "¿Descartar los cambios?",
        description:
          "Cargaste datos en esta zona que todavía no guardaste. Si cerrás ahora, se pierden.",
        confirmLabel: "Sí, descartar",
        cancelLabel: "Seguir editando",
        tone: "danger",
        icon: "RotateCcw",
      });
      if (!ok) return;
    }
    onClose();
  }

  const problem = validate(draft);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) void handleClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar zona de envío" : "Nueva zona de envío"}
          </DialogTitle>
          <DialogDescription>
            Definí a dónde llega y cuánto sale. Lo único obligatorio es el
            nombre y el costo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Nombre */}
          <Field
            label="Nombre de la zona"
            required
            hint="Lo ve el cliente al elegir el envío. Ej: CABA, Interior del país."
          >
            <Input
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ej: CABA"
            />
          </Field>

          {/* Costo de envío */}
          <Field
            label="Costo de envío"
            hint="Lo que paga el cliente por el envío. Dejalo en $0 si esta zona es gratis."
          >
            <MoneyInput
              value={draft.base_cost}
              onChange={(v) => update("base_cost", v ?? 0)}
              allowEmpty={false}
              placeholder="0"
            />
          </Field>

          {/* Envío gratis desde */}
          <Field
            label="Envío gratis a partir de cierto monto"
            hint="Si la compra supera este monto, el envío le sale gratis al cliente. Dejalo vacío si no querés ofrecerlo. Ej: $30.000."
          >
            <MoneyInput
              value={draft.free_shipping_threshold}
              onChange={(v) => update("free_shipping_threshold", v)}
              allowEmpty
              placeholder="Sin envío gratis"
            />
          </Field>

          {/* Tiempo de entrega */}
          <Field
            label="Tiempo de entrega"
            hint="Cuánto tarda en llegar. Elegí una opción o escribilo a mano."
          >
            <DeliveryTimeInput
              value={draft.estimated_days}
              onChange={(v) => update("estimated_days", v)}
            />
          </Field>

          {/* Provincias (opcional) */}
          <Field
            label="¿A qué provincias llega esta zona? — opcional"
            hint="Sólo para tenerlo anotado y organizarte. No es obligatorio y no cambia el costo."
          >
            <ProvincePicker
              value={draft.provinces}
              onChange={(codes) => update("provinces", codes)}
            />
          </Field>

          {/* Activa */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-pearl px-4 py-3">
            <span className="min-w-0">
              <span className="block text-sm font-medium text-navy-900">
                Zona activa
              </span>
              <span className="block text-xs text-mute">
                Si la pausás, el cliente no la puede elegir al pagar.
              </span>
            </span>
            <Switch
              checked={draft.active}
              onCheckedChange={(v) => update("active", v)}
            />
          </label>

          {/* Vista previa en vivo */}
          <ZonePreview
            name={draft.name}
            baseCost={draft.base_cost}
            freeThreshold={draft.free_shipping_threshold}
            estimatedDays={draft.estimated_days}
            active={draft.active}
          />

          {/* Aviso de validación si falta algo, sin bloquear el render */}
          {problem && (
            <p className="text-sm text-[#922C2C]">{problem}</p>
          )}
        </div>

        {/* Acciones del formulario */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => void handleClose()}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={saving || !!problem}
          >
            {saving
              ? "Guardando…"
              : isEdit
                ? "Guardar cambios"
                : "Crear zona"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Campo en sentence-case (sin micro-labels en MAYÚSCULA), igual que el
   resto del panel rediseñado. */
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-blush-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}
