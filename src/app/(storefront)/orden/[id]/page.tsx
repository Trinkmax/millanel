import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Truck,
  Store,
  CreditCard,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { fetchOrderByNumber } from "@/lib/actions/orders";
import { SITE } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/format";
import { MillanelMark } from "@/components/brand/millanel-mark";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export const metadata: Metadata = {
  title: "Estado del pedido",
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const order = (await fetchOrderByNumber(id)) as {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_method: "pickup" | "shipping";
    shipping_address: { street: string; city: string; province: string; postalCode: string; notes?: string } | null;
    shipping_cost: number;
    shipping_zone?: { name: string; estimated_days?: string } | null;
    subtotal: number;
    total: number;
    payment_method: string;
    payment_status: string;
    status: string;
    notes: string | null;
    created_at: string;
    items: { product_name: string; product_code: string | null; quantity: number; unit_price: number; total: number }[];
  } | null;

  if (!order) notFound();

  const isPaid = order.payment_status === "paid";
  const isFailed =
    sp.status === "failure" || order.payment_status === "failed";
  const isPending = !isPaid && !isFailed;

  return (
    <div className="container-page py-10 md:py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Status banner */}
        <header className="text-center space-y-4">
          <StatusBadge
            paid={isPaid}
            failed={isFailed}
            pending={isPending}
          />
          <p className="num-eyebrow text-mute">Pedido</p>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight text-navy-900">
            {order.order_number}
          </h1>
          <p className="text-mute max-w-md mx-auto">
            {isPaid &&
              "Recibimos tu pago. Te vamos a estar contactando para coordinar la entrega o retiro."}
            {isPending &&
              "Tu pedido fue registrado. Te contactaremos para confirmar y coordinar el pago si corresponde."}
            {isFailed &&
              "Algo no salió bien con el pago. Escribinos por WhatsApp para resolverlo juntos."}
          </p>
          <p className="text-xs text-mute-soft">
            Creado el {formatDate(order.created_at)}
          </p>
        </header>

        <Separator />

        {/* Order details */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailBlock icon={CreditCard} title="Pago">
            <p className="font-medium text-navy-900 capitalize">
              {order.payment_method === "mercadopago"
                ? "MercadoPago"
                : order.payment_method === "whatsapp"
                  ? "WhatsApp"
                  : order.payment_method === "transfer"
                    ? "Transferencia bancaria"
                    : "Efectivo al retirar"}
            </p>
            <Badge
              variant={
                isPaid ? "success" : isFailed ? "danger" : "warn"
              }
              className="mt-2"
            >
              {order.payment_status}
            </Badge>
          </DetailBlock>

          <DetailBlock
            icon={order.shipping_method === "pickup" ? Store : Truck}
            title={order.shipping_method === "pickup" ? "Retiro en Frías" : "Envío"}
          >
            {order.shipping_method === "pickup" ? (
              <>
                <p className="text-sm text-navy-900">
                  {SITE.contact.address}
                  <br />
                  {SITE.contact.city}, {SITE.contact.province}
                </p>
                <p className="text-xs text-mute mt-2">
                  {SITE.contact.hours}
                </p>
              </>
            ) : (
              <>
                {order.shipping_address && (
                  <p className="text-sm text-navy-900">
                    {order.shipping_address.street}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.province}
                    {" "}({order.shipping_address.postalCode})
                  </p>
                )}
                {order.shipping_zone && (
                  <p className="text-xs text-mute mt-2">
                    {order.shipping_zone.name}
                    {order.shipping_zone.estimated_days &&
                      ` · ${order.shipping_zone.estimated_days}`}
                  </p>
                )}
              </>
            )}
          </DetailBlock>
        </section>

        {/* Items */}
        <section className="space-y-3">
          <h2 className="eyebrow text-mute">Productos</h2>
          <div className="rounded-2xl border border-line bg-cream-50 divide-y divide-line">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 md:p-5">
                <span className="num-display text-navy font-medium w-8 shrink-0">
                  ×{item.quantity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 leading-tight">
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
                    {formatPrice(item.total)}
                  </p>
                  <p className="text-xs text-mute">
                    {formatPrice(item.unit_price)} c/u
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="rounded-2xl border border-line bg-pearl p-6 md:p-8 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mute">Subtotal</span>
            <span className="font-medium text-navy num-display">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-mute">Envío</span>
            <span className="font-medium text-navy num-display">
              {order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <Separator />
          <div className="flex items-baseline justify-between">
            <span className="font-display text-xl text-navy-900">Total</span>
            <span className="font-display text-3xl text-navy num-display">
              {formatPrice(order.total)}
            </span>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="whatsapp" size="lg" className="flex-1">
            <a
              href={`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(
                `Hola, soy ${order.customer_name}. Te escribo por mi pedido ${order.order_number}.`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link href="/productos">
              Seguir comprando
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* Footer note */}
        <p className="text-center text-xs text-mute italic">
          Guardá este número de pedido. Te enviamos los datos al email{" "}
          <span className="text-navy">{order.customer_email}</span>.
        </p>

        <div className="flex justify-center pt-6">
          <MillanelMark size={28} className="text-navy-200" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  paid,
  failed,
  pending,
}: {
  paid: boolean;
  failed: boolean;
  pending: boolean;
}) {
  if (paid) {
    return (
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#E2EFE0]">
        <CheckCircle2 className="h-7 w-7 text-[#3F6B3F]" />
      </div>
    );
  }
  if (failed) {
    return (
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FBE0E0]">
        <XCircle className="h-7 w-7 text-[#922C2C]" />
      </div>
    );
  }
  if (pending) {
    return (
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FBEED1]">
        <Clock className="h-7 w-7 text-[#876310]" />
      </div>
    );
  }
  return null;
}

function DetailBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream-50 p-5 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-navy" />
        <p className="eyebrow">{title}</p>
      </div>
      {children}
    </div>
  );
}
