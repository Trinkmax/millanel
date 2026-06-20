/* Standalone scoring tests — run with: npx tsx src/lib/asesoria/score.test.ts */
import assert from "node:assert/strict";
import { scoreCandidates, inferSeason } from "./score";
import { EMPTY_ANSWERS } from "./types";
import type { QuizCandidate, QuizAnswers } from "./types";

function cand(
  p: Partial<QuizCandidate> & { id: string; scent_family: string },
): QuizCandidate {
  return {
    id: p.id,
    slug: p.id,
    code: null,
    name: p.name ?? p.id,
    price: 10000,
    sale_price: null,
    promotion: null,
    is_new: false,
    featured: false,
    stock: 10,
    images: [{ path: "x.jpg" }],
    sizes: [],
    tags: [],
    categories: { id: "c", name: "Perfumes", slug: "perfumes-mujer" },
    scent_family: p.scent_family,
    scent_subfamily: null,
    notes_top: [],
    notes_heart: [],
    notes_base: [],
    intensity_tier: p.intensity_tier ?? 2,
    gender_lean: p.gender_lean ?? "femenino",
    occasion: p.occasion ?? [],
    season: p.season ?? [],
    personality_tags: p.personality_tags ?? [],
    inspired_by_name: p.inspired_by_name ?? null,
    inspired_by_brand: p.inspired_by_brand ?? null,
  };
}

const pool: QuizCandidate[] = [
  cand({ id: "n5", name: "Alt N°5", scent_family: "floral", inspired_by_name: "N°5", inspired_by_brand: "Chanel", gender_lean: "femenino", intensity_tier: 2 }),
  cand({ id: "blackopium", name: "Alt Black Opium", scent_family: "gourmand", inspired_by_name: "Black Opium", inspired_by_brand: "YSL", gender_lean: "femenino", intensity_tier: 3, personality_tags: ["magnetica", "coqueta"], occasion: ["noche"], season: ["invierno"] }),
  cand({ id: "sauvage", name: "Alt Sauvage", scent_family: "fresco", inspired_by_name: "Sauvage", inspired_by_brand: "Dior", gender_lean: "masculino", intensity_tier: 2, occasion: ["dia", "diario"], season: ["verano"] }),
  cand({ id: "floralM", name: "Floral masc", scent_family: "floral", gender_lean: "masculino", intensity_tier: 2 }),
  cand({ id: "floralF", name: "Floral fem", scent_family: "floral", gender_lean: "femenino", intensity_tier: 1, occasion: ["dia"], season: ["verano"] }),
];

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log("✓", name);
  } catch (e) {
    console.error("✗", name, "\n", e);
    process.exitCode = 1;
  }
}

test("inferSeason (southern hemisphere)", () => {
  assert.equal(inferSeason(0), "verano");
  assert.equal(inferSeason(6), "invierno");
  assert.equal(inferSeason(3), "otono");
  assert.equal(inferSeason(9), "primavera");
});

test("exact inspired-by match tops the list at 99%", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "femenino", inspiredBy: { name: "Black Opium", brand: "YSL" }, likes: "floral", occasion: "dia", intensity: 1, personality: "elegante" };
  const r = scoreCandidates(pool, a, { season: "verano", limit: 4 });
  assert.equal(r.recommendations[0].product.id, "blackopium");
  assert.equal(r.recommendations[0].isExact, true);
  assert.equal(r.recommendations[0].matchPct, 99);
});

test("normalized exact match ignores accents/case", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "femenino", inspiredBy: { name: "n°5", brand: "Chanel" }, likes: "gourmand", occasion: "noche", intensity: 3, personality: "magnetica" };
  const r = scoreCandidates(pool, a, { season: "invierno", limit: 4 });
  assert.equal(r.recommendations[0].product.id, "n5");
  assert.equal(r.recommendations[0].isExact, true);
});

test("family preference dominates when no exact match", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "femenino", inspiredBy: null, likes: "gourmand", occasion: "noche", intensity: 3, personality: "magnetica" };
  const r = scoreCandidates(pool, a, { season: "invierno", limit: 4 });
  assert.equal(r.recommendations[0].product.scent_family, "gourmand");
  assert.equal(r.archetype.family, "gourmand");
});

test("gender lean ranks same-line above opposite (same family)", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "femenino", likes: "floral", occasion: "dia", intensity: 1, personality: "coqueta" };
  const r = scoreCandidates(pool, a, { season: "verano", limit: 5 });
  const idxFem = r.recommendations.findIndex((x) => x.product.id === "floralF");
  const idxMasc = r.recommendations.findIndex((x) => x.product.id === "floralM");
  assert.ok(idxFem !== -1 && (idxMasc === -1 || idxFem < idxMasc), "femenino floral must outrank masculino floral");
});

test("matchPct always within [60,99]", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "unisex", likes: "floral", occasion: "todo", intensity: 2, personality: "coqueta" };
  const r = scoreCandidates(pool, a, { season: "primavera", limit: 5 });
  assert.ok(r.recommendations.length > 0);
  for (const rec of r.recommendations) {
    assert.ok(rec.matchPct >= 60 && rec.matchPct <= 99, `pct out of range: ${rec.matchPct}`);
  }
});

test("empty pool yields no recommendations but a valid archetype", () => {
  const a: QuizAnswers = { ...EMPTY_ANSWERS, gender: "femenino", likes: "floral", occasion: "dia", intensity: 1, personality: "elegante" };
  const r = scoreCandidates([], a, { season: "verano" });
  assert.equal(r.recommendations.length, 0);
  assert.equal(r.archetype.family, "floral");
});

console.log(`\n${passed} checks passed`);
