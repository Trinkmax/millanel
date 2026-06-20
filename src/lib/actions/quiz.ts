"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { QuizLeadSchema, type QuizLeadInput } from "@/lib/schemas/quiz";

export type { QuizLeadInput } from "@/lib/schemas/quiz";

/**
 * Persists an Asesoría de Aroma completion (zero-party answers + the products we
 * recommended) as a lead. quiz_submissions is admin-only under RLS, so — like
 * guest checkout writing to `orders` — we use the service-role client. Never
 * blocks the result UI; failures are swallowed to a soft error.
 */
export async function submitQuizLead(
  input: QuizLeadInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const parsed = QuizLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join(". ") };
  }
  const d = parsed.data;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("quiz_submissions")
      .insert({
        answers: d.answers as never,
        archetype: d.archetype ?? null,
        recommended_product_ids: d.recommendedProductIds,
        whatsapp: d.whatsapp ?? null,
        consent: d.consent,
        source: d.source,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[submitQuizLead] insert error:", error);
      return { ok: false, error: "No pudimos guardar tu resultado." };
    }
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[submitQuizLead] error:", err);
    return { ok: false, error: "No pudimos guardar tu resultado." };
  }
}
