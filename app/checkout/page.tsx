import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { getPublicStoreSettings } from "@/lib/store-settings-server";

export const metadata: Metadata = {
  title: "Checkout | ARA LOT",
  description: "Prepara los datos de entrega y pago para tu pedido de ARA LOT.",
};

export default async function CheckoutRoute() {
  const settings = await getPublicStoreSettings();

  return (
    <main id="storefront" tabIndex={-1}>
      <div className="container">
        <CheckoutPage settings={settings} />
      </div>
    </main>
  );
}