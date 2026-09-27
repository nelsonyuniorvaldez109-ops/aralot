"use client";

import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
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
  const { isFavorite, ready, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const price = priceFormatter.format(product.price);
  const compareAtPrice = product.compareAtPrice
    ? priceFormatter.format(product.compareAtPrice)
    : undefined;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <div className={styles.productLink}>
          {hasImage ? (
            <Image
              src={product.image}
              alt={`${product.name}, producto de ARA LOT`}
              fill
              sizes="(max-width: 1199px) 50vw, 25vw"
              className={styles.image}
            />
          ) : (
            <div
              className={`${styles.placeholder} ${styles[`placeholder${placeholderVariant}`]}`}
              aria-hidden="true"
            />
          )}
        </div>

        {product.badge ? (
          <span className={styles.badge}>{product.badge}</span>
        ) : null}

        <button
          className={styles.favorite}
          type="button"
          disabled={!ready}
          aria-label={
            favorite
              ? `Quitar ${product.name} de favoritos`
              : `Agregar ${product.name} a favoritos`
          }
          aria-pressed={favorite}
          onClick={() => toggleFavorite(product.id)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20.8 4.8a5.4 5.4 0 0 0-7.6 0L12 6l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
          </svg>
        </button>
      </div>

      <div className={styles.content}>
        <h3>
          <Link className={styles.nameLink} href={`/productos/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

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

      </div>
    </article>
  );
}
