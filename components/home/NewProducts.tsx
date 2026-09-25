import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { newProducts } from "@/data/products";
import styles from "./NewProducts.module.css";

export function NewProducts() {
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

        <div className={styles.grid}>
          {newProducts.map((product, index) => {
            const hasImage = existsSync(
              path.join(process.cwd(), "public", product.image.slice(1)),
            );

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
