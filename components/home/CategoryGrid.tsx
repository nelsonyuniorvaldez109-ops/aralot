import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/products/categories";
import { CatalogRetry } from "@/components/product/CatalogRetry";
import styles from "./CategoryGrid.module.css";

const categoryCta: Record<string, string> = {
  poloches: "Ver colección",
  "cuidado-personal": "Ver productos",
  "nueva-coleccion": "Descubrir",
  combos: "Ver ofertas",
};

export async function CategoryGrid() {
  const { categories, error } = await getCategories();

  return (
    <section
      className={styles.section}
      aria-labelledby="categories-title"
    >
      <div className="container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>CATEGORÍAS</p>

          <h2 id="categories-title">
            Esenciales para tu estilo
          </h2>
        </div>

        {error && <CatalogRetry message={error} />}
        <div className={styles.grid}>
          {categories?.map((category, index) => (
            <article
              className={styles.card}
              key={category.id}
            >
              <Link
                className={styles.link}
                href={`/productos?categoria=${category.slug}`}
                aria-label={`Ver ${category.name.toLocaleLowerCase("es")}`}
              >
                <div className={styles.media}>
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 25vw"
                      className={styles.image}
                    />
                  ) : (
                    <div
                      className={`${styles.placeholder} ${
                        styles[
                          `placeholder${(index % 4) + 1}`
                        ]
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className={styles.meta}>
                  <h3>{category.name.toUpperCase()}</h3>

                  <span className={styles.cta}>
                    {categoryCta[category.slug] ??
                      "Ver productos"}

                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}