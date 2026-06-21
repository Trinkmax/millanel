import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/format";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { CustomerContact } from "@/components/admin/orders/customer-contact";
import {
  AdminPage,
  SectionCard,
  OrderStatusChip,
  PaymentStatusChip,
  AdminIcon,
} from "@/components/admin/ui";
import { shippingMethodLabel, paymentMethodLabel } from "@/lib/admin/labels";
import { getSiteInfo } from "@/lib/queries/site";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const site = await getSiteInfo();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, shipping_zones(name, estimated_days)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!order) notFound();

  type ShippingAddress = {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    notes?: string;
  } | null;
  const shippingAddress = (order.shipping_address ?? null) as ShippingAddress;
  const shippingZone = (
    order as unknown as {
      shipping_zones: { name: string; estimated_days: string | null } | null;
    }
  ).shipping_zones;

  const isPickup = order.shipping_method === "pickup";

  // Historial de hitos (sólo mostramos los que ya pasaron).
  const milestones = [
    { label: "Pedido recibido", at: order.created_at, icon: "Inbox" },
    { label: "Pago recibido", at: order.paid_at, icon: "CircleCheck" },
    { label: "Pedido enviado", at: order.shipped_at, icon: "Truck" },
    { label: "Pedido entregado", at: order.delivered_at, icon: "PackageCheck" },
  ].filter((m) => m.at);

  return (
    <AdminPage>
      {/* Encabezado: volver + número + estados grandes */}
      <header className="space-y-3">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pedidos
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <p className="eyebrow text-mute">Pedido</p>
            <h1 className="num-display font-display text-3xl text-navy-900 md:text-4xl">
              {order.order_number}
            </h1>
            <p className="text-xs text-mute">
              Entró el {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusChip status={order.status} size="md" full />
            <PaymentStatusChip status={order.payment_status} size="md" full />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna principal: controles + productos */}
        <div className="space-y-6 lg:col-span-2">
          <OrderStatusControls
            id={order.id}
            status={order.status}
            paymentStatus={order.payment_status}
            adminNotes={order.admin_notes}
          />

          <SectionCard
            title={`Productos (${items?.length ?? 0})`}
            icon="Package"
          >
            <ul className="divide-y divide-line">
              {(items ?? []).map((item) => (
                <li key={item.id} className="flex items-start gap-4 py-3 first:pt-0">
                  <span className="num-display mt-0.5 w-9 shrink-0 text-sm font-medium text-navy">
                    ×{item.quantity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900">
                      {item.product_name}
                    </p>
                    {item.product_code && (
                      <p className="num-display mt-0.5 text-[11px] text-mute-soft">
                        Código {item.product_code}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="num-display font-medium text-navy">
                      {formatPrice(Number(item.total))}
                    </p>
                    <p className="num-display text-xs text-mute">
                      {formatPrice(Number(item.unit_price))} c/u
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
              <Row
                label="Envío"
                value={
                  Number(order.shipping_cost) === 0
                    ? "Gratis"
                    : formatPrice(Number(order.shipping_cost))
                }
              />
              <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                <span className="font-display text-lg text-navy-900">Total</span>
                <span className="num-display font-display text-2xl text-navy">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Columna lateral: cliente, entrega, nota de la clienta, historial */}
        <aside className="space-y-6">
          <SectionCard title="Cliente" icon="MessageCircle">
            <CustomerContact
              name={order.customer_name}
              email={order.customer_email}
              phone={order.customer_phone}
              dni={order.customer_dni}
              orderNumber={order.order_number}
            />
          </SectionCard>

          <SectionCard
            title={isPickup ? "Retiro en el local" : "Envío a domicilio"}
            icon={isPickup ? "Store" : "Truck"}
          >
            <p className="mb-3 text-xs text-mute">
              {shippingMethodLabel(order.shipping_method)} ·{" "}
              {paymentMethodLabel(order.payment_method)}
            </p>

            {isPickup ? (
              <div className="space-y-1 text-sm text-navy-900">
                <p className="font-medium">{site.name}</p>
                <p className="text-mute">
                  {site.contact.address}, {site.contact.city}
                </p>
                <p className="text-xs text-mute">{site.contact.hours}</p>
              </div>
            ) : (
              <>
                {shippingZone && (
                  <p className="mb-2 text-xs text-mute">
                    {shippingZone.name}
                    {shippingZone.estimated_days &&
                      ` · llega en ${shippingZone.estimated_days}`}
                  </p>
                )}
                {shippingAddress ? (
                  <div className="space-y-1 text-sm text-navy-900">
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mute" />
                      <span>
                        {shippingAddress.street}
                        <br />
                        {shippingAddress.city}, {shippingAddress.province}
                        <br />
                        CP {shippingAddress.postalCode}
                      </span>
                    </p>
                    {shippingAddress.notes && (
                      <p className="ml-5 text-xs italic text-mute">
                        {shippingAddress.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="rounded-xl border border-line bg-cream-50 px-3 py-3 text-sm text-mute">
                    Todavía no hay una dirección cargada para este envío.
                    Coordiná con la clienta por WhatsApp.
                  </p>
                )}
              </>
            )}
          </SectionCard>

          {order.notes && (
            <SectionCard title="Nota de la clienta" icon="MessageCircle">
              <p className="text-sm italic leading-relaxed text-mute">
                “{order.notes}”
              </p>
            </SectionCard>
          )}

          {milestones.length > 0 && (
            <SectionCard title="Historial" icon="Clock">
              <ol className="space-y-3">
                {milestones.map((m) => (
                  <li key={m.label} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream-100 text-navy-700">
                      <AdminIcon name={m.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-navy-900">
                        {m.label}
                      </p>
                      <p className="num-display text-xs text-mute">
                        {formatDateTime(m.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}
        </aside>
      </div>
    </AdminPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">{label}</span>
      <span className="num-display font-medium text-navy">{value}</span>
    </div>
  );
}
