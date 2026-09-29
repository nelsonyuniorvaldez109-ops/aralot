import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getProduct } from "@/lib/products/server";
import styles from "./ProductPage.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return {
    title: `${product.name} | ARA LOT`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const hasImage = Boolean(product.image);
  const placeholderVariant = 1;

  return (
    <main className={styles.main} id="storefront" tabIndex={-1}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Ruta del producto">
          <ol>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>{product.category}</li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <ProductDetail
          key={product.id}
          product={product}
          hasImage={hasImage}
          placeholderVariant={placeholderVariant}
        />
      </div>
    </main>
  );
}
