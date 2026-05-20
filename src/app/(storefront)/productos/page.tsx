import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { CatalogFilters } from "@/components/storefront/catalog/catalog-filters";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    nuevos?: string;
    destacados?: string;
    promo?: string;
    sort?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todos los productos Millanel — perfumes, cosmética y cuidado personal.",
};

export const revalidate = 300;

export default async function ProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      search: sp.q,
      categorySlug: sp.cat,
      isNew: sp.nuevos === "1",
      featured: sp.destacados === "1",
      promo: sp.promo === "1",
      sort: (sp.sort as "newest") ?? "newest",
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.count / PAGE_SIZE));
  const cat = sp.cat ? categories.find((c) => c.slug === sp.cat) : null;

  return (
    <div className="container-page py-10 md:py-16">
      {/* Header */}
      <div className="max-w-3xl">
        {sp.q ? (
          <SectionHeading
            eyebrow="Búsqueda"
            title={
              <>
                Resultados para{" "}
                <em className="italic font-normal text-navy-700">«{sp.q}»</em>
              </>
            }
            description={`${result.count} productos encontrados`}
          />
        ) : cat ? (
          <SectionHeading
            eyebrow={`Categoría · ${categories.length} secciones`}
            title={cat.name}
            description={cat.description ?? undefined}
          />
        ) : (
          <SectionHeading
            eyebrow="Catálogo completo"
            title={
              <>
                Todo el universo{" "}
                <em className="italic font-normal text-navy-700">Millanel.</em>
              </>
            }
            description="Filtrá por categoría, ordená a tu gusto y descubrí los productos seleccionados de la edición actual."
          />
        )}
      </div>

      <div className="mt-10 md:mt-14 flex flex-col lg:flex-row gap-8 lg:gap-12">
        <Suspense>
          <CatalogFilters categories={categories} totalCount={result.count} />
        </Suspense>

        <div className="flex-1 min-w-0">
          {/* Top meta */}
          <div className="hidden lg:flex items-center justify-between text-xs text-mute mb-6">
            <p>
              <span className="num-display text-navy-900 font-medium">
                {result.count}
              </span>{" "}
              productos
            </p>
            {page > 1 && (
              <p>
                Página {page} de {totalPages}
              </p>
            )}
          </div>

          {result.products.length === 0 ? (
            <EmptyResults />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                {result.products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  current={page}
                  total={totalPages}
                  searchParams={sp}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Pagination({
  current,
  total,
  searchParams,
}: {
  current: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  function makeUrl(page: number) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") p.set(k, v);
    }
    if (page > 1) p.set("page", String(page));
    const q = p.toString();
    return `/productos${q ? `?${q}` : ""}`;
  }

  return (
    <nav className="mt-16 flex items-center justify-between border-t border-line pt-8">
      <Button asChild variant="ghost" size="sm" disabled={current <= 1}>
        <Link
          href={current > 1 ? makeUrl(current - 1) : "#"}
          aria-disabled={current <= 1}
          className={current <= 1 ? "pointer-events-none opacity-30" : ""}
        >
          ← Anterior
        </Link>
      </Button>
      <p className="text-xs text-mute">
        Página <span className="num-display text-navy">{current}</span> de{" "}
        <span className="num-display text-navy">{total}</span>
      </p>
      <Button asChild variant="ghost" size="sm" disabled={current >= total}>
        <Link
          href={current < total ? makeUrl(current + 1) : "#"}
          aria-disabled={current >= total}
          className={current >= total ? "pointer-events-none opacity-30" : ""}
        >
          Siguiente →
        </Link>
      </Button>
    </nav>
  );
}

function EmptyResults() {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-24">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-sky/40">
        <Search className="h-6 w-6 text-navy-700" />
      </div>
      <div className="space-y-2 max-w-md">
        <p className="font-display text-2xl text-navy-900">No encontramos productos</p>
        <p className="text-sm text-mute">
          Intentá con otros filtros o volvé al catálogo completo.
        </p>
      </div>
      <Button asChild>
        <Link href="/productos">
          Ver todo el catálogo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function generateStaticParams() {
  return [];
}
