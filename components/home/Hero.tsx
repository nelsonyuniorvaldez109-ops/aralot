import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

type HeroProps = {
  // Once the approved photo exists at public/images/hero/ara-lot-hero.webp,
  // pass a description of that photograph to enable it: <Hero imageAlt="..." />.
  imageAlt?: string;
};

export function Hero({ imageAlt }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {imageAlt && (
        <Image
          src="/images/hero/ara-lot-hero.webp"
          alt={imageAlt}
          fill
          sizes="(max-width: 1023px) max(100vw, 1024px, 178svh), max(100vw, 139svh)"
          preload
          className={styles.image}
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
