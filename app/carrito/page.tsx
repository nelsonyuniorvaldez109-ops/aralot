import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Carrito | ARA LOT",
  description: "Revisa los productos seleccionados en tu carrito de ARA LOT.",
};

export default function ShoppingCartPage() {
  return (
    <main id="storefront" tabIndex={-1}>
      <div className="container">
        <CartPage />
      </div>
    </main>
  );
}
