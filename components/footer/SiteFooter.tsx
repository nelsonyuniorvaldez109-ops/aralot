import Link from "next/link";
import styles from "./SiteFooter.module.css";

const instagram = "https://www.instagram.com/aralot.caribe";
const whatsapp = "https://wa.me/18296446731";
const shopLinks = [
  { label: "Todos los productos", href: "/#new-products" },
  { label: "Poloches", href: "/#categories-title" },
  { label: "Cuidado personal", href: "/#new-products" },
  { label: "Combos", href: "/#categories-title" },
  { label: "Ofertas", href: "/#new-products" },
] as const;
const helpDestinations: Record<string, string> = { "Envíos y entregas": "/envios", "Cambios y devoluciones": "/cambios", "Términos y condiciones": "/terminos", "Política de privacidad": "/privacidad" };
const helpLinks = ["Preguntas frecuentes", "Envíos y entregas", "Cambios y devoluciones", "Términos y condiciones", "Política de privacidad"];

type IconName = "instagram" | "mail" | "whatsapp" | "truck" | "shield" | "support" | "location";
function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "instagram" && <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none" /></>}
    {name === "mail" && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 5 9 8 9-8" /></>}
    {name === "whatsapp" && <><path d="M20.4 3.6a10 10 0 0 0-16 11.6L3 21l5.8-1.4a10 10 0 0 0 11.6-16Z" /><path d="m8 7 2 3-1.2 1.2a8 8 0 0 0 4 4L14 14l3 2c-.5 2-2 2-3 1.6A12 12 0 0 1 6.4 10C6 9 6 7.5 8 7Z" /></>}
    {name === "truck" && <><path d="M2 5h12v12H2zM14 9h4l4 5v3h-8M2 9H0M2 13H0" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>}
    {name === "shield" && <><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z" /><path d="m8 11 3 3 5-5" /></>}
    {name === "support" && <><path d="M4 13V10a8 8 0 0 1 16 0v3M20 18v3h-6" /><rect x="2" y="11" width="4" height="8" rx="2" /><rect x="18" y="11" width="4" height="8" rx="2" /></>}
    {name === "location" && <><path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 14 0Z" /><circle cx="12" cy="9" r="2" /></>}
  </svg>;
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <section className={`${styles.social} container`} aria-labelledby="social-title">
        <div className={styles.socialCopy}>
          <h2 id="social-title">ARA LOT EN INSTAGRAM</h2>
          <p>Descubre novedades, ofertas y colecciones exclusivas.<br />Únete a nuestra comunidad.</p>
          <a className={styles.instagramButton} href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Icon name="instagram" />
          </a>
        </div>
        {/* Reserved for a future client-supplied photograph; no mockup is embedded. */}
        <div className={styles.socialMedia} aria-hidden="true" />
      </section>

      <div className={styles.divider}>
        <div className={`${styles.columns} container`}>
          <section className={styles.brand} aria-labelledby="footer-brand-title">
            <h2 id="footer-brand-title">ARA LOT</h2>
            <p>Estilo, cuidado y confianza<br />para el hombre de hoy.</p>
            <ul className={styles.benefits}>
              <li><Icon name="truck" /><span>Envíos los fines de semana</span></li>
              <li><Icon name="shield" /><span>Compra segura</span></li>
              <li><Icon name="support" /><span>Atención personalizada</span></li>
            </ul>
          </section>
          <nav className={styles.column} aria-labelledby="shop-links-title">
            <h2 id="shop-links-title">TIENDA</h2>
            <ul>{shopLinks.map(link => <li key={link.label}><Link href={link.href}>{link.label}<span aria-hidden="true">›</span></Link></li>)}</ul>
          </nav>
          <section className={styles.column} id="footer-help" aria-labelledby="help-links-title">
            <h2 id="help-links-title">AYUDA</h2>
            <ul>{helpLinks.map(label => <li key={label}>{helpDestinations[label] ? <Link href={helpDestinations[label]}>{label}</Link> : <span className={styles.pending}>{label}</span>}</li>)}</ul>
          </section>
          <section className={styles.column} id="about" aria-labelledby="about-title">
            <h2 id="about-title">NOSOTROS</h2>
            <ul>
              <li><span className={styles.pending}>Nuestra historia</span></li>
              <li><a href="#contact">Contacto<span aria-hidden="true">›</span></a></li>
            </ul>
          </section>
          <section className={`${styles.column} ${styles.contact}`} id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title">CONTÁCTANOS</h2>
            <address>
              <a href="mailto:aralot.caribe@gmail.com" aria-label="Correo electrónico"><Icon name="mail" /></a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" /></a>
            </address>
          </section>
        </div>
      </div>
      <div className={styles.divider}>
        <div className={`${styles.legal} container`}>
          <p>© {new Date().getFullYear()} ARA LOT. Todos los derechos reservados.</p>
          <p><Icon name="location" />República Dominicana</p>
        </div>
      </div>
    </footer>
  );
}
