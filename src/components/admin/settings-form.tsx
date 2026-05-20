"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { updateSetting } from "@/lib/actions/admin";
import { toast } from "sonner";

interface SettingsFormProps {
  store: Record<string, string>;
  contact: Record<string, string>;
  payment: Record<string, boolean>;
}

export function SettingsForm({
  store: initialStore,
  contact: initialContact,
  payment: initialPayment,
}: SettingsFormProps) {
  const [store, setStore] = useState(initialStore);
  const [contact, setContact] = useState(initialContact);
  const [payment, setPayment] = useState(initialPayment);
  const [pending, startTransition] = useTransition();

  async function save(key: "store" | "contact" | "payment", value: unknown) {
    startTransition(async () => {
      const r = await updateSetting(key, value);
      if (!r.ok) toast.error(r.error);
      else toast.success("Ajustes guardados");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 !pt-6 space-y-5">
          <h2 className="font-display text-xl text-navy-900">Tienda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nombre">
              <Input
                value={store.name ?? ""}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
              />
            </FormField>
            <FormField label="Tagline">
              <Input
                value={store.tagline ?? ""}
                onChange={(e) => setStore({ ...store, tagline: e.target.value })}
              />
            </FormField>
            <FormField label="Descripción" className="md:col-span-2">
              <Textarea
                rows={2}
                value={store.description ?? ""}
                onChange={(e) => setStore({ ...store, description: e.target.value })}
              />
            </FormField>
            <FormField label="Dirección">
              <Input
                value={store.address_street ?? ""}
                onChange={(e) =>
                  setStore({ ...store, address_street: e.target.value })
                }
              />
            </FormField>
            <FormField label="Ciudad">
              <Input
                value={store.address_city ?? ""}
                onChange={(e) =>
                  setStore({ ...store, address_city: e.target.value })
                }
              />
            </FormField>
            <FormField label="Provincia">
              <Input
                value={store.address_province ?? ""}
                onChange={(e) =>
                  setStore({ ...store, address_province: e.target.value })
                }
              />
            </FormField>
            <FormField label="Código postal">
              <Input
                value={store.address_postal_code ?? ""}
                onChange={(e) =>
                  setStore({ ...store, address_postal_code: e.target.value })
                }
              />
            </FormField>
          </div>
          <Button onClick={() => save("store", store)} disabled={pending}>
            <Save className="h-4 w-4" /> Guardar tienda
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 !pt-6 space-y-5">
          <h2 className="font-display text-xl text-navy-900">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Teléfono">
              <Input
                value={contact.phone ?? ""}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </FormField>
            <FormField label="WhatsApp (solo dígitos)">
              <Input
                value={contact.whatsapp ?? ""}
                onChange={(e) =>
                  setContact({ ...contact, whatsapp: e.target.value })
                }
                placeholder="5493854000000"
              />
            </FormField>
            <FormField label="Email">
              <Input
                type="email"
                value={contact.email ?? ""}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </FormField>
            <FormField label="Horarios">
              <Input
                value={contact.hours ?? ""}
                onChange={(e) => setContact({ ...contact, hours: e.target.value })}
              />
            </FormField>
            <FormField label="Instagram">
              <Input
                value={contact.instagram ?? ""}
                onChange={(e) =>
                  setContact({ ...contact, instagram: e.target.value })
                }
              />
            </FormField>
            <FormField label="Facebook">
              <Input
                value={contact.facebook ?? ""}
                onChange={(e) =>
                  setContact({ ...contact, facebook: e.target.value })
                }
              />
            </FormField>
          </div>
          <Button onClick={() => save("contact", contact)} disabled={pending}>
            <Save className="h-4 w-4" /> Guardar contacto
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 !pt-6 space-y-5">
          <h2 className="font-display text-xl text-navy-900">Métodos de pago</h2>
          <ul className="divide-y divide-line">
            {(
              [
                ["mercadopago_enabled", "MercadoPago"],
                ["whatsapp_enabled", "Coordinar por WhatsApp"],
                ["transfer_enabled", "Transferencia bancaria"],
                ["cash_pickup_enabled", "Efectivo al retirar"],
              ] as const
            ).map(([key, label]) => (
              <li
                key={key}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-navy-900">{label}</span>
                <Switch
                  checked={!!payment[key]}
                  onCheckedChange={(v) => setPayment({ ...payment, [key]: v })}
                />
              </li>
            ))}
          </ul>
          <Button onClick={() => save("payment", payment)} disabled={pending}>
            <Save className="h-4 w-4" /> Guardar pagos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
