"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

function NavIcon({ index }: { index: number }) {
  const paths = [
    "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    "m3 7 9-5 9 5v10l-9 5-9-5V7Zm0 0 9 5 9-5M12 12v10",
    "M3 4h7l2 3h9v13H3z",
    "M4 4h16v16H4zM8 8h8M8 12h8M8 16h4",
    "m3 3 10 0 8 8-10 10-8-8V3ZM7 7h.01",
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2",
  ];

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index]} />
    </svg>
  );
}

export function AdminNavigation() {
  const pathname = usePathname();

  const activeItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: 0,
    },
    {
      label: "Productos",
      href: "/admin/productos",
      icon: 1,
    },
    {
      label: "Categorías",
      href: "/admin/categorias",
      icon: 2,
    },
    {
      label: "Inventario",
      href: "/admin/inventario",
      icon: 3,
    },
    {
      label: "Configuración",
      href: "/admin/configuracion",
      icon: 5,
    },
  ];

  const comingSoonItems = [
    {
      label: "Promociones",
      icon: 4,
    },
  ];

  return (
    <nav aria-label="Navegación administrativa">
      {activeItems.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? styles.active : undefined}
          >
            <NavIcon index={item.icon} />
            {item.label}
          </Link>
        );
      })}

      {comingSoonItems.map((item) => (
        <button
          key={item.label}
          type="button"
          disabled
          title="Disponible en una próxima fase"
        >
          <NavIcon index={item.icon} />
          {item.label}
          <span>Próximamente</span>
        </button>
      ))}
    </nav>
  );
}