import type { Category } from "@/lib/supabase/types";
import type { CategoryFormInput } from "@/lib/actions/admin";
import { slugify } from "@/lib/utils";

/* Estado editable de una categoría dentro del panel. Reflejo 1:1 de las
   columnas que la dueña puede tocar, más el id (vacío = todavía no existe).
   El "slug" se deriva del nombre y nunca se edita a mano: lo guardamos para
   poder mostrarlo de sólo lectura en "Opciones avanzadas". */
export interface CategoryDraft {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_path: string | null;
  sort_order: number;
  featured: boolean;
  active: boolean;
}

/** Convierte una fila de la base en un borrador editable. */
export function toDraft(c: Category): CategoryDraft {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    image_path: c.image_path ?? null,
    sort_order: c.sort_order,
    featured: c.featured,
    active: c.active,
  };
}

/** Borrador vacío para la card de "nueva categoría". */
export function emptyDraft(sortOrder: number): CategoryDraft {
  return {
    name: "",
    slug: "",
    description: "",
    image_path: null,
    sort_order: sortOrder,
    featured: false,
    active: true,
  };
}

/* Arma el payload EXACTO que espera upsertCategory (CategoryFormInput).
   El slug se autogenera desde el nombre: la dueña nunca lo escribe.
   Mando los campos limpios (description vacía → null) para no guardar "". */
export function toInput(d: CategoryDraft): CategoryFormInput {
  const name = d.name.trim();
  return {
    name,
    slug: slugify(name),
    description: d.description.trim() || null,
    image_path: d.image_path || null,
    sort_order: d.sort_order,
    featured: d.featured,
    active: d.active,
  };
}

/* La vista previa del slug que mostramos en "Opciones avanzadas". Siempre
   refleja lo que se va a guardar (slugify del nombre), no el valor viejo. */
export function previewSlug(name: string): string {
  return slugify(name.trim());
}

/** ¿Cambió algo respecto del estado original guardado? Para mostrar la barra
 *  de "cambios sin guardar" por fila sin falsos positivos. */
export function isDirty(a: CategoryDraft, b: CategoryDraft): boolean {
  return (
    a.name.trim() !== b.name.trim() ||
    a.description.trim() !== b.description.trim() ||
    (a.image_path || null) !== (b.image_path || null) ||
    a.featured !== b.featured ||
    a.active !== b.active
  );
}
