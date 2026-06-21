"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MapPin, Sparkles, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { useSiteInfo } from "@/components/storefront/site-info-provider";
import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  categories: Pick<Category, "slug" | "name">[];
}

export function MobileMenu({ categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const site = useSiteInfo();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-100 transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <SheetContent
        side="left"
        hideClose
        className="w-[88vw] max-w-sm flex flex-col gap-0 p-0 bg-cream-50"
      >
        <SheetHeader className="flex flex-row items-center justify-between gap-4 border-b border-line !pt-5 !pb-4">
          <SheetTitle asChild>
            <MillanelWordmark variant="inline" size="sm" />
          </SheetTitle>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="rounded-full p-2 text-mute hover:bg-cream-100 hover:text-navy transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-6 py-6">
          <Link
            href="/asesoria"
            onClick={() => setOpen(false)}
            className="mb-7 flex items-center justify-between gap-3 rounded-2xl border border-navy-100 bg-pearl px-4 py-3.5 shadow-whisper transition-colors hover:border-navy-300"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-cream">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-display text-base leading-tight text-navy-900">
                  Asesoría de aroma
                </span>
                <span className="block text-[11px] text-mute">
                  Encontrá tu perfume en 45 s
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-navy-700" />
          </Link>

          <p className="eyebrow mb-3">Catálogo</p>
          <ul className="flex flex-col gap-0.5">
            <li>
              <NavLink href="/productos" onClick={() => setOpen(false)}>
                Todos los productos
              </NavLink>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <NavLink
                  href={`/categorias/${c.slug}`}
                  onClick={() => setOpen(false)}
                >
                  {c.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-8 mb-3">Conocenos</p>
          <ul className="flex flex-col gap-0.5">
            <li>
              <NavLink href="/sobre" onClick={() => setOpen(false)}>
                Sobre nosotros
              </NavLink>
            </li>
            <li>
              <NavLink href="/contacto" onClick={() => setOpen(false)}>
                Contacto
              </NavLink>
            </li>
            <li>
              <NavLink
                href={`https://wa.me/${site.contact.whatsapp}`}
                target="_blank"
                onClick={() => setOpen(false)}
                className="text-[#1DAE54]"
              >
                <WhatsAppIcon size={14} />
                WhatsApp
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="border-t border-line px-6 py-5 bg-pearl">
          <p className="eyebrow mb-2">Visitanos</p>
          <p className="font-display text-lg text-navy-900 leading-snug">
            {site.contact.address}
            <br />
            <span className="text-mute text-sm font-sans not-italic">
              {site.contact.city}, {site.contact.province}
            </span>
          </p>
          <Link
            href={site.maps.link}
            target="_blank"
            className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-navy-700 link-line"
          >
            <MapPin className="h-3.5 w-3.5" />
            Cómo llegar
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NavLink({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "flex items-center gap-2 rounded-md py-2.5 text-base text-navy-900 transition-colors hover:text-navy-500",
        className,
      )}
    >
      {children}
    </Link>
  );
}
