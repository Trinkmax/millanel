import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  ArrowRight,
  Truck,
} from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/brand/social-icons";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { SITE } from "@/lib/constants";
import { getCategories } from "@/lib/queries/categories";

export async function SiteFooter() {
  const categories = await getCategories();

  return (
    <footer className="bg-navy text-cream mt-24">
      {/* Decorative top edge */}
      <div className="h-12 bg-cream-50">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="h-12 w-full text-navy"
          aria-hidden
        >
          <path
            d="M0,60 C 240,20 480,0 720,0 C 960,0 1200,20 1440,60 L 1440,60 L 0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand block */}
          <div className="md:col-span-4 space-y-6">
            <MillanelWordmark
              variant="logo"
              tone="dark"
              size="lg"
              href={null}
            />
            <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
              {SITE.description}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={SITE.social.instagram}
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream hover:bg-cream hover:text-navy transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={SITE.social.facebook}
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream hover:bg-cream hover:text-navy transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookIcon size={16} />
              </a>
            </div>
          </div>

          {/* Catálogo */}
          <div className="md:col-span-3">
            <p className="eyebrow text-cream/60 mb-5">Catálogo</p>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="/productos">Todos los productos</FooterLink>
              </li>
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <FooterLink href={`/categorias/${c.slug}`}>{c.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-3 space-y-4">
            <p className="eyebrow text-cream/60 mb-5">Contacto</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-cream/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  {SITE.contact.address}
                  <br />
                  {SITE.contact.city}, {SITE.contact.province}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href={`tel:${SITE.contact.phone.replace(/\s/g, "")}`}
                  className="text-cream/80 hover:text-cream transition-colors"
                >
                  {SITE.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="text-cream/80 hover:text-cream transition-colors"
                >
                  {SITE.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-cream/80">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="text-xs">{SITE.contact.hours}</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="md:col-span-2">
            <p className="eyebrow text-cream/60 mb-5">Más</p>
            <ul className="space-y-2.5">
              <li>
                <FooterLink href="/sobre">Nuestra historia</FooterLink>
              </li>
              <li>
                <FooterLink href="/contacto">Contacto</FooterLink>
              </li>
              <li>
                <FooterLink href={`https://wa.me/${SITE.contact.whatsapp}`} external>
                  WhatsApp
                </FooterLink>
              </li>
            </ul>
            <Link
              href="/productos"
              className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-cream hover:text-blush-200 transition-colors group"
            >
              Ver catálogo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-16 pt-8 border-t border-cream/15 grid grid-cols-2 md:grid-cols-3 gap-6">
          <Trust icon={Truck} title="Envío a todo el país" desc="Andreani · Correo Argentino" />
          <Trust icon={CreditCard} title="MercadoPago" desc="Tarjeta · Transferencia · Efectivo" />
          <Trust icon={MapPin} title="Retiro en Frías" desc="Rivadavia 664, sin cargo" />
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-cream/15 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} Millanel Frías · {SITE.owner.name}.
            Todos los derechos reservados.
          </p>
          <p className="italic font-display text-cream/60">
            Hecho con cariño en Santiago del Estero.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-cream/75 hover:text-cream transition-colors link-line"
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className="text-sm text-cream/75 hover:text-cream transition-colors link-line"
    >
      {children}
    </Link>
  );
}

function Trust({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 shrink-0">
        <Icon className="h-4 w-4 text-cream" />
      </div>
      <div className="space-y-0.5">
        <p className="font-display text-base text-cream leading-tight">
          {title}
        </p>
        <p className="text-xs text-cream/60">{desc}</p>
      </div>
    </div>
  );
}
