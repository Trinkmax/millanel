/* ──────────────────────────────────────────────────────────────
   MILLANEL · Admin — Diccionario en español (fuente única de verdad)

   La base de datos guarda los estados en inglés (pending, paid, …).
   La dueña NUNCA tiene que ver esas palabras. Todo lo que se muestra
   en pantalla se traduce acá, con un color y un ícono coherentes en
   todo el panel. Cambiá una etiqueta acá y cambia en todos lados.

   Este archivo es TS puro (sin JSX) para poder importarlo tanto desde
   componentes de servidor como de cliente. El ícono se referencia por
   nombre y lo resuelve <StatusChip> (admin/ui/status-chip.tsx).
   ────────────────────────────────────────────────────────────── */

import type { Enums } from "@/lib/supabase/types";

export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
export type PaymentMethod = Enums<"payment_method">;
export type ShippingMethod = Enums<"shipping_method">;

/** Tono visual de un estado. <StatusChip> lo traduce a colores de marca. */
export type Tone = "neutral" | "info" | "warn" | "success" | "danger";

export interface StatusMeta {
  /** Etiqueta en español, en tono cercano. */
  label: string;
  /** Versión corta para chips angostos (cae a `label` si no existe). */
  short?: string;
  tone: Tone;
  /** Nombre de un ícono de lucide-react (lo resuelve StatusChip). */
  icon: string;
  /** Explicación en lenguaje llano: qué significa y qué hacer. */
  hint?: string;
}

/* ── Estado del pedido (su recorrido) ──────────────────────────── */

export const ORDER_STATUS: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pedido nuevo",
    short: "Nuevo",
    tone: "info",
    icon: "Inbox",
    hint: "Recién entró. Confirmalo para empezar a prepararlo.",
  },
  confirmed: {
    label: "Confirmado",
    tone: "info",
    icon: "BadgeCheck",
    hint: "Ya lo confirmaste. El próximo paso es prepararlo.",
  },
  preparing: {
    label: "Preparando",
    tone: "warn",
    icon: "Package",
    hint: "Lo estás armando para enviar o entregar.",
  },
  shipped: {
    label: "Enviado",
    tone: "info",
    icon: "Truck",
    hint: "Ya salió hacia el cliente.",
  },
  delivered: {
    label: "Entregado",
    tone: "success",
    icon: "PackageCheck",
    hint: "Llegó al cliente. ¡Pedido terminado!",
  },
  cancelled: {
    label: "Cancelado",
    tone: "danger",
    icon: "XCircle",
    hint: "Este pedido se canceló.",
  },
};

/* ── Estado del pago (la plata) ────────────────────────────────── */

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  pending: {
    label: "Falta pagar",
    short: "Sin pagar",
    tone: "warn",
    icon: "Clock",
    hint: "Todavía no recibiste el pago de este pedido.",
  },
  in_process: {
    label: "Pago en proceso",
    short: "En proceso",
    tone: "info",
    icon: "Hourglass",
    hint: "El pago se está procesando. Esperá la confirmación.",
  },
  paid: {
    label: "Pagado",
    tone: "success",
    icon: "CircleCheck",
    hint: "Ya cobraste este pedido.",
  },
  failed: {
    label: "Pago rechazado",
    short: "Rechazado",
    tone: "danger",
    icon: "CircleX",
    hint: "El pago no se concretó.",
  },
  refunded: {
    label: "Reembolsado",
    tone: "neutral",
    icon: "RotateCcw",
    hint: "Le devolviste el dinero al cliente.",
  },
};

/* ── Cómo paga / cómo recibe ───────────────────────────────────── */

export const PAYMENT_METHOD: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  mercadopago: { label: "Mercado Pago", icon: "CreditCard" },
  whatsapp: { label: "Coordina por WhatsApp", icon: "MessageCircle" },
  transfer: { label: "Transferencia", icon: "Banknote" },
  pickup_cash: { label: "Efectivo al retirar", icon: "Wallet" },
};

export const SHIPPING_METHOD: Record<
  ShippingMethod,
  { label: string; icon: string }
> = {
  pickup: { label: "Retira en el local", icon: "Store" },
  shipping: { label: "Envío a domicilio", icon: "Truck" },
};

/* ── Recorrido del pedido (para la línea de tiempo guiada) ─────── */

/** Pasos normales, en orden. `cancelled` queda fuera (es un desvío). */
export const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
];

/** El paso siguiente "natural" de un pedido, o null si ya terminó. */
export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const i = ORDER_FLOW.indexOf(current);
  if (i === -1 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1];
}

/** Texto del botón de acción principal para avanzar el pedido. */
export const NEXT_STEP_LABEL: Record<OrderStatus, string | null> = {
  pending: "Confirmar pedido",
  confirmed: "Empezar a preparar",
  preparing: "Marcar como enviado",
  shipped: "Marcar como entregado",
  delivered: null,
  cancelled: null,
};

/* ── Helpers de lectura segura ─────────────────────────────────── */

export function orderStatusMeta(s: string): StatusMeta {
  return ORDER_STATUS[s as OrderStatus] ?? FALLBACK(s);
}
export function paymentStatusMeta(s: string): StatusMeta {
  return PAYMENT_STATUS[s as PaymentStatus] ?? FALLBACK(s);
}
export function paymentMethodLabel(m?: string | null): string {
  if (!m) return "—";
  return PAYMENT_METHOD[m as PaymentMethod]?.label ?? m;
}
export function shippingMethodLabel(m?: string | null): string {
  if (!m) return "—";
  return SHIPPING_METHOD[m as ShippingMethod]?.label ?? m;
}

function FALLBACK(raw: string): StatusMeta {
  return { label: raw, tone: "neutral", icon: "Circle" };
}

/* ── Vistas rápidas que la dueña piensa de verdad ──────────────────
   "¿Qué tengo que hacer?" se responde combinando estado + pago, no
   con los enums sueltos. Estas presets alimentan los filtros de
   Pedidos y las tarjetas de tareas del Inicio.
   ──────────────────────────────────────────────────────────────── */

export interface OrderView {
  key: string;
  label: string;
  /** Descripción corta para tooltips / vacíos. */
  hint: string;
  icon: string;
  tone: Tone;
  /** Estados de pedido que entran en esta vista (vacío = cualquiera). */
  statuses?: OrderStatus[];
  /** Estados de pago que entran en esta vista (vacío = cualquiera). */
  payments?: PaymentStatus[];
  /** Estados de pedido que se EXCLUYEN (ej. no contar cancelados como "sin pagar"). */
  excludeStatuses?: OrderStatus[];
}

export const ORDER_VIEWS: OrderView[] = [
  {
    key: "todos",
    label: "Todos",
    hint: "Todos los pedidos.",
    icon: "List",
    tone: "neutral",
  },
  {
    key: "preparar",
    label: "Para preparar",
    hint: "Pedidos nuevos y confirmados que tenés que armar.",
    icon: "Package",
    tone: "warn",
    statuses: ["pending", "confirmed"],
  },
  {
    key: "enviar",
    label: "Para enviar",
    hint: "Ya armados, listos para despachar o entregar.",
    icon: "Truck",
    tone: "info",
    statuses: ["preparing"],
  },
  {
    key: "sin-pagar",
    label: "Sin pagar",
    hint: "Pedidos que todavía no cobraste.",
    icon: "Clock",
    tone: "warn",
    payments: ["pending", "in_process"],
    // Un pedido cancelado que nunca se cobró NO es plata por cobrar.
    excludeStatuses: ["cancelled"],
  },
  {
    key: "terminados",
    label: "Terminados",
    hint: "Pedidos entregados.",
    icon: "CheckCheck",
    tone: "success",
    statuses: ["delivered"],
  },
  {
    key: "cancelados",
    label: "Cancelados",
    hint: "Pedidos cancelados.",
    icon: "XCircle",
    tone: "danger",
    statuses: ["cancelled"],
  },
];

export function orderViewByKey(key?: string | null): OrderView {
  return ORDER_VIEWS.find((v) => v.key === key) ?? ORDER_VIEWS[0];
}
