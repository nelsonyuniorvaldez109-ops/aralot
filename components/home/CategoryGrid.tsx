import Image from "next/image";
import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import styles from "./CategoryGrid.module.css";

const categories = [
  {
    name: "POLOCHES",
    cta: "Ver colección",
    image: "/images/categories/poloches.webp",
    alt: "Selección de poloches para hombre",
  },
  {
    name: "CUIDADO PERSONAL",
    cta: "Ver productos",
    image: "/images/categories/personal-care.webp",
    alt: "Productos de cuidado personal para hombre",
  },
  {
    name: "MARCAS",
    cta: "Ver marcas",
    image: "/images/categories/brands.webp",
    alt: "Selección de marcas disponibles en ARA LOT",
  },
  {
    name: "COMBOS",
    cta: "Ver ofertas",
    image: "/images/categories/combos.webp",
    alt: "Combos de ropa y cuidado personal para hombre",
  },
] as const;

export function CategoryGrid() {
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <div className="container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>CATEGORÍAS</p>
          <h2 id="categories-title">Esenciales para tu estilo</h2>
        </div>

        <div className={styles.grid}>
          {categories.map((category, index) => {
            const hasImage = existsSync(
              path.join(process.cwd(), "public", category.image.slice(1)),
            );

            return (
              <article className={styles.card} key={category.name}>
                <Link
                  className={styles.link}
                  href="#categories-title"
                  aria-label={`${category.cta}: ${category.name.toLocaleLowerCase("es")}`}
                >
                  <div className={styles.media}>
                    {hasImage ? (
                      <Image
                        src={category.image}
                        alt={category.alt}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 25vw"
                        className={styles.image}
                      />
                    ) : (
                      <div
                        className={`${styles.placeholder} ${styles[`placeholder${index + 1}`]}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className={styles.meta}>
                    <h3>{category.name}</h3>
                    <span className={styles.cta}>
                      {category.cta}
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
