import "server-only";
import { cache } from "react";
import { publicClient } from "./public-client";
import { mapProduct, type CatalogRow } from "./catalog";
import type { Product } from "@/data/products";

export type CatalogResult = { products: Product[]; error: string | null };

const columns =
  "id,slug,name,description,price,sale_price,image_url,categories(name,slug),product_variants(id,color,size,presentation,image_url,inventory(quantity))";

export const getProducts = cache(
  async (category?: string, slug?: string): Promise<CatalogResult> => {
    try {
      const client = publicClient();
      const products: Product[] = [];

      for (let offset = 0; ; offset += 500) {
        let query = client
          .from("products")
          .select(
            category
              ? columns.replace("categories(", "categories!inner(")
              : columns
          )
          .eq("active", true)
          .eq("product_variants.active", true)
          .order("created_at", { ascending: false })
          .order("id")
          .range(offset, offset + 499);

        if (category) query = query.eq("categories.slug", category);
        if (slug) query = query.eq("slug", slug);

        const { data, error } = await query.returns<CatalogRow[]>();

        if (error) throw new Error("catalog");

        products.push(...(data ?? []).map(mapProduct));

        if (!data || data.length < 500) break;
      }

      return { products, error: null };
    } catch {
      return {
        products: [],
        error:
          "No pudimos cargar los productos. Inténtalo nuevamente en unos momentos.",
      };
    }
  }
);

export const getProduct = cache(async (slug: string) => {
  const result = await getProducts(undefined, slug);

  if (result.error) throw new Error(result.error);

  return result.products[0];
});