"use client";

import Link from "next/link";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

export function CartPage() {
  const { items, ready, totalUnits, subtotal } = useCart();

  if (!ready) {
    return (
      <section className={styles.loading} aria-live="polite">
        <p>Cargando carrito…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.empty} aria-labelledby="empty-cart-title">
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="empty-cart-title">Tu carrito está vacío</h1>
        <p>Descubre piezas y esenciales seleccionados para tu estilo.</p>
        <Link href="/#new-products">Ver productos</Link>
      </section>
    );
  }

  return (
    <section className={styles.cart} aria-labelledby="cart-title">
      <header className={styles.heading}>
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="cart-title">Tu carrito</h1>
        <p>
          {totalUnits} {totalUnits === 1 ? "unidad" : "unidades"}
        </p>
      </header>

      <div className={styles.layout}>
        <div className={styles.items} aria-live="polite">
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
        </div>
        <CartSummary subtotal={subtotal} />
      </div>
    </section>
  );
}
