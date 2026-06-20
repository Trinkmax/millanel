import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Sparkles, Tag, Truck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductImage } from "@/components/storefront/product-image";
import { publicUrl } from "@/lib/storage";
import { parseSizes, minSizePrice } from "@/lib/variants";
import { ProductCard } from "@/components/storefront/product-card";
import { AddToCart } from "@/components/storefront/product/add-to-cart";
import { SectionHeading } from "@/components/storefront/section-heading";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { formatPrice, formatDiscount } from "@/lib/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description:
      product.short_description ?? `${product.name} — Millanel Frías`,
  };
}

function firstImage(images: unknown): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  const first = images[0];
  if (typeof first === "string") return first;
  if (typeof first === "object" && first && "path" in first)
    return (first as { path?: string }).path ?? null;
  return null;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category_id, 4);
  const image = firstImage(product.images);
  const sizes = parseSizes(product.sizes);
  const hasSizes = sizes.length > 0;
  const fromPrice = hasSizes ? minSizePrice(sizes) : product.price;
  const discount =
    !hasSizes && product.sale_price
      ? formatDiscount(product.price, product.sale_price)
      : null;
  const isOutOfPrice = (hasSizes ? fromPrice : product.price) === 0;

  return (
    <article>
      {/* Breadcrumbs */}
      <div className="container-page pt-6 pb-4">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-mute"
        >
          <Link href="/" className="hover:text-navy transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/productos" className="hover:text-navy transition-colors">
            Catálogo
          </Link>
          {product.categories && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/categorias/${product.categories.slug}`}
                className="hover:text-navy transition-colors"
              >
                {product.categories.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Main */}
      <section className="container-page pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-20 items-start">
          {/* Visual */}
          <div className="lg:sticky lg:top-28">
            <div className="relative rounded-2xl overflow-hidden">
              <ProductImage
                src={publicUrl(image)}
                alt={product.name}
                seed={product.id}
                aspect="square"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                {product.is_new && <Badge variant="new">Nuevo</Badge>}
                {discount && <Badge variant="promo">-{discount}%</Badge>}
                {product.promotion && !discount && (
                  <Badge variant="champagne">Promo</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-7">
            <div className="space-y-3">
              {product.categories && (
                <Link
                  href={`/categorias/${product.categories.slug}`}
                  className="eyebrow text-navy-700 hover:text-navy transition-colors"
                >
                  {product.categories.name}
                </Link>
              )}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-navy-900">
                {product.name}
              </h1>
              {product.code && (
                <p className="text-xs uppercase tracking-[0.18em] text-mute-soft">
                  Código {product.code}
                </p>
              )}
              {product.alternativa_a && (
                <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-navy-200 bg-sky-50 px-3 py-1 text-xs text-navy-800">
                  <Sparkles className="h-3 w-3 text-navy-500" />
                  Alternativa a:{" "}
                  <span className="font-medium">
                    {product.alternativa_a}
                    {product.alternativa_marca
                      ? ` de ${product.alternativa_marca}`
                      : ""}
                  </span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-baseline gap-3">
              {isOutOfPrice ? (
                <span className="font-display text-3xl italic text-mute">
                  Consultá disponibilidad
                </span>
              ) : hasSizes ? (
                <span className="font-display text-2xl text-navy-700">
                  Desde{" "}
                  <span className="num-display text-navy">
                    {formatPrice(fromPrice)}
                  </span>
                </span>
              ) : product.sale_price ? (
                <>
                  <span className="font-display text-4xl md:text-5xl text-navy num-display">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-lg text-mute line-through num-display">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-display text-4xl md:text-5xl text-navy num-display">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Promotion */}
            {product.promotion && (
              <div className="rounded-xl border border-blush-200 bg-blush-50 px-4 py-3 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-blush-400 shrink-0 mt-0.5" />
                <p className="text-sm text-navy-900 leading-relaxed">
                  {product.promotion}
                </p>
              </div>
            )}

            {/* Add to cart */}
            <AddToCart product={product} />

            {/* Description */}
            {(product.description || product.short_description) && (
              <div className="space-y-3 pt-2">
                <Separator />
                <p className="eyebrow">Descripción</p>
                <p className="text-base text-navy-900/80 leading-relaxed whitespace-pre-line">
                  {product.description || product.short_description}
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Tag className="h-3.5 w-3.5 text-mute" />
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-[0.18em] text-mute"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Trust */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              <TrustItem
                icon={Truck}
                title="Envío a todo el país"
                desc="Por correo. Tiempo según zona."
              />
              <TrustItem
                icon={ShieldCheck}
                title="Producto original Millanel"
                desc="Distribuidora oficial · Frías"
              />
            </div>

            {product.section && (
              <p className="pt-4 text-xs text-mute-soft italic">
                Catálogo de referencia: {product.section}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-page py-12 md:py-20 border-t border-line">
          <SectionHeading
            eyebrow="También te puede gustar"
            title={
              <>
                Otros{" "}
                <em className="italic font-normal text-navy-700">favoritos</em>
              </>
            }
            link={{
              href: product.categories
                ? `/categorias/${product.categories.slug}`
                : "/productos",
              label: "Ver más",
            }}
          />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
            {related.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

function TrustItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-cream-50 px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-100 text-navy shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-navy-900 leading-tight">
          {title}
        </p>
        <p className="text-xs text-mute leading-snug">{desc}</p>
      </div>
    </div>
  );
}
