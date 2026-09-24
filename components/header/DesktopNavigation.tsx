import Link from "next/link";
import { navigationItems } from "./navigation";
import styles from "./Header.module.css";

export function DesktopNavigation() {
  return (
    <nav className={styles.desktopNavigation} aria-label="Navegación principal">
      <ul>
        {navigationItems.map((item) => (
          <li key={item.label}>
            <Link href={item.href} aria-current={"current" in item ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}