import "server-only";
import { SITE } from "@/lib/constants";
import { getSettings } from "@/lib/queries/settings";
import type { SiteInfo } from "@/lib/site-info";

/**
 * Información del comercio resuelta: lo que la dueña cargó en Ajustes
 * (tabla `settings`) por encima de los valores por defecto de SITE. Si un
 * campo está vacío, cae al default — así el sitio nunca queda en blanco y
 * sigue siendo seguro ante migraciones. Hereda el cacheo cookieless de
 * getSettings (tag "settings", revalida cada 300s), así no fuerza render
 * dinámico en las páginas públicas.
 */

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export async function getSiteInfo(): Promise<SiteInfo> {
  const settings = await getSettings();
  const store = settings.store ?? {};
  const contact = settings.contact ?? {};
  const payment = settings.payment ?? {};

  return {
    name: str(store.name, SITE.name),
    tagline: str(store.tagline, SITE.tagline),
    description: str(store.description, SITE.description),
    url: SITE.url,
    owner: { name: SITE.owner.name, role: SITE.owner.role },
    contact: {
      address: str(store.address_street, SITE.contact.address),
      city: str(store.address_city, SITE.contact.city),
      province: str(store.address_province, SITE.contact.province),
      country: SITE.contact.country,
      postalCode: str(store.address_postal_code, SITE.contact.postalCode),
      phone: str(contact.phone, SITE.contact.phone),
      whatsapp: str(contact.whatsapp, SITE.contact.whatsapp),
      email: str(contact.email, SITE.contact.email),
      hours: str(contact.hours, SITE.contact.hours),
    },
    social: {
      instagram: str(contact.instagram, SITE.social.instagram),
      facebook: str(contact.facebook, SITE.social.facebook),
    },
    maps: { embedSrc: SITE.maps.embedSrc, link: SITE.maps.link },
    payment: {
      mercadopago: bool(payment.mercadopago_enabled, true),
      whatsapp: bool(payment.whatsapp_enabled, true),
      transfer: bool(payment.transfer_enabled, true),
      pickup_cash: bool(payment.cash_pickup_enabled, true),
    },
  };
}
