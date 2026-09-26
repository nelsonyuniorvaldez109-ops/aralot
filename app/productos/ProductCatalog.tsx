"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { productCategories, type Product } from "@/data/products";
import styles from "./Products.module.css";

type CatalogProduct = {
  product: Product;
  hasImage: boolean;
  placeholderVariant: number;
};

export default function ProductCatalog({ products }: { products: CatalogProduct[] }) {
  const searchParams = useSearchParams();
  const categoryKey = searchParams.get("categoria");
  const category = Object.entries(productCategories).find(([key]) => key === categoryKey)?.[1];
  const filtered = categoryKey
    ? products.filter(({ product }) => category !== undefined && product.category === category)
    : products;

  return (
    <section aria-labelledby="products-title">
      <div className={styles.heading}>
        <h1 id="products-title">{category ?? (categoryKey ? "Categoría no encontrada" : "Todos los productos")}</h1>
        {categoryKey && <Link href="/productos">Ver todos los productos →</Link>}
      </div>
      {filtered.length ? (
        <div className={styles.grid}>
          {filtered.map(({ product, hasImage, placeholderVariant }) => (
            <ProductCard key={product.id} product={product} hasImage={hasImage} placeholderVariant={placeholderVariant} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Todavía no hay productos disponibles en esta categoría.</p>
      )}
    </section>
  );
}
