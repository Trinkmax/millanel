const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export type StorageBucket = "product-images" | "category-images";

/**
 * Resolve a Supabase Storage object to its public URL.
 *
 * Convention: we store BUCKET-RELATIVE paths (e.g. "seed/foo.jpg") in the DB —
 * never absolute URLs — so the catalog survives a Supabase project migration
 * (the project ref is not baked into the data; Millanel already migrated once).
 * Call this only at render time, wherever an image is shown.
 *
 * Absolute URLs (legacy rows) and empty values pass through unchanged.
 */
export function publicUrl(
  path?: string | null,
  bucket: StorageBucket = "product-images",
): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${clean}`;
}
