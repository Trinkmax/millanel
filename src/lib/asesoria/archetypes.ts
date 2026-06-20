import type { Archetype, ScentFamily, Gender, QuizAnswers } from "./types";

/* ── "Perfil de aroma" archetypes ─────────────────────────────────────────────
   The shareable identity shown on the result reveal. Derived from the winning
   recommendation's family + the user's chosen line (gender). Owner-editable copy. */

interface Tpl {
  names: Record<Gender, string>;
  tagline: string;
  description: string;
}

const TEMPLATES: Record<ScentFamily, Tpl> = {
  floral: {
    names: {
      femenino: "La Romántica",
      masculino: "Carácter Floral",
      unisex: "Espíritu Romántico",
    },
    tagline: "Pétalos que dejan huella",
    description:
      "Te seducen los aromas florales: delicados, luminosos y con una estela romántica que se siente cercana.",
  },
  gourmand: {
    names: {
      femenino: "La Dulce Magnética",
      masculino: "El Goloso Audaz",
      unisex: "Alma Golosa",
    },
    tagline: "Dulce, cálido e irresistible",
    description:
      "Buscás aromas golosos y envolventes —vainilla, caramelo, café— que abrazan y se quedan en la memoria.",
  },
  oriental: {
    names: {
      femenino: "La Magnética",
      masculino: "El Magnético",
      unisex: "Aura Magnética",
    },
    tagline: "Sensual, intensa, inolvidable",
    description:
      "Te van los orientales y especiados: ámbar, incienso y especias para una presencia que no pasa desapercibida.",
  },
  amaderado: {
    names: {
      femenino: "La Elegante con Carácter",
      masculino: "El Amaderado con Carácter",
      unisex: "Carácter Amaderado",
    },
    tagline: "Cálida, segura, con raíces",
    description:
      "Preferís lo amaderado: sándalo, cedro y vetiver que transmiten calidez, seguridad y carácter.",
  },
  fresco: {
    names: {
      femenino: "La Fresca Luminosa",
      masculino: "El Fresco Vital",
      unisex: "Espíritu Luminoso",
    },
    tagline: "Limpia, vital, luminosa",
    description:
      "Te identificás con lo fresco y cítrico: brisa, energía y una limpieza luminosa que acompaña todo el día.",
  },
  chypre: {
    names: {
      femenino: "La Sofisticada",
      masculino: "El Sofisticado",
      unisex: "Aura Sofisticada",
    },
    tagline: "Elegancia atemporal",
    description:
      "Tu perfil es sofisticado: cítricos sobre musgo, una elegancia clásica que nunca falla.",
  },
  fougere: {
    names: {
      femenino: "La Clásica Fresca",
      masculino: "El Clásico Fresco",
      unisex: "Espíritu Clásico",
    },
    tagline: "Clásico, prolijo, fresco",
    description:
      "Te gusta lo clásico y aromático: lavanda y hierbas, esa frescura prolija de los grandes clásicos.",
  },
};

export function buildArchetype(family: ScentFamily, answers: QuizAnswers): Archetype {
  const t = TEMPLATES[family];
  const g: Gender = answers.gender ?? "unisex";
  return {
    id: family,
    name: t.names[g] ?? t.names.unisex,
    tagline: t.tagline,
    description: t.description,
    family,
  };
}
