import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Quote, Sparkles, Heart, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MillanelMark } from "@/components/brand/millanel-mark";
import { getSiteInfo } from "@/lib/queries/site";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteInfo();
  return {
    title: "Sobre nosotros",
    description: `Conocé la historia detrás de ${site.name}, distribuidora oficial Millanel atendida por ${site.owner.name}.`,
  };
}

export default async function AboutPage() {
  const site = await getSiteInfo();

  return (
    <div className="paper-grain">
      {/* Hero */}
      <section className="container-page pt-12 md:pt-20 pb-12 md:pb-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-12 bg-navy-200" />
            <span className="eyebrow">Nuestra historia</span>
            <span className="h-px w-12 bg-navy-200" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight text-navy-900">
            Belleza{" "}
            <em className="italic font-normal text-navy-700">cercana,</em>
            <br />
            cuidada y nuestra.
          </h1>
          <p className="text-lg text-mute leading-relaxed max-w-2xl mx-auto">
            En el corazón de Frías, una distribuidora con la calidad de Millanel y la atención personal que sólo da quien hace las cosas con amor.
          </p>
        </div>
      </section>

      {/* Photo + intro */}
      <section className="container-page py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="absolute -inset-4 md:-inset-6 rounded-[24px] bg-sky-100 -rotate-3" />
              <div className="absolute -inset-3 md:-inset-4 rounded-[22px] bg-blush-100 rotate-2" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] shadow-deep">
                <Image
                  src="/cintia.jpg"
                  alt={site.owner.name}
                  fill
                  sizes="(max-width: 1024px) 80vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Quote className="h-8 w-8 text-champagne-300" />
            <p className="font-display text-3xl md:text-4xl leading-snug tracking-tight text-navy-900">
              Soy <em className="italic text-navy-700">{site.owner.name}</em>. Hace más de doce años elijo, pruebo y comparto los productos Millanel con quienes me confían sus rutinas de belleza.
            </p>
            <div className="space-y-4 text-base text-mute leading-relaxed">
              <p>
                Lo que empezó como un proyecto chico se transformó en un punto de
                encuentro: un local donde cada quien encuentra su perfume favorito,
                la crema que la mamá pidió o ese regalo perfecto para sorprender.
              </p>
              <p>
                Atender en {site.contact.address} es atender en casa: con tiempo, con
                pruebas, con consejos honestos y con la confianza de saber que
                detrás de cada producto hay una historia.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <MillanelMark size={24} className="text-navy-700" />
              <span className="font-display italic text-lg text-navy-700">
                Cintia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-cream-50">
        <div className="container-page py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <Stat number="+12" label="años acompañándote" />
          <Stat number="+550" label="productos en catálogo" />
          <Stat number="+5K" label="pedidos despachados" />
          <Stat number="24" label="provincias alcanzadas" />
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <p className="eyebrow">Lo que nos guía</p>
          <h2 className="font-display text-4xl md:text-5xl text-navy-900 leading-tight">
            Tres valores{" "}
            <em className="italic font-normal text-navy-700">
              que no negociamos.
            </em>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <Value
            icon={Sparkles}
            title="Curaduría honesta"
            desc="Sólo recomendamos lo que probamos y queremos. No vendemos lo que no usaríamos."
          />
          <Value
            icon={Heart}
            title="Atención personal"
            desc="Detrás del WhatsApp hay una persona — yo, Cintia — escuchando y respondiendo."
          />
          <Value
            icon={MapPin}
            title="De Frías al país"
            desc="Una marca con identidad local que viaja con cariño a cualquier provincia."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-[28px] bg-navy text-cream px-8 md:px-16 py-16 md:py-20 text-center">
          <div className="paper-grain absolute inset-0 opacity-40" />
          <div className="relative space-y-6 max-w-2xl mx-auto">
            <p className="eyebrow text-cream/60">Vení a conocernos</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              ¿Pasás por Frías esta semana?
            </h2>
            <p className="text-cream/70 leading-relaxed">
              Te recibimos en {site.contact.address}. Probá los perfumes, llevate
              muestras y contale a Cintia lo que estás buscando.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button asChild size="lg" className="!bg-cream !text-navy hover:!bg-blush">
                <Link href="/contacto">
                  <MapPin className="h-4 w-4" />
                  Cómo llegar
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="!border-cream/30 !text-cream hover:!bg-cream/10">
                <Link href="/productos">
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-1">
      <p className="font-display text-5xl md:text-6xl text-navy num-display leading-none">
        {number}
      </p>
      <p className="eyebrow text-mute">{label}</p>
    </div>
  );
}

function Value({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-sky-100 text-navy">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-2xl text-navy-900 leading-tight">
        {title}
      </h3>
      <p className="text-base text-mute leading-relaxed">{desc}</p>
    </div>
  );
}
