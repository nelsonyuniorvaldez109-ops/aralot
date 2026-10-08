import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";
import { getHeroImage } from "@/lib/store-settings-server";

type HeroProps = {
  // Description of the original fallback photograph.
  imageAlt?: string;
};

export async function Hero({ imageAlt }: HeroProps) {
  const configuredImage = await getHeroImage();
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {(imageAlt || configuredImage) && (
        <Image
          src={configuredImage || "/images/hero/ara-lot-hero.webp"}
          alt={configuredImage ? "Imagen principal de la colección ARA LOT" : imageAlt || "ARA LOT"}
          fill
          sizes={configuredImage ? "100vw" : "(max-width: 1023px) max(100vw, 1024px, 178svh), max(100vw, 139svh)"}
          preload
          className={`${styles.image} ${configuredImage ? styles.configuredImage : ""}`}
        />
      )}
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h1 id="hero-title" className={styles.title}>
            <span>ESTILO.</span>
            <span>DISCIPLINA.</span>
            <span>RESULTADOS.</span>
          </h1>
          <p className={styles.description}>
            Ropa y cuidado personal para el hombre moderno.
          </p>
          <Link
            href="/productos?categoria=poloches"
            className={styles.cta}
          >
            VER COLECCIÓN
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </Link>
          <p className={styles.signature}>CALIDAD — CONFIANZA — TU MEJOR VERSIÓN</p>
        </div>
      </div>
    </section>
  );
}
