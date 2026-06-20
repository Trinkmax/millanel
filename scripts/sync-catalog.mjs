// ============================================================================
// Sincroniza el catálogo OFICIAL (API Millanel) con la DB:
//   - Crea los productos REGULARES que tienen foto pero NO están en la DB
//     (con precio oficial, categoría por reglas, y foto de millanel_fotos/).
//   - Desactiva duplicados: viejos SKU por-tamaño/roll-on de alternativas
//     (01{03,06,10,60}XXXX) que duplican los ALT-{n}.
//   - Productos sin foto se dejan como están.
//
// Requiere sesión:  NX_SESSION=... NX_FINGERPRINT=... node scripts/sync-catalog.mjs [--go]
// ============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GO = process.argv.includes("--go");
const BUCKET = "product-images";
const FOTOS = join(ROOT, "millanel_fotos");
const API = "https://tienda.millanel.com/nexus/rest/manual/items/search-items-with-context";
const IMG_BASE = "https://tienda.millanel.com/nximages/";

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
const NX = process.env.NX_SESSION;
const FP = process.env.NX_FINGERPRINT;
if (!NX || !FP) {
  console.error("Faltan NX_SESSION / NX_FINGERPRINT (sesión del navegador).");
  process.exit(1);
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// ── categorización (porteada de scripts/build-products-sql.ts) ───────────────
const has = (n, rs) => rs.some((r) => r.test(n));
const RULES = [
  { slug: "outlet", test: (_n, s) => /outlet/i.test(s), tags: ["outlet"] },
  { slug: "merchandising", test: (n, s) => /^(merchandising|material de promoci)/i.test(s) || has(n, [/\bbolsa\s+(millanel|obsequio|chic|infantil|rosas|reutilizable|de regalo)/i, /^bolsa /i, /\bnotas de pedido/i, /\bbol[ií]grafo para revendedora/i, /\bcat[aá]logo/i, /\bporta ?plumin/i, /\bsacapuntas/i, /\bpack volante/i]), tags: ["merchandising"] },
  { slug: "barber-shop", test: (n) => /\bbarber\s*shop\b/i.test(n) || /\bafter shave\b/i.test(n) || /\bp[óo]s? afeitad/i.test(n) || /\bjab[oó]n para afeitar/i.test(n), tags: ["hombre", "barber"] },
  { slug: "boxes-sets", test: (n) => /^(box(\s|$)|beauty box|gift box|caja (felicidades|un regalo)|kit de coloraci|kit\b|set\b)/i.test(n), tags: [] },
  { slug: "indumentaria", test: (n) => has(n, [/\bb[oó]xer\b/i, /\bpijama\b/i, /\bsoquete\b/i, /\bmusculosa\b/i, /\bremera\b/i, /\bshort\b/i, /\bcalza\b/i, /\bbombacha\b/i, /\bbufanda\b/i, /\bgorro\b/i, /\bgorra\b/i, /\bcint[oa]\b/i, /juego de s[aá]banas/i, /jgo de toall/i, /\btoall[oó]n/i]), tags: ["indumentaria"] },
  { slug: "mate-y-cocina", test: (n) => has(n, [/\bmate\b/i, /\byerbera/i, /\bazucarera/i, /\bbombilla/i, /\bbolso matero/i, /\bfunda para mate/i, /\bbotella afa/i, /\bhermetico\b/i, /\bhermético\b/i, /\bfrutera\b/i, /\bcopa\b/i, /\bjarra\b/i, /\bensaladera/i, /\blunchera/i, /\bmandolina/i, /\bchurrera/i, /\bflanera/i, /\bcucharas\b/i, /\bhornillo/i, /\besp[aá]tula/i, /\bcopetinero/i, /\bcanasto/i, /\bdispenser/i, /\besponja\b/i, /\bpinche\b/i]), tags: ["cocina"] },
  { slug: "hogar-y-aromas", test: (n) => has(n, [/\baromatizante/i, /\bsahumeri/i, /\bsahumador/i, /\bporta sahumer/i, /\bdifusor/i, /\brepuesto aromatizante/i, /\brepuesto doypack/i, /\brepuesto repelente/i, /\bbasta mosquito/i, /\bpalo santo/i, /\bcitronela\b/i, /\baerosol repelente/i, /\bmuestra aromatizante/i]), tags: ["hogar"] },
  { slug: "accesorios", test: (n) => has(n, [/\bafeitadora\b/i, /\bcargador\b/i, /\borganizador de cables/i, /\bdestornillador/i, /\bset de herramient/i, /\bpinza multi/i, /\bcinta m[eé]trica/i, /\bmini buclera/i, /\bmini planchita/i, /\bsecador (de cabello )?(de viaje|para viaje)?/i, /\bcepillo facial/i, /\bsecador de esmalte/i, /\bporta espiral/i, /\bporta plumin\b/i]), tags: ["tecnologia"] },
  { slug: "accesorios", test: (n) => has(n, [/\bneceser\b/i, /\bmochila/i, /\bmorral/i, /\bbolso\b/i, /\bcartera\b/i, /\bperfumero recargable/i, /\bri[nñ]onera/i]), tags: ["bolsos"] },
  { slug: "maquillaje", test: (n) => has(n, [/\blabial\b/i, /\bbrillo labial/i, /\bgloss\b/i, /\blip ?gloss/i, /\brubor\b/i, /\bpolvo (compacto|trasl)/i, /\bpolvo vol[aá]til/i, /\bsombra\b/i, /\bsombras\b/i, /\bpaleta de sombras/i, /\bdelineador/i, /\beyeliner/i, /\bm[aá]scara de pestañ/i, /\bm[aá]scara para pestañ/i, /\bmascara p\/pest/i, /\bprimer\b/i, /\bbase (l[ií]quida|de maquillaje|satinada|bb cream)/i, /\bbase bb cream/i, /\bcorrector\b/i, /\biluminador/i, /\besmalte\b/i, /\bquita esmalte/i, /\bkit de maquillaje/i, /\bcontouring/i, /\blima (para )?u[nñ]as/i, /\bbrocha\b/i, /\bpincel\b/i, /\besponja (gota|para make up)/i, /\bd[uú]o de sombras/i]), tags: [] },
  { slug: "cabello", test: (n) => has(n, [/\bshampoo\b/i, /\bacondicionador/i, /\bba[nñ]o de crema/i, /\bba[nñ]o l[ií]quido/i, /\bmascarilla capilar/i, /\bcrema para peinar/i, /\bs[eé]rum capilar/i, /\bgel antifrizz/i, /\b[oó]leo (extraordinario|rejuvenecedor)/i, /\bperfume para cabello/i, /\bprotector t[eé]rmico/i, /\bkit de coloraci/i, /\bbrillo extremo/i]), tags: ["cabello"] },
  { slug: "manos-y-pies", test: (n) => has(n, [/crema (para|p\/|cont .* de ) ?manos/i, /\bcrema para pies/i, /\bcrema (corporal )?p\/pies/i, /\bmillanel feet/i, /\bp[eé]dic[oa]\b/i, /\bjab[oó]n p[eé]dico/i, /\bsal p[eé]dica/i, /\bdesodorante p[eé]dico/i]), tags: ["manos-pies"] },
  { slug: "cuidado-facial", test: (n) => has(n, [/crema (para|p\/|cont .* de )? ?rostro/i, /crema facial/i, /crema (anti[\- ]?age|anti edad|antiedad)/i, /\bs[eé]rum facial/i, /\bs[eé]rum (concentrado|iluminador|brillo)/i, /\bespuma de limpieza/i, /\bgel de limpieza/i, /\bleche de limpieza/i, /\bt[oó]nico\b/i, /\bagua micelar/i, /\bbruma\b/i, /\bloci[oó]n desmaquillante/i, /\bcrema cont de ojos/i, /\bcrema gel hidratante/i, /\bb[aá]lsamo (lips care|millanel lips|labial|universal)/i, /\bcrema (gel )?hidratante/i, /\bjab[oó]n micelar/i]), tags: ["facial"] },
  { slug: "cuidado-corporal", test: (n) => has(n, [/\bemulsi[oó]n corporal/i, /\bbody cream/i, /\bcrema corporal/i, /\b[oó]leo (mix )?corporal/i, /\bjab[oó]n cremoso/i, /\bjab[oó]n corporal/i, /\bjab[oó]n l[ií]quido sally/i, /\bjabones manitos/i, /\bgel corporal/i, /\bcrema repelente/i, /\bdeo corporal/i, /\bdesodorante (antitranspirante|p[eé]dico)?/i, /\bantitranspirante/i, /\btalco\b/i, /\baceite corporal/i, /\balcohol en gel/i]), tags: ["cuerpo"] },
  { slug: "perfumes-infantiles", test: (n) => has(n, [/\bmanitos\b/i, /\bsweet carolina\b/i, /\bprincess\b/i, /\bpeppa pig/i, /\bsaja boys/i, /\bk[-\s]?pop/i, /\bp-ni[nñ]as/i, /\bpara ni[nñ]as\b/i, /\bpara beb[eé]s/i, /\binfantil\b/i, /\blol\b/i]), tags: ["infantiles"] },
  { slug: "perfumes-hombre", test: (n) => { const f = /(eau de parfum|eau de toilette|eau de cologne|loci[oó]n|loc\.|loc n|fragancia|perfume|colonia|splash|deluxe|mist)/i.test(n); if (!f) return false; return has(n, [/\bpour homme/i, /\bfor him/i, /\bhombre/i, /\bmasculin[oa]/i, /\bmasc\b/i, /\bmen\b/i, /\bman\b/i, /\bdeluxe brav[ií]o/i, /\bmirage (noir|blue|bourbon)/i, /\buomo/i, /\baventura( origen)?/i, /\bblack (attractive|and red|obsession)/i, /\btempo\b/i, /\bh[eé]roe/i, /\bchampions/i, /\brub[ií] oud/i]); }, tags: ["hombre"] },
  { slug: "perfumes-mujer", test: (n) => /(eau de parfum|eau de toilette|eau de cologne|loci[oó]n|loc\.|loc n|fragancia|perfume|colonia|splash|deluxe|mist|body splash)/i.test(n), tags: ["mujer"] },
];
function pickCategory(name) {
  for (const r of RULES) if (r.test(name, "")) return { slug: r.slug, tags: r.tags ?? [] };
  return { slug: "accesorios", tags: [] };
}

// ── API ──────────────────────────────────────────────────────────────────────
async function apiPage(page) {
  for (let i = 0; i < 8; i++) {
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", Accept: "application/json",
          Origin: "https://tienda.millanel.com", Referer: "https://tienda.millanel.com/",
          "nx-session": NX, "nx-browser-fingerprint": FP,
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120 Safari/537.36",
        },
        body: JSON.stringify({ dataLoadLevel: 2, pageNumber: page, numberPerPage: 51, maxItemsImageCount: 10, searchComparisonMethod: 0, sortMethod: 2 }),
      });
      const d = await r.json();
      const items = (d.itemsResult || []).map((e) => e.item);
      if (items.length) return items;
    } catch {}
    await new Promise((res) => setTimeout(res, 1500));
  }
  return [];
}

// ── run ──────────────────────────────────────────────────────────────────────
const ALT_RE = /^01(03|06|10)\d{4}$|^01600\d{3}$/;

// catálogo oficial
const items = [];
for (let p = 1; p <= 27; p++) {
  const lote = await apiPage(p);
  items.push(...lote);
  process.stdout.write(`\rfetch página ${p}/27 · ${items.length} items   `);
}
console.log();

// índice de fotos local por código
const photosByCode = new Map();
if (existsSync(FOTOS)) {
  for (const f of readdirSync(FOTOS)) {
    if (!/\.(jpe?g|png|webp|avif)$/i.test(f)) continue;
    const code = f.split("_")[0];
    const m = f.match(/_(\d+)\.[a-z]+$/i);
    const idx = m ? parseInt(m[1], 10) : 1;
    if (!photosByCode.has(code)) photosByCode.set(code, new Map());
    const inner = photosByCode.get(code);
    const cur = inner.get(idx);
    if (!cur || (f.includes("_alt-") && !cur.includes("_alt-"))) inner.set(idx, f);
  }
}
const filesOf = (code) => {
  const inner = photosByCode.get(code);
  return inner ? [...inner.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]) : [];
};

// DB
const { data: cats } = await supabase.from("categories").select("id, slug");
const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));
const { data: prods } = await supabase.from("products").select("id, code, slug, name, active");
const dbCodes = new Set((prods ?? []).map((p) => p.code).filter(Boolean));
const dbSlugs = new Set((prods ?? []).map((p) => p.slug));
const normName = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
const dbNames = new Set((prods ?? []).filter((p) => p.active).map((p) => normName(p.name)));

async function uploadAttach(code) {
  const files = filesOf(code);
  const imgs = [];
  for (const f of files) {
    const path = `seed/${f}`;
    if (GO) {
      const { error } = await supabase.storage.from(BUCKET).upload(path, readFileSync(join(FOTOS, f)), { contentType: "image/jpeg", cacheControl: "31536000", upsert: true });
      if (error) console.log(`    ✗ ${f}: ${error.message}`);
    }
    imgs.push({ path, alt: "" });
  }
  return imgs;
}

let creados = 0, sinFotoLocal = 0, desactivados = 0, dupSkip = 0;
const usedSlugs = new Set(dbSlugs);

for (const it of items) {
  const code = (it.codigo || "").trim();
  if (!code || ALT_RE.test(code)) continue; // alternativas las maneja el otro script
  if (dbCodes.has(code)) continue; // ya existe
  if (!photosByCode.has(code)) continue; // solo creamos los que TIENEN foto
  const name = (it.titulo || "").trim();
  if (!name) continue;
  if (dbNames.has(normName(name))) { dupSkip++; continue; } // ya existe con ese nombre
  const price = it.precioFinal?.monto ?? it.precioNetoPrecalculado?.monto ?? 0;
  const { slug: catSlug, tags } = pickCategory(name);
  let slug = slugify(name) || `producto-${code}`;
  if (usedSlugs.has(slug)) slug = `${slug}-${code.slice(-4)}`;
  usedSlugs.add(slug);
  const images = await uploadAttach(code);
  if (!images.length) { sinFotoLocal++; continue; }
  creados++;
  const prod = {
    code, slug, name,
    short_description: (it.textoDeListado || "").slice(0, 280) || null,
    description: (it.descripcion || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000) || null,
    category_id: catBySlug.get(catSlug) ?? null,
    price, sizes: [], tags, images, active: true,
    section: "Catálogo Millanel",
  };
  if (GO) await supabase.from("products").upsert(prod, { onConflict: "code" });
}

// dedup: viejos SKU por-tamaño/roll-on de alternativas todavía activos
const { data: legacy } = await supabase
  .from("products")
  .select("id, code, name")
  .or("code.like.0103%,code.like.0106%,code.like.0110%,code.like.01600%")
  .eq("active", true);
const toOff = (legacy ?? []).filter((p) => /^01(03|06|10)\d{4}$|^01600\d{3}$/.test(p.code ?? ""));
desactivados = toOff.length;
if (toOff.length) {
  console.log(`dedup: desactivar ${desactivados} SKU viejos por-tamaño/roll-on: ${toOff.map((p) => p.code).join(", ")}`);
  if (GO) for (const p of toOff) await supabase.from("products").update({ active: false }).eq("id", p.id);
}

console.log(`\n── ${GO ? "Hecho" : "DRY-RUN"} ──`);
console.log(`Productos regulares creados (con foto): ${creados}`);
console.log(`Saltados por nombre duplicado: ${dupSkip}`);
console.log(`Oficiales con foto pero sin archivo local: ${sinFotoLocal}`);
console.log(`Duplicados (SKU por-tamaño) desactivados: ${desactivados}`);
if (!GO) console.log("Volvé a correr con --go para escribir.");
