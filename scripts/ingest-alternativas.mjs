// ============================================================================
// Crea/actualiza los productos de la línea "Fragancias Alternativas" Millanel:
// UN producto por número con selector de tamaño (30/60/100 ml), campo
// "Alternativa a:", y enlaza el roll-on (10 ml) por fragrance_number.
//
// Fuente: info/equivalencias_millanel.csv  (verificá/completá ese archivo antes)
// Fotos:  millanel_fotos/  (se suben a product-images/seed/ y se enganchan por N°)
//
// Uso:
//   node scripts/ingest-alternativas.mjs                  # DRY-RUN (no escribe)
//   node scripts/ingest-alternativas.mjs --go             # crea/actualiza productos
//   node scripts/ingest-alternativas.mjs --go --deactivate-legacy
//        # además desactiva (active=false) los viejos productos por-tamaño
//        # (Loc Nº / Loción Alternativa por 30/60/100). Reversible.
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GO = process.argv.includes("--go");
const DEACTIVATE = process.argv.includes("--deactivate-legacy");
const BUCKET = "product-images";

// Precio por tamaño (PVP, editable). Igual para todos los números.
const SIZES = [
  { ml: 30, label: "30 ml", price: 10499.99 },
  { ml: 60, label: "60 ml", price: 14499.99 },
  { ml: 100, label: "100 ml", price: 17999.99 },
];
const ROLLON_PRICE = 2799.99;
const SECTION = "Fragancias Alternativas";

// ── env / client ────────────────────────────────────────────────────────────
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
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── 1. equivalencias del CSV ────────────────────────────────────────────────
function loadEquivalencias() {
  const raw = readFileSync(join(ROOT, "info/equivalencias_millanel.csv"), "utf8");
  const rows = [];
  for (const line of raw.split("\n")) {
    if (!/^\d+;/.test(line)) continue; // saltea header y comentarios (#)
    const [numero, genero, perfume, marca] = line.split(";");
    rows.push({
      numero: parseInt(numero, 10),
      genero: (genero || "").trim(),
      perfume: (perfume || "").trim(),
      marca: (marca || "").trim(),
    });
  }
  return rows;
}

// ── 2. índice de fotos por número (millanel_fotos/) ─────────────────────────
// código = 01 + sizecode(2) + número(4):  03→30ml 06→60ml 10→100ml 60→rollon
function photoIndex() {
  const dir = join(ROOT, "millanel_fotos");
  const idx = new Map(); // numero -> { sizes:[file], rollon:[file] }
  if (!existsSync(dir)) return idx;
  for (const f of readdirSync(dir)) {
    const code = f.split("_")[0];
    if (!/^01(03|06|10|60)\d{4}$/.test(code)) continue;
    const numero = parseInt(code.slice(-4), 10);
    const isRollon = code.slice(2, 4) === "60";
    if (!idx.has(numero)) idx.set(numero, { sizes: [], rollon: [] });
    idx.get(numero)[isRollon ? "rollon" : "sizes"].push(f);
  }
  return idx;
}

async function uploadPhoto(file) {
  const path = `seed/${file}`;
  if (!GO) return path;
  const body = readFileSync(join(ROOT, "millanel_fotos", file));
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) console.log(`    ✗ foto ${file}: ${error.message}`);
  return path;
}

// ── run ──────────────────────────────────────────────────────────────────────
const equivalencias = loadEquivalencias();
const photos = photoIndex();

// categorías por slug
const { data: cats } = await supabase.from("categories").select("id, slug");
const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));
const categoryFor = (genero) =>
  catBySlug.get(genero === "hombre" ? "perfumes-hombre" : "perfumes-mujer") ?? null;

console.log(`Modo: ${GO ? "ESCRITURA" : "DRY-RUN (no escribe; usá --go)"}`);
console.log(`Equivalencias: ${equivalencias.length} · con foto: ${[...photos.keys()].length} números\n`);

let creados = 0, rollons = 0;
for (const eq of equivalencias) {
  const n = eq.numero;
  const ph = photos.get(n);

  // imágenes del producto principal: 100ml, 60ml, 30ml (las que existan)
  const images = [];
  if (ph?.sizes?.length) {
    const ordered = [...ph.sizes].sort(); // 0103.. 0106.. 0110.. → 30,60,100
    for (const f of ordered) images.push({ path: await uploadPhoto(f), alt: `Perfume Alternativo N°${n}` });
  }

  const product = {
    code: `ALT-${n}`,
    slug: `alternativa-n-${n}`,
    name: `Perfume Alternativo N°${n}`,
    short_description: `Alternativa olfativa a ${eq.perfume}${eq.marca ? ` de ${eq.marca}` : ""}.`,
    description: `Fragancia alternativa Millanel N°${n} — alternativa olfativa a ${eq.perfume}${eq.marca ? ` de ${eq.marca}` : ""}. Disponible en 30, 60 y 100 ml.`,
    alternativa_a: eq.perfume || null,
    alternativa_marca: eq.marca || null,
    fragrance_number: n,
    category_id: categoryFor(eq.genero),
    section: SECTION,
    price: SIZES[0].price,
    sizes: SIZES,
    tags: ["alternativa", eq.genero].filter(Boolean),
    images,
    active: true,
  };

  console.log(`  N°${n} · ${eq.perfume}${eq.marca ? ` (${eq.marca})` : ""} · ${eq.genero}${images.length ? ` · ${images.length} foto(s)` : ""}`);
  if (GO) {
    const { error } = await supabase.from("products").upsert(product, { onConflict: "code" });
    if (error) { console.log(`    ✗ ${error.message}`); continue; }
  }
  creados++;

  // roll-on como producto separado, enlazado por fragrance_number
  if (ph?.rollon?.length) {
    const rImages = [];
    for (const f of [...ph.rollon].sort()) rImages.push({ path: await uploadPhoto(f), alt: `Roll-On N°${n}` });
    const rollon = {
      code: `ALT-${n}-RO`,
      slug: `roll-on-n-${n}`,
      name: `Eau de Parfum Roll-On N°${n}`,
      short_description: `Roll-on 10 ml — alternativa olfativa a ${eq.perfume}${eq.marca ? ` de ${eq.marca}` : ""}.`,
      alternativa_a: eq.perfume || null,
      alternativa_marca: eq.marca || null,
      fragrance_number: n,
      category_id: categoryFor(eq.genero),
      section: SECTION,
      price: ROLLON_PRICE,
      sizes: [],
      tags: ["alternativa", "roll-on", eq.genero].filter(Boolean),
      images: rImages,
      active: true,
    };
    console.log(`     ↳ roll-on N°${n}`);
    if (GO) await supabase.from("products").upsert(rollon, { onConflict: "code" });
    rollons++;
  }
}

// ── desactivar productos viejos por-tamaño (opcional) ───────────────────────
if (DEACTIVATE) {
  // Per-size numerados (0103xxxx/0106xxxx/0110xxxx) + genéricos "Loción Alternativa".
  const { data: legacy } = await supabase
    .from("products")
    .select("id, code, name")
    .or("code.like.0103%,code.like.0106%,code.like.0110%")
    .not("code", "like", "ALT-%");
  const toOff = (legacy ?? []).filter((p) => /^01(03|06|10)\d{4}$/.test(p.code ?? ""));
  console.log(`\nDesactivar legacy por-tamaño: ${toOff.length} productos`);
  for (const p of toOff) console.log(`  - ${p.code} ${p.name}`);
  if (GO) {
    for (const p of toOff) await supabase.from("products").update({ active: false }).eq("id", p.id);
  }
}

console.log(`\n── ${GO ? "Hecho" : "Dry-run"} ── productos: ${creados} · roll-ons: ${rollons}`);
if (!GO) console.log("Volvé a correr con --go para escribir (y --deactivate-legacy para apagar los viejos por-tamaño).");
