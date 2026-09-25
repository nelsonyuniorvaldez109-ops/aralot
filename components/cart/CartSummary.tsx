"use client";

import Link from "next/link";
import styles from "./Cart.module.css";

type CartSummaryProps = {
  subtotal: number;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function CartSummary({ subtotal }: CartSummaryProps) {
  return (
    <aside className={styles.summary} aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">Resumen del pedido</h2>
      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <strong>{priceFormatter.format(subtotal)}</strong>
      </div>
      <p>Envío calculado en el checkout</p>
      <Link className={styles.summaryCheckout} href="/checkout">
        Continuar compra
      </Link>
    </aside>
  );
}
