import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Search, ArrowRight } from "lucide-react";
import { CatalogFilters } from "@/components/storefront/catalog/catalog-filters";
import { ProductCard } from "@/components/storefront/product-card";
import { SectionHeading } from "@/components/storefront/section-heading";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/lib/queries/products";
import { getCategories, getCategoryBySlug } from "@/lib/queries/categories";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    nuevos?: string;
    destacados?: string;
    promo?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 24;

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: cat.name,
    description: cat.description ?? `${cat.name} — Millanel Frías`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [allCategories, result] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: slug,
      isNew: sp.nuevos === "1",
      featured: sp.destacados === "1",
      promo: sp.promo === "1",
      sort: (sp.sort as "newest") ?? "newest",
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.count / PAGE_SIZE));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-cream-50/60">
        <div className="container-page py-10 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-mute mb-5"
          >
            <Link href="/" className="hover:text-navy transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/productos" className="hover:text-navy transition-colors">
              Catálogo
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-navy-900">{category.name}</span>
          </nav>
          <SectionHeading
            eyebrow={`${result.count} productos`}
            title={category.name}
            description={category.description ?? undefined}
          />
        </div>
      </section>

      {/* Catalog */}
      <section className="container-page py-10 md:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <Suspense>
            <CatalogFilters categories={allCategories} totalCount={result.count} />
          </Suspense>

          <div className="flex-1 min-w-0">
            {result.products.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-5 py-24">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-sky/40">
                  <Search className="h-6 w-6 text-navy-700" />
                </div>
                <div className="space-y-2 max-w-md">
                  <p className="font-display text-2xl text-navy-900">
                    No hay productos con esos filtros
                  </p>
                  <p className="text-sm text-mute">
                    Probá ajustar la búsqueda o explorá otra categoría.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/productos">
                    Ver todo el catálogo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
                {result.products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <CategoryPagination
                slug={slug}
                current={page}
                total={totalPages}
                sp={sp}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryPagination({
  slug,
  current,
  total,
  sp,
}: {
  slug: string;
  current: number;
  total: number;
  sp: Record<string, string | undefined>;
}) {
  function makeUrl(page: number) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (v && k !== "page") p.set(k, v);
    }
    if (page > 1) p.set("page", String(page));
    const q = p.toString();
    return `/categorias/${slug}${q ? `?${q}` : ""}`;
  }

  return (
    <nav className="mt-16 flex items-center justify-between border-t border-line pt-8">
      <Button asChild variant="ghost" size="sm">
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
      <Button asChild variant="ghost" size="sm">
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
