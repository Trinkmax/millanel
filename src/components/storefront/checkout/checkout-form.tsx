"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Banknote,
  Building2,
  MapPin,
  Store,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart, cartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { placeOrder, type CheckoutInput } from "@/lib/actions/orders";
import { PROVINCES_AR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ShippingZone } from "@/lib/supabase/types";

interface CheckoutFormProps {
  shippingZones: ShippingZone[];
  mercadopagoEnabled: boolean;
}

type PaymentMethod = CheckoutInput["paymentMethod"];

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "mercadopago",
    label: "MercadoPago",
    description: "Tarjeta de crédito, débito, transferencia o efectivo.",
    icon: CreditCard,
  },
  {
    value: "whatsapp",
    label: "Coordinar por WhatsApp",
    description: "Te respondemos con todas las opciones de pago.",
    icon: MessageCircle,
  },
  {
    value: "transfer",
    label: "Transferencia bancaria",
    description: "Te enviamos los datos de la cuenta.",
    icon: Building2,
  },
  {
    value: "pickup_cash",
    label: "Efectivo al retirar",
    description: "Pagás en mano cuando retirás en Frías.",
    icon: Banknote,
  },
];

export function CheckoutForm({ shippingZones, mercadopagoEnabled }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [shippingMethod, setShippingMethod] = useState<"pickup" | "shipping">("pickup");
  const [shippingZoneId, setShippingZoneId] = useState<string>(shippingZones[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    mercadopagoEnabled ? "mercadopago" : "whatsapp",
  );

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDni, setCustomerDni] = useState("");

  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [addressPostal, setAddressPostal] = useState("");
  const [addressNotes, setAddressNotes] = useState("");

  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const { subtotal, count } = cartTotals(items);

  const selectedZone = useMemo(
    () => shippingZones.find((z) => z.id === shippingZoneId) ?? null,
    [shippingZones, shippingZoneId],
  );
  const shippingCost =
    shippingMethod === "shipping" && selectedZone
      ? selectedZone.free_shipping_threshold &&
        subtotal >= selectedZone.free_shipping_threshold
        ? 0
        : Number(selectedZone.base_cost)
      : 0;
  const total = subtotal + shippingCost;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Tu carrito está vacío");
      return;
    }
    startTransition(async () => {
      const result = await placeOrder({
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          dni: customerDni.trim() || null,
        },
        shippingMethod,
        shippingZoneId: shippingMethod === "shipping" ? shippingZoneId : null,
        shippingAddress:
          shippingMethod === "shipping"
            ? {
                street: addressStreet.trim(),
                city: addressCity.trim(),
                province: addressProvince.trim(),
                postalCode: addressPostal.trim(),
                notes: addressNotes.trim() || null,
              }
            : null,
        paymentMethod,
        items,
        notes: notes.trim() || null,
      });

      if (!result.ok) {
        setError(result.error ?? "No pudimos procesar el pedido");
        toast.error("Error", { description: result.error });
        return;
      }

      // Success — clear cart and redirect
      clear();

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      if (result.whatsappUrl) {
        window.location.href = result.whatsappUrl;
        return;
      }
      router.push(`/orden/${result.orderNumber}?status=created`);
    });
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="font-display text-3xl text-navy-900">
          No hay nada para pagar
        </p>
        <p className="text-mute">Sumá productos al carrito antes de continuar.</p>
        <Button asChild className="mt-4">
          <Link href="/productos">
            Ver catálogo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
      <div className="lg:col-span-7 space-y-10">
        {/* Customer */}
        <FormSection
          step="01"
          title="Tus datos"
          description="Te vamos a contactar a este email y teléfono."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nombre y apellido" required>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Florencia Gómez"
                required
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="hola@email.com"
                required
              />
            </FormField>
            <FormField label="Teléfono / WhatsApp" required>
              <Input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="3854 12-3456"
                required
              />
            </FormField>
            <FormField label="DNI (opcional para factura)">
              <Input
                value={customerDni}
                onChange={(e) => setCustomerDni(e.target.value)}
                placeholder="20.123.456"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Shipping */}
        <FormSection
          step="02"
          title="Cómo lo recibís"
          description="Elegí entre retiro en Frías o envío a tu casa."
        >
          <RadioGroup
            value={shippingMethod}
            onValueChange={(v) => setShippingMethod(v as "pickup" | "shipping")}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <RadioOption
              value="pickup"
              icon={Store}
              title="Retiro en Frías"
              description="Rivadavia 664 · Sin costo"
              checked={shippingMethod === "pickup"}
            />
            <RadioOption
              value="shipping"
              icon={MapPin}
              title="Envío a domicilio"
              description="Por correo a todo el país"
              checked={shippingMethod === "shipping"}
            />
          </RadioGroup>

          <AnimatePresence mode="wait">
            {shippingMethod === "shipping" && (
              <motion.div
                key="ship-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-4">
                  <FormField label="Zona de envío" required>
                    <Select value={shippingZoneId} onValueChange={setShippingZoneId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegí tu zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingZones.map((z) => (
                          <SelectItem key={z.id} value={z.id}>
                            {z.name}
                            <span className="text-xs text-mute ml-2">
                              {formatPrice(z.base_cost)}
                              {z.estimated_days && ` · ${z.estimated_days}`}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Calle y número" required className="md:col-span-2">
                      <Input
                        value={addressStreet}
                        onChange={(e) => setAddressStreet(e.target.value)}
                        placeholder="Av. Belgrano 1234, Depto 5B"
                        required={shippingMethod === "shipping"}
                      />
                    </FormField>
                    <FormField label="Ciudad" required>
                      <Input
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        placeholder="San Miguel"
                        required={shippingMethod === "shipping"}
                      />
                    </FormField>
                    <FormField label="Provincia" required>
                      <Select
                        value={addressProvince}
                        onValueChange={setAddressProvince}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Elegí..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PROVINCES_AR.map((p) => (
                            <SelectItem key={p.code} value={p.name}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Código postal" required>
                      <Input
                        value={addressPostal}
                        onChange={(e) => setAddressPostal(e.target.value)}
                        placeholder="C1011"
                        required={shippingMethod === "shipping"}
                      />
                    </FormField>
                    <FormField label="Aclaraciones (timbre, piso, etc.)">
                      <Input
                        value={addressNotes}
                        onChange={(e) => setAddressNotes(e.target.value)}
                        placeholder="Timbre B · piso 2"
                      />
                    </FormField>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FormSection>

        {/* Payment */}
        <FormSection
          step="03"
          title="Cómo pagás"
          description="Elegí la forma que más te convenga."
        >
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {PAYMENT_METHODS.map((m) => {
              const disabled = m.value === "mercadopago" && !mercadopagoEnabled;
              return (
                <RadioOption
                  key={m.value}
                  value={m.value}
                  icon={m.icon}
                  title={m.label}
                  description={
                    disabled
                      ? "Próximamente disponible en este sitio."
                      : m.description
                  }
                  checked={paymentMethod === m.value}
                  disabled={disabled}
                />
              );
            })}
          </RadioGroup>
        </FormSection>

        {/* Notes */}
        <FormSection
          step="04"
          title="Algo más para sumar"
          description="Comentarios, regalos o lo que sea."
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Si es regalo, contános cómo te gustaría que llegue."
          />
        </FormSection>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-5 lg:sticky lg:top-28 self-start">
        <div className="rounded-2xl border border-line bg-cream-50 p-6 md:p-8 space-y-5">
          <h3 className="font-display text-2xl text-navy-900">Tu pedido</h3>
          <Separator />
          <ul className="space-y-3 max-h-72 overflow-auto -mr-2 pr-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="num-display font-medium text-navy w-7 shrink-0">
                  ×{item.quantity}
                </span>
                <span className="flex-1 text-navy-900/85 leading-snug line-clamp-2">
                  {item.name}
                </span>
                <span className="num-display text-navy font-medium shrink-0">
                  {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-mute">Subtotal ({count})</span>
              <span className="font-medium text-navy num-display">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-mute">
                Envío {selectedZone && shippingMethod === "shipping" && `· ${selectedZone.name}`}
              </span>
              <span className="font-medium text-navy num-display">
                {shippingMethod === "pickup"
                  ? "Gratis"
                  : shippingCost === 0
                    ? "Gratis 🎉"
                    : formatPrice(shippingCost)}
              </span>
            </div>
            {selectedZone?.free_shipping_threshold &&
              shippingMethod === "shipping" &&
              shippingCost > 0 && (
                <p className="text-xs text-mute italic pt-1">
                  Envío gratis desde {formatPrice(selectedZone.free_shipping_threshold)}.
                </p>
              )}
          </div>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xl text-navy-900">Total</span>
            <span className="font-display text-3xl text-navy num-display">
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending}
          >
            {pending ? "Procesando..." : "Finalizar pedido"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </Button>

          <div className="flex items-start gap-2 rounded-lg bg-sky-50 border border-sky-200 px-3.5 py-3">
            <ShieldCheck className="h-4 w-4 text-navy shrink-0 mt-0.5" />
            <p className="text-xs text-navy-900/80 leading-relaxed">
              Pago seguro a través de MercadoPago. Tus datos están protegidos
              y no compartimos tu información.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex items-baseline gap-4">
        <span className="num-eyebrow text-2xl text-navy-300">{step}</span>
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-navy-900 leading-tight">
            {title}
          </h2>
          <p className="text-sm text-mute mt-1">{description}</p>
        </div>
      </header>
      <div className="ml-0 md:ml-12 space-y-4">{children}</div>
    </section>
  );
}

function RadioOption({
  value,
  icon: Icon,
  title,
  description,
  checked,
  disabled = false,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative flex items-start gap-3 cursor-pointer rounded-xl border bg-pearl px-4 py-4 transition-all duration-300",
        checked
          ? "border-navy shadow-soft"
          : "border-line hover:border-navy-300",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <RadioGroupItem value={value} className="mt-1" disabled={disabled} />
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-navy" />
          <p className="font-medium text-navy-900">{title}</p>
        </div>
        <p className="text-xs text-mute leading-snug">{description}</p>
      </div>
    </label>
  );
}
