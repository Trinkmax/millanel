"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  OrderStatusChip,
  PaymentStatusChip,
  AdminIcon,
} from "@/components/admin/ui";
import { paymentMethodLabel, shippingMethodLabel } from "@/lib/admin/labels";
import { formatPrice, formatDateTime } from "@/lib/format";

/* Lista de pedidos en formato TARJETA, pensada primero para el celular.
   Cada tarjeta linkea al detalle. Los chips de estado/pago y los datos
   de método de pago y entrega están SIEMPRE visibles (también en mobile):
   son la información que Cintia necesita de un vistazo, así que nunca se
   esconden detrás de un breakpoint ni de un hover. */

export interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  shipping_method: string | null;
  created_at: string;
}

export function OrdersList({ orders }: { orders: OrderRow[] }) {
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link
            href={`/admin/ordenes/${o.id}`}
            className="group block rounded-2xl border border-line bg-pearl p-4 shadow-whisper transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-soft md:p-5"
          >
            {/* Línea principal: cliente + total grande */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-navy-900 md:text-lg">
                  {o.customer_name}
                </p>
                <p className="num-display mt-0.5 text-xs text-mute">
                  {o.order_number} · {formatDateTime(o.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="num-display font-display text-xl text-navy-900 md:text-2xl">
                  {formatPrice(Number(o.total))}
                </span>
                <ChevronRight className="h-5 w-5 text-mute-soft transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-navy" />
              </div>
            </div>

            {/* Chips de estado: siempre visibles, también en celular */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <OrderStatusChip status={o.status} size="sm" full />
              <PaymentStatusChip status={o.payment_status} size="sm" full />
            </div>

            {/* Cómo paga / cómo recibe: en lenguaje simple, sin enums */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mute">
              <span className="inline-flex items-center gap-1.5">
                <AdminIcon
                  name={
                    o.shipping_method === "pickup" ? "Store" : "Truck"
                  }
                  className="h-3.5 w-3.5"
                />
                {shippingMethodLabel(o.shipping_method)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AdminIcon name="Wallet" className="h-3.5 w-3.5" />
                {paymentMethodLabel(o.payment_method)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
