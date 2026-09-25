"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { newProducts } from "@/data/products";
import styles from "./SearchOverlay.module.css";

type SearchOverlayProps = {
  onClose: () => void;
};

const priceFormatter = new Intl.NumberFormat("es-DO", {
  style: "currency",
  currency: "DOP",
  maximumFractionDigits: 0,
});

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const results = normalizedQuery
    ? newProducts.filter((product) =>
        `${product.name} ${product.category}`
          .toLocaleLowerCase("es")
          .includes(normalizedQuery),
      )
    : [];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());

    function closeWithEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", closeWithEscape);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", closeWithEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function keepFocusInside(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'input, a[href], button:not([disabled])',
      ) ?? [],
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className={styles.overlay} id="product-search-overlay" role="presentation">
      <div
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        onKeyDown={keepFocusInside}
      >
        <div className="container">
          <header className={styles.heading}>
            <div>
              <p>ARA LOT</p>
              <h2 id="search-title">Buscar productos</h2>
            </div>
            <button type="button" aria-label="Cerrar búsqueda" onClick={onClose}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 5 14 14M19 5 5 19" />
              </svg>
            </button>
          </header>

          <div className={styles.searchField}>
            <label htmlFor="product-search">Buscar en ARA LOT</label>
            <input
              ref={inputRef}
              id="product-search"
              type="search"
              value={query}
              placeholder="Buscar productos..."
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className={styles.results} aria-live="polite">
            {!normalizedQuery ? (
              <p className={styles.message}>Escribe para buscar productos.</p>
            ) : results.length === 0 ? (
              <p className={styles.message}>
                No encontramos productos para tu búsqueda.
              </p>
            ) : (
              <ul aria-label={`${results.length} productos encontrados`}>
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/productos/${product.slug}`}
                      onClick={onClose}
                    >
                      <span className={styles.media}>
                        <span className={styles.placeholder} aria-hidden="true" />
                      </span>
                      <span className={styles.productInformation}>
                        <strong>{product.name}</strong>
                        <small>{product.category}</small>
                      </span>
                      <span className={styles.price}>
                        {priceFormatter.format(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
