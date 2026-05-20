import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Store, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/format";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { SITE } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
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
    order as unknown as { shipping_zones: { name: string; estimated_days: string | null } | null }
  ).shipping_zones;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="space-y-2">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-mute hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Órdenes
        </Link>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="eyebrow text-mute">Pedido</p>
            <h1 className="font-display text-4xl md:text-5xl text-navy-900 num-display">
              {order.order_number}
            </h1>
            <p className="text-xs text-mute mt-1">
              Creado el {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex items-start gap-2 flex-wrap">
            <Badge
              variant={
                order.payment_status === "paid"
                  ? "success"
                  : order.payment_status === "failed"
                    ? "danger"
                    : "warn"
              }
            >
              {order.payment_status}
            </Badge>
            <Badge variant={order.status === "delivered" ? "success" : "soft"}>
              {order.status}
            </Badge>
          </div>
        </div>
      </header>

      <OrderStatusControls
        id={order.id}
        status={order.status}
        paymentStatus={order.payment_status}
        adminNotes={order.admin_notes}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 !pt-6 space-y-1">
            <h2 className="font-display text-xl text-navy-900 mb-4">
              Productos ({items?.length ?? 0})
            </h2>
            <ul className="divide-y divide-line -mx-2">
              {(items ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-4 px-2 py-3"
                >
                  <span className="num-display font-medium text-navy w-8 shrink-0">
                    ×{item.quantity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">
                      {item.product_name}
                    </p>
                    {item.product_code && (
                      <p className="text-[11px] text-mute-soft uppercase tracking-wider mt-0.5">
                        COD {item.product_code}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-navy num-display">
                      {formatPrice(Number(item.total))}
                    </p>
                    <p className="text-xs text-mute num-display">
                      {formatPrice(Number(item.unit_price))} c/u
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="pt-3 space-y-1 text-sm">
              <Row label="Subtotal" value={formatPrice(Number(order.subtotal))} />
              <Row
                label="Envío"
                value={
                  Number(order.shipping_cost) === 0
                    ? "Gratis"
                    : formatPrice(Number(order.shipping_cost))
                }
              />
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <span className="font-display text-lg text-navy-900">Total</span>
                <span className="font-display text-2xl text-navy num-display">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-6">
          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h3 className="font-display text-lg text-navy-900">Cliente</h3>
              <div className="space-y-1.5 text-sm">
                <p className="font-medium text-navy-900">{order.customer_name}</p>
                {order.customer_dni && (
                  <p className="text-xs text-mute">DNI {order.customer_dni}</p>
                )}
                <a
                  href={`mailto:${order.customer_email}`}
                  className="flex items-center gap-2 text-mute hover:text-navy transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {order.customer_email}
                </a>
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex items-center gap-2 text-mute hover:text-navy transition-colors"
                  rel="noreferrer"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {order.customer_phone}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 !pt-6 space-y-3">
              <h3 className="font-display text-lg text-navy-900 flex items-center gap-2">
                {order.shipping_method === "pickup" ? (
                  <Store className="h-4 w-4" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                {order.shipping_method === "pickup" ? "Retiro" : "Envío"}
              </h3>
              {order.shipping_method === "pickup" ? (
                <p className="text-sm text-navy-900">
                  {SITE.contact.address}, {SITE.contact.city}
                </p>
              ) : (
                <>
                  {shippingZone && (
                    <p className="eyebrow text-mute">
                      {shippingZone.name}
                      {shippingZone.estimated_days && ` · ${shippingZone.estimated_days}`}
                    </p>
                  )}
                  {shippingAddress && (
                    <div className="space-y-1 text-sm text-navy-900">
                      <p className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 text-mute shrink-0" />
                        <span>
                          {shippingAddress.street}
                          <br />
                          {shippingAddress.city}, {shippingAddress.province}
                          <br />
                          CP {shippingAddress.postalCode}
                        </span>
                      </p>
                      {shippingAddress.notes && (
                        <p className="text-xs text-mute italic ml-5">
                          {shippingAddress.notes}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardContent className="p-6 !pt-6 space-y-2">
                <h3 className="font-display text-lg text-navy-900">
                  Nota del cliente
                </h3>
                <p className="text-sm text-mute italic leading-relaxed">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">{label}</span>
      <span className="text-navy font-medium num-display">{value}</span>
    </div>
  );
}
