import type { Metadata } from "next";
import { Hero } from "@/components/storefront/home/hero";
import { ValueStrip } from "@/components/storefront/home/value-strip";
import { CategoriesGrid } from "@/components/storefront/home/categories-grid";
import { BrandStory } from "@/components/storefront/home/brand-story";
import { EditorialCTA } from "@/components/storefront/home/editorial-cta";
import { SectionHeading } from "@/components/storefront/section-heading";
import { ProductCard } from "@/components/storefront/product-card";
import { AlternativasShowcase } from "@/components/storefront/home/alternativas-showcase";
import { AdvisorTeaser } from "@/components/storefront/home/advisor-teaser";
import { getProducts, getAlternatives } from "@/lib/queries/products";
import { getCategories } from "@/lib/queries/categories";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Millanel Frías — Perfumes, cosmética y cuidado personal. Distribuidora oficial en Santiago del Estero. Envío nacional y retiro en Rivadavia 664.",
};

export const revalidate = 300; // 5 minutes

export default async function HomePage() {
  const [featured, categories, alternatives] = await Promise.all([
    getProducts({ featured: true, limit: 8, hasImage: true }),
    getCategories({ featured: true }),
    getAlternatives(),
  ]);

  return (
    <div className="paper-grain">
      <Hero />
      <ValueStrip />

      {/* Asesoría de aroma — guided scent-finder entry point */}
      <AdvisorTeaser />

      {/* Featured products */}
      <section className="container-page py-20 md:py-28">
        <SectionHeading
          eyebrow="Edición N°06"
          title={
            <>
              Los más{" "}
              <em className="italic font-normal text-navy-700">queridos</em> de esta temporada
            </>
          }
          description="Una curaduría editorial de las novedades y favoritos del catálogo actual."
          link={{ href: "/productos?destacados=1", label: "Ver todos" }}
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
          {featured.products.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      </section>

      {/* Alternativas — interactive finder (conversion) */}
      {alternatives.length > 0 && (
        <AlternativasShowcase alternatives={alternatives} />
      )}

      {/* Categories */}
      <section className="container-page py-20 md:py-28 border-t border-line">
        <SectionHeading
          eyebrow="Universos Millanel"
          title={
            <>
              Una sección{" "}
              <em className="italic font-normal text-navy-700">para cada momento.</em>
            </>
          }
          description="Perfumes, cosmética, cuidado personal y mucho más — todo organizado para que encuentres lo que buscás."
        />
        <div className="mt-12">
          <CategoriesGrid categories={categories} />
        </div>
      </section>

      <BrandStory />

      <EditorialCTA />
    </div>
  );
}
