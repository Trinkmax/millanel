"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import {
  ProductFormSchema,
  CategoryFormSchema,
  ShippingZoneSchema,
  type ProductFormInput,
  type CategoryFormInput,
  type ShippingZoneInput,
} from "@/lib/schemas/admin";

export type { ProductFormInput, CategoryFormInput, ShippingZoneInput };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

/* ── PRODUCTS ──────────────────────────────────────────────── */

export async function createProduct(input: ProductFormInput) {
  const supabase = await requireAdmin();
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.message };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidateTag("products", "max");
  return { ok: true as const, id: data.id };
}

export async function updateProduct(id: string, input: ProductFormInput) {
  const supabase = await requireAdmin();
  const parsed = ProductFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.message };
  }
  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, slug })
    .eq("id", id);

  if (error) {
    return { ok: false as const, error: error.message };
  }
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${slug}`);
  revalidateTag("products", "max");
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidateTag("products", "max");
  return { ok: true as const };
}

export async function toggleProductActive(id: string, active: boolean) {
  const supabase = await requireAdmin();
  await supabase.from("products").update({ active }).eq("id", id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidateTag("products", "max");
}

/* ── CATEGORIES ────────────────────────────────────────────── */

export async function upsertCategory(
  input: CategoryFormInput,
  id?: string,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const supabase = await requireAdmin();
  const parsed = CategoryFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({ ...parsed.data, slug })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...parsed.data, slug })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    id = data.id;
  }
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidateTag("categories", "max");
  return { ok: true, id };
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidateTag("categories", "max");
  return { ok: true as const };
}

/* ── ORDERS ────────────────────────────────────────────────── */

export async function updateOrderStatus(
  id: string,
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "shipped"
    | "delivered"
    | "cancelled",
) {
  const supabase = await requireAdmin();
  const patch: Record<string, unknown> = { status };
  if (status === "shipped") patch.shipped_at = new Date().toISOString();
  if (status === "delivered") patch.delivered_at = new Date().toISOString();

  const { error } = await supabase
    .from("orders")
    .update(patch as never)
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${id}`);
  return { ok: true as const };
}

export async function updateOrderPayment(
  id: string,
  payment_status:
    | "pending"
    | "in_process"
    | "paid"
    | "failed"
    | "refunded",
) {
  const supabase = await requireAdmin();
  const patch: Record<string, unknown> = { payment_status };
  if (payment_status === "paid") patch.paid_at = new Date().toISOString();

  const { error } = await supabase
    .from("orders")
    .update(patch as never)
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${id}`);
  return { ok: true as const };
}

export async function updateOrderAdminNotes(id: string, notes: string) {
  const supabase = await requireAdmin();
  await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
  revalidatePath(`/admin/ordenes/${id}`);
}

/* ── SHIPPING ZONES ────────────────────────────────────────── */

export async function upsertShippingZone(
  input: ShippingZoneInput,
  id?: string,
) {
  const supabase = await requireAdmin();
  const parsed = ShippingZoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.message };

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  if (id) {
    const { error } = await supabase
      .from("shipping_zones")
      .update({ ...parsed.data, slug })
      .eq("id", id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase
      .from("shipping_zones")
      .insert({ ...parsed.data, slug });
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/admin/envios");
  revalidateTag("shipping", "max");
  return { ok: true as const };
}

export async function deleteShippingZone(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/envios");
  revalidateTag("shipping", "max");
  return { ok: true as const };
}

/* ── SETTINGS ──────────────────────────────────────────────── */

export async function updateSetting(key: string, value: unknown) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/ajustes");
  revalidatePath("/", "layout");
  revalidateTag("settings", "max");
  return { ok: true as const };
}
