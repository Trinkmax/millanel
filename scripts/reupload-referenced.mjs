// Re-sube (overwrite) todas las fotos referenciadas por productos, desde
// millanel_fotos/ (ya comprimido). Reemplaza las versiones sin comprimir en Storage.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BUCKET = "product-images";
const FOTOS = join(ROOT, "millanel_fotos");
const env = {};
for (const l of readFileSync(join(ROOT, ".env.local"), "utf8").split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: prods } = await supabase.from("products").select("images").eq("active", true);
const paths = new Set();
for (const p of prods ?? []) {
  for (const img of Array.isArray(p.images) ? p.images : []) {
    const path = img?.path;
    if (typeof path === "string" && path.startsWith("seed/")) paths.add(path);
  }
}
console.log(`Fotos referenciadas a re-subir: ${paths.size}`);

let ok = 0, miss = 0;
for (const path of paths) {
  const fp = join(FOTOS, path.replace(/^seed\//, ""));
  if (!existsSync(fp)) { miss++; continue; }
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, readFileSync(fp), { contentType: "image/jpeg", cacheControl: "31536000", upsert: true });
  if (error) console.log("✗", path, error.message);
  else if (++ok % 200 === 0) process.stdout.write(`\r${ok}/${paths.size}`);
}
console.log(`\nRe-subidas: ${ok} · sin archivo local: ${miss}`);
