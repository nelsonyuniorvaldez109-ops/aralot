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

import { type Product } from "@/data/products";
import { selectedVariant } from "@/lib/products/catalog";
import { useCatalog } from "@/components/product/CatalogProvider";

const MAX_QUANTITY = 20;
const STORAGE_KEY = "ara-lot-cart";

export type CartItem = {
  key: string;
  variantId?: string;
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
  addItem: (item: CartItemInput) => boolean;
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
function validateItem(value: unknown, products: Product[]): CartItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const product = products.find(product => product.id === input.productId);
  if (!product || typeof input.quantity !== "number" || !Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_QUANTITY) return null;
  const variant = selectedVariant(product, input.selectedColor as string | undefined, input.selectedSize as string | undefined, input.presentation as string | undefined);
  if (!variant || variant.stock < 1) return null;
  const item: CartItemInput = {
    variantId: variant.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: variant.image || product.image,
    imageAvailable: Boolean(variant.image || product.image),
    price: product.price,
    quantity: Math.min(input.quantity, variant.stock),
    selectedColor: input.selectedColor as string | undefined,
    selectedSize: input.selectedSize as string | undefined,
    presentation: variant.presentation,
  };
  return { ...item, key: createItemKey(item) };
}

function validateCart(value: unknown, products: Product[]): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const entry of value) {
    const item = validateItem(entry, products);
    if (!item) continue;
    const units = result.filter(current => current.productId === item.productId).reduce((sum, current) => sum + current.quantity, 0);
    if (units + item.quantity > MAX_QUANTITY) continue;
    const existing = result.find(current => current.key === item.key);
    if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, products.find(p => p.id === item.productId)?.variants?.find(v => v.id === item.variantId)?.stock ?? 0);
    else result.push(item);
  }
  return result;
}

function readStoredCart(products: Product[]): CartItem[] {
  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart: unknown = JSON.parse(storedCart);
    return validateCart(parsedCart, products);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, error } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) return;
    const frame = window.requestAnimationFrame(() => {
      setItems(readStoredCart(products));
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [products, error]);

  useEffect(() => {
    if (!ready || error) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready, error]);

  const addItem = useCallback((input: CartItemInput) => {
    if (error) return false;
    const item = validateItem(input, products);
    if (!item) return false;
    const stock = products.find(p => p.id === item.productId)?.variants?.find(v => v.id === item.variantId)?.stock ?? 0;
    const units = items.filter(v => v.productId === item.productId).reduce((n,v) => n + v.quantity, 0);
    const existingUnits = items.find(v => v.key === item.key)?.quantity ?? 0;
    if (units >= MAX_QUANTITY || existingUnits >= stock) return false;
    setItems(current => {
      const existing = current.find(v => v.key === item.key);
      const total = current.filter(v => v.productId === item.productId).reduce((n,v) => n + v.quantity, 0);
      const quantity = Math.min(item.quantity, MAX_QUANTITY-total, stock-(existing?.quantity ?? 0));
      if (quantity < 1) return current;
      return existing ? current.map(v => v.key === item.key ? {...v,quantity:v.quantity+quantity} : v) : [...current,{...item,quantity}];
    });
    return true;
  }, [items, products, error]);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (error || !Number.isInteger(quantity) || quantity < 1) return;
    setItems(current => current.map(item => {
      if (item.key !== key) return item;
      const stock = products.find(p => p.id === item.productId)?.variants?.find(v => v.id === item.variantId)?.stock ?? 0;
      const others = current.filter(v => v.productId === item.productId && v.key !== key).reduce((n,v) => n+v.quantity,0);
      return {...item,quantity:Math.min(quantity, MAX_QUANTITY-others, stock)};
    }).filter(item => item.quantity > 0));
  }, [products, error]);

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
      ready: ready && !error,
      totalUnits,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
    }),
    [items, ready, error, totalUnits, subtotal, addItem, updateQuantity, removeItem],
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
