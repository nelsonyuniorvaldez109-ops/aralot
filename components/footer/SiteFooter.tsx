import Link from "next/link";
import styles from "./SiteFooter.module.css";

const shopLinks = [
  { label: "Todos los productos", href: "/#new-products" },
  { label: "Poloches", href: "/#categories-title" },
  { label: "Cuidado personal", href: "/#new-products" },
  { label: "Combos", href: "/#categories-title" },
  { label: "Ofertas", href: "/#new-products" },
] as const;

const helpLinks = [
  "Preguntas frecuentes",
  "Envíos y entregas",
  "Cambios y devoluciones",
  "Términos y condiciones",
  "Política de privacidad",
] as const;

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <section className={styles.shipping} aria-labelledby="shipping-title">
        <div className={`${styles.shippingInner} container`}>
          <h2 id="shipping-title">ENVÍOS</h2>
          <div>
            <p>Realizamos nuestros envíos los fines de semana.</p>
            <span>Los detalles de entrega se coordinan al procesar tu pedido.</span>
          </div>
        </div>
      </section>

      <section className={`${styles.social} container`} aria-labelledby="social-title">
        <div>
          <p>SÍGUENOS</p>
          <h2 id="social-title">ARA LOT EN INSTAGRAM</h2>
        </div>
        <a
          href="https://www.instagram.com/aralot.caribe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Seguir a ARA LOT en Instagram (abre en una nueva pestaña)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.75" className={styles.dot} />
          </svg>
          <span>@aralot.caribe</span>
        </a>
      </section>

      <div className={`${styles.columns} container`}>
        <section className={styles.brand} aria-labelledby="footer-brand-title">
          <h2 id="footer-brand-title">ARA LOT</h2>
          <p>Estilo, cuidado y confianza para el hombre de hoy.</p>
        </section>

        <nav className={styles.column} aria-labelledby="shop-links-title">
          <h2 id="shop-links-title">TIENDA</h2>
          <ul>
            {shopLinks.map((link) => (
              <li key={link.label}><Link href={link.href}>{link.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav className={styles.column} id="footer-help" aria-labelledby="help-links-title">
          <h2 id="help-links-title">AYUDA</h2>
          <ul>
            {helpLinks.map((label) => (
              <li key={label}><a href="#footer-help">{label}</a></li>
            ))}
          </ul>
        </nav>

        <nav className={styles.column} id="about" aria-labelledby="about-title">
          <h2 id="about-title">NOSOTROS</h2>
          <ul>
            <li><a href="#about">Nuestra historia</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
        </nav>

        <section className={styles.column} id="contact" aria-labelledby="contact-title">
          <h2 id="contact-title">CONTÁCTANOS</h2>
          <address>
            <span>Email:</span>
            <a href="mailto:aralot.caribe@gmail.com">aralot.caribe@gmail.com</a>
            <span>Instagram:</span>
            <a href="https://www.instagram.com/aralot.caribe" target="_blank" rel="noopener noreferrer">
              @aralot.caribe
            </a>
          </address>
        </section>
      </div>

      <div className={`${styles.legal} container`}>
        <p>© {currentYear} ARA LOT. Todos los derechos reservados.</p>
        <p>República Dominicana</p>
      </div>
    </footer>
  );
}
