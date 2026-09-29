import type { Metadata } from "next";
import {
  FavoritesPage,
  type FavoriteProduct,
} from "@/components/favorites/FavoritesPage";
import { getProducts } from "@/lib/products/server";

export const metadata: Metadata = {
  title: "Favoritos | ARA LOT",
  description: "Consulta tus productos favoritos de ARA LOT.",
};

export default async function FavoritesRoute() {
  const catalog = await getProducts();
  const products: FavoriteProduct[] = catalog.products.map((product, index) => ({
    product,
    hasImage: Boolean(product.image),
    placeholderVariant: index + 1,
  }));

  return (
    <main id="storefront" tabIndex={-1}>
      <div className="container">
        {catalog.error ? <p role="status">{catalog.error}</p> : <FavoritesPage products={products} />}
      </div>
    </main>
  );
}
