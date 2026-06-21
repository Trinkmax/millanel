import { ShippingZoneManager } from "@/components/admin/shipping-zone-manager";
import { AdminPage, PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { ShippingZone } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/* Conteo en español, sin números crudos sueltos. */
function countLabel(n: number): string {
  if (n === 0) return "Sin zonas todavía";
  if (n === 1) return "1 zona de envío";
  return `${n} zonas de envío`;
}

export default async function AdminShippingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_zones")
    .select("*")
    // Desempate estable: si dos zonas comparten sort_order (default 0), el orden
    // no queda indefinido y reordenar con las flechas se ve consistente.
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const zones = (data ?? []) as ShippingZone[];

  return (
    <AdminPage>
      <PageHeader
        eyebrow={countLabel(zones.length)}
        title="Zonas de envío"
        subtitle="Definí a dónde enviás y cuánto cuesta cada zona. Estas son las opciones que ve tu cliente al momento de pagar."
      />
      <ShippingZoneManager initial={zones} />
    </AdminPage>
  );
}
