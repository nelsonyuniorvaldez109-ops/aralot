import Link from "next/link";
import Image from "next/image";
import styles from "./PromotionalBanners.module.css";

const banners = [
  {
    eyebrow: "NUEVOS POLOCHES",
    image: "/images/banners/poloches.webp",
    alt: "Hombre con poloche negro ARA LOT",
    title: "ESTILO PARA CADA MOMENTO",
    description: "Descubre la colección de ARA LOT para el hombre de hoy.",
    cta: "VER COLECCIÓN",
    href: "/#new-products",
  },
  {
    eyebrow: "CUIDADO PERSONAL",
    image: "/images/banners/personal-care.webp",
    alt: "Productos de cuidado personal ARA LOT",
    title: "CUIDA TU ESTILO",
    description: "Shampoo, gelatina y cuidado personal ARA LOT.",
    cta: "VER PRODUCTOS",
    href: "/#new-products",
  },
] as const;

export function PromotionalBanners() {
  return (
    <section className={styles.section} aria-labelledby="promotions-title">
      <h2 className={styles.visuallyHidden} id="promotions-title">
        Colecciones destacadas
      </h2>
      <div className={`${styles.grid} container`}>
        {banners.map((banner) => (
          <article className={styles.banner} key={banner.eyebrow}>
            <div className={styles.media}><Image src={banner.image} alt={banner.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className={styles.image} /></div>
            <div className={styles.content}>
              <p className={styles.eyebrow}>{banner.eyebrow}</p>
              <h3>{banner.title}</h3>
              <p className={styles.description}>{banner.description}</p>
              <Link className={styles.cta} href={banner.href}>
                {banner.cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
