"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/data/products";
import { useFavorites } from "./FavoritesProvider";
import styles from "./FavoritesPage.module.css";

export type FavoriteProduct = {
  product: Product;
  hasImage: boolean;
  placeholderVariant: number;
};

type FavoritesPageProps = {
  products: FavoriteProduct[];
};

export function FavoritesPage({ products }: FavoritesPageProps) {
  const { favoriteIds, favoriteCount, ready } = useFavorites();
  const favorites = products.filter(({ product }) =>
    favoriteIds.includes(product.id),
  );

  if (!ready) {
    return (
      <section className={styles.loading} aria-live="polite">
        <p>Cargando favoritos…</p>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className={styles.empty} aria-labelledby="empty-favorites-title">
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="empty-favorites-title">No tienes productos favoritos.</h1>
        <p>Guarda los productos que quieras consultar más adelante.</p>
        <Link href="/#new-products">Explorar productos</Link>
      </section>
    );
  }

  return (
    <section className={styles.favorites} aria-labelledby="favorites-title">
      <header className={styles.heading}>
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="favorites-title">Favoritos</h1>
        <p>
          {favoriteCount} {favoriteCount === 1 ? "producto" : "productos"}
        </p>
      </header>

      <div className={styles.grid}>
        {favorites.map(({ product, hasImage, placeholderVariant }) => (
          <ProductCard
            key={product.id}
            product={product}
            hasImage={hasImage}
            placeholderVariant={placeholderVariant}
          />
        ))}
      </div>
    </section>
  );
}
