import {
  OCCASION_SCORES,
  SEASON_SCORES,
  PERSONALITY_SCORES,
  WEIGHTS,
  FAMILY_META,
} from "./families";
import { buildArchetype } from "./archetypes";
import type {
  QuizAnswers,
  QuizCandidate,
  Recommendation,
  QuizResult,
  Season,
  ScentFamily,
} from "./types";

/* ── Recommendation scoring (pure, unit-testable) ─────────────────────────────
   No I/O, no React. The quiz runs this client-side over the ~440-row pool. */

/** Argentina (southern hemisphere). month: 0=Jan … 11=Dec */
export function inferSeason(month: number): Season {
  if (month === 11 || month <= 1) return "verano"; // Dic–Feb
  if (month >= 2 && month <= 4) return "otono"; // Mar–May
  if (month >= 5 && month <= 7) return "invierno"; // Jun–Ago
  return "primavera"; // Sep–Nov
}

export function currentSeason(now: Date = new Date()): Season {
  return inferSeason(now.getMonth());
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

function genderMultiplier(answer: QuizAnswers["gender"], lean: string | null): number {
  if (!answer || answer === "unisex") return 1;
  if (!lean) return 0.85;
  if (lean === answer) return 1;
  if (lean === "unisex") return 0.92;
  return 0.5; // soft penalty for the opposite line — never a hard exclusion
}

function reasonsFor(
  c: QuizCandidate,
  fam: ScentFamily,
  answers: QuizAnswers,
  isExact: boolean,
): string[] {
  const r: string[] = [];
  if (c.inspired_by_name) {
    const ref = `${c.inspired_by_name}${c.inspired_by_brand ? " de " + c.inspired_by_brand : ""}`;
    r.push(isExact ? `Tu match exacto: inspirado en ${ref}` : `Inspirado en ${ref}`);
  }
  if (answers.likes && fam === answers.likes) {
    r.push(`${FAMILY_META[fam].label} — la onda que elegiste`);
  } else {
    r.push(FAMILY_META[fam].description);
  }
  if (answers.occasion === "noche") r.push("Ideal para la noche");
  else if (answers.occasion === "dia") r.push("Perfecto para el día");
  else if (answers.occasion === "diario") r.push("Para todos los días");
  else if (answers.occasion === "todo") r.push("Versátil, va con todo");
  return r.slice(0, 3);
}

export interface ScoreOptions {
  season?: Season;
  limit?: number;
}

interface Scored {
  c: QuizCandidate;
  fam: ScentFamily;
  score: number;
  base: number; // score before the exact-match boost (for %match)
  isExact: boolean;
}

export function scoreCandidates(
  candidates: QuizCandidate[],
  answers: QuizAnswers,
  opts: ScoreOptions = {},
): QuizResult {
  const season = opts.season ?? currentSeason();
  const limit = opts.limit ?? 4;

  // Family seed from the chosen original (Q2): if the user named an original we
  // stock, its family softly boosts the rest of the pool.
  let seededFamily: ScentFamily | null = null;
  if (answers.inspiredBy) {
    const m = candidates.find(
      (c) =>
        c.inspired_by_name &&
        norm(c.inspired_by_name) === norm(answers.inspiredBy!.name),
    );
    if (m?.scent_family) seededFamily = m.scent_family as ScentFamily;
  }

  const scored: Scored[] = [];
  for (const c of candidates) {
    const fam = c.scent_family as ScentFamily | null;
    if (!fam || !(fam in FAMILY_META)) continue;

    let s = 0;

    // Q3 — preferred family (strongest signal)
    if (answers.likes) {
      if (fam === answers.likes) s += WEIGHTS.likes * 3;
      else if (seededFamily && fam === seededFamily) s += WEIGHTS.likes * 1.5;
    } else if (seededFamily && fam === seededFamily) {
      s += WEIGHTS.likes * 2;
    }

    // Q4 — occasion + intensity
    if (answers.occasion) {
      s += WEIGHTS.occasion * (OCCASION_SCORES[answers.occasion][fam] ?? 0);
      if (answers.occasion === "todo" || c.occasion?.includes(answers.occasion)) s += 1;
    }
    if (answers.intensity && c.intensity_tier) {
      s += WEIGHTS.intensity * (3 - Math.abs(answers.intensity - c.intensity_tier));
    }

    // Season — inferred, not asked
    s += WEIGHTS.season * (SEASON_SCORES[season][fam] ?? 0);
    if (c.season?.includes(season) || c.season?.includes("todo")) s += 1;

    // Q5 — personality (tiebreaker) + per-product tag bonus
    if (answers.personality) {
      s += WEIGHTS.personality * (PERSONALITY_SCORES[answers.personality][fam] ?? 0);
      if (c.personality_tags?.includes(answers.personality)) s += 1.5;
    }

    // Gender soft multiplier
    s *= genderMultiplier(answers.gender, c.gender_lean);

    // Nudge photographed products up (better reveal)
    const hasPhoto = Array.isArray(c.images) && (c.images as unknown[]).length > 0;
    if (hasPhoto) s += 0.4;
    // Surface dupes with a clear designer reference — the price-anchor value prop.
    if (c.inspired_by_name) s += 1.8;

    const isExact = !!(
      answers.inspiredBy &&
      c.inspired_by_name &&
      norm(c.inspired_by_name) === norm(answers.inspiredBy.name)
    );

    const base = s;
    if (isExact) s += 100; // force the named original's dupe to the top

    scored.push({ c, fam, score: s, base, isExact });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  // %match: presentation transform. The top picks usually cluster near the max,
  // so a global min/max would print 99% for all of them. Instead we anchor the
  // best non-exact pick and taper by rank (98, 96, 94…) — exact match is always
  // 99. This reads credible without ever changing the ranking.
  const anchor = top.find((x) => !x.isExact)?.base ?? top[0]?.base ?? 1;
  let rank = 0;
  const recommendations: Recommendation[] = top.map((x) => {
    let matchPct: number;
    if (x.isExact) {
      matchPct = 99;
    } else {
      const ratio = anchor > 0 ? x.base / anchor : 1;
      const ceiling = 98 - rank * 2;
      matchPct = Math.round(Math.min(ceiling, 60 + 38 * ratio));
      matchPct = Math.max(72, Math.min(98, matchPct));
      rank++;
    }
    return {
      product: x.c,
      score: x.score,
      matchPct,
      isExact: x.isExact,
      reasons: reasonsFor(x.c, x.fam, answers, x.isExact),
    };
  });

  const topFamily: ScentFamily =
    (recommendations[0]?.product.scent_family as ScentFamily) ??
    answers.likes ??
    seededFamily ??
    "floral";

  return { archetype: buildArchetype(topFamily, answers), recommendations };
}
