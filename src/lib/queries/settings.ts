import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Public settings (announcement bar, store info, etc.). Cookieless + cached so
 * it doesn't force dynamic rendering. Settings RLS is `using (true)` for anon,
 * so the cookieless read returns the same data the SSR client did. Invalidated
 * via `revalidateTag("settings")` from `updateSetting`.
 */

const REVALIDATE = 300; // seconds

async function _getSettings(): Promise<Record<string, Record<string, unknown>>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("settings").select("*");
  if (error) throw error;
  const map: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    map[row.key] = row.value as Record<string, unknown>;
  }
  return map;
}

const getSettingsCached = unstable_cache(() => _getSettings(), ["settings:all"], {
  tags: ["settings"],
  revalidate: REVALIDATE,
});

export async function getSettings() {
  try {
    return await getSettingsCached();
  } catch (error) {
    console.error("[settings] query error:", error);
    return {} as Record<string, Record<string, unknown>>;
  }
}

export async function getSetting<T = Record<string, unknown>>(key: string) {
  const settings = await getSettings();
  return (settings[key] ?? null) as T | null;
}
