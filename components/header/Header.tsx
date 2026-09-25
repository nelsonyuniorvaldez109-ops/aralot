"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./Header.module.css";

const actions: { label: string; compact?: boolean; icon: ReactNode }[] = [
  { label: "Buscar", icon: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></> },
  { label: "Mi cuenta", compact: true, icon: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></> },
  { label: "Favoritos", compact: true, icon: <path d="M20.4 5.6a5.4 5.4 0 0 0-7.6 0L12 6.4l-.8-.8a5.4 5.4 0 0 0-7.6 7.6L12 21l8.4-7.8a5.4 5.4 0 0 0 0-7.6Z" /> },
  { label: "Carrito", icon: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></> },
];

export function Header() {
  const { ready, totalUnits } = useCart();
  const {
    favoriteCount,
    ready: favoritesReady,
  } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 75rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    window.requestAnimationFrame(() => searchButton.current?.focus());
  }, []);

  return (
    <header className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();
        closeMenu();
      }
    }}>
      <div className={`container ${styles.headerInner}`}>
        <button
          ref={menuButton}
          type="button"
          className={`${styles.iconButton} ${styles.menuToggle}`}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" focusable="false">
            {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
        {/* Temporary wordmark: replace this text with the official logo asset when available. */}
        <Link href="/" className={styles.wordmark} aria-label="ARA LOT — Inicio">ARA LOT</Link>
        <DesktopNavigation />
        <div className={styles.actions} role="group" aria-label="Acciones de la tienda">
          {actions.map(({ label, compact, icon }) => {
            const className = `${styles.iconButton} ${compact ? styles.secondaryAction : ""}`;

            if (label === "Buscar") {
              return (
                <button
                  ref={searchButton}
                  key={label}
                  type="button"
                  className={className}
                  aria-label="Buscar productos"
                  aria-expanded={searchOpen}
                  aria-controls="product-search-overlay"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icon}</svg>
                </button>
              );
            }

            if (label === "Favoritos") {
              return (
                <Link
                  key={label}
                  href="/favoritos"
                  className={`${className} ${styles.favoriteLink}`}
                  aria-label={
                    favoritesReady && favoriteCount > 0
                      ? `Favoritos, ${favoriteCount} ${favoriteCount === 1 ? "producto" : "productos"}`
                      : "Favoritos"
                  }
                  title="Ver favoritos"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icon}</svg>
                  {favoritesReady && favoriteCount > 0 ? (
                    <span className={styles.cartCount} aria-hidden="true">
                      {favoriteCount}
                    </span>
                  ) : null}
                </Link>
              );
            }

            if (label === "Carrito") {
              return (
                <Link
                  key={label}
                  href="/carrito"
                  className={`${className} ${styles.cartButton}`}
                  aria-label={
                    ready && totalUnits > 0
                      ? `Carrito, ${totalUnits} ${totalUnits === 1 ? "unidad" : "unidades"}`
                      : "Carrito"
                  }
                  title="Ver carrito"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icon}</svg>
                  {ready && totalUnits > 0 ? (
                    <span className={styles.cartCount} aria-hidden="true">
                      {totalUnits}
                    </span>
                  ) : null}
                </Link>
              );
            }

            return (
              <button key={label} type="button" className={className} aria-label={label} aria-disabled="true" title={`${label} — Próximamente`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{icon}</svg>
              </button>
            );
          })}
        </div>
      </div>
      <MobileNavigation open={menuOpen} onNavigate={closeMenu} />
      {searchOpen ? <SearchOverlay onClose={closeSearch} /> : null}
    </header>
  );
}
