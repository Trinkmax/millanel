import "server-only";
import { MercadoPagoConfig, Preference } from "mercadopago";

let cachedClient: MercadoPagoConfig | null = null;

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export function getMercadoPagoClient() {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not set");
  }
  if (!cachedClient) {
    cachedClient = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 },
    });
  }
  return cachedClient;
}

export interface MpPreferenceInput {
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
    description?: string;
  }[];
  shippingCost: number;
  siteUrl: string;
}

export async function createPreference(input: MpPreferenceInput) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);

  const [firstName, ...rest] = input.customer.name.split(/\s+/);

  const response = await preference.create({
    body: {
      items: input.items.map((i, idx) => ({
        id: `${input.orderId}-${idx}`,
        title: i.title,
        description: i.description,
        quantity: i.quantity,
        currency_id: "ARS",
        unit_price: Number(i.unitPrice.toFixed(2)),
      })),
      payer: {
        name: firstName,
        surname: rest.join(" "),
        email: input.customer.email,
      },
      shipments:
        input.shippingCost > 0
          ? { cost: Number(input.shippingCost.toFixed(2)), mode: "not_specified" }
          : undefined,
      external_reference: input.orderNumber,
      back_urls: {
        success: `${input.siteUrl}/orden/${input.orderNumber}?status=success`,
        failure: `${input.siteUrl}/orden/${input.orderNumber}?status=failure`,
        pending: `${input.siteUrl}/orden/${input.orderNumber}?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${input.siteUrl}/api/mercadopago/webhook`,
      statement_descriptor: "MILLANEL FRIAS",
      binary_mode: false,
    },
  });

  return {
    id: response.id!,
    init_point: response.init_point!,
    sandbox_init_point: response.sandbox_init_point,
  };
}
