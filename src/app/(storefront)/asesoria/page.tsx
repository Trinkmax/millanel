import type { Metadata } from "next";
import { getQuizCandidates, getInspiredByOptions } from "@/lib/queries/products";
import { ScentQuiz } from "@/components/storefront/asesoria/scent-quiz";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Asesoría de aroma",
  description:
    "Encontrá tu perfume ideal en 45 segundos. Respondé 5 preguntas y descubrí, entre cientos de fragancias Millanel, las que más van con vos.",
};

export default async function AsesoriaPage() {
  const [candidates, inspiredOptions] = await Promise.all([
    getQuizCandidates(),
    getInspiredByOptions(),
  ]);

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="halo-sky pointer-events-none absolute inset-0" />
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-60" />
      <section className="container-page relative flex min-h-[80vh] flex-col justify-center py-14 md:py-20">
        <ScentQuiz candidates={candidates} inspiredOptions={inspiredOptions} />
      </section>
    </div>
  );
}
