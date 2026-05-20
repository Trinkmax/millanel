import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDateTime } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

const STATUSES = [
  { key: "", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "preparing", label: "En preparación" },
  { key: "shipped", label: "Enviadas" },
  { key: "delivered", label: "Entregadas" },
  { key: "cancelled", label: "Canceladas" },
];

const PAGE_SIZE = 30;

export const dynamic = "force-dynamic";

export default async function AdminOrdersList({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, customer_phone, total, status, payment_status, payment_method, shipping_method, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (sp.status) {
    query = query.eq(
      "status",
      sp.status as
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled",
    );
  }
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`,
    );
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count } = await query;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-mute">{count ?? 0} órdenes</p>
          <h1 className="font-display text-3xl md:text-4xl text-navy-900">
            Órdenes
          </h1>
        </div>
        <form className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="N° orden, cliente o email..."
            className="pl-10"
          />
        </form>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.key}
            href={`/admin/ordenes${s.key ? `?status=${s.key}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-[0.14em] transition-colors ${
              (sp.status ?? "") === s.key
                ? "bg-navy text-cream"
                : "bg-cream-100 text-navy-700 hover:bg-cream-200"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {!data || data.length === 0 ? (
        <p className="text-center text-mute py-20 italic">Sin órdenes.</p>
      ) : (
        <div className="rounded-2xl border border-line bg-pearl overflow-hidden">
          <ul className="divide-y divide-line">
            {data.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/ordenes/${o.id}`}
                  className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto_auto_auto] gap-3 md:gap-6 px-4 md:px-6 py-4 items-center hover:bg-cream-50 transition-colors"
                >
                  <div>
                    <p className="num-display font-medium text-navy text-sm">
                      {o.order_number}
                    </p>
                    <p className="text-[11px] text-mute uppercase tracking-wider mt-0.5">
                      {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {o.customer_name}
                    </p>
                    <p className="text-xs text-mute truncate">
                      {o.customer_email} · {o.customer_phone}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <Badge
                      variant={
                        o.shipping_method === "pickup" ? "sky" : "soft"
                      }
                    >
                      {o.shipping_method === "pickup" ? "Retiro" : "Envío"}
                    </Badge>
                    <Badge variant="outline">{o.payment_method}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Badge variant={o.status === "delivered" ? "success" : "soft"}>
                      {o.status}
                    </Badge>
                  </div>
                  <span className="num-display font-medium text-navy text-lg w-28 text-right">
                    {formatPrice(Number(o.total))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(count ?? 0) > PAGE_SIZE && (
        <nav className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/admin/ordenes?${new URLSearchParams({
                ...(q && { q }),
                ...(sp.status && { status: sp.status }),
                page: String(Math.max(1, page - 1)),
              })}`}
              className={page <= 1 ? "pointer-events-none opacity-30" : ""}
            >
              ← Anterior
            </Link>
          </Button>
          <span className="text-xs text-mute">Página {page}</span>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/admin/ordenes?${new URLSearchParams({
                ...(q && { q }),
                ...(sp.status && { status: sp.status }),
                page: String(page + 1),
              })}`}
              className={
                page * PAGE_SIZE >= (count ?? 0)
                  ? "pointer-events-none opacity-30"
                  : ""
              }
            >
              Siguiente →
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
