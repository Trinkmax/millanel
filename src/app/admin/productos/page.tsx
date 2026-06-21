import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/storage";
import { formatPrice, formatNumber } from "@/lib/format";
import { ProductImage } from "@/components/storefront/product-image";
import {
  AdminPage,
  PageHeader,
  SearchBar,
  EmptyState,
} from "@/components/admin/ui";
import { FilterChips } from "@/components/admin/products/filter-chips";
import { CategoryFilter } from "@/components/admin/products/category-filter";
import { ActiveToggle } from "@/components/admin/products/active-toggle";
import { ilikePattern, PG_INT4_MAX } from "@/lib/admin/search";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
    stock?: string;
    categoria?: string;
  }>;
}

const PAGE_SIZE = 30;

export const dynamic = "force-dynamic";

/* Forma cruda de la fila que pedimos a Supabase (imágenes como Json). */
interface ProductRow {
  id: string;
  name: string;
  code: string | null;
  price: number;
  active: boolean;
  featured: boolean;
  is_new: boolean;
  track_stock: boolean;
  stock: number;
  images: { path: string }[] | null;
  categories: { name: string; slug: string } | null;
}

export default async function AdminProductsList({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status;
  const stock = sp.stock;
  const categoria = sp.categoria?.trim() || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const supabase = await createClient();

  // Categorías para el filtro (livianas: sólo nombre + slug).
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });
  const categories = (categoriesData ?? []) as {
    id: string;
    name: string;
    slug: string;
  }[];
  const activeCategory = categoria
    ? categories.find((c) => c.slug === categoria || c.id === categoria)
    : undefined;

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false });

  // Búsqueda real: matchea por nombre O código, y si el texto es un número,
  // también por el número de fragancia (así "212" encuentra la fragancia 212).
  if (q) {
    // Escapamos el término (comillas dobles) para que paréntesis/comas en el
    // nombre no rompan el .or() de PostgREST y devuelva "nada" en falso.
    const pat = ilikePattern(q);
    const ors = [`name.ilike.${pat}`, `code.ilike.${pat}`];
    // Si el texto es un número (y no desborda un int4), también por nº de fragancia.
    if (/^\d+$/.test(q) && Number(q) <= PG_INT4_MAX) {
      ors.push(`fragrance_number.eq.${q}`);
    }
    query = query.or(ors.join(","));
  }

  if (status === "active") query = query.eq("active", true);
  if (status === "inactive") query = query.eq("active", false);
  // "Poco stock": sólo cuenta productos que controlan stock (track_stock).
  if (stock === "low") query = query.eq("track_stock", true).lte("stock", 5);
  // Filtro por categoría (acepta slug o id de la categoría).
  if (activeCategory) query = query.eq("category_id", activeCategory.id);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const { data, count, error } = await query;
  if (error) console.error("[admin/productos] error de consulta:", error);
  const products = (data ?? []) as unknown as ProductRow[];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ¿Hay algún filtro/búsqueda activo? Define qué vacío mostramos.
  const isFiltered = Boolean(q || status || stock || categoria);

  // Helper para armar links de paginación conservando TODOS los filtros.
  function pageHref(target: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (stock) params.set("stock", stock);
    if (categoria) params.set("categoria", categoria);
    params.set("page", String(target));
    return `/admin/productos?${params.toString()}`;
  }

  return (
    <AdminPage>
      <PageHeader
        eyebrow={
          total === 1
            ? "1 producto"
            : `${formatNumber(total)} productos`
        }
        title="Productos"
        subtitle="Buscá por nombre, código o número de fragancia. Mostrá u ocultá un producto sin tener que abrirlo."
        actions={
          <Button asChild>
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" />
              Cargar producto
            </Link>
          </Button>
        }
      />

      {/* Buscador con botón visible. Conserva los otros filtros y resetea page. */}
      <SearchBar
        placeholder="Buscar por nombre, código o número…"
        resetParams={["page"]}
        className="max-w-xl"
      />

      {/* Filtros: chips de estado + selector de categoría. */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterChips />
          <CategoryFilter categories={categories} value={activeCategory?.slug} />
        </div>
        {stock === "low" && (
          <p className="text-xs text-mute">
            Mostramos sólo productos con control de stock cuyo stock es 5 o
            menos. Los que no llevan control no aparecen acá.
          </p>
        )}
      </div>

      {error ? (
        <EmptyState
          icon="TriangleAlert"
          title="Hubo un problema al cargar"
          description="No pudimos traer tus productos en este momento. Esperá unos segundos y probá de nuevo."
        />
      ) : products.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon="Inbox"
            title="No encontramos nada"
            description="No hay productos que coincidan con lo que buscaste. Probá con otras palabras o sacá los filtros."
            action={
              <Button variant="outline" asChild>
                <Link href="/admin/productos">Borrar búsqueda y filtros</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon="Package"
            title="Todavía no hay productos"
            description="Cuando cargues tu primer producto, va a aparecer acá."
            action={
              <Button asChild>
                <Link href="/admin/productos/nuevo">
                  <Plus className="h-4 w-4" />
                  Cargar producto
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <ul className="space-y-2.5">
          {products.map((p) => {
            const firstImg =
              Array.isArray(p.images) && p.images.length > 0
                ? p.images[0]
                : null;
            const lowStock =
              p.track_stock && p.stock <= 5;
            return (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  imageUrl={firstImg ? publicUrl(firstImg.path) : null}
                  lowStock={lowStock}
                />
              </li>
            );
          })}
        </ul>
      )}

      {/* Paginación: conserva q + status + stock + categoria. */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-3 pt-1">
          <Button variant="ghost" size="md" asChild disabled={page <= 1}>
            <Link
              href={pageHref(page - 1)}
              className={page <= 1 ? "pointer-events-none opacity-30" : ""}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          </Button>
          <span className="text-xs text-mute">
            Página {page} de {totalPages}
          </span>
          <Button variant="ghost" size="md" asChild disabled={page >= totalPages}>
            <Link
              href={pageHref(page + 1)}
              className={page >= totalPages ? "pointer-events-none opacity-30" : ""}
              aria-disabled={page >= totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </nav>
      )}
    </AdminPage>
  );
}

/* ── Tarjeta de producto (fila) ───────────────────────────────────────
   La fila entera linkea al producto (por id). El switch de "En la tienda"
   vive encima del Link, pero frena la navegación cuando se lo toca.
   El estado (En la tienda / Oculto) y el precio se ven SIEMPRE, también en
   mobile: nada crítico escondido detrás de un breakpoint. */

function ProductCard({
  product: p,
  imageUrl,
  lowStock,
}: {
  product: ProductRow;
  imageUrl: string | null;
  lowStock: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-pearl shadow-whisper transition-shadow hover:shadow-soft">
      {/* El link cubre la tarjeta para que toda la fila sea tocable. */}
      <Link
        href={`/admin/productos/${p.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Abrir ${p.name}`}
      />

      <div className="relative z-10 flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Miniatura */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-100 sm:h-[72px] sm:w-[72px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={p.name}
              fill
              sizes="72px"
              className="object-cover"
            />
          ) : (
            <ProductImage src={null} alt={p.name} seed={p.id} className="rounded-xl" />
          )}
        </div>

        {/* Datos */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[15px] font-medium text-navy-900">
              {p.name}
            </p>
            {p.is_new && (
              <Badge variant="new" className="!px-1.5 !py-0.5 !text-[9px]">
                Nuevo
              </Badge>
            )}
            {p.featured && (
              <Badge variant="champagne" className="!px-1.5 !py-0.5 !text-[9px]">
                Destacado
              </Badge>
            )}
            {lowStock && (
              <Badge variant="warn" className="!px-1.5 !py-0.5 !text-[9px]">
                Poco stock
              </Badge>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-mute">
            <span className="num-display text-sm font-medium text-navy-700">
              {formatPrice(Number(p.price))}
            </span>
            {p.code && (
              <span className="num-display">Cód. {p.code}</span>
            )}
            {p.categories?.name && (
              <span className="truncate">{p.categories.name}</span>
            )}
          </div>
        </div>

        {/* Acción rápida: switch En la tienda / Oculto. Siempre visible,
            también en mobile. Frena la navegación de la fila. */}
        <div className="shrink-0">
          <ActiveToggle id={p.id} active={p.active} />
        </div>
      </div>
    </div>
  );
}
