// Size variants for products (perfume alternatives come in 30/60/100 ml, etc.).
// Stored in products.sizes (jsonb). Empty array = single-price product.

export interface ProductSize {
  ml: number;
  label: string;
  price: number;
  sale_price?: number | null;
}

/** Safely parse the products.sizes jsonb into typed, sorted size variants. */
export function parseSizes(raw: unknown): ProductSize[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductSize[] = [];
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const ml = typeof o.ml === "number" ? o.ml : Number(o.ml);
    const price = typeof o.price === "number" ? o.price : Number(o.price);
    if (!Number.isFinite(ml) || !Number.isFinite(price)) continue;
    out.push({
      ml,
      label: typeof o.label === "string" && o.label ? o.label : `${ml} ml`,
      price,
      sale_price:
        o.sale_price == null ? null : Number(o.sale_price) || null,
    });
  }
  return out.sort((a, b) => a.ml - b.ml);
}

export const effectivePrice = (s: ProductSize) => s.sale_price ?? s.price;

/** Lowest selectable price ("desde $X") for a variant product. */
export function minSizePrice(sizes: ProductSize[]): number {
  return sizes.reduce(
    (min, s) => Math.min(min, effectivePrice(s)),
    Infinity,
  );
}
