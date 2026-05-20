import { Suspense } from "react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { FloatingWhatsApp } from "@/components/storefront/floating-whatsapp";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16 md:h-20 border-b border-line" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense>
        <SiteFooter />
      </Suspense>
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}
