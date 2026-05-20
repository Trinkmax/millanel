import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/components/storefront/contact-form";
import { SectionHeading } from "@/components/storefront/section-heading";
import {
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "@/components/brand/social-icons";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Encontranos en ${SITE.contact.address}, ${SITE.contact.city}. WhatsApp, email y mapa.`,
};

export default function ContactPage() {
  return (
    <div>
      <section className="container-page pt-10 md:pt-16 pb-8 md:pb-12">
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="Estamos cerca"
            title={
              <>
                Pasá a saludar,{" "}
                <em className="italic font-normal text-navy-700">
                  o escribinos.
                </em>
              </>
            }
            description="La forma más rápida de contactarnos es por WhatsApp. También respondemos email y atendemos en el local de lunes a sábado."
          />
        </div>
      </section>

      <section className="container-page pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-6">
          <ContactCard
            icon={WhatsAppIcon}
            title="WhatsApp"
            cta="Abrir chat"
            href={`https://wa.me/${SITE.contact.whatsapp}`}
            external
            highlight
          >
            <p className="text-sm text-mute leading-relaxed">
              La mejor forma para consultas rápidas, pedidos personalizados y
              novedades. Respondemos en minutos durante horario comercial.
            </p>
          </ContactCard>

          <ContactCard icon={MapPin} title="Local de Frías">
            <p className="text-sm text-navy-900">
              {SITE.contact.address}
              <br />
              <span className="text-mute">
                {SITE.contact.city}, {SITE.contact.province} ({SITE.contact.postalCode})
              </span>
            </p>
            <Button asChild variant="ghost" size="sm" className="mt-2 -ml-3">
              <a href={SITE.maps.link} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Ver en Google Maps
              </a>
            </Button>
          </ContactCard>

          <ContactCard icon={Clock} title="Horario de atención">
            <p className="text-sm text-navy-900 leading-relaxed">
              {SITE.contact.hours}
            </p>
            <p className="text-xs text-mute italic mt-2">
              Pedidos online los 7 días. Despachos según día hábil.
            </p>
          </ContactCard>

          <div className="grid grid-cols-2 gap-3">
            <ContactCardSmall icon={Phone} href={`tel:${SITE.contact.phone}`} label="Teléfono">
              {SITE.contact.phone}
            </ContactCardSmall>
            <ContactCardSmall icon={Mail} href={`mailto:${SITE.contact.email}`} label="Email">
              {SITE.contact.email}
            </ContactCardSmall>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy hover:bg-cream-100 transition-colors"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy hover:bg-cream-100 transition-colors"
            >
              <FacebookIcon size={16} />
            </a>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 space-y-8">
          <Card>
            <CardContent className="p-6 md:p-8 !pt-6">
              <h2 className="font-display text-2xl md:text-3xl text-navy-900 mb-1">
                Mandanos un mensaje
              </h2>
              <p className="text-sm text-mute mb-6">
                Completá el formulario y armamos el mensaje para enviártelo por WhatsApp.
              </p>
              <ContactForm />
            </CardContent>
          </Card>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-line shadow-soft">
            <iframe
              src={SITE.maps.embedSrc}
              width="100%"
              height="420"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Millanel Frías"
              className="block"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  cta,
  href,
  external,
  highlight,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  cta?: string;
  href?: string;
  external?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={highlight ? "bg-navy text-cream border-navy" : undefined}>
      <CardContent className="p-6 !pt-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full ${
              highlight ? "bg-cream/10" : "bg-sky-100"
            }`}
          >
            <Icon className={`h-4 w-4 ${highlight ? "text-cream" : "text-navy"}`} />
          </div>
          <h3
            className={`font-display text-xl ${
              highlight ? "text-cream" : "text-navy-900"
            }`}
          >
            {title}
          </h3>
        </div>
        <div
          className={
            highlight ? "text-cream/85 [&_*]:!text-cream/85 [&_strong]:!text-cream" : ""
          }
        >
          {children}
        </div>
        {cta && href && (
          <Button
            asChild
            variant={highlight ? "champagne" : "outline"}
            size="sm"
            className={highlight ? "!bg-cream !text-navy hover:!bg-blush" : ""}
          >
            <a href={href} target={external ? "_blank" : undefined} rel="noreferrer">
              {cta}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ContactCardSmall({
  icon: Icon,
  href,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-line bg-pearl p-4 hover:border-navy-300 hover:bg-cream-50 transition-colors group"
    >
      <Icon className="h-4 w-4 text-mute mb-2 group-hover:text-navy transition-colors" />
      <p className="eyebrow mb-1">{label}</p>
      <p className="text-sm text-navy-900 break-all">{children}</p>
    </a>
  );
}
