/**
 * Generates SQL files seeding the products table from the
 * Millanel price list CSV. Outputs one file per chunk so they can be
 * applied via execute_sql.
 *
 *   pnpm tsx scripts/build-products-sql.ts
 *   → writes supabase/seeds/products_001.sql, ...
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import Papa from "papaparse";

interface CsvRow {
  Sección: string;
  Código: string;
  Descripción: string;
  PVR: string;
  PVP: string;
  Promoción: string;
}

const CSV_PATH = join(process.cwd(), "info", "Lista_de_Precios_C06-2026.csv");
const OUT_DIR = join(process.cwd(), "supabase", "seeds");
const CHUNK_SIZE = 100;

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePrice(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/\./g, "").replace(",", ".").trim();
  const n = Number.parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}

function sqlString(v: string | null | undefined): string {
  if (v === null || v === undefined) return "null";
  return "'" + v.replace(/'/g, "''") + "'";
}
function sqlNumber(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "null";
  return v.toFixed(2);
}
function sqlBool(v: boolean): string {
  return v ? "true" : "false";
}
function sqlArray(values: string[]): string {
  if (!values.length) return "'{}'";
  return "array[" + values.map(sqlString).join(",") + "]::text[]";
}
const has = (text: string, words: (RegExp | string)[]) =>
  words.some((w) =>
    typeof w === "string"
      ? text.toLowerCase().includes(w.toLowerCase())
      : w.test(text),
  );

interface Rule {
  slug: string;
  test: (name: string, section: string) => boolean;
  tags?: string[];
}

const RULES: Rule[] = [
  { slug: "outlet", test: (_n, s) => /outlet/i.test(s), tags: ["outlet"] },
  {
    slug: "merchandising",
    test: (n, s) =>
      /^(merchandising|material de promoci)/i.test(s) ||
      has(n, [
        /\bbolsa\s+(millanel|obsequio|chic|infantil|rosas|reutilizable|de regalo)/i,
        /^bolsa /i,
        /\bnotas de pedido/i,
        /\bbol[ií]grafo para revendedora/i,
        /\bestuche portaplumines/i,
        /\bdemo (plastico|plástico|pl)\b/i,
        /\bcat[aá]logo/i,
        /\bporta ?plumin/i,
        /\bsacapuntas/i,
        /\bpack volante/i,
      ]),
    tags: ["merchandising"],
  },
  {
    slug: "barber-shop",
    test: (n) =>
      /\bbarber\s*shop\b/i.test(n) ||
      /\bafter shave\b/i.test(n) ||
      /\bp[óo]s? afeitad/i.test(n) ||
      /\bjab[oó]n para afeitar/i.test(n),
    tags: ["hombre", "barber"],
  },
  {
    slug: "boxes-sets",
    test: (n) =>
      /^(box(\s|$)|beauty box|gift box|caja (felicidades|un regalo)|kit de coloraci|kit\b|set\b)/i.test(
        n,
      ),
    tags: [],
  },
  {
    slug: "indumentaria",
    test: (n) =>
      has(n, [
        /\bb[oó]xer\b/i, /\bpijama\b/i, /\bsoquete\b/i, /\bmusculosa\b/i,
        /\bremera\b/i, /\bshort\b/i, /\bcalza\b/i, /\bbombacha\b/i,
        /\bbufanda\b/i, /\bgorro\b/i, /\bgorra\b/i, /\bcint[oa]\b/i,
        /juego de s[aá]banas/i, /jgo de toall/i, /\btoall[oó]n/i,
      ]),
    tags: ["indumentaria"],
  },
  {
    slug: "mate-y-cocina",
    test: (n) =>
      has(n, [
        /\bmate\b/i, /\byerbera/i, /\bazucarera/i, /\bbombilla/i,
        /\bbolso matero/i, /\bfunda para mate/i, /\bbotella afa/i,
        /\bhermetico\b/i, /\bhermético\b/i, /\bfrutera\b/i, /\bcopa\b/i,
        /\bjarra\b/i, /\bensaladera/i, /\blunchera/i, /\bmandolina/i,
        /\bchurrera/i, /\bflanera/i, /\bpinche para picada/i,
        /\bcucharas medidoras/i, /\bcucharas\b/i,
        /\bfiltro para bombilla/i, /\baceite para hornillo/i,
        /\bhornillo/i, /\bbatidor de silicona/i, /\besp[aá]tula/i,
        /\bcopetinero/i, /\bcanasto/i, /\bdispenser/i, /\blimpia vidrios/i,
        /\besponja\b/i, /\bcepillo 3 en 1/i, /\bpinche\b/i,
        /\bcontenedor a rosca/i,
      ]),
    tags: ["cocina"],
  },
  {
    slug: "hogar-y-aromas",
    test: (n) =>
      has(n, [
        /\baromatizante/i, /\bsahumeri/i, /\bsahumador/i,
        /\bporta sahumer/i, /\bdifusor/i, /\brepuesto aromatizante/i,
        /\brepuesto doypack/i, /\brepuesto repelente/i,
        /\bbasta mosquito/i, /\bbombita para defumaci/i,
        /\bpalo santo/i, /\bpastillas de citronela/i, /\bcitronela\b/i,
        /\baerosol repelente/i, /\bantifiebre\b/i, /\bmuestra aromatizante/i,
      ]),
    tags: ["hogar"],
  },
  {
    slug: "accesorios",
    test: (n) =>
      has(n, [
        /\bafeitadora\b/i, /\bcargador\b/i, /\borganizador de cables/i,
        /\bdestornillador/i, /\bset de herramient/i, /\bpinza multi/i,
        /\bcinta m[eé]trica/i, /\bmini buclera/i, /\bmini planchita/i,
        /\bsecador (de cabello )?(de viaje|para viaje)?/i,
        /\bcepillo facial/i, /\bsecador de esmalte/i,
        /\bmanito sujeta cables/i, /\bporta espiral/i, /\bporta plumin\b/i,
      ]),
    tags: ["tecnologia"],
  },
  {
    slug: "accesorios",
    test: (n) =>
      has(n, [
        /\bneceser\b/i, /\bmochila/i, /\bmorral/i, /\bbolso\b/i,
        /\bcartera\b/i, /\bperfumero recargable/i, /\bri[nñ]onera/i,
      ]),
    tags: ["bolsos"],
  },
  {
    slug: "maquillaje",
    test: (n) =>
      has(n, [
        /\blabial\b/i, /\bbrillo labial/i, /\bbrillo fijador/i,
        /\bgloss\b/i, /\blip ?gloss/i, /\brubor\b/i,
        /\bpolvo (compacto|trasl)/i, /\bpolvo vol[aá]til/i, /\bsombra\b/i,
        /\bsombras\b/i, /\bpaleta de sombras/i, /\bcuarteto de sombras/i,
        /\bdelineador/i, /\beyeliner/i,
        /\bm[aá]scara de pestañ/i, /\bm[aá]scara para pestañ/i,
        /\bmasc p\/ pestañas/i, /\bmascara p\/pest/i,
        /\bprimer\b/i, /\bbase (l[ií]quida|de maquillaje|satinada|bb cream)/i,
        /\bbase bb cream/i, /\bcorrector\b/i, /\biluminador/i,
        /\besmalte\b/i, /\bquita esmalte/i, /\bkit de maquillaje/i,
        /\bcontouring/i, /\bcrema removedora cut[ií]cula/i,
        /\blima (para )?u[nñ]as/i, /\bbrocha\b/i, /\bpincel\b/i,
        /\besponja (gota|para make up)/i, /\barqueador de pesta[nñ]as/i,
        /\bbase de porcelana/i, /\bduo de sombras/i, /\bd[uú]o de sombras/i,
        /\bsombra para parpados/i, /\bperlas tonalizadoras/i,
        /\bmaquillaje (artistico|art[ií]stico|oculta manchas)/i,
        /\bbarra secativa/i, /\bbatidor de silicona/i,
        /\bpinza de depilar/i, /\bguante exfoliante/i, /\bpiedra pomez/i,
      ]),
    tags: [],
  },
  {
    slug: "cabello",
    test: (n) =>
      has(n, [
        /\bshampoo\b/i, /\bacondicionador/i, /\bba[nñ]o de crema/i,
        /\bba[nñ]o l[ií]quido/i, /\bba[nñ]o de burbujas/i,
        /\bmascarilla capilar/i, /\bcrema para peinar/i,
        /\bserum capilar/i, /\bs[eé]rum capilar/i, /\bgel antifrizz/i,
        /\boleo (extraordinario|rejuvenecedor)/i,
        /\b[oó]leo (extraordinario|rejuvenecedor)/i,
        /\bperfume para cabello/i, /\bprotector t[eé]rmico/i,
        /\bkit de coloraci/i, /\bspray\b/i, /\bbrillo extremo/i,
      ]),
    tags: ["cabello"],
  },
  {
    slug: "manos-y-pies",
    test: (n) =>
      has(n, [
        /crema (para|p\/|cont .* de ) ?manos/i, /\bcrema para pies/i,
        /\bcrema (corporal )?p\/pies/i, /\bcrema p\/ pies/i,
        /\bmillanel feet/i, /\bp[eé]dica\b/i, /\bp[eé]dico\b/i,
        /\bjab[oó]n p[eé]dico/i, /\bsal p[eé]dica/i,
        /\bgel exfol\.? p[eé]dico/i, /\bquita esmalte/i,
        /\bcrema removedora cut[ií]cula/i, /\bdesodorante p[eé]dico/i,
      ]),
    tags: ["manos-pies"],
  },
  {
    slug: "cuidado-facial",
    test: (n) =>
      has(n, [
        /crema (para|p\/|cont .* de )? ?rostro/i, /crema facial/i,
        /crema (anti[\- ]?age|anti edad|antiedad)/i,
        /\bs[eé]rum facial/i, /\bserum facial/i,
        /\bs[eé]rum (concentrado|iluminador|brillo)/i,
        /\bserum (concentrado|iluminador|brillo)/i, /\bbooster\b/i,
        /\bespuma de limpieza/i, /\bgel de limpieza/i,
        /\bleche de limpieza/i, /\bt[oó]nico\b/i,
        /\bagua micelar/i, /\bbruma\b/i, /\bgel descongestivo/i,
        /\bpads descongestivos/i, /\broll on para bolsas/i,
        /\bloci[oó]n desmaquillante/i, /\bgel exfoliante para rostro/i,
        /\bcrema cont de ojos/i, /\bcrema gel hidratante/i,
        /\bbalsamo lips care/i,
        /\bb[aá]lsamo (lips care|millanel lips|labial|universal)/i,
        /\bcrema (gel )?hidratante/i, /\bjab[oó]n micelar/i,
        /\bjab[oó]n secativo facial/i, /\bgel secativo puntual/i,
        /\bdispenser autom[aá]tico millanel home/i,
      ]),
    tags: ["facial"],
  },
  {
    slug: "cuidado-corporal",
    test: (n) =>
      has(n, [
        /\bemulsi[oó]n corporal/i, /\bbody cream/i, /\bcrema corporal/i,
        /\b[oó]leo (mix )?corporal/i, /\bjab[oó]n cremoso/i,
        /\bjab[oó]n corporal/i, /\bjab[oó]n exfoliante corporal/i,
        /\bjab[oó]n l[ií]quido sally/i, /\bjabones manitos/i,
        /\bjabón corporal para celulitis/i, /\bgel corporal/i,
        /\bcrema repelente/i, /\bpouch basta mosquito/i,
        /\bdeo corporal/i,
        /\bdesodorante (antitranspirante|p[eé]dico)?/i,
        /\bantitranspirante/i, /\btalco\b/i, /\baceite corporal/i,
        /\b[oó]leo calc[aá]reo/i, /\bquita esmalte/i,
        /\balcohol en gel/i, /\bemulsi[oó]n manos y cuerpo/i,
      ]),
    tags: ["cuerpo"],
  },
  {
    slug: "perfumes-infantiles",
    test: (n) =>
      has(n, [
        /\bmanitos\b/i, /\bsweet carolina\b/i, /\bprincess\b/i,
        /\bpeppa pig/i, /\bsaja boys/i, /\bk[-\s]?pop/i,
        /\bp-ni[nñ]as/i, /\bpara ni[nñ]as\b/i, /\bpara beb[eé]s/i,
        /\binfantil\b/i, /\blol\b/i,
      ]),
    tags: ["infantiles"],
  },
  {
    slug: "perfumes-hombre",
    test: (n) => {
      const isFragrance =
        /(eau de parfum|eau de toilette|eau de cologne|loci[oó]n|loc\.|loc n|fragancia|perfume|colonia|splash|deluxe|mist)/i.test(
          n,
        );
      if (!isFragrance) return false;
      return has(n, [
        /\bpour homme/i, /\bfor him/i, /\bhombre/i,
        /\bmasculin[oa]/i, /\bmasc\b/i, /\bmen\b/i, /\bman\b/i,
        /\bdeluxe brav[ií]o/i, /\bdeluxe poderoso/i,
        /\bdeluxe party men/i, /\bdeluxe platinum/i,
        /\bmirage (noir|blue|bourbon)/i, /\bboreal/i, /\buomo/i,
        /\bcosta azul/i, /\baventura( origen)?/i, /\binfinity\b/i,
        /\bblack (attractive|and red|obsession)/i, /\btempo\b/i,
        /\bh[eé]roe/i, /\belement\b/i, /\binstinto urbano/i,
        /\bkroma blue/i, /\bchampions/i, /\bnitro\b/i, /\bhalimah/i,
        /\beau de cologne champions/i, /\bbody splash george/i,
        /\bbody splash champions/i, /\bagua de colonia masculina/i,
        /\bf by florencia pe/i, /\bf magn[eé]tica/i,
        /\buno x/i, /\brub[ií] oud/i,
      ]);
    },
    tags: ["hombre"],
  },
  {
    slug: "perfumes-mujer",
    test: (n) =>
      /(eau de parfum|eau de toilette|eau de cologne|loci[oó]n|loc\.|loc n|fragancia|perfume|colonia|splash|deluxe|mist|body splash)/i.test(
        n,
      ),
    tags: ["mujer"],
  },
];

function pickCategory(name: string, section: string) {
  for (const rule of RULES) {
    if (rule.test(name, section)) {
      return { slug: rule.slug, tags: rule.tags ?? [] };
    }
  }
  return { slug: "accesorios", tags: [] };
}

const csvText = readFileSync(CSV_PATH, "utf8");
const parsed = Papa.parse<CsvRow>(csvText, {
  header: true,
  delimiter: ";",
  skipEmptyLines: true,
});

const usedSlugs = new Set<string>();
const usedCodes = new Set<string>();
const records: string[] = [];
const categoryCounts: Record<string, number> = {};
const featuredCounts: Record<string, number> = {};

for (const row of parsed.data) {
  const rawName = row.Descripción?.trim();
  const rawCode = row.Código?.trim();
  if (!rawName || !rawCode) continue;
  if (usedCodes.has(rawCode)) continue;
  if (/\bDEMO\b/i.test(rawName)) continue;
  usedCodes.add(rawCode);

  const section = row.Sección?.trim() ?? "";
  const isNew = /\bNuevo\b/i.test(rawName);
  const cleanName = rawName
    .replace(/\s*-\s*Nuevo\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  let baseSlug = slugify(cleanName) || `producto-${rawCode}`;
  let slug = baseSlug;
  let suffix = 1;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }
  usedSlugs.add(slug);

  const pvp = parsePrice(row.PVP);
  const pvr = parsePrice(row.PVR);
  const promo = row.Promoción?.trim() || null;
  const { slug: categorySlug, tags } = pickCategory(cleanName, section);
  categoryCounts[categorySlug] = (categoryCounts[categorySlug] ?? 0) + 1;

  const isFeatured = isNew && (featuredCounts[categorySlug] ?? 0) < 5;
  if (isFeatured) {
    featuredCounts[categorySlug] = (featuredCounts[categorySlug] ?? 0) + 1;
  }
  const allTags = [...tags];
  if (isNew) allTags.push("nuevo");
  if (promo) allTags.push("promo");

  const sql =
    "(" +
    [
      sqlString(rawCode),
      sqlString(slug),
      sqlString(cleanName),
      sqlString(section || null),
      `(select id from category_lookup where slug = ${sqlString(categorySlug)})`,
      sqlNumber(pvp),
      sqlNumber(pvr || null),
      "null",
      sqlString(promo),
      sqlBool(isFeatured),
      sqlBool(isNew),
      sqlArray(allTags),
    ].join(", ") +
    ")";
  records.push(sql);
}

mkdirSync(OUT_DIR, { recursive: true });

// Clear previous chunks
for (const f of readdirSync(OUT_DIR)) {
  if (/^products(_\d+)?\.sql$/.test(f)) unlinkSync(join(OUT_DIR, f));
}

const chunks: string[][] = [];
for (let i = 0; i < records.length; i += CHUNK_SIZE) {
  chunks.push(records.slice(i, i + CHUNK_SIZE));
}

chunks.forEach((chunk, idx) => {
  const n = String(idx + 1).padStart(3, "0");
  const sql = `with category_lookup as (
  select id, slug from public.categories
)
insert into public.products (
  code, slug, name, section, category_id, price, reference_price, sale_price,
  promotion, featured, is_new, tags
) values
${chunk.join(",\n")}
on conflict (code) do nothing;
`;
  writeFileSync(join(OUT_DIR, `products_${n}.sql`), sql, "utf8");
});

console.error(`✅ Wrote ${records.length} products across ${chunks.length} chunks → ${OUT_DIR}`);
console.error("Category distribution:");
for (const [k, v] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
  console.error(`  ${k.padEnd(22)} ${v}`);
}
