// ============================================================================
// Sube las fotos de millanel_fotos/ al bucket `product-images` de Supabase y
// puebla products.images (matcheando por products.code = prefijo del filename).
//
// Uso:  node scripts/upload-seed-images.mjs
//
// - Lee NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY de .env.local
// - Solo carga fotos de códigos que EXISTEN en la tabla (las huérfanas se saltan)
// - Guarda la URL PÚBLICA COMPLETA en images[].path (el storefront la usa directo
//   como <Image src>; el publicUrl() del admin la deja pasar tal cual).
// - Idempotente: upsert en storage + set de images. Re-ejecutable sin duplicar.
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const FOTOS_DIR = join(ROOT, "millanel_fotos");
const BUCKET = "product-images";
const STORAGE_FOLDER = "seed";

// ── env ─────────────────────────────────────────────────────────────────────
function loadEnv() {
  const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── agrupar archivos por código (prefijo antes del primer "_") ──────────────
if (!existsSync(FOTOS_DIR)) {
  console.error(`No existe la carpeta ${FOTOS_DIR}. Corré primero descargar_millanel.py`);
  process.exit(1);
}
const files = readdirSync(FOTOS_DIR)
  .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .sort(); // _1 antes que _2 (mismo prefijo)

const byCode = new Map();
for (const f of files) {
  const code = f.split("_")[0];
  if (!byCode.has(code)) byCode.set(code, []);
  byCode.get(code).push(f);
}
const allCodes = [...byCode.keys()];

// ── ¿qué códigos existen en la tabla? ───────────────────────────────────────
const { data: rows, error: qErr } = await supabase
  .from("products")
  .select("id, code, name")
  .in("code", allCodes);
if (qErr) {
  console.error("Error consultando products:", qErr.message);
  process.exit(1);
}
const productByCode = new Map(rows.map((r) => [r.code, r]));

const matched = allCodes.filter((c) => productByCode.has(c));
const unmatched = allCodes.filter((c) => !productByCode.has(c));

console.log(`Carpeta: ${FOTOS_DIR}`);
console.log(`Archivos: ${files.length} · códigos: ${allCodes.length} · con producto: ${matched.length} · sin producto: ${unmatched.length}\n`);

// ── subir + actualizar ──────────────────────────────────────────────────────
// Guardamos el PATH RELATIVO al bucket (ej "seed/foo.jpg") en images[].path.
// El render lo resuelve con publicUrl() (@/lib/storage) → migration-safe.
const ctype = (f) =>
  f.toLowerCase().endsWith(".png") ? "image/png"
  : f.toLowerCase().endsWith(".webp") ? "image/webp"
  : f.toLowerCase().endsWith(".avif") ? "image/avif"
  : "image/jpeg";

let uploadedCount = 0;
let updatedCount = 0;

for (const code of matched) {
  const product = productByCode.get(code);
  const filesForCode = byCode.get(code);
  const images = [];

  for (const f of filesForCode) {
    const storagePath = `${STORAGE_FOLDER}/${f}`;
    const body = readFileSync(join(FOTOS_DIR, f));
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, body, {
        contentType: ctype(f),
        cacheControl: "31536000",
        upsert: true,
      });
    if (upErr) {
      console.log(`  ✗ upload ${f}: ${upErr.message}`);
      continue;
    }
    uploadedCount++;
    images.push({ path: storagePath, alt: product.name });
  }

  if (images.length === 0) continue;
  const { error: updErr } = await supabase
    .from("products")
    .update({ images })
    .eq("id", product.id);
  if (updErr) {
    console.log(`  ✗ update ${code} (${product.name}): ${updErr.message}`);
    continue;
  }
  updatedCount++;
  console.log(`  ✓ ${code} · ${images.length} img · ${product.name}`);
}

console.log(`\n── Resumen ──`);
console.log(`Imágenes subidas: ${uploadedCount}`);
console.log(`Productos actualizados: ${updatedCount}`);
if (unmatched.length) {
  console.log(`\nCódigos SIN producto en el catálogo (fotos no usadas): ${unmatched.length}`);
  console.log(unmatched.join(", "));
}
