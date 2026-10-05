"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCatalog } from "@/components/product/CatalogProvider";

const STORAGE_KEY = "ara-lot-favorites";


type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteCount: number;
  ready: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStoredFavorites(validProductIds: Set<string>) {
  try {
    const storedFavorites = window.localStorage.getItem(STORAGE_KEY);
    if (!storedFavorites) return [];

    const parsedFavorites: unknown = JSON.parse(storedFavorites);
    if (!Array.isArray(parsedFavorites)) return [];

    return Array.from(
      new Set(
        parsedFavorites.filter(
          (productId): productId is string =>
            typeof productId === "string" && validProductIds.has(productId),
        ),
      ),
    );
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { products, error } = useCatalog();
  const validProductIds = useMemo(() => new Set(products.map(p => p.id)), [products]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) return;
    const frame = window.requestAnimationFrame(() => {
      setFavoriteIds(readStoredFavorites(validProductIds));
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [validProductIds, error]);

  useEffect(() => {
    if (!ready || error) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Storage may be blocked or full; keep the current in-memory state.
    }
  }, [favoriteIds, ready, error]);

  const toggleFavorite = useCallback((productId: string) => {
    if (!validProductIds.has(productId)) return;

    setFavoriteIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((currentId) => currentId !== productId)
        : [...currentIds, productId],
    );
  }, [validProductIds]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteCount: favoriteIds.length,
      ready,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, ready, isFavorite, toggleFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites debe utilizarse dentro de FavoritesProvider");
  }

  return context;
}
