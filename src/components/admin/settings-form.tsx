"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminPage,
  PageHeader,
  SectionCard,
  SaveBar,
  useConfirm,
  AdminIcon,
} from "@/components/admin/ui";
import { Field, ToggleRow } from "@/components/admin/settings/fields";
import { StorePreview } from "@/components/admin/settings/store-preview";
import { updateSetting } from "@/lib/actions/admin";
import { PROVINCES_AR } from "@/lib/constants";
import { toast } from "sonner";

/* ──────────────────────────────────────────────────────────────
   AJUSTES · Lo que la dueña edita acá CAMBIA el sitio público
   (el sitio lee de la tabla settings vía getSiteInfo()).

   Modelo de guardado: un solo botón "Guardar cambios" en la SaveBar
   pegajosa. Guarda las tres claves jsonb (store / contact / payment)
   con los nombres EXACTOS de campos que espera el sitio y el checkout.
   contact.whatsapp se guarda SÓLO con dígitos (lo usa el checkout).
   ────────────────────────────────────────────────────────────── */

interface SettingsFormProps {
  store: Record<string, string>;
  contact: Record<string, string>;
  payment: Record<string, boolean>;
}

/* Claves de pago, en el orden y con la explicación que ve la dueña. */
const PAYMENT_FIELDS = [
  {
    key: "mercadopago_enabled",
    label: "Mercado Pago",
    hint: "Cobrás con tarjeta o dinero en cuenta desde el sitio.",
  },
  {
    key: "whatsapp_enabled",
    label: "Coordinar por WhatsApp",
    hint: "El cliente te escribe para arreglar el pago con vos.",
  },
  {
    key: "transfer_enabled",
    label: "Transferencia bancaria",
    hint: "Le mostramos tus datos para que transfiera.",
  },
  {
    key: "cash_pickup_enabled",
    label: "Efectivo al retirar",
    hint: "Paga en mano cuando pasa a buscar el pedido.",
  },
] as const;

export function SettingsForm({
  store: initialStore,
  contact: initialContact,
  payment: initialPayment,
}: SettingsFormProps) {
  const confirm = useConfirm();
  const router = useRouter();

  // Valores de origen (la "última versión guardada") para detectar cambios.
  const initial = useMemo(
    () => ({
      store: initialStore,
      contact: initialContact,
      payment: initialPayment,
    }),
    [initialStore, initialContact, initialPayment],
  );

  const [store, setStore] = useState<Record<string, string>>(initialStore);
  const [contact, setContact] = useState<Record<string, string>>(initialContact);
  const [payment, setPayment] = useState<Record<string, boolean>>(
    initialPayment,
  );
  const [pending, startTransition] = useTransition();

  // Helpers de edición ──────────────────────────────────────────────────────
  const setStoreField = (key: string, value: string) =>
    setStore((s) => ({ ...s, [key]: value }));
  const setContactField = (key: string, value: string) =>
    setContact((c) => ({ ...c, [key]: value }));
  const setPaymentField = (key: string, value: boolean) =>
    setPayment((p) => ({ ...p, [key]: value }));

  // WhatsApp: sólo dígitos al vuelo (lo usa el checkout) ────────────────────
  const whatsappDigits = (contact.whatsapp ?? "").replace(/\D/g, "");
  const whatsappPreview = whatsappDigits
    ? "+" + whatsappDigits.replace(/^(\d{2})(\d)(.*)$/, "$1 $2 $3").trim()
    : "+54 9 …";

  // ¿Qué cambió? Comparamos contra la versión inicial. ─────────────────────
  const storeDirty = JSON.stringify(store) !== JSON.stringify(initial.store);
  const contactDirty =
    JSON.stringify(contact) !== JSON.stringify(initial.contact);
  const paymentDirty =
    JSON.stringify(payment) !== JSON.stringify(initial.payment);
  const dirty = storeDirty || contactDirty || paymentDirty;

  // Guardar: sólo las claves que cambiaron, con feedback honesto. ──────────
  function onSave() {
    startTransition(async () => {
      const errors: string[] = [];

      if (storeDirty) {
        const r = await updateSetting("store", store);
        if (!r.ok) errors.push(r.error);
      }
      if (contactDirty) {
        // Guardamos el WhatsApp ya saneado (sólo dígitos).
        const r = await updateSetting("contact", {
          ...contact,
          whatsapp: whatsappDigits,
        });
        if (!r.ok) errors.push(r.error);
      }
      if (paymentDirty) {
        const r = await updateSetting("payment", payment);
        if (!r.ok) errors.push(r.error);
      }

      if (errors.length > 0) {
        toast.error("No se pudieron guardar todos los cambios", {
          description: errors[0],
        });
        return;
      }

      // Reflejamos el saneo del WhatsApp en pantalla.
      if (contactDirty && whatsappDigits !== contact.whatsapp) {
        setContactField("whatsapp", whatsappDigits);
      }
      // Releemos del servidor para que la "última versión guardada" (initial)
      // se actualice y la barra de cambios se apague sola.
      router.refresh();
      toast.success("Listo, ya se ve en tu sitio", {
        description: "Tus clientes ven los datos actualizados.",
      });
    });
  }

  // Descartar: avisamos antes de perder lo editado. ────────────────────────
  async function onDiscard() {
    const ok = await confirm({
      title: "¿Descartar los cambios?",
      description:
        "Vas a volver a la última versión guardada. Perdés lo que editaste recién.",
      confirmLabel: "Sí, descartar",
      cancelLabel: "Seguir editando",
      tone: "danger",
      icon: "RotateCcw",
    });
    if (!ok) return;
    setStore(initial.store);
    setContact(initial.contact);
    setPayment(initial.payment);
    toast.success("Volvimos a la última versión guardada");
  }

  // Aviso del navegador al salir con cambios sin guardar. ──────────────────
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <>
      <AdminPage className="pb-28">
        <PageHeader
          eyebrow="Configuración"
          title="Ajustes de tu tienda"
          subtitle="Lo que edites acá se ve en tu sitio: datos de contacto, dirección y cómo te pueden pagar."
        />

        {/* Aviso honesto: esto cambia el sitio de verdad. */}
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-sm text-navy-800">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-500">
            <AdminIcon name="Info" className="h-4 w-4" />
          </span>
          <p>
            Todo lo que cargues acá lo ven tus clientes en el sitio. Cuando
            termines, tocá <strong>Guardar cambios</strong> abajo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Columna principal: los formularios */}
          <div className="space-y-6 lg:col-span-2">
            {/* ── Tu tienda ──────────────────────────────────────────── */}
            <SectionCard
              title="Tu tienda"
              description="El nombre, la frase y dónde estás."
              icon="Store"
            >
              <div className="space-y-5">
                <Field label="Nombre de la tienda" htmlFor="store-name">
                  <Input
                    id="store-name"
                    value={store.name ?? ""}
                    onChange={(e) => setStoreField("name", e.target.value)}
                    placeholder="Millanel Frías"
                  />
                </Field>

                <Field
                  label="Frase corta de la tienda"
                  htmlFor="store-tagline"
                  hint="Aparece debajo del nombre. Algo cortito que te describa."
                >
                  <Input
                    id="store-tagline"
                    value={store.tagline ?? ""}
                    onChange={(e) => setStoreField("tagline", e.target.value)}
                    placeholder="Perfumería · Cosmética · Cuidado personal"
                  />
                </Field>

                <Field
                  label="Descripción"
                  htmlFor="store-description"
                  hint="Un párrafo para presentarte. Opcional."
                >
                  <Textarea
                    id="store-description"
                    rows={3}
                    value={store.description ?? ""}
                    onChange={(e) =>
                      setStoreField("description", e.target.value)
                    }
                    placeholder="Distribuidora oficial Millanel en Frías…"
                  />
                </Field>

                {/* Dirección */}
                <div className="space-y-5 rounded-2xl border border-line bg-cream-50 p-4">
                  <p className="text-sm font-medium text-navy-900">
                    Dónde estás
                  </p>
                  <Field label="Calle y número" htmlFor="store-street">
                    <Input
                      id="store-street"
                      value={store.address_street ?? ""}
                      onChange={(e) =>
                        setStoreField("address_street", e.target.value)
                      }
                      placeholder="Rivadavia 664"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Ciudad o localidad" htmlFor="store-city">
                      <Input
                        id="store-city"
                        value={store.address_city ?? ""}
                        onChange={(e) =>
                          setStoreField("address_city", e.target.value)
                        }
                        placeholder="Frías"
                      />
                    </Field>
                    <Field label="Código postal" htmlFor="store-postal">
                      <Input
                        id="store-postal"
                        value={store.address_postal_code ?? ""}
                        onChange={(e) =>
                          setStoreField("address_postal_code", e.target.value)
                        }
                        placeholder="G4233"
                      />
                    </Field>
                  </div>
                  <Field label="Provincia">
                    <Select
                      value={store.address_province ?? ""}
                      onValueChange={(v) => setStoreField("address_province", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Elegí tu provincia…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES_AR.map((p) => (
                          <SelectItem key={p.code} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* ── Contacto ───────────────────────────────────────────── */}
            <SectionCard
              title="Contacto"
              description="Cómo te encuentran y te escriben."
              icon="Phone"
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Teléfono" htmlFor="contact-phone">
                    <Input
                      id="contact-phone"
                      type="tel"
                      inputMode="tel"
                      value={contact.phone ?? ""}
                      onChange={(e) => setContactField("phone", e.target.value)}
                      placeholder="+54 9 2494 00-7008"
                    />
                  </Field>
                  <Field label="Email" htmlFor="contact-email">
                    <Input
                      id="contact-email"
                      type="email"
                      inputMode="email"
                      value={contact.email ?? ""}
                      onChange={(e) => setContactField("email", e.target.value)}
                      placeholder="hola@tutienda.com"
                    />
                  </Field>
                </div>

                {/* WhatsApp: sólo dígitos, con preview. */}
                <Field
                  label="WhatsApp"
                  htmlFor="contact-whatsapp"
                  hint="Tu número con código de país y área, sin espacios."
                >
                  <Input
                    id="contact-whatsapp"
                    inputMode="numeric"
                    value={contact.whatsapp ?? ""}
                    onChange={(e) =>
                      setContactField(
                        "whatsapp",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="5492494007008"
                  />
                  <p className="text-xs text-mute">
                    Se va a ver como{" "}
                    <span className="font-medium text-navy-700">
                      {whatsappPreview}
                    </span>
                  </p>
                </Field>

                <Field
                  label="Horarios"
                  htmlFor="contact-hours"
                  hint="Cuándo estás abierta. Tal cual querés que lo lean."
                >
                  <Input
                    id="contact-hours"
                    value={contact.hours ?? ""}
                    onChange={(e) => setContactField("hours", e.target.value)}
                    placeholder="Lun a Sáb · 09:00 – 13:00 y 17:00 – 21:00"
                  />
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Instagram"
                    htmlFor="contact-instagram"
                    hint="El link o el usuario de tu perfil."
                  >
                    <Input
                      id="contact-instagram"
                      value={contact.instagram ?? ""}
                      onChange={(e) =>
                        setContactField("instagram", e.target.value)
                      }
                      placeholder="instagram.com/tutienda"
                    />
                  </Field>
                  <Field
                    label="Facebook"
                    htmlFor="contact-facebook"
                    hint="El link o el nombre de tu página."
                  >
                    <Input
                      id="contact-facebook"
                      value={contact.facebook ?? ""}
                      onChange={(e) =>
                        setContactField("facebook", e.target.value)
                      }
                      placeholder="facebook.com/tutienda"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* ── Métodos de pago ────────────────────────────────────── */}
            <SectionCard
              title="Métodos de pago"
              description="Activá o desactivá cómo te pueden pagar en el sitio."
              icon="CreditCard"
            >
              <div className="divide-y divide-line">
                {PAYMENT_FIELDS.map((f) => (
                  <ToggleRow key={f.key} label={f.label} hint={f.hint}>
                    <Switch
                      checked={!!payment[f.key]}
                      onCheckedChange={(v) => setPaymentField(f.key, v)}
                      aria-label={f.label}
                    />
                  </ToggleRow>
                ))}
              </div>
              <p className="mt-4 text-xs text-mute">
                Lo que apagues acá deja de aparecer como opción cuando un cliente
                va a pagar.
              </p>
            </SectionCard>
          </div>

          {/* Columna lateral: cómo lo ven tus clientes */}
          <aside className="space-y-6">
            <SectionCard
              title="Así lo ven tus clientes"
              description="Una idea de cómo aparece tu contacto en el sitio."
              icon="Eye"
            >
              <StorePreview
                name={store.name ?? ""}
                tagline={store.tagline ?? ""}
                street={store.address_street ?? ""}
                city={store.address_city ?? ""}
                province={store.address_province ?? ""}
                phone={contact.phone ?? ""}
                whatsapp={contact.whatsapp ?? ""}
                email={contact.email ?? ""}
                hours={contact.hours ?? ""}
              />
              {dirty && (
                <p className="mt-3 text-xs text-mute">
                  Esto es una vista previa. Recordá guardar para que se vea en tu
                  sitio.
                </p>
              )}
            </SectionCard>
          </aside>
        </div>
      </AdminPage>

      {/* Barra pegajosa: aparece sólo cuando hay algo sin guardar. */}
      <SaveBar
        visible={dirty}
        saving={pending}
        onSave={onSave}
        onDiscard={onDiscard}
        message="Tenés cambios sin guardar"
        saveLabel="Guardar cambios"
      />
    </>
  );
}
