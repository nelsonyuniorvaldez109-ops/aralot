import { Suspense } from "react";
import { existsSync } from "node:fs";
import path from "node:path";
import { newProducts } from "@/data/products";
import ProductCatalog from "./ProductCatalog";
import styles from "./Products.module.css";

export default function ProductsPage() {
  const products = newProducts.map((product, index) => ({
    product,
    hasImage: existsSync(path.join(process.cwd(), "public", product.image.slice(1))),
    placeholderVariant: index + 1,
  }));

  return (
    <div className={`container ${styles.page}`}>
      <Suspense fallback={<p role="status">Cargando productos…</p>}>
        <ProductCatalog products={products} />
      </Suspense>
    </div>
  );
}
