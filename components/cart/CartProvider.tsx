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

import { getProductImage, newProducts } from "@/data/products";

const MAX_QUANTITY = 20;
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

// Provisional client-side validation. A future server must validate orders independently.
function validateItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const product = newProducts.find(product => product.id === input.productId);
  if (!product || typeof input.quantity !== "number" || !Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_QUANTITY) return null;
  const validOption = (value: unknown, options?: string[]) => options?.length
    ? typeof value === "string" && options.includes(value)
    : value === undefined;
  if (!validOption(input.selectedColor, product.colors) || !validOption(input.selectedSize, product.sizes)) return null;
  if (input.presentation !== product.presentation) return null;
  const item: CartItemInput = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: getProductImage(product, input.selectedColor as string | undefined),
    imageAvailable: Boolean(product.imagesByColor?.[input.selectedColor as string]) || input.imageAvailable === true,
    price: product.price,
    quantity: input.quantity,
    selectedColor: input.selectedColor as string | undefined,
    selectedSize: input.selectedSize as string | undefined,
    presentation: product.presentation,
  };
  return { ...item, key: createItemKey(item) };
}

function validateCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const entry of value) {
    const item = validateItem(entry);
    if (!item) continue;
    const units = result.filter(current => current.productId === item.productId).reduce((sum, current) => sum + current.quantity, 0);
    if (units + item.quantity > MAX_QUANTITY) continue;
    const existing = result.find(current => current.key === item.key);
    if (existing) existing.quantity += item.quantity;
    else result.push(item);
  }
  return result;
}

function readStoredCart(): CartItem[] {
  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart: unknown = JSON.parse(storedCart);
    return validateCart(parsedCart);
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

  const addItem = useCallback((input: CartItemInput) => {
    const item = validateItem(input);
    if (!item) return;
    setItems((currentItems) => {
      const units = currentItems.filter(current => current.productId === item.productId).reduce((sum, current) => sum + current.quantity, 0);
      const quantity = Math.min(item.quantity, MAX_QUANTITY - units);
      if (quantity < 1) return currentItems;
      const existing = currentItems.find(current => current.key === item.key);
      return existing
        ? currentItems.map(current => current.key === item.key ? { ...current, quantity: current.quantity + quantity } : current)
        : [...currentItems, { ...item, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setItems((currentItems) => currentItems.map(item => {
      if (item.key !== key) return item;
      const otherUnits = currentItems.filter(current => current.productId === item.productId && current.key !== key).reduce((sum, current) => sum + current.quantity, 0);
      return { ...item, quantity: Math.min(quantity, MAX_QUANTITY - otherUnits) };
    }));
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
