import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ShippingZone } from "@/lib/supabase/types";

export async function getShippingZones() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipping_zones")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as ShippingZone[];
}
