"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem as CartItemType } from "./CartProvider";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

type CartItemProps = {
  item: CartItemType;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const unitPrice = priceFormatter.format(item.price);
  const itemSubtotal = priceFormatter.format(item.price * item.quantity);

  return (
    <article className={styles.item}>
      <Link
        className={styles.itemMedia}
        href={`/productos/${item.slug}`}
        aria-label={`Ver detalle de ${item.name}`}
      >
        {item.imageAvailable ? (
          <Image
            src={item.image}
            alt={`${item.name}, producto de ARA LOT`}
            fill
            sizes="(max-width: 639px) 32vw, 10rem"
            className={styles.itemImage}
          />
        ) : (
          <span className={styles.itemPlaceholder} aria-hidden="true" />
        )}
      </Link>

      <div className={styles.itemInformation}>
        <h2>
          <Link href={`/productos/${item.slug}`}>{item.name}</Link>
        </h2>

        <dl className={styles.variants}>
          {item.selectedColor ? (
            <div>
              <dt>Color</dt>
              <dd>{item.selectedColor}</dd>
            </div>
          ) : null}
          {item.selectedSize ? (
            <div>
              <dt>Talla</dt>
              <dd>{item.selectedSize}</dd>
            </div>
          ) : null}
          {item.presentation ? (
            <div>
              <dt>Presentación</dt>
              <dd>{item.presentation}</dd>
            </div>
          ) : null}
        </dl>

        <p className={styles.unitPrice}>{unitPrice}</p>

        <div className={styles.itemActions}>
          <div className={styles.quantity} aria-label={`Cantidad de ${item.name}`}>
            <button
              type="button"
              aria-label={`Reducir cantidad de ${item.name}`}
              disabled={item.quantity === 1}
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
            >
              −
            </button>
            <output aria-live="polite" aria-label={`Cantidad: ${item.quantity}`}>
              {item.quantity}
            </output>
            <button
              type="button"
              aria-label={`Aumentar cantidad de ${item.name}`}
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
            >
              +
            </button>
          </div>

          <button
            className={styles.removeButton}
            type="button"
            aria-label={`Eliminar ${item.name} del carrito`}
            onClick={() => removeItem(item.key)}
          >
            Eliminar
          </button>
        </div>
      </div>

      <div className={styles.itemSubtotal}>
        <span>Subtotal</span>
        <strong>{itemSubtotal}</strong>
      </div>
    </article>
  );
}
