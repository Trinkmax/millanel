import Link from "next/link";
import { User } from "lucide-react";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { CartButton } from "@/components/storefront/cart-button";
import { SearchDialog } from "@/components/storefront/search-dialog";
import { MobileMenu } from "@/components/storefront/mobile-menu";
import { getCategories } from "@/lib/queries/categories";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";

export async function SiteHeader() {
  const categories = await getCategories({ featured: true });

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 w-full border-b border-line bg-cream-50/85 backdrop-blur-md">
        <div className="container-page flex h-16 md:h-20 items-center gap-3">
          {/* Mobile menu */}
          <MobileMenu
            categories={[
              ...(await getCategories()).map((c) => ({
                slug: c.slug,
                name: c.name,
              })),
            ]}
          />

          {/* Logo */}
          <div className="flex-1 md:flex-none md:mr-10">
            <MillanelWordmark variant="inline" size="md" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 mr-auto">
            <NavLink href="/productos">Catálogo</NavLink>
            {categories.slice(0, 4).map((c) => (
              <NavLink key={c.slug} href={`/categorias/${c.slug}`}>
                {c.name}
              </NavLink>
            ))}
            <NavLink href="/sobre">Sobre</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <SearchDialog />
            <Link
              href="/ingreso"
              aria-label="Mi cuenta"
              className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-100 transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
            <CartButton />
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-navy-900 hover:text-navy-500 transition-colors relative group"
    >
      {children}
      <span className="absolute inset-x-3 -bottom-0.5 h-[1.5px] bg-navy origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
    </Link>
  );
}
