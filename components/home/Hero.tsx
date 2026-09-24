import Image from "next/image";
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
          sizes="100vw"
          preload
          className={styles.image}
        />
      )}
      <div className={styles.shade} aria-hidden="true" />
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>ARA LOT</p>
          <h1 id="hero-title" className={styles.title}>
            <span>ESTILO.</span>
            <span>DISCIPLINA.</span>
            <span>RESULTADOS.</span>
          </h1>
          <p className={styles.description}>
            Ropa y cuidado personal para el hombre moderno.
          </p>
          {/* Replace this placeholder with a link when the collection page exists. */}
          <button
            type="button"
            className={styles.cta}
            aria-disabled="true"
            aria-label="Ver colección — próximamente"
            title="Colección próximamente"
          >
            VER COLECCIÓN
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <p className={styles.signature}>CALIDAD — CONFIANZA — TU MEJOR VERSIÓN</p>
        </div>
      </div>
    </section>
  );
}
