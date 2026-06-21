"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, useConfirm } from "@/components/admin/ui";
import {
  upsertShippingZone,
  deleteShippingZone,
  type ShippingZoneInput,
} from "@/lib/actions/admin";
import type { ShippingZone } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ZoneFormDialog,
  emptyZoneDraft,
  type ZoneDraft,
} from "./shipping/zone-form-dialog";
import { provinceName } from "./shipping/province-picker";

interface Props {
  initial: ShippingZone[];
}

/* Pasa una zona de la base (números como string en algunos casos) al
   borrador editable del formulario. */
function toDraft(z: ShippingZone): ZoneDraft {
  return {
    name: z.name,
    base_cost: Number(z.base_cost),
    free_shipping_threshold:
      z.free_shipping_threshold != null ? Number(z.free_shipping_threshold) : null,
    estimated_days: z.estimated_days ?? "",
    provinces: z.provinces ?? [],
    active: z.active,
  };
}

/* Arma el payload exacto que espera el server action. El slug lo deriva
   el servidor del nombre si va vacío; acá no lo tocamos. */
function toPayload(draft: ZoneDraft, sortOrder: number): ShippingZoneInput {
  return {
    name: draft.name,
    provinces: draft.provinces,
    base_cost: draft.base_cost,
    free_shipping_threshold: draft.free_shipping_threshold,
    estimated_days: draft.estimated_days || null,
    sort_order: sortOrder,
    active: draft.active,
  };
}

/* Estado del formulario abierto: o "nueva" (sin id) o "editar" (con id). */
type Editing =
  | { mode: "new"; draft: ZoneDraft }
  | { mode: "edit"; id: string; draft: ZoneDraft }
  | null;

export function ShippingZoneManager({ initial }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [zones, setZones] = useState<ShippingZone[]>(initial);
  const [editing, setEditing] = useState<Editing>(null);
  const [pending, startTransition] = useTransition();
  // Guardamos de a una zona; recordamos cuál para mostrar su spinner.
  const [busyId, setBusyId] = useState<string | null>(null);

  const hasActive = zones.some((z) => z.active);

  function openNew() {
    setEditing({ mode: "new", draft: emptyZoneDraft() });
  }

  function openEdit(z: ShippingZone) {
    setEditing({ mode: "edit", id: z.id, draft: toDraft(z) });
  }

  // ── Crear / editar (mismo formulario) ──────────────────────────────────
  function handleSubmit(draft: ZoneDraft) {
    if (!editing) return;
    const isEdit = editing.mode === "edit";
    // En "nueva" la mandamos al final del orden; en "editar" conservamos
    // el sort_order que ya tenía la zona.
    const existing = isEdit
      ? zones.find((z) => z.id === editing.id)
      : undefined;
    const sortOrder = isEdit
      ? (existing?.sort_order ?? 0)
      : (zones.at(-1)?.sort_order ?? 0) + 10;

    startTransition(async () => {
      const r = await upsertShippingZone(
        toPayload(draft, sortOrder),
        isEdit ? editing.id : undefined,
      );
      if (!r.ok) {
        toast.error("No se pudo guardar", { description: r.error });
        return;
      }
      toast.success(isEdit ? "Zona actualizada" : "Zona creada");
      setEditing(null);
      router.refresh();
    });
  }

  // ── Eliminar ───────────────────────────────────────────────────────────
  async function handleDelete(z: ShippingZone) {
    const ok = await confirm({
      title: `¿Eliminar la zona "${z.name}"?`,
      description: (
        <span>
          Se borra para siempre y deja de aparecer como opción de envío al
          pagar. <strong>No se puede deshacer.</strong>
        </span>
      ),
      confirmLabel: "Eliminar zona",
      cancelLabel: "Mejor no",
      tone: "danger",
    });
    if (!ok) return;
    setBusyId(z.id);
    startTransition(async () => {
      const r = await deleteShippingZone(z.id);
      setBusyId(null);
      if (!r.ok) {
        toast.error("No se pudo eliminar", { description: r.error });
        return;
      }
      setZones((arr) => arr.filter((x) => x.id !== z.id));
      toast.success("Zona eliminada");
      router.refresh();
    });
  }

  // ── Reordenar con flechas ──────────────────────────────────────────────
  // Intercambiamos el sort_order de dos zonas vecinas y persistimos ambas.
  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= zones.length) return;
    if (pending) return;

    const a = zones[index];
    const b = zones[target];

    // Orden optimista en pantalla (se confirma con el refresh).
    const next = [...zones];
    next[index] = b;
    next[target] = a;
    setZones(next);

    setBusyId(a.id);
    startTransition(async () => {
      // Persistimos ambas zonas con su nuevo orden, sin perder el resto
      // de sus datos. Si una falla, avisamos y volvemos atrás.
      const [ra, rb] = await Promise.all([
        upsertShippingZone(toPayload(toDraft(a), b.sort_order), a.id),
        upsertShippingZone(toPayload(toDraft(b), a.sort_order), b.id),
      ]);
      setBusyId(null);
      if (!ra.ok || !rb.ok) {
        setZones(zones); // revertimos
        toast.error("No se pudo cambiar el orden", {
          description: (!ra.ok && ra.error) || (!rb.ok && rb.error) || undefined,
        });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Aviso cuando no hay ninguna zona activa: bloquea el checkout. */}
      {zones.length > 0 && !hasActive && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#FBEED1] bg-[#FBEED1]/40 px-4 py-3.5 text-sm text-[#876310]">
          <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0" aria-hidden />
          <span>
            Tenés zonas cargadas, pero ninguna está activa. Hasta que actives
            al menos una, tus clientes no pueden elegir envío al pagar.
          </span>
        </div>
      )}

      {zones.length === 0 ? (
        <Card className="overflow-hidden">
          <EmptyState
            icon="Truck"
            title="Todavía no definiste tus envíos"
            description="Sin al menos una zona activa, tus clientes no pueden elegir envío al pagar. Empezá creando la primera (por ejemplo, tu ciudad)."
            action={
              <Button type="button" onClick={openNew}>
                <Plus className="h-4 w-4" />
                Agregá tu primera zona
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-mute">
              Se le muestran al cliente en este orden. Usá las flechas para
              acomodarlas.
            </p>
            <Button type="button" onClick={openNew} className="shrink-0">
              <Plus className="h-4 w-4" />
              Nueva zona
            </Button>
          </div>

          <ul className="space-y-3">
            {zones.map((z, idx) => (
              <ZoneRow
                key={z.id}
                zone={z}
                isFirst={idx === 0}
                isLast={idx === zones.length - 1}
                busy={busyId === z.id && pending}
                disabled={pending}
                onUp={() => move(idx, -1)}
                onDown={() => move(idx, 1)}
                onEdit={() => openEdit(z)}
                onDelete={() => handleDelete(z)}
              />
            ))}
          </ul>
        </>
      )}

      <ZoneFormDialog
        open={!!editing}
        initial={editing?.draft ?? null}
        isEdit={editing?.mode === "edit"}
        saving={pending && busyId === null}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

/* Tarjeta de una zona en la lista: lo que importa de un vistazo + acciones
   con targets cómodos (≥44px) para el celular. */
function ZoneRow({
  zone,
  isFirst,
  isLast,
  busy,
  disabled,
  onUp,
  onDown,
  onEdit,
  onDelete,
}: {
  zone: ShippingZone;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  disabled: boolean;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cost = Number(zone.base_cost);
  const free =
    zone.free_shipping_threshold != null
      ? Number(zone.free_shipping_threshold)
      : null;
  const provinces = zone.provinces ?? [];

  return (
    <li>
      <Card className={cn("overflow-hidden", busy && "opacity-70")}>
        <div className="flex items-stretch">
          {/* Flechas de orden a la izquierda, bien tocables */}
          <div className="flex flex-col justify-center gap-1 border-r border-line px-1.5 py-3">
            <button
              type="button"
              onClick={onUp}
              disabled={isFirst || disabled}
              aria-label={`Subir ${zone.name}`}
              className="grid h-9 w-9 place-items-center rounded-lg text-navy-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDown}
              disabled={isLast || disabled}
              aria-label={`Bajar ${zone.name}`}
              className="grid h-9 w-9 place-items-center rounded-lg text-navy-700 transition-colors hover:bg-cream-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          {/* Cuerpo: nombre + resumen "como lo ve el cliente" */}
          <div className="min-w-0 flex-1 p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h3 className="font-display text-xl text-navy-900">
                {zone.name}
              </h3>
              {zone.active ? (
                <Badge variant="success">Activa</Badge>
              ) : (
                <Badge variant="warn">Pausada</Badge>
              )}
            </div>

            {/* Línea estilo checkout: "CABA — $3.500 · 3-5 días" */}
            <p className="mt-1 text-sm text-navy-700">
              <span className="font-medium">
                {cost <= 0 ? "Envío gratis" : formatPrice(cost)}
              </span>
              {zone.estimated_days && (
                <span className="text-mute"> · {zone.estimated_days}</span>
              )}
            </p>

            {free != null && free > 0 && (
              <p className="mt-0.5 text-xs text-mute">
                Gratis desde {formatPrice(free)} de compra
              </p>
            )}

            {provinces.length > 0 && (
              <p className="mt-2 text-xs text-mute">
                Llega a:{" "}
                {provinces.slice(0, 4).map(provinceName).join(", ")}
                {provinces.length > 4 &&
                  ` y ${provinces.length - 4} más`}
              </p>
            )}
          </div>

          {/* Acciones a la derecha */}
          <div className="flex flex-col items-center justify-center gap-1.5 border-l border-line px-2 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onEdit}
              disabled={disabled}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              disabled={disabled}
              aria-label={`Eliminar ${zone.name}`}
              className="!text-destructive hover:!bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
}
