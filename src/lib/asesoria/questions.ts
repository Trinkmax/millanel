import type { OccasionAnswer } from "./types";
import { FAMILY_META, FAMILY_CHOICES } from "./families";

/* ── Quiz definition (data-driven) ────────────────────────────────────────────
   The UI renders straight from this; logic lives in score.ts. 5 steps. */

export const TOTAL_STEPS = 5;

export type QuestionId = "gender" | "inspired" | "likes" | "occasion" | "personality";

export interface ChoiceOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: string;
  gradient?: string;
}

export interface QuestionDef {
  id: QuestionId;
  step: number;
  eyebrow: string;
  title: string;
  titleEm?: string;
  subtitle?: string;
  kind: "choice" | "inspired";
  columns?: 2 | 3;
  options?: ChoiceOption[];
}

/** Q4 packs occasion + intensity into one tap. */
export const OCCASION_INTENSITY: Record<OccasionAnswer, 1 | 2 | 3> = {
  dia: 1,
  diario: 2,
  noche: 3,
  todo: 2,
};

const genderOptions: ChoiceOption[] = [
  { value: "femenino", label: "Femenina", sublabel: "Para ella", icon: "venus" },
  { value: "masculino", label: "Masculina", sublabel: "Para él", icon: "mars" },
  { value: "unisex", label: "Unisex", sublabel: "Me da igual", icon: "sparkles" },
];

const likesOptions: ChoiceOption[] = FAMILY_CHOICES.map((k) => ({
  value: k,
  label: FAMILY_META[k].short,
  sublabel: FAMILY_META[k].description,
  icon: FAMILY_META[k].icon,
  gradient: FAMILY_META[k].gradient,
}));

const occasionOptions: ChoiceOption[] = [
  { value: "dia", label: "Día / oficina", sublabel: "Sutil y prolija", icon: "sun" },
  { value: "diario", label: "Todos los días", sublabel: "Presente, equilibrada", icon: "coffee" },
  { value: "noche", label: "Noche / salida", sublabel: "Intensa, con estela", icon: "moon" },
  { value: "todo", label: "Para todo", sublabel: "Una que vaya con todo", icon: "infinity" },
];

const personalityOptions: ChoiceOption[] = [
  { value: "elegante", label: "Elegante", sublabel: "Clásica y sofisticada", icon: "gem" },
  { value: "magnetica", label: "Magnética", sublabel: "Sensual e intensa", icon: "flame" },
  { value: "fresca", label: "Fresca y relajada", sublabel: "Natural y luminosa", icon: "droplet" },
  { value: "audaz", label: "Audaz", sublabel: "Que se note, sin miedo", icon: "zap" },
  { value: "coqueta", label: "Coqueta", sublabel: "Dulce y juguetona", icon: "heart" },
];

export const QUESTIONS: QuestionDef[] = [
  {
    id: "gender",
    step: 1,
    eyebrow: "Paso 01",
    title: "¿Para quién buscás",
    titleEm: "la fragancia?",
    subtitle: "Así afinamos la selección desde el arranque.",
    kind: "choice",
    columns: 3,
    options: genderOptions,
  },
  {
    id: "inspired",
    step: 2,
    eyebrow: "Paso 02",
    title: "¿Hay un perfume que ya",
    titleEm: "te encanta?",
    subtitle:
      "Buscá el original y te mostramos su versión Millanel. Si no, seguí — te guiamos igual.",
    kind: "inspired",
  },
  {
    id: "likes",
    step: 3,
    eyebrow: "Paso 03",
    title: "¿Qué familia de aromas",
    titleEm: "te atrae?",
    subtitle: "Elegí la onda que más va con vos.",
    kind: "choice",
    columns: 3,
    options: likesOptions,
  },
  {
    id: "occasion",
    step: 4,
    eyebrow: "Paso 04",
    title: "¿Cuándo la vas",
    titleEm: "a usar?",
    subtitle: "Definimos la intensidad ideal para vos.",
    kind: "choice",
    columns: 2,
    options: occasionOptions,
  },
  {
    id: "personality",
    step: 5,
    eyebrow: "Paso 05",
    title: "¿Qué querés",
    titleEm: "transmitir?",
    subtitle: "Lo último — y armamos tu perfil de aroma.",
    kind: "choice",
    columns: 3,
    options: personalityOptions,
  },
];
