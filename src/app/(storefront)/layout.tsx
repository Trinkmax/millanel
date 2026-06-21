import { Suspense } from "react";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { FloatingWhatsApp } from "@/components/storefront/floating-whatsapp";
import { SiteInfoProvider } from "@/components/storefront/site-info-provider";
import { getSiteInfo } from "@/lib/queries/site";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteInfo();

  return (
    <SiteInfoProvider value={site}>
      <Suspense fallback={<div className="h-16 md:h-20 border-b border-line" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense>
        <SiteFooter />
      </Suspense>
      <CartDrawer />
      <FloatingWhatsApp />
    </SiteInfoProvider>
  );
}
