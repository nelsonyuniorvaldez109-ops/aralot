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
import { newProducts } from "@/data/products";

const STORAGE_KEY = "ara-lot-favorites";
const validProductIds = new Set(newProducts.map((product) => product.id));

type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteCount: number;
  ready: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readStoredFavorites() {
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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setFavoriteIds(readStoredFavorites());
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds, ready]);

  const toggleFavorite = useCallback((productId: string) => {
    if (!validProductIds.has(productId)) return;

    setFavoriteIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((currentId) => currentId !== productId)
        : [...currentIds, productId],
    );
  }, []);

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
