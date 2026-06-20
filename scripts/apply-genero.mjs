// Aplica la limpieza del workflow (/tmp/clean_alt.json): perfume, marca, género
// (tags + categoría) y short_description, a las alternativas (ALT-{n} y ALT-{n}-RO).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const env = {};
for (const l of readFileSync(join(process.cwd(), ".env.local"), "utf8").split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const clean = JSON.parse(readFileSync("/tmp/clean_alt.json", "utf8"));
const { data: cats } = await supabase.from("categories").select("id, slug");
const catBySlug = new Map((cats ?? []).map((c) => [c.slug, c.id]));

let ok = 0;
for (const it of clean) {
  const cat = it.genero === "hombre" ? "perfumes-hombre" : "perfumes-mujer";
  const marca = it.marca && it.marca !== "—" ? it.marca : null;
  const { error } = await supabase
    .from("products")
    .update({
      alternativa_a: it.perfume || null,
      alternativa_marca: marca,
      tags: ["alternativa", it.genero],
      category_id: catBySlug.get(cat) ?? null,
      short_description: `Alternativa olfativa a ${it.perfume}${marca ? ` de ${marca}` : ""}.`,
    })
    .eq("fragrance_number", it.n)
    .like("code", "ALT-%");
  if (error) console.log("✗", it.n, error.message);
  else ok++;
}
console.log(`Alternativas actualizadas: ${ok}/${clean.length}`);
