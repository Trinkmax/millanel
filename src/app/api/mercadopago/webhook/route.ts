import { NextResponse, type NextRequest } from "next/server";
import { getMercadoPagoClient, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * MercadoPago payment webhook
 * https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ ok: false, reason: "mp_disabled" }, { status: 200 });
  }

  const body = await request.json().catch(() => null);
  const url = new URL(request.url);
  const type = body?.type ?? url.searchParams.get("type");
  const dataId =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const client = getMercadoPagoClient();
    const { Payment } = await import("mercadopago");
    const payment = new Payment(client);
    const result = await payment.get({ id: dataId });

    const externalRef = result.external_reference;
    const status = result.status; // approved, pending, in_process, rejected, refunded, cancelled
    const paymentId = String(result.id);

    if (!externalRef) {
      return NextResponse.json({ ok: false, reason: "no_external_ref" });
    }

    const supabase = createAdminClient();

    let paymentStatus: "pending" | "in_process" | "paid" | "failed" | "refunded" =
      "pending";
    let orderStatus: "pending" | "confirmed" | "preparing" | "cancelled" =
      "pending";

    switch (status) {
      case "approved":
        paymentStatus = "paid";
        orderStatus = "confirmed";
        break;
      case "in_process":
        paymentStatus = "in_process";
        break;
      case "rejected":
      case "cancelled":
        paymentStatus = "failed";
        orderStatus = "cancelled";
        break;
      case "refunded":
      case "charged_back":
        paymentStatus = "refunded";
        break;
      default:
        paymentStatus = "pending";
    }

    await supabase
      .from("orders")
      .update({
        mp_payment_id: paymentId,
        mp_status: status,
        payment_status: paymentStatus,
        status: orderStatus,
        paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
      })
      .eq("order_number", externalRef);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[mp webhook] error:", err);
    return NextResponse.json(
      { ok: false, error: "internal" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, alive: true });
}
