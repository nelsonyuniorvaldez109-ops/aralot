import Link from "next/link";
import { navigationItems } from "./navigation";
import styles from "./Header.module.css";

type MobileNavigationProps = {
  open: boolean;
  onNavigate: () => void;
};

export function MobileNavigation({ open, onNavigate }: MobileNavigationProps) {
  return (
    <nav id="mobile-navigation" className={styles.mobileNavigation} aria-label="Navegación móvil" hidden={!open}>
      <div className="container">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} onClick={onNavigate} aria-current={"current" in item ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.mobileAccountActions}>
          <button type="button" aria-disabled="true" title="Próximamente">Mi cuenta</button>
          <Link href="/favoritos" onClick={onNavigate}>Favoritos</Link>
        </div>
        <p className={styles.mobileSupport}>ATENCIÓN POR WHATSAPP</p>
      </div>
    </nav>
  );
}
