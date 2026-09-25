"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@/components/cart/CartProvider";
import styles from "./Checkout.module.css";

type OrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function OrderSummary({ items, subtotal }: OrderSummaryProps) {
  const formattedSubtotal = priceFormatter.format(subtotal);

  return (
    <aside className={styles.summary} aria-labelledby="order-summary-title">
      <h2 id="order-summary-title">Resumen del pedido</h2>

      <div className={styles.summaryItems}>
        {items.map((item) => (
          <article className={styles.summaryItem} key={item.key}>
            <Link
              className={styles.summaryMedia}
              href={`/productos/${item.slug}`}
              aria-label={`Ver detalle de ${item.name}`}
            >
              {item.imageAvailable ? (
                <Image
                  src={item.image}
                  alt={`${item.name}, producto de ARA LOT`}
                  fill
                  sizes="5rem"
                  className={styles.summaryImage}
                />
              ) : (
                <span className={styles.summaryPlaceholder} aria-hidden="true" />
              )}
            </Link>

            <div className={styles.summaryInformation}>
              <h3>{item.name}</h3>
              <p>
                {[item.selectedColor, item.selectedSize, item.presentation]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <span>Cantidad: {item.quantity}</span>
            </div>

            <div className={styles.summaryPrice}>
              <span>{priceFormatter.format(item.price)} c/u</span>
              <strong>{priceFormatter.format(item.price * item.quantity)}</strong>
            </div>
          </article>
        ))}
      </div>

      <dl className={styles.totals}>
        <div>
          <dt>Subtotal</dt>
          <dd>{formattedSubtotal}</dd>
        </div>
        <div>
          <dt>Entrega</dt>
          <dd>Por confirmar</dd>
        </div>
        <div className={styles.provisionalTotal}>
          <dt>Total provisional</dt>
          <dd>{formattedSubtotal}</dd>
        </div>
      </dl>

      <p className={styles.deliveryDisclaimer}>
        El costo de entrega todavía no está incluido.
      </p>
    </aside>
  );
}
