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

const STORAGE_KEY = "ara-lot-cart";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  imageAvailable: boolean;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  presentation?: string;
};

export type CartItemInput = Omit<CartItem, "key">;

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  totalUnits: number;
  subtotal: number;
  addItem: (item: CartItemInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function createItemKey(item: CartItemInput) {
  return [
    item.productId,
    item.selectedColor ?? "",
    item.selectedSize ?? "",
    item.presentation ?? "",
  ].join("::");
}

function readStoredCart(): CartItem[] {
  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart: unknown = JSON.parse(storedCart);
    return Array.isArray(parsedCart) ? (parsedCart as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setItems(readStoredCart());
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: CartItemInput) => {
    const key = createItemKey(item);

    setItems((currentItems) => {
      const existingItem = currentItems.find((current) => current.key === key);

      if (existingItem) {
        return currentItems.map((current) =>
          current.key === key
            ? { ...current, quantity: current.quantity + item.quantity }
            : current,
        );
      }

      return [...currentItems, { ...item, key }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.key !== key));
  }, []);

  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      ready,
      totalUnits,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
    }),
    [items, ready, totalUnits, subtotal, addItem, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider");
  }

  return context;
}
