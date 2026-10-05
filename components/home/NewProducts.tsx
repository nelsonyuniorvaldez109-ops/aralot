import { CatalogRetry } from "@/components/product/CatalogRetry";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/products/server";
import styles from "./NewProducts.module.css";

export async function NewProducts() {
  const { products, error } = await getProducts();
  return (
    <section
      className={styles.section}
      id="new-products"
      aria-labelledby="new-products-title"
    >
      <div className="container">
        <div className={styles.heading}>
          <h2 id="new-products-title">NUEVOS PRODUCTOS</h2>
          <Link
            className={styles.viewAll}
            href="#new-products-title"
            aria-label="Ver todos los nuevos productos"
          >
            Ver todos <span aria-hidden="true">→</span>
          </Link>
        </div>

        {error && <CatalogRetry message={error} />}
        <div className={styles.grid}>
          {products.slice(0, 4).map((product, index) => {
            const hasImage = Boolean(product.image);

            return (
              <ProductCard
                key={product.id}
                product={product}
                hasImage={hasImage}
                placeholderVariant={index + 1}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
