/* ── Asesoría de Aroma — shared domain types ──────────────────────────────────
   Pure types + tiny constants. NOTHING here may import the `server-only` query
   layer, so these modules stay safe to bundle in client components. */

export type ScentFamily =
  | "floral"
  | "amaderado"
  | "oriental"
  | "fresco"
  | "gourmand"
  | "chypre"
  | "fougere";

export type Gender = "femenino" | "masculino" | "unisex";
export type OccasionAnswer = "dia" | "diario" | "noche" | "todo";
export type Personality = "elegante" | "magnetica" | "fresca" | "audaz" | "coqueta";
export type Season = "verano" | "invierno" | "primavera" | "otono";

export interface InspiredRef {
  name: string;
  brand: string;
}

/** A designer original users can pick in Q2 (built from products.inspired_by_*). */
export interface InspiredOption {
  name: string;
  brand: string | null;
  count: number;
}

export interface QuizAnswers {
  /** Q1 — línea / para quién (also the soft gender lean for scoring). */
  gender: Gender | null;
  /** Q2 — a designer original the user already loves (the "dupe killer"); null = skipped. */
  inspiredBy: InspiredRef | null;
  /** Q3 — preferred scent family. */
  likes: ScentFamily | null;
  /** Q4 — occasion (carries intensity, see OCCASION_INTENSITY). */
  occasion: OccasionAnswer | null;
  intensity: 1 | 2 | 3 | null;
  /** Q5 — what they want to project → archetype. */
  personality: Personality | null;
  /** Optional, set on the intro screen — light gift mode. */
  isGift: boolean;
}

export const EMPTY_ANSWERS: QuizAnswers = {
  gender: null,
  inspiredBy: null,
  likes: null,
  occasion: null,
  intensity: null,
  personality: null,
  isGift: false,
};

/** Lean product DTO for the quiz — structurally satisfies <ProductCard> AND
 *  carries the scent columns the scorer needs. A narrow, explicit shape (not the
 *  full products row) so we don't ship descriptions / search_vector to the client. */
export interface QuizCandidate {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  price: number;
  sale_price: number | null;
  promotion: string | null;
  is_new: boolean;
  featured: boolean;
  stock: number;
  images: unknown;
  sizes: unknown;
  tags: string[];
  categories: { id: string; name: string; slug: string } | null;
  scent_family: string | null;
  scent_subfamily: string | null;
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  intensity_tier: number | null;
  gender_lean: string | null;
  occasion: string[];
  season: string[];
  personality_tags: string[];
  inspired_by_name: string | null;
  inspired_by_brand: string | null;
}

export interface Archetype {
  /** family-derived id */
  id: ScentFamily;
  name: string;
  tagline: string;
  description: string;
  family: ScentFamily;
}

export interface Recommendation {
  product: QuizCandidate;
  score: number;
  /** Presentation-only 60–99 "match" figure. */
  matchPct: number;
  /** True when it matched the designer original chosen in Q2. */
  isExact: boolean;
  reasons: string[];
}

export interface QuizResult {
  archetype: Archetype;
  recommendations: Recommendation[];
}
