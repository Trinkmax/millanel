import { z } from "zod";

const ProductImage = z.object({ path: z.string(), alt: z.string().optional() });

const ProductSizeSchema = z.object({
  ml: z.number().int().positive(),
  label: z.string(),
  price: z.number().nonnegative(),
  sale_price: z.number().nullable().optional(),
});

export const ProductFormSchema = z.object({
  name: z.string().min(2),
  code: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  section: z.string().nullable().optional(),
  price: z.number().nonnegative(),
  reference_price: z.number().nullable().optional(),
  sale_price: z.number().nullable().optional(),
  promotion: z.string().nullable().optional(),
  stock: z.number().int().nonnegative(),
  track_stock: z.boolean(),
  featured: z.boolean(),
  is_new: z.boolean(),
  active: z.boolean(),
  tags: z.array(z.string()),
  images: z.array(ProductImage),
  // Size variants (perfume alternatives: 30/60/100 ml). Empty = single price.
  sizes: z.array(ProductSizeSchema).default([]),
  // Olfactory alternative metadata.
  fragrance_number: z.number().int().nullable().optional(),
  alternativa_a: z.string().nullable().optional(),
  alternativa_marca: z.string().nullable().optional(),
});

export type ProductFormInput = z.infer<typeof ProductFormSchema>;

export const CategoryFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  // Imagen de la categoría (path bucket-relativo en bucket 'category-images').
  image_path: z.string().nullable().optional(),
  sort_order: z.number().int(),
  featured: z.boolean(),
  active: z.boolean(),
});

export type CategoryFormInput = z.infer<typeof CategoryFormSchema>;

export const ShippingZoneSchema = z.object({
  name: z.string().min(2),
  slug: z.string().nullable().optional(),
  provinces: z.array(z.string()),
  base_cost: z.number().nonnegative(),
  free_shipping_threshold: z.number().nullable().optional(),
  estimated_days: z.string().nullable().optional(),
  sort_order: z.number().int(),
  active: z.boolean(),
});

export type ShippingZoneInput = z.infer<typeof ShippingZoneSchema>;
