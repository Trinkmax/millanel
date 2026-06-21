import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  AdminPage,
  PageHeader,
  SearchBar,
  EmptyState,
} from "@/components/admin/ui";
import { orderViewByKey, type OrderStatus } from "@/lib/admin/labels";
import { ilikePattern } from "@/lib/admin/search";
import {
  OrdersList,
  type OrderRow,
} from "@/components/admin/orders/orders-list";
import { OrderViewChips } from "@/components/admin/orders/order-view-chips";

interface PageProps {
  searchParams: Promise<{
    view?: string;
    q?: string;
    status?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 30;

export const dynamic = "force-dynamic";

/* Mapeo defensivo: si llega un ?status=<enum> viejo (links guardados,
   marcadores), lo convertimos a la vista nueva más parecida. Así no se
   rompe ningún enlace anterior y la dueña ve siempre el lenguaje nuevo. */
const LEGACY_STATUS_TO_VIEW: Record<OrderStatus, string> = {
  pending: "preparar",
  confirmed: "preparar",
  preparing: "enviar",
  shipped: "todos",
  delivered: "terminados",
  cancelled: "cancelados",
};

export default async function AdminOrdersList({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  // Resolución de la vista activa: ?view= manda; si no, traducimos ?status=.
  const viewKey =
    sp.view ??
    (sp.status ? LEGACY_STATUS_TO_VIEW[sp.status as OrderStatus] : undefined);
  const view = orderViewByKey(viewKey);

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, customer_phone, total, status, payment_status, payment_method, shipping_method, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  // Filtros de la vista (estados de pedido y/o de pago).
  if (view.statuses && view.statuses.length > 0) {
    query = query.in("status", view.statuses);
  }
  if (view.payments && view.payments.length > 0) {
    query = query.in("payment_status", view.payments);
  }
  if (view.excludeStatuses && view.excludeStatuses.length > 0) {
    query = query.not("status", "in", `(${view.excludeStatuses.join(",")})`);
  }

  if (q) {
    // Escapamos el término para que una coma o paréntesis en un nombre no
    // rompa el .or() de PostgREST (antes daba "no encontramos nada" en falso).
    const pat = ilikePattern(q);
    query = query.or(
      `order_number.ilike.${pat},customer_name.ilike.${pat},customer_email.ilike.${pat}`,
    );
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count, error } = await query;
  if (error) console.error("[admin/ordenes] error de consulta:", error);

  const orders = (data ?? []) as OrderRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // Conserva view + q al paginar (sin arrastrar el ?status= viejo).
  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (view.key !== "todos") params.set("view", view.key);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/ordenes?${qs}` : "/admin/ordenes";
  };

  const hasFilter = view.key !== "todos" || q !== "";

  // Volver a la misma vista pero sin búsqueda (para "Limpiar búsqueda").
  const clearSearchHref =
    view.key !== "todos" ? `/admin/ordenes?view=${view.key}` : "/admin/ordenes";

  return (
    <AdminPage>
      <PageHeader
        eyebrow="Tu negocio"
        title="Pedidos"
        subtitle="Acá ves todo lo que entró y en qué anda cada pedido. Tocá uno para abrirlo y seguir su recorrido."
      />

      <div className="space-y-3">
        <OrderViewChips active={view.key} />
        <SearchBar
          placeholder="Buscá por cliente, número de pedido o email…"
          resetParams={["page"]}
        />
      </div>

      {error ? (
        <EmptyState
          icon="TriangleAlert"
          title="Hubo un problema al cargar"
          description="No pudimos traer tus pedidos en este momento. Esperá unos segundos y probá de nuevo."
          className="rounded-2xl border border-line bg-pearl"
        />
      ) : orders.length === 0 ? (
        q !== "" ? (
          <EmptyState
            icon="CircleAlert"
            title="No encontramos pedidos así"
            description={
              <>
                No hay pedidos que coincidan con{" "}
                <span className="font-medium text-navy-800">“{q}”</span>.
                Probá con otro nombre, número o email.
              </>
            }
            action={
              <Button asChild variant="outline" size="md">
                <Link href={clearSearchHref}>Limpiar búsqueda</Link>
              </Button>
            }
            className="rounded-2xl border border-line bg-pearl"
          />
        ) : hasFilter ? (
          <EmptyState
            icon={view.icon}
            title="No hay nada en esta vista"
            description={`${view.hint} Por ahora no tenés pedidos acá. Cambiá de pestaña para ver el resto.`}
            action={
              <Button asChild variant="outline" size="md">
                <Link href="/admin/ordenes">Ver todos los pedidos</Link>
              </Button>
            }
            className="rounded-2xl border border-line bg-pearl"
          />
        ) : (
          <EmptyState
            icon="Inbox"
            title="Todavía no llegó ningún pedido"
            description="Cuando una clienta compre en tu tienda, el pedido aparece acá al toque. Vas a poder confirmarlo, prepararlo y avisarle cuando salga."
            className="rounded-2xl border border-line bg-pearl"
          />
        )
      ) : (
        <>
          <OrdersList orders={orders} />

          {/* Rango amigable + navegación entre páginas */}
          <nav className="flex flex-col items-center gap-3 pt-1 sm:flex-row sm:justify-between">
            <p className="text-xs text-mute">
              Mostrando{" "}
              <span className="num-display font-medium text-navy-800">
                {from}–{to}
              </span>{" "}
              de{" "}
              <span className="num-display font-medium text-navy-800">
                {total}
              </span>{" "}
              {total === 1 ? "pedido" : "pedidos"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  disabled={page <= 1}
                >
                  <Link
                    href={pageHref(Math.max(1, page - 1))}
                    className={
                      page <= 1 ? "pointer-events-none opacity-30" : ""
                    }
                  >
                    Anterior
                  </Link>
                </Button>
                <span className="num-display text-xs text-mute">
                  Página {page} de {totalPages}
                </span>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages}
                >
                  <Link
                    href={pageHref(page + 1)}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-30"
                        : ""
                    }
                  >
                    Siguiente
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </>
      )}
    </AdminPage>
  );
}
