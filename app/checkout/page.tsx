import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | ARA LOT",
  description: "Prepara los datos de entrega y pago para tu pedido de ARA LOT.",
};

export default function CheckoutRoute() {
  return (
    <main id="storefront" tabIndex={-1}>
      <div className="container">
        <CheckoutPage />
      </div>
    </main>
  );
}
