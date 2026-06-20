"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { CheckoutInputSchema, type CheckoutInput } from "@/lib/schemas/orders";
import { parseSizes, effectivePrice } from "@/lib/variants";

export type { CheckoutInput } from "@/lib/schemas/orders";

interface CheckoutResult {
  ok: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: string;
  redirectUrl?: string;
  whatsappUrl?: string;
}

interface PriceCheckRow {
  id: string;
  slug: string;
  code: string | null;
  name: string;
  price: number;
  sale_price: number | null;
  active: boolean;
  stock: number;
  track_stock: boolean;
  images: unknown;
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = CheckoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join(". "),
    };
  }
  const data = parsed.data;

  // Trusted server action: prices are verified server-side and the input is
  // Zod-validated, so we use the service-role client (like the MP webhook).
  // orders/order_items are admin-only under RLS; guests never touch them directly.
  const supabase = createAdminClient();

  // 1. Verify prices server-side
  const ids = data.items.map((i) => i.productId ?? i.id);
  const { data: priceRows, error: priceError } = await (supabase.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    "get_products_for_checkout",
    { p_ids: ids },
  );
  if (priceError) {
    console.error("[placeOrder] price check error:", priceError);
    return { ok: false, error: "No pudimos verificar los precios. Intentá de nuevo." };
  }
  const priceMap = new Map<string, PriceCheckRow>();
  for (const row of (priceRows ?? []) as unknown as PriceCheckRow[]) {
    priceMap.set(row.id, row);
  }

  // Variant sizes, for per-size price verification (service-role read).
  const sizesMap = new Map<string, unknown>();
  const { data: sizeRows } = await supabase
    .from("products")
    .select("id, sizes")
    .in("id", ids);
  for (const r of sizeRows ?? []) {
    sizesMap.set(r.id, (r as { sizes?: unknown }).sizes);
  }

  let subtotal = 0;
  const checkedItems: {
    product_id: string;
    product_name: string;
    product_code: string | null;
    product_image: string | null;
    unit_price: number;
    quantity: number;
    total: number;
    variant_label: string | null;
  }[] = [];

  for (const item of data.items) {
    const pid = item.productId ?? item.id;
    const row = priceMap.get(pid);
    if (!row || !row.active) {
      return {
        ok: false,
        error: `El producto "${item.name}" ya no está disponible. Quitalo y volvé a intentar.`,
      };
    }

    // Per-size pricing: variant products are re-priced against products.sizes
    // (never trust the client's price). Non-variant products use price/sale_price.
    const sizes = parseSizes(sizesMap.get(pid));
    let unitPrice: number;
    let variantLabel: string | null = null;
    let displayName = row.name;
    if (sizes.length > 0) {
      const variant =
        item.sizeMl != null ? sizes.find((s) => s.ml === item.sizeMl) : undefined;
      if (!variant) {
        return { ok: false, error: `Elegí un tamaño para "${row.name}".` };
      }
      unitPrice = Number(effectivePrice(variant));
      variantLabel = variant.label;
      displayName = `${row.name} — ${variant.label}`;
    } else {
      unitPrice = Number(row.sale_price ?? row.price);
    }

    if (unitPrice <= 0) {
      return {
        ok: false,
        error: `"${row.name}" no tiene precio cargado — consultá por WhatsApp.`,
      };
    }
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    checkedItems.push({
      product_id: row.id,
      product_name: displayName,
      product_code: row.code,
      product_image: item.image ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
      total: lineTotal,
      variant_label: variantLabel,
    });
  }

  // 2. Calculate shipping
  let shippingCost = 0;
  if (data.shippingMethod === "shipping" && data.shippingZoneId) {
    const { data: zone } = await supabase
      .from("shipping_zones")
      .select("base_cost, free_shipping_threshold, active")
      .eq("id", data.shippingZoneId)
      .maybeSingle();
    if (!zone || !zone.active) {
      return { ok: false, error: "La zona de envío no está disponible." };
    }
    shippingCost = Number(zone.base_cost);
    if (zone.free_shipping_threshold && subtotal >= zone.free_shipping_threshold) {
      shippingCost = 0;
    }
  }

  const total = subtotal + shippingCost;

  // 3. Insert order
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      customer_dni: data.customer.dni ?? null,
      shipping_method: data.shippingMethod,
      shipping_zone_id: data.shippingMethod === "shipping" ? data.shippingZoneId ?? null : null,
      shipping_address:
        data.shippingMethod === "shipping" && data.shippingAddress
          ? data.shippingAddress
          : null,
      shipping_cost: shippingCost,
      subtotal,
      total,
      payment_method: data.paymentMethod,
      payment_status: "pending",
      status: "pending",
      notes: data.notes ?? null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    console.error("[placeOrder] order insert error:", orderError);
    return { ok: false, error: "No pudimos crear el pedido. Intentá de nuevo." };
  }

  // 4. Insert items
  const { error: itemsError } = await supabase.from("order_items").insert(
    checkedItems.map((i) => ({
      ...i,
      order_id: orderRow.id,
    })),
  );
  if (itemsError) {
    console.error("[placeOrder] items insert error:", itemsError);
    return { ok: false, error: "No pudimos guardar los productos del pedido." };
  }

  // 5. Payment-specific handling
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (data.paymentMethod === "mercadopago" && isMercadoPagoConfigured()) {
    try {
      const pref = await createPreference({
        orderId: orderRow.id,
        orderNumber: orderRow.order_number,
        customer: data.customer,
        items: checkedItems.map((i) => ({
          title: i.product_name,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          description: i.product_code ?? undefined,
        })),
        shippingCost,
        siteUrl,
      });
      await supabase
        .from("orders")
        .update({ mp_preference_id: pref.id })
        .eq("id", orderRow.id);
      return {
        ok: true,
        orderId: orderRow.id,
        orderNumber: orderRow.order_number,
        redirectUrl:
          process.env.NODE_ENV === "production"
            ? pref.init_point
            : (pref.sandbox_init_point ?? pref.init_point),
      };
    } catch (err) {
      console.error("[placeOrder] MP preference error:", err);
      return {
        ok: true,
        orderId: orderRow.id,
        orderNumber: orderRow.order_number,
        error:
          "El pedido se creó, pero no pudimos generar el pago online. Te contactaremos por WhatsApp.",
      };
    }
  }

  // 6. WhatsApp / Transfer / Cash on pickup
  if (data.paymentMethod === "whatsapp") {
    const whatsappLines = [
      `*Pedido ${orderRow.order_number}*`,
      `Nombre: ${data.customer.name}`,
      `Email: ${data.customer.email}`,
      `Tel: ${data.customer.phone}`,
      data.shippingMethod === "pickup"
        ? "Retiro en local"
        : `Envío a: ${data.shippingAddress?.street}, ${data.shippingAddress?.city}`,
      "",
      "Productos:",
      ...checkedItems.map(
        (i) => `• ${i.quantity}× ${i.product_name} — $${i.total.toFixed(2)}`,
      ),
      "",
      `Subtotal: $${subtotal.toFixed(2)}`,
      shippingCost > 0 ? `Envío: $${shippingCost.toFixed(2)}` : "",
      `Total: $${total.toFixed(2)}`,
    ].filter(Boolean);
    const phone = (await supabase
      .from("settings")
      .select("value")
      .eq("key", "contact")
      .single()
      .then((r) => (r.data?.value as { whatsapp?: string })?.whatsapp)) ?? "";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappLines.join("\n"))}`;
    return {
      ok: true,
      orderId: orderRow.id,
      orderNumber: orderRow.order_number,
      whatsappUrl: url,
    };
  }

  return {
    ok: true,
    orderId: orderRow.id,
    orderNumber: orderRow.order_number,
  };
}

export async function fetchOrderByNumber(orderNumber: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.rpc as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    "get_order_public",
    { p_order_number: orderNumber },
  );
  if (error) {
    console.error("[fetchOrderByNumber] error:", error);
    return null;
  }
  return data;
}
