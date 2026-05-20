import { ShippingZoneManager } from "@/components/admin/shipping-zone-manager";
import { createClient } from "@/lib/supabase/server";
import type { ShippingZone } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_zones")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="space-y-2">
        <p className="eyebrow text-mute">{data?.length ?? 0} zonas configuradas</p>
        <h1 className="font-display text-3xl md:text-4xl text-navy-900">
          Zonas de envío
        </h1>
        <p className="text-mute">
          Configurá el costo y los días estimados de envío por zona del país.
        </p>
      </header>
      <ShippingZoneManager initial={(data ?? []) as ShippingZone[]} />
    </div>
  );
}
