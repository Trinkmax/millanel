import { z } from "zod";

/** Lead/analytics row written when a visitor finishes the Asesoría de Aroma. */
export const QuizLeadSchema = z.object({
  answers: z.record(z.string(), z.unknown()).optional().default({}),
  archetype: z.string().max(80).nullable().optional(),
  recommendedProductIds: z.array(z.string().uuid()).max(12).optional().default([]),
  whatsapp: z.string().trim().max(40).nullable().optional(),
  consent: z.boolean().optional().default(false),
  source: z.string().max(40).optional().default("asesoria"),
});

export type QuizLeadInput = z.infer<typeof QuizLeadSchema>;
