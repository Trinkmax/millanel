"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import {
  upsertShippingZone,
  deleteShippingZone,
} from "@/lib/actions/admin";
import type { ShippingZone } from "@/lib/supabase/types";
import { toast } from "sonner";

interface Props {
  initial: ShippingZone[];
}

interface Draft {
  id?: string;
  name: string;
  provincesText: string;
  base_cost: number;
  free_shipping_threshold: number | null;
  estimated_days: string;
  sort_order: number;
  active: boolean;
}

function toDraft(z: ShippingZone): Draft {
  return {
    id: z.id,
    name: z.name,
    provincesText: z.provinces.join(", "),
    base_cost: Number(z.base_cost),
    free_shipping_threshold: z.free_shipping_threshold
      ? Number(z.free_shipping_threshold)
      : null,
    estimated_days: z.estimated_days ?? "",
    sort_order: z.sort_order,
    active: z.active,
  };
}

const empty = (order = 999): Draft => ({
  name: "",
  provincesText: "",
  base_cost: 0,
  free_shipping_threshold: null,
  estimated_days: "",
  sort_order: order,
  active: true,
});

export function ShippingZoneManager({ initial }: Props) {
  const router = useRouter();
  const [zones, setZones] = useState<Draft[]>(initial.map(toDraft));
  const [newZone, setNewZone] = useState<Draft>(empty());
  const [, startTransition] = useTransition();

  function update(idx: number, patch: Partial<Draft>) {
    setZones((arr) => arr.map((z, i) => (i === idx ? { ...z, ...patch } : z)));
  }

  function buildPayload(d: Draft) {
    return {
      name: d.name,
      provinces: d.provincesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      base_cost: d.base_cost,
      free_shipping_threshold: d.free_shipping_threshold,
      estimated_days: d.estimated_days || null,
      sort_order: d.sort_order,
      active: d.active,
    };
  }

  function save(idx: number) {
    const d = zones[idx];
    startTransition(async () => {
      const r = await upsertShippingZone(buildPayload(d), d.id);
      if (!r.ok) toast.error(r.error);
      else {
        toast.success(`"${d.name}" guardada`);
        router.refresh();
      }
    });
  }

  function remove(idx: number) {
    const d = zones[idx];
    if (!d.id) {
      setZones((arr) => arr.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`¿Eliminar "${d.name}"?`)) return;
    startTransition(async () => {
      const r = await deleteShippingZone(d.id!);
      if (!r.ok) toast.error(r.error);
      else {
        setZones((arr) => arr.filter((_, i) => i !== idx));
        toast.success("Zona eliminada");
      }
    });
  }

  function addNew() {
    if (!newZone.name.trim()) return;
    startTransition(async () => {
      const r = await upsertShippingZone(buildPayload(newZone));
      if (!r.ok) toast.error(r.error);
      else {
        toast.success("Zona creada");
        setNewZone(empty(zones.length * 10 + 100));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {zones.map((z, idx) => (
        <Card key={z.id ?? `new-${idx}`}>
          <CardContent className="p-5 !pt-5">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-start">
              <div className="col-span-2 md:col-span-3">
                <FormField label="Zona">
                  <Input
                    value={z.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="col-span-2 md:col-span-3">
                <FormField label="Provincias (AR-X, AR-B...)">
                  <Input
                    value={z.provincesText}
                    onChange={(e) =>
                      update(idx, { provincesText: e.target.value })
                    }
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label="Costo">
                  <Input
                    type="number"
                    step="0.01"
                    value={z.base_cost}
                    onChange={(e) =>
                      update(idx, { base_cost: parseFloat(e.target.value) || 0 })
                    }
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label="Envío gratis desde">
                  <Input
                    type="number"
                    step="0.01"
                    value={z.free_shipping_threshold ?? ""}
                    onChange={(e) =>
                      update(idx, {
                        free_shipping_threshold: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                  />
                </FormField>
              </div>
              <div className="col-span-2 md:col-span-2">
                <FormField label="Tiempo">
                  <Input
                    value={z.estimated_days}
                    onChange={(e) => update(idx, { estimated_days: e.target.value })}
                    placeholder="3-5 días"
                  />
                </FormField>
              </div>
              <div className="col-span-2 md:col-span-12 flex items-center justify-end gap-3 pt-1">
                <div className="flex items-center gap-2 text-xs text-mute">
                  Activa
                  <Switch
                    checked={z.active}
                    onCheckedChange={(v) => update(idx, { active: v })}
                  />
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => remove(idx)}
                  className="!text-destructive hover:!bg-destructive/10"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="sm" onClick={() => save(idx)}>
                  <Save className="h-3.5 w-3.5" />
                  Guardar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed">
        <CardContent className="p-5 !pt-5 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-end">
            <div className="col-span-2 md:col-span-4">
              <FormField label="Nueva zona">
                <Input
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  placeholder="Ej: CABA"
                />
              </FormField>
            </div>
            <div className="col-span-2 md:col-span-3">
              <FormField label="Costo">
                <Input
                  type="number"
                  value={newZone.base_cost}
                  onChange={(e) =>
                    setNewZone({
                      ...newZone,
                      base_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </FormField>
            </div>
            <div className="col-span-2 md:col-span-3">
              <FormField label="Tiempo">
                <Input
                  value={newZone.estimated_days}
                  onChange={(e) =>
                    setNewZone({ ...newZone, estimated_days: e.target.value })
                  }
                />
              </FormField>
            </div>
            <div className="col-span-2 md:col-span-2 flex justify-end">
              <Button type="button" onClick={addNew}>
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
