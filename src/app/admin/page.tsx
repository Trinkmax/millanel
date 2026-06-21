import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  Check,
  ArrowRight,
  TrendingUp,
  Users,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdminPage,
  PageHeader,
  SectionCard,
  EmptyState,
  OrderStatusChip,
  PaymentStatusChip,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatNumber, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PeriodSwitch, type Period } from "@/components/admin/dashboard/period-switch";
import { SalesSparkline } from "@/components/admin/dashboard/sales-sparkline";

export const dynamic = "force-dynamic";

/* ── Forma del JSON que devuelve el RPC dashboard_metrics(period) ──
   Mismas claves exactas que arma la función en Postgres. No tocar. */
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

/* Conteos chicos de las tareas del día (la tabla orders es chica, son
   consultas head:true, sin traer filas). */
interface Tasks {
  preparar: number;
  enviar: number;
  sinPagar: number;
}

// El selector sólo ofrece estos tres (el RPC soporta más, pero acá no).
const VALID_PERIODS: Period[] = ["day", "week", "month"];

function normalizePeriod(raw?: string): Period {
  return VALID_PERIODS.includes(raw as Period) ? (raw as Period) : "month";
}

// El título del período, en lenguaje de Cintia.
const PERIOD_NOUN: Record<Period, string> = {
  day: "de hoy",
  week: "de la semana",
  month: "del mes",
};

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const sp = await searchParams;
  const period = normalizePeriod(sp.period);

  const supabase = await createClient();

  const [metrics, recent, tasks] = await Promise.all([
    fetchMetrics(supabase, period),
    fetchRecentOrders(supabase),
    fetchTasks(supabase),
  ]);

  const today = capitalize(
    new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
  );

  return (
    <AdminPage>
      <PageHeader
        eyebrow={today}
        title={
          <>
            Hola, Cintia <span aria-hidden>☀️</span>
          </>
        }
        subtitle="Esto es lo que está pasando en tu tienda. Empezá por lo que tenés pendiente."
        actions={<PeriodSwitch value={period} />}
      />

      {/* ── Si el RPC falla, no la dejamos sola con un error frío ── */}
      {!metrics ? (
        <SectionCard
          title="No pudimos cargar los números"
          description="A veces pasa por la conexión. Tus pedidos y productos están a salvo."
          icon="TriangleAlert"
        >
          <p className="text-sm leading-relaxed text-mute">
            Probá de nuevo en un momento. Si sigue sin cargar, cerrá sesión y
            volvé a entrar.
          </p>
          <div className="mt-5">
            <Button asChild variant="outline">
              <Link href="/admin">Reintentar</Link>
            </Button>
          </div>
        </SectionCard>
      ) : null}

      {/* ── Hoy te toca… ───────────────────────────────────────── */}
      <TasksBlock tasks={tasks} />

      {/* ── Números importantes (KPIs clickeables) ─────────────── */}
      {metrics ? <KpiBlock metrics={metrics} period={period} /> : null}

      {/* ── Mini gráfico de ventas (sólo si hay datos) ─────────── */}
      {metrics && metrics.revenue_by_day.length > 0 ? (
        <SectionCard
          title={`Ventas ${PERIOD_NOUN[period]}`}
          description="Cada barra es un día con ventas cobradas."
          icon="Banknote"
        >
          <SalesSparkline data={metrics.revenue_by_day} />
        </SectionCard>
      ) : null}

      {/* ── Últimas órdenes + Top productos ────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentOrders orders={recent} className="lg:col-span-2" />
        {metrics ? (
          <TopProducts products={metrics.top_products} />
        ) : null}
      </div>
    </AdminPage>
  );
}

/* ────────────────────────────────────────────────────────────────
   Bloque: "Hoy te toca…"
   ──────────────────────────────────────────────────────────────── */

function TasksBlock({ tasks }: { tasks: Tasks }) {
  const allClear =
    tasks.preparar === 0 && tasks.enviar === 0 && tasks.sinPagar === 0;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-navy-900">Hoy te toca…</h2>

      {allClear ? (
        <SectionCard>
          <EmptyState
            icon="CheckCheck"
            title="Estás al día ✨"
            description="No tenés pedidos esperando. Cuando entre algo nuevo, lo vas a ver acá."
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <TaskCard
            href="/admin/ordenes?view=preparar"
            icon={Package}
            count={tasks.preparar}
            label="Para preparar"
            hint="Pedidos que tenés que armar."
            tone="warn"
          />
          <TaskCard
            href="/admin/ordenes?view=enviar"
            icon={Truck}
            count={tasks.enviar}
            label="Para enviar"
            hint="Listos para despachar o entregar."
            tone="info"
          />
          <TaskCard
            href="/admin/ordenes?view=sin-pagar"
            icon={Clock}
            count={tasks.sinPagar}
            label="Sin pagar"
            hint="Todavía no cobraste estos pedidos."
            tone="champagne"
          />
        </div>
      )}
    </section>
  );
}

type TaskTone = "warn" | "info" | "champagne";

const TASK_TONE: Record<
  TaskTone,
  { badge: string; ring: string }
> = {
  warn: {
    badge: "bg-champagne-100 text-champagne-400",
    ring: "hover:border-champagne-300",
  },
  info: {
    badge: "bg-sky-100 text-navy",
    ring: "hover:border-sky-300",
  },
  champagne: {
    badge: "bg-blush-100 text-navy",
    ring: "hover:border-blush-300",
  },
};

function TaskCard({
  href,
  icon: Icon,
  count,
  label,
  hint,
  tone,
}: {
  href: string;
  icon: LucideIcon;
  count: number;
  label: string;
  hint: string;
  tone: TaskTone;
}) {
  const done = count === 0;
  const t = TASK_TONE[tone];
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[7rem] flex-col justify-between gap-3 rounded-2xl border border-line bg-card p-5 shadow-whisper transition-all hover:-translate-y-0.5 hover:shadow-soft",
        t.ring,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full",
            done ? "bg-cream-100 text-mute" : t.badge,
          )}
        >
          {done ? (
            <Check className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <span className="num-display font-display text-4xl leading-none text-navy-900">
          {formatNumber(count)}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-navy-900">{label}</p>
          <p className="mt-0.5 text-xs text-mute">
            {done ? "Nada pendiente acá." : hint}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-mute transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────────
   Bloque: KPIs
   ──────────────────────────────────────────────────────────────── */

function KpiBlock({
  metrics,
  period,
}: {
  metrics: Metrics;
  period: Period;
}) {
  const lowStock = metrics.low_stock;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        href="/admin/ordenes?view=todos"
        icon={TrendingUp}
        label={`Ventas ${PERIOD_NOUN[period]}`}
        value={formatPrice(Number(metrics.revenue))}
        hint={
          Number(metrics.revenue_pending) > 0
            ? `Pendiente de cobro: ${formatPrice(Number(metrics.revenue_pending))}`
            : `${formatNumber(metrics.orders_paid)} pedidos cobrados`
        }
        tone="navy"
      />
      <KpiCard
        href="/admin/ordenes?view=todos"
        icon={Users}
        label="Clientes que compraron"
        value={formatNumber(metrics.total_customers)}
        hint={`Distintos clientes ${PERIOD_NOUN[period]}`}
        tone="sky"
      />
      <KpiCard
        href={lowStock > 0 ? "/admin/productos?stock=low" : "/admin/productos"}
        icon={Package}
        label="Productos en la tienda"
        value={formatNumber(metrics.total_products)}
        hint={
          lowStock > 0
            ? `${formatNumber(lowStock)} con poco stock (quedan 5 o menos)`
            : "Todo con stock suficiente"
        }
        tone="champagne"
        warning={lowStock > 0}
      />
    </div>
  );
}

type KpiTone = "navy" | "sky" | "champagne";

function KpiCard({
  href,
  icon: Icon,
  label,
  value,
  hint,
  tone,
  warning,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: KpiTone;
  warning?: boolean;
}) {
  const badge =
    tone === "navy"
      ? "bg-navy text-cream"
      : tone === "sky"
        ? "bg-sky-100 text-navy"
        : "bg-champagne-100 text-champagne-400";
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 shadow-whisper transition-all hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-soft md:p-6"
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-full",
            badge,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {warning ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-champagne-100 px-2 py-0.5 text-[11px] font-medium text-champagne-400">
            <CircleAlert className="h-3 w-3" />
            Atención
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-sm text-mute">{label}</p>
        <p className="num-display font-display mt-1 text-3xl text-navy-900">
          {value}
        </p>
        <p className="mt-1.5 text-xs text-mute">{hint}</p>
      </div>
    </Link>
  );
}

/* ────────────────────────────────────────────────────────────────
   Bloque: Últimas órdenes
   ──────────────────────────────────────────────────────────────── */

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
};

function RecentOrders({
  orders,
  className,
}: {
  orders: RecentOrder[];
  className?: string;
}) {
  return (
    <SectionCard
      title="Últimas órdenes"
      icon="Inbox"
      action={
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/ordenes?view=todos">Ver todas</Link>
        </Button>
      }
      className={className}
      bodyClassName="p-0"
    >
      {orders.length === 0 ? (
        <EmptyState
          icon="Sparkles"
          title="Todavía no hay ventas"
          description="Cuando llegue tu primera venta va a aparecer acá, con su estado y su total."
        />
      ) : (
        <ul className="divide-y divide-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/ordenes/${o.id}`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-cream-50 md:px-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy-900">
                      {o.customer_name}
                    </p>
                    <p className="num-display mt-0.5 text-xs text-mute">
                      {o.order_number} · {formatDate(o.created_at)}
                    </p>
                  </div>
                  <span className="num-display shrink-0 font-display text-lg text-navy-900">
                    {formatPrice(Number(o.total))}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <OrderStatusChip status={o.status} size="sm" full />
                  <PaymentStatusChip status={o.payment_status} size="sm" full />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   Bloque: Top productos
   ──────────────────────────────────────────────────────────────── */

function TopProducts({
  products,
}: {
  products: Metrics["top_products"];
}) {
  return (
    <SectionCard
      title="Lo más vendido"
      icon="Sparkles"
      bodyClassName={products.length === 0 ? "p-0" : undefined}
    >
      {products.length === 0 ? (
        <EmptyState
          icon="Sparkles"
          title="Sin datos por ahora"
          description="Cuando vendas, acá vas a ver tus productos más pedidos."
        />
      ) : (
        <ol className="space-y-4">
          {products.map((p, idx) => (
            <li
              key={`${p.product_name}-${idx}`}
              className="flex items-center gap-3"
            >
              <span className="num-display font-display w-7 shrink-0 text-xl text-champagne-400">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-navy-900">
                  {p.product_name}
                </p>
                <p className="mt-0.5 text-xs text-mute">
                  {formatNumber(p.units)}{" "}
                  {p.units === 1 ? "unidad" : "unidades"} ·{" "}
                  {formatPrice(Number(p.revenue))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  );
}

/* ────────────────────────────────────────────────────────────────
   Carga de datos
   ──────────────────────────────────────────────────────────────── */

type DbClient = Awaited<ReturnType<typeof createClient>>;

async function fetchMetrics(
  supabase: DbClient,
  period: Period,
): Promise<Metrics | null> {
  const { data, error } = await supabase.rpc("dashboard_metrics", { period });
  if (error || !data) {
    console.error("[dashboard_metrics] error:", error);
    return null;
  }
  return data as unknown as Metrics;
}

async function fetchRecentOrders(supabase: DbClient): Promise<RecentOrder[]> {
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total, status, payment_status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []) as RecentOrder[];
}

async function fetchTasks(supabase: DbClient): Promise<Tasks> {
  // Tres conteos chiquitos (head:true → no traen filas, sólo el número).
  const [preparar, enviar, sinPagar] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "preparing"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["pending", "in_process"])
      .neq("status", "cancelled"),
  ]);

  return {
    preparar: preparar.count ?? 0,
    enviar: enviar.count ?? 0,
    sinPagar: sinPagar.count ?? 0,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
