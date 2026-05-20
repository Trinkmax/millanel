import type { Metadata } from "next";
import { SectionHeading } from "@/components/storefront/section-heading";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";
import { getShippingZones } from "@/lib/queries/shipping";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalizá tu pedido en pocos pasos.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [shippingZones] = await Promise.all([getShippingZones()]);

  return (
    <div className="container-page py-10 md:py-16">
      <div className="max-w-3xl">
        <SectionHeading
          eyebrow="Casi listo"
          title={
            <>
              Pasaste a la{" "}
              <em className="italic font-normal text-navy-700">caja.</em>
            </>
          }
          description="Completá los datos y elegí cómo querés pagar y recibir el pedido."
        />
      </div>
      <div className="mt-12">
        <CheckoutForm
          shippingZones={shippingZones}
          mercadopagoEnabled={isMercadoPagoConfigured()}
        />
      </div>
    </div>
  );
}
