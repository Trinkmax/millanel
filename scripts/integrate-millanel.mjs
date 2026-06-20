// ============================================================================
// Integra la data OFICIAL de Millanel (millanel_productos.csv + millanel_fotos/):
//   1. Corrige alternativa_a / alternativa_marca de los ALT-{n} con la
//      equivalencia oficial (extraída de la descripción de cada producto).
//   2. Sube y engancha TODAS las fotos: alternativas por número, productos
//      comunes por código.
//   3. Crea las alternativas oficiales que falten (género=mujer por defecto).
//
// Uso:  node scripts/integrate-millanel.mjs           # DRY-RUN (no escribe)
//       node scripts/integrate-millanel.mjs --go       # escribe
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GO = process.argv.includes("--go");
const ALIGN = process.argv.includes("--align"); // desactivar alternativas fuera del catálogo oficial
const BUCKET = "product-images";
const FOTOS = join(ROOT, "millanel_fotos");

const SIZES = [
  { ml: 30, label: "30 ml", price: 10499.99, sale_price: null },
  { ml: 60, label: "60 ml", price: 14499.99, sale_price: null },
  { ml: 100, label: "100 ml", price: 17999.99, sale_price: null },
];

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

// ── brand split: "Flower Kenzo" -> {perfume:"Flower", marca:"Kenzo"} ─────────
const BRANDS = [
  "Carolina Herrera", "Paco Rabanne", "Giorgio Armani", "Calvin Klein",
  "Christian Dior", "Yves Saint Laurent", "Tommy Hilfiger", "Antonio Banderas",
  "Victoria's Secret", "Jean Paul Gaultier", "Ralph Lauren", "Dolce & Gabbana",
  "Nina Ricci", "Thierry Mugler", "Hugo Boss", "Elizabeth Arden",
  "Estée Lauder", "Paloma Picasso", "Van Cleef", "Issey Miyake",
  "Salvador Dalí", "Jesús del Pozo", "Jesus del Pozo", "Guy Laroche",
  "Ted Lapidus", "Pino Silvestre", "Britney Spears", "Paris Hilton",
  "Donna Karan", "Jennifer Lopez", "Armani", "Dior", "Kenzo", "Cacharel",
  "Lancôme", "Lancome", "Givenchy", "Bvlgary", "Bvlgari", "Guerlain",
  "Chanel", "Davidoff", "Chloé", "Chloe", "Escada", "Gucci", "Shakira",
  "Montana", "Azzaro", "Benetton", "Rochas", "Molyneux", "Revlon",
  "Balenciaga", "Grès", "Gres", "Animale", "Parlux", "Adidas", "Puig",
  "Antonio Puig", "Mexx", "Diesel", "Lacoste", "Burberry", "Versace",
].sort((a, b) => b.length - a.length);

const norm = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();

function splitAlt(s) {
  const raw = (s || "").replace(/´/g, "'").replace(/\s+/g, " ").trim();
  if (!raw) return { perfume: null, marca: null };
  const n = norm(raw);
  for (const b of BRANDS) {
    if (n.endsWith(norm(b))) {
      let perfume = raw.slice(0, raw.length - b.length).trim();
      perfume = perfume.replace(/\s+(de|of)$/i, "").trim();
      return { perfume: perfume || raw, marca: b };
    }
  }
  return { perfume: raw, marca: null };
}

// Heurística de género (la API no lo expone por item a este nivel).
const MEN = [
  "men", "homme", "for men", "pour homme", "masculin", "invictus",
  "one million", "1 million", "ultra male", "le male", "sauvage", "savage",
  "acqua di gio giorgio", "polo", "kouros", "azzaro", "phantom",
  "stronger with you", "bleu", "explorer", "drakkar", "fahrenheit",
  "cool water", "spicebomb", "aventus", "bad boy", "eros", "wanted",
  "dylan blue", "the one for men", "gentleman", "jazz", "minotaure",
  "xeryus", "insense", "heroe", "hero", "mirage", "boss bottled",
  "hugo boss", "212 men", "212 vip men", "212 vip black", "211",
];
function generoFor(perfume, marca) {
  const s = norm(`${perfume || ""} ${marca || ""}`);
  if (/\b(woman|femme|her|she|girl|rose|fleur|blossom|amor|lady|gioia)\b/.test(s))
    return "mujer";
  for (const m of MEN) if (s.includes(norm(m))) return "hombre";
  return "mujer";
}

// ── 1. equivalencias oficiales por número (vía código de la alternativa) ────
const SIZE_RE = /^01(03|06|10)\d{4}$/;
const ROLLON_RE = /^01600\d{3}$/;

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function loadOfficial() {
  const raw = readFileSync(join(ROOT, "millanel_productos.csv"), "utf8").replace(/^﻿/, "");
  const lines = raw.split("\n");
  const origByNum = new Map();
  const officialNums = new Set();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) continue;
    const code = cols[0].trim();
    const alt = (cols[2] || "").trim();
    if (!(SIZE_RE.test(code) || ROLLON_RE.test(code))) continue;
    const n = parseInt(code.slice(-4), 10);
    officialNums.add(n);
    if (alt && !origByNum.has(n)) origByNum.set(n, alt);
  }
  return { origByNum, officialNums };
}

// ── 2. índice de fotos (dedup por código+índice; preferí variante _alt-) ────
function photoIndex() {
  const sizeByNum = new Map(); // num -> Map(idx -> file)
  const rollByNum = new Map();
  const regByCode = new Map(); // code -> Map(idx -> file)
  if (!existsSync(FOTOS)) return { sizeByNum, rollByNum, regByCode };
  for (const f of readdirSync(FOTOS)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(f)) continue;
    const code = f.split("_")[0];
    const im = f.match(/_(\d+)\.[a-z]+$/i);
    const idx = im ? parseInt(im[1], 10) : 1;
    const pick = (map, key) => {
      if (!map.has(key)) map.set(key, new Map());
      const inner = map.get(key);
      const cur = inner.get(idx);
      // preferí el nombre con _alt- (trae el perfume original)
      if (!cur || (f.includes("_alt-") && !cur.includes("_alt-"))) inner.set(idx, f);
    };
    if (SIZE_RE.test(code)) pick(sizeByNum, parseInt(code.slice(-4), 10));
    else if (ROLLON_RE.test(code)) pick(rollByNum, parseInt(code.slice(-4), 10));
    else pick(regByCode, code);
  }
  return { sizeByNum, rollByNum, regByCode };
}

const filesOf = (innerMap) =>
  innerMap ? [...innerMap.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]) : [];

async function upload(file) {
  const path = `seed/${file}`;
  if (GO) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, readFileSync(join(FOTOS, file)), {
        contentType: "image/jpeg",
        cacheControl: "31536000",
        upsert: true,
      });
    if (error) console.log(`    ✗ foto ${file}: ${error.message}`);
  }
  return path;
}
async function imagesFrom(files, alt) {
  const out = [];
  for (const f of files) out.push({ path: await upload(f), alt });
  return out;
}

// ── run ──────────────────────────────────────────────────────────────────────
const { origByNum, officialNums } = loadOfficial();
const { sizeByNum, rollByNum, regByCode } = photoIndex();

const { data: cats } = await supabase.from("categories").select("id, slug");
const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

const { data: prods } = await supabase
  .from("products")
  .select("id, code, fragrance_number, tags");
const altByNum = new Map(); // num -> {id, tags}
const rollByNumDb = new Map();
const regByCodeDb = new Map(); // code -> id
for (const p of prods ?? []) {
  if (p.code?.startsWith("ALT-") && p.code.endsWith("-RO"))
    rollByNumDb.set(p.fragrance_number, p.id);
  else if (p.code?.startsWith("ALT-")) altByNum.set(p.fragrance_number, p);
  else if (p.code) regByCodeDb.set(p.code, p.id);
}

console.log(`Modo: ${GO ? "ESCRITURA" : "DRY-RUN"}`);
console.log(
  `Equivalencias oficiales: ${origByNum.size} · fotos: alt=${sizeByNum.size} nums, rollon=${rollByNum.size}, regulares=${regByCode.size} códigos`,
);
console.log(
  `DB: ${altByNum.size} alternativas, ${rollByNumDb.size} roll-ons, ${regByCodeDb.size} productos comunes\n`,
);

let updEquiv = 0, updFotoAlt = 0, updFotoReg = 0, creadas = 0, updRoll = 0, deact = 0;

// 2a. Alternativas: alinear al catálogo OFICIAL (corregir equivalencia + fotos + crear faltantes)
for (const n of [...officialNums].sort((a, b) => a - b)) {
  const official = origByNum.get(n);
  const { perfume, marca } = splitAlt(official);
  const photos = await imagesFrom(filesOf(sizeByNum.get(n)), `Perfume Alternativo N°${n}`);
  const existing = altByNum.get(n);

  if (existing) {
    const patch = { active: true };
    if (official) {
      patch.alternativa_a = perfume;
      patch.alternativa_marca = marca;
      updEquiv++;
    }
    if (photos.length) {
      patch.images = photos;
      updFotoAlt++;
    }
    if (GO) await supabase.from("products").update(patch).eq("id", existing.id);
  } else {
    creadas++;
    const genero = generoFor(perfume, marca);
    const prod = {
      code: `ALT-${n}`,
      slug: `alternativa-n-${n}`,
      name: `Perfume Alternativo N°${n}`,
      short_description: official
        ? `Alternativa olfativa a ${perfume}${marca ? ` de ${marca}` : ""}.`
        : `Fragancia alternativa Millanel N°${n}.`,
      description: official
        ? `Fragancia alternativa Millanel N°${n} — alternativa olfativa a ${perfume}${marca ? ` de ${marca}` : ""}. Disponible en 30, 60 y 100 ml.`
        : `Fragancia alternativa Millanel N°${n}. Disponible en 30, 60 y 100 ml.`,
      alternativa_a: official ? perfume : null,
      alternativa_marca: official ? marca : null,
      fragrance_number: n,
      category_id:
        catBySlug.get(genero === "hombre" ? "perfumes-hombre" : "perfumes-mujer") ?? null,
      section: "Fragancias Alternativas",
      price: SIZES[0].price,
      sizes: SIZES,
      tags: ["alternativa", genero],
      images: photos,
      active: true,
    };
    if (GO) await supabase.from("products").upsert(prod, { onConflict: "code" });
  }
}

// 2a-bis. Alinear: desactivar las alternativas que NO están en el catálogo oficial.
if (ALIGN) {
  const extra = [...altByNum.entries()].filter(([n]) => !officialNums.has(n));
  deact = extra.length;
  console.log(
    `[align] desactivar ${deact} fuera de catálogo: ${extra.map(([n]) => n).sort((a, b) => a - b).join(", ")}`,
  );
  if (GO)
    for (const [, p] of extra)
      await supabase.from("products").update({ active: false }).eq("id", p.id);
}

// 2b. Roll-ons: fotos
for (const [n, id] of rollByNumDb) {
  const photos = await imagesFrom(filesOf(rollByNum.get(n)), `Roll-On N°${n}`);
  if (!photos.length) continue;
  updRoll++;
  if (GO) await supabase.from("products").update({ images: photos }).eq("id", id);
}

// 2c. Productos comunes: fotos por código
for (const [code, inner] of regByCode) {
  const id = regByCodeDb.get(code);
  if (!id) continue;
  const photos = await imagesFrom(filesOf(inner), "");
  if (!photos.length) continue;
  updFotoReg++;
  if (GO) await supabase.from("products").update({ images: photos }).eq("id", id);
}

console.log(`── ${GO ? "Hecho" : "Dry-run"} ──`);
console.log(`Equivalencias corregidas: ${updEquiv}`);
console.log(`Alternativas con fotos nuevas: ${updFotoAlt}`);
console.log(`Roll-ons con fotos: ${updRoll}`);
console.log(`Productos comunes con fotos: ${updFotoReg}`);
console.log(`Alternativas nuevas creadas: ${creadas}`);
console.log(`Alternativas desactivadas (fuera de catálogo): ${deact}`);
if (!GO)
  console.log(
    "\nVolvé a correr con --go para escribir (+ --align para desactivar las que no están en el catálogo oficial).",
  );
