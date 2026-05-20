import { CategoryManager } from "@/components/admin/category-manager";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="space-y-2">
        <p className="eyebrow text-mute">{data?.length ?? 0} categorías</p>
        <h1 className="font-display text-3xl md:text-4xl text-navy-900">
          Categorías
        </h1>
        <p className="text-mute">
          Organizá los productos en secciones que aparecen en el menú y en el catálogo.
        </p>
      </header>
      <CategoryManager initial={(data ?? []) as Category[]} />
    </div>
  );
}
