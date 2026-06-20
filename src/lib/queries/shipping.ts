import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { ShippingZone } from "@/lib/supabase/types";

/**
 * Public shipping zones. Cookieless + cached. Invalidated via
 * `revalidateTag("shipping")` from the admin shipping mutations.
 */

const REVALIDATE = 300; // seconds

async function _getShippingZones(): Promise<ShippingZone[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ShippingZone[];
}

const getShippingZonesCached = unstable_cache(
  () => _getShippingZones(),
  ["shipping:zones"],
  { tags: ["shipping"], revalidate: REVALIDATE },
);

export async function getShippingZones() {
  try {
    return await getShippingZonesCached();
  } catch {
    return [];
  }
}
