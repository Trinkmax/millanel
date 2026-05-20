import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/components/admin/image-uploader";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/storefront/product-image";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; status?: string; stock?: string }>;
}

const PAGE_SIZE = 30;

export const dynamic = "force-dynamic";

export default async function AdminProductsList({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (sp.status === "active") query = query.eq("active", true);
  if (sp.status === "inactive") query = query.eq("active", false);
  if (sp.stock === "low") query = query.eq("track_stock", true).lte("stock", 5);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count } = await query;
  const products = (data ?? []) as unknown as {
    id: string;
    name: string;
    code: string | null;
    price: number;
    active: boolean;
    featured: boolean;
    is_new: boolean;
    images: { path: string }[] | null;
    categories: { name: string } | null;
  }[];

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="p-6 md:p-10 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow text-mute">{count ?? 0} productos</p>
          <h1 className="font-display text-3xl md:text-4xl text-navy-900">
            Productos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <form className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-mute" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Buscar..."
              className="pl-10 w-full md:w-64"
            />
          </form>
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </header>

      {/* Filters chips */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip href="/admin/productos" label="Todos" active={!sp.status && !sp.stock} />
        <FilterChip href="/admin/productos?status=active" label="Activos" active={sp.status === "active"} />
        <FilterChip href="/admin/productos?status=inactive" label="Inactivos" active={sp.status === "inactive"} />
        <FilterChip href="/admin/productos?stock=low" label="Bajo stock" active={sp.stock === "low"} />
      </div>

      {products.length === 0 ? (
        <p className="text-center text-mute py-20 italic">No hay productos.</p>
      ) : (
        <div className="rounded-2xl border border-line bg-pearl overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_100px_100px] gap-4 px-5 py-3 text-xs uppercase tracking-[0.16em] text-mute border-b border-line">
            <span></span>
            <span>Producto</span>
            <span>Categoría</span>
            <span>Código</span>
            <span className="text-right">Precio</span>
            <span className="text-right">Estado</span>
          </div>
          <ul className="divide-y divide-line">
            {products.map((p) => {
              const firstImg = Array.isArray(p.images) && p.images.length > 0
                ? p.images[0]
                : null;
              return (
                <li key={p.id}>
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="grid grid-cols-[60px_1fr_auto] md:grid-cols-[60px_1fr_120px_120px_100px_100px] gap-3 md:gap-4 px-4 md:px-5 py-3 items-center hover:bg-cream-50 transition-colors"
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-cream-100">
                      {firstImg ? (
                        <Image
                          src={publicUrl(firstImg.path)}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <ProductImage src={null} alt={p.name} seed={p.id} className="rounded-md" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy-900 truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {p.is_new && <Badge variant="new" className="!text-[8px] !px-1.5">Nuevo</Badge>}
                        {p.featured && (
                          <Badge variant="champagne" className="!text-[8px] !px-1.5">
                            Destacado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="hidden md:block text-xs text-mute truncate">
                      {p.categories?.name ?? "—"}
                    </span>
                    <span className="hidden md:block text-xs text-mute num-display">
                      {p.code ?? "—"}
                    </span>
                    <span className="hidden md:block text-sm text-navy font-medium num-display text-right">
                      {formatPrice(Number(p.price))}
                    </span>
                    <div className="hidden md:flex justify-end">
                      <Badge variant={p.active ? "success" : "soft"}>
                        {p.active ? "activo" : "oculto"}
                      </Badge>
                    </div>
                    <Badge
                      variant={p.active ? "success" : "soft"}
                      className="md:hidden justify-self-end"
                    >
                      {formatPrice(Number(p.price))}
                    </Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild disabled={page <= 1}>
            <Link
              href={`/admin/productos?${new URLSearchParams({
                ...(q && { q }),
                ...(sp.status && { status: sp.status }),
                page: String(page - 1),
              })}`}
              className={page <= 1 ? "pointer-events-none opacity-30" : ""}
            >
              ← Anterior
            </Link>
          </Button>
          <span className="text-xs text-mute">
            Página {page} de {totalPages}
          </span>
          <Button variant="ghost" size="sm" asChild disabled={page >= totalPages}>
            <Link
              href={`/admin/productos?${new URLSearchParams({
                ...(q && { q }),
                ...(sp.status && { status: sp.status }),
                page: String(page + 1),
              })}`}
              className={page >= totalPages ? "pointer-events-none opacity-30" : ""}
            >
              Siguiente →
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-[0.14em] transition-colors ${
        active
          ? "bg-navy text-cream"
          : "bg-cream-100 text-navy-700 hover:bg-cream-200"
      }`}
    >
      {label}
    </Link>
  );
}
