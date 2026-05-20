import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart/cart-view";

export const metadata: Metadata = {
  title: "Tu carrito",
  description: "Revisá tu selección antes de pagar.",
};

export default function CartPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <CartView />
    </div>
  );
}
