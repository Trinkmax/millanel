import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*");
  const map: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value as Record<string, unknown>;
  }
  return map;
}

export async function getSetting<T = Record<string, unknown>>(key: string) {
  const settings = await getSettings();
  return (settings[key] ?? null) as T | null;
}
