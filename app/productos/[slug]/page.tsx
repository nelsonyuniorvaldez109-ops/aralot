import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { newProducts } from "@/data/products";
import styles from "./ProductPage.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function findProduct(slug: string) {
  return newProducts.find((product) => product.slug === slug);
}

export function generateStaticParams() {
  return newProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) notFound();

  return {
    title: `${product.name} | ARA LOT`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) notFound();

  const hasImage = existsSync(
    path.join(process.cwd(), "public", product.image.slice(1)),
  );
  const placeholderVariant = newProducts.findIndex((item) => item.id === product.id) + 1;

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
          product={product}
          hasImage={hasImage}
          placeholderVariant={placeholderVariant}
        />
      </div>
    </main>
  );
}
