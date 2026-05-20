import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Metrics {
  revenue: number;
  revenue_pending: number;
  orders_count: number;
  orders_paid: number;
  orders_pending: number;
  orders_shipping: number;
  total_customers: number;
  total_products: number;
  low_stock: number;
  top_products: { product_name: string; units: number; revenue: number }[];
  revenue_by_day: { day: string; total: number }[];
}

async function fetchMetrics(period: string): Promise<Metrics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_metrics", { period });
  if (error) {
    console.error("[dashboard_metrics] error:", error);
    return null;
  }
  return data as unknown as Metrics;
}

async function fetchRecentOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function AdminDashboard() {
  const [monthly, recent] = await Promise.all([
    fetchMetrics("month"),
    fetchRecentOrders(),
  ]);

  if (!monthly) {
    return (
      <div className="p-8">
        <p className="text-mute">Error cargando métricas.</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-6 md:p-10 space-y-10">
      <header className="space-y-2">
        <p className="eyebrow text-mute">{today}</p>
        <h1 className="font-display text-4xl md:text-5xl text-navy-900">
          Buen día, Cintia ✨
        </h1>
        <p className="text-mute">
          Acá tenés el resumen de tu negocio en lo que va del mes.
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Ventas del mes"
          value={formatPrice(monthly.revenue)}
          hint={`${monthly.orders_paid} pedidos pagos`}
          tone="navy"
        />
        <StatCard
          icon={ShoppingBag}
          label="Pendientes"
          value={formatNumber(monthly.orders_pending)}
          hint={`${formatPrice(monthly.revenue_pending)} estimado`}
          tone="champagne"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value={formatNumber(monthly.total_customers)}
          hint="Únicos por email"
          tone="sky"
        />
        <StatCard
          icon={Package}
          label="Productos activos"
          value={formatNumber(monthly.total_products)}
          hint={
            monthly.low_stock > 0 ? `${monthly.low_stock} con bajo stock` : "Todo OK"
          }
          tone="blush"
          warning={monthly.low_stock > 0}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 md:p-8 !pt-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-2xl text-navy-900">
                  Últimas órdenes
                </h2>
                <p className="text-xs text-mute mt-1">
                  Las {recent.length} más recientes
                </p>
              </div>
              <Button asChild variant="link" size="sm">
                <Link href="/admin/ordenes">
                  Ver todas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {recent.length === 0 ? (
              <p className="text-sm text-mute italic py-8 text-center">
                Aún no hay órdenes.
              </p>
            ) : (
              <ul className="divide-y divide-line -mx-2">
                {recent.map((o) => (
                  <li key={o.id} className="px-2">
                    <Link
                      href={`/admin/ordenes/${o.id}`}
                      className="flex items-center gap-4 py-3 hover:bg-cream-50 rounded-md transition-colors px-2 -mx-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">
                          {o.customer_name}
                        </p>
                        <p className="text-xs text-mute mt-0.5 num-display">
                          {o.order_number}
                        </p>
                      </div>
                      <Badge
                        variant={
                          o.payment_status === "paid"
                            ? "success"
                            : o.payment_status === "failed"
                              ? "danger"
                              : "warn"
                        }
                      >
                        {o.payment_status}
                      </Badge>
                      <span className="num-display font-medium text-navy w-24 text-right">
                        {formatPrice(Number(o.total))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardContent className="p-6 md:p-8 !pt-6">
            <h2 className="font-display text-2xl text-navy-900 mb-5">
              Top productos
            </h2>
            {monthly.top_products.length === 0 ? (
              <p className="text-sm text-mute italic py-8 text-center">
                Aún sin datos.
              </p>
            ) : (
              <ol className="space-y-3">
                {monthly.top_products.map((p, idx) => (
                  <li key={`${p.product_name}-${idx}`} className="flex items-center gap-3">
                    <span className="num-display font-display text-lg text-navy-300 w-6">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">
                        {p.product_name}
                      </p>
                      <p className="text-xs text-mute mt-0.5">
                        {p.units} unidades · {formatPrice(p.revenue)}
                      </p>
                    </div>
                    <Sparkles className="h-3.5 w-3.5 text-champagne-300" />
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="eyebrow text-mute mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction href="/admin/productos/nuevo" label="Cargar producto" />
          <QuickAction href="/admin/ordenes?status=pending" label="Pedidos pendientes" />
          <QuickAction href="/admin/productos?stock=low" label="Bajo stock" />
          <QuickAction href="/admin/ajustes" label="Configuración" />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  warning,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone: "navy" | "champagne" | "sky" | "blush";
  warning?: boolean;
}) {
  const toneClass =
    tone === "navy"
      ? "bg-navy text-cream"
      : tone === "champagne"
        ? "bg-champagne-100 text-champagne-400"
        : tone === "sky"
          ? "bg-sky-100 text-navy"
          : "bg-blush-100 text-navy";
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 md:p-6 !pt-6">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`grid h-10 w-10 place-items-center rounded-full ${toneClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          {warning && (
            <AlertCircle className="h-4 w-4 text-champagne-400" />
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-mute">{label}</p>
        <p className="font-display text-3xl mt-1 text-navy-900 num-display">
          {value}
        </p>
        {hint && <p className="text-xs text-mute mt-1.5">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-pearl px-4 py-3 text-sm font-medium text-navy-900 hover:border-navy-300 hover:bg-cream-50 transition-colors group"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
    </Link>
  );
}
