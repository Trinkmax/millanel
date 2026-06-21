"use client";

import * as React from "react";
import { SITE } from "@/lib/constants";
import type { SiteInfo } from "@/lib/site-info";

/* Hace disponible la info del comercio (resuelta desde Ajustes) a los
   componentes de cliente del sitio público, sin tener que pasarla por
   props por todos lados. El layout (server) la resuelve con getSiteInfo()
   y la inyecta acá. */

const DEFAULT: SiteInfo = {
  name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  url: SITE.url,
  owner: { name: SITE.owner.name, role: SITE.owner.role },
  contact: { ...SITE.contact },
  social: { ...SITE.social },
  maps: { ...SITE.maps },
  payment: {
    mercadopago: true,
    whatsapp: true,
    transfer: true,
    pickup_cash: true,
  },
};

const SiteInfoContext = React.createContext<SiteInfo>(DEFAULT);

export function useSiteInfo() {
  return React.useContext(SiteInfoContext);
}

export function SiteInfoProvider({
  value,
  children,
}: {
  value: SiteInfo;
  children: React.ReactNode;
}) {
  return (
    <SiteInfoContext.Provider value={value}>
      {children}
    </SiteInfoContext.Provider>
  );
}
