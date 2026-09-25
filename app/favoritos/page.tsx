import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  FavoritesPage,
  type FavoriteProduct,
} from "@/components/favorites/FavoritesPage";
import { newProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Favoritos | ARA LOT",
  description: "Consulta tus productos favoritos de ARA LOT.",
};

export default function FavoritesRoute() {
  const products: FavoriteProduct[] = newProducts.map((product, index) => ({
    product,
    hasImage: existsSync(
      path.join(process.cwd(), "public", product.image.slice(1)),
    ),
    placeholderVariant: index + 1,
  }));

  return (
    <main id="storefront" tabIndex={-1}>
      <div className="container">
        <FavoritesPage products={products} />
      </div>
    </main>
  );
}
