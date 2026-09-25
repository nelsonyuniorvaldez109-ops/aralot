import Image from "next/image";
import type { Product } from "@/data/products";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  hasImage: boolean;
  placeholderVariant: number;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function ProductCard({
  product,
  hasImage,
  placeholderVariant,
}: ProductCardProps) {
  const price = priceFormatter.format(product.price);
  const compareAtPrice = product.compareAtPrice
    ? priceFormatter.format(product.compareAtPrice)
    : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {hasImage ? (
          <Image
            src={product.image}
            alt={`${product.name}, producto de ARA LOT`}
            fill
            sizes="(max-width: 359px) 100vw, (max-width: 1199px) 50vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div
            className={`${styles.placeholder} ${styles[`placeholder${placeholderVariant}`]}`}
            aria-hidden="true"
          />
        )}

        {product.badge ? (
          <span className={styles.badge}>{product.badge}</span>
        ) : null}

        <button
          className={styles.favorite}
          type="button"
          aria-label={`Agregar ${product.name} a favoritos (próximamente)`}
          aria-disabled="true"
          title="Favoritos próximamente"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.category}>{product.category}</p>
        <h3>{product.name}</h3>

        <p
          className={styles.prices}
          aria-label={
            compareAtPrice
              ? `Precio de oferta ${price}; precio anterior ${compareAtPrice}`
              : `Precio ${price}`
          }
        >
          {compareAtPrice ? (
            <del aria-hidden="true">{compareAtPrice}</del>
          ) : null}
          <span aria-hidden="true">{price}</span>
        </p>

        <div className={styles.details}>
          {product.colors ? (
            <div className={styles.detailRow}>
              <span>Colores</span>
              <ul aria-label="Colores disponibles">
                {product.colors.map((color) => (
                  <li key={color}>{color}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.sizes ? (
            <div className={styles.detailRow}>
              <span>Tallas</span>
              <ul aria-label="Tallas disponibles">
                {product.sizes.map((size) => (
                  <li key={size}>{size}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {product.presentation ? (
            <p className={styles.presentation}>
              <span>Presentación</span> {product.presentation}
            </p>
          ) : null}
        </div>

        <button
          className={styles.addButton}
          type="button"
          aria-disabled="true"
          aria-label={`Agregar ${product.name} al carrito (próximamente)`}
          title="Carrito próximamente"
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
