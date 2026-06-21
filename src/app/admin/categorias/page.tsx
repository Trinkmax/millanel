import { CategoryManager } from "@/components/admin/category-manager";
import { AdminPage, PageHeader } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

/* Conteo en español, sin números crudos sueltos. */
function countLabel(n: number): string {
  if (n === 0) return "Sin secciones todavía";
  if (n === 1) return "1 sección";
  return `${n} secciones`;
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const categories = (data ?? []) as Category[];

  return (
    <AdminPage>
      <PageHeader
        eyebrow={countLabel(categories.length)}
        title="Secciones de la tienda"
        subtitle="Organizá tus productos en secciones. El orden de acá es el mismo que ve la clienta en el menú y en el catálogo."
      />
      <CategoryManager initial={categories} />
    </AdminPage>
  );
}
