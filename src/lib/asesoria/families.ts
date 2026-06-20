import type {
  ScentFamily,
  OccasionAnswer,
  Personality,
  Season,
} from "./types";

/* ── Fragrance families: display metadata + scoring tables ─────────────────────
   Tables derived from the Fragrance-Wheel research (occasion / season /
   personality → family fit, 0–3 points). Same canonical family keys the
   backfill wrote to products.scent_family. */

export const FAMILIES: ScentFamily[] = [
  "floral",
  "amaderado",
  "oriental",
  "fresco",
  "gourmand",
  "chypre",
  "fougere",
];

export interface FamilyMeta {
  key: ScentFamily;
  label: string;
  /** short title for option tiles */
  short: string;
  description: string;
  accent: "blush" | "champagne" | "navy" | "sky";
  gradient: string;
  /** lucide icon key, resolved in the UI */
  icon: string;
}

export const FAMILY_META: Record<ScentFamily, FamilyMeta> = {
  floral: {
    key: "floral",
    label: "Floral",
    short: "Floral",
    description: "Rosas, jazmín y pétalos — romántico y luminoso.",
    accent: "blush",
    gradient: "from-blush-100 via-cream-50 to-blush-50",
    icon: "flower",
  },
  gourmand: {
    key: "gourmand",
    label: "Dulce / Gourmand",
    short: "Dulce",
    description: "Vainilla, caramelo y café — goloso y envolvente.",
    accent: "champagne",
    gradient: "from-champagne-100 via-cream-50 to-champagne-50",
    icon: "cake",
  },
  amaderado: {
    key: "amaderado",
    label: "Amaderado",
    short: "Amaderado",
    description: "Sándalo, cedro y vetiver — cálido y con carácter.",
    accent: "champagne",
    gradient: "from-champagne-200 via-cream-100 to-navy-50",
    icon: "tree",
  },
  fresco: {
    key: "fresco",
    label: "Fresco / Cítrico",
    short: "Fresco",
    description: "Cítricos, brisa marina y verde — limpio y vital.",
    accent: "sky",
    gradient: "from-sky-100 via-cream-50 to-sky-50",
    icon: "droplet",
  },
  oriental: {
    key: "oriental",
    label: "Oriental / Especiado",
    short: "Oriental",
    description: "Ámbar, especias e incienso — sensual e intenso.",
    accent: "navy",
    gradient: "from-navy-100 via-cream-50 to-blush-50",
    icon: "flame",
  },
  chypre: {
    key: "chypre",
    label: "Chipre",
    short: "Chipre",
    description: "Cítrico sobre musgo — elegante y sofisticado.",
    accent: "sky",
    gradient: "from-sky-100 via-cream-50 to-champagne-50",
    icon: "gem",
  },
  fougere: {
    key: "fougere",
    label: "Aromático / Fougère",
    short: "Aromático",
    description: "Lavanda y hierbas — clásico y fresco.",
    accent: "sky",
    gradient: "from-sky-100 via-cream-50 to-navy-50",
    icon: "leaf",
  },
};

/** Q3 offers these five; chypre & fougère still surface via the other signals. */
export const FAMILY_CHOICES: ScentFamily[] = [
  "gourmand",
  "floral",
  "amaderado",
  "fresco",
  "oriental",
];

type FamScores = Record<ScentFamily, number>;

// Order: floral, amaderado, oriental, fresco, gourmand, chypre, fougere
const f = (
  floral: number,
  amaderado: number,
  oriental: number,
  fresco: number,
  gourmand: number,
  chypre: number,
  fougere: number,
): FamScores => ({ floral, amaderado, oriental, fresco, gourmand, chypre, fougere });

export const OCCASION_SCORES: Record<OccasionAnswer, FamScores> = {
  dia: f(2, 1, 0, 3, 0, 1, 2),
  diario: f(2, 2, 1, 3, 1, 1, 2),
  noche: f(2, 2, 3, 0, 3, 1, 1),
  todo: f(2, 2, 2, 2, 1, 2, 2),
};

export const SEASON_SCORES: Record<Season, FamScores> = {
  verano: f(2, 1, 0, 3, 0, 1, 2),
  invierno: f(1, 3, 3, 0, 3, 1, 1),
  primavera: f(3, 1, 1, 3, 1, 2, 2),
  otono: f(1, 3, 2, 1, 2, 3, 2),
};

export const PERSONALITY_SCORES: Record<Personality, FamScores> = {
  elegante: f(3, 1, 1, 1, 0, 3, 1),
  magnetica: f(1, 2, 3, 0, 2, 1, 1),
  fresca: f(1, 0, 0, 3, 0, 1, 3),
  audaz: f(0, 3, 3, 0, 1, 2, 2),
  coqueta: f(2, 0, 1, 1, 3, 0, 0),
};

/** Dimension weights — explicit family preference is the strongest signal. */
export const WEIGHTS = {
  likes: 3.0,
  occasion: 2.0,
  season: 2.0,
  intensity: 1.5,
  personality: 1.0,
} as const;
