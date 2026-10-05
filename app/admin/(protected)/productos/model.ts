import { safeImage } from "@/lib/products/images";
export type Category = { id: string; name: string; active: boolean };
export type VariantDraft = {
  id?: string; expected_inventory_updated_at?: string; stock_changed?: boolean;
  sku: string; color: string; size: string; presentation: string; image_url: string;
  active: boolean; quantity: string; low_stock_threshold: string;
};
export type ProductDraft = {
  id?: string; updated_at?: string; name: string; slug: string; category_id: string;
  description: string; price: string; sale_price: string; image_url: string;
  active: boolean; variants: VariantDraft[];
};
export type SaveState = { error: string; fields?: Record<string, string> };
export type ListProduct = {
  id: string; name: string; slug: string; price: number; sale_price: number | null;
  active: boolean; updated_at: string; categories: { name: string } | null;
};
export const emptyVariant = (): VariantDraft => ({
  sku: "", color: "", size: "", presentation: "", image_url: "",
  active: true, quantity: "0", low_stock_threshold: "5",
});
export const emptyProduct = (): ProductDraft => ({
  name: "", slug: "", category_id: "", description: "", price: "", sale_price: "",
  image_url: "", active: true, variants: [emptyVariant()],
});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isId = (value: unknown): value is string => typeof value === "string" && uuid.test(value);
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function validateProduct(value: unknown) {
  const input = record(value);
  const errors: Record<string, string> = {};
  function text(source: Record<string, unknown>, key: string, path: string, max: number, required = false) {
    const value = typeof source[key] === "string" ? source[key].trim() : "";
    if (required && !value) errors[path] = "Este campo es obligatorio.";
    if (value.length > max) errors[path] = `Usa como máximo ${max} caracteres.`;
    return value;
  }
  function image(source: Record<string, unknown>, path: string) {
    const value = text(source, "image_url", path, 2048);
    if (value && !safeImage(value)) errors[path] = "Selecciona una imagen del almacenamiento autorizado (JPEG, PNG o WEBP).";
    return value || null;
  }
  function numeric(source: Record<string, unknown>, key: string, path: string, integer: boolean, optional = false) {
    const raw = typeof source[key] === "string" ? source[key].trim() : "";
    if (!raw && optional) return null;
    const valid = integer ? /^\d+$/.test(raw) : /^\d+(?:\.\d{1,2})?$/.test(raw);
    const result = Number(raw);
    if (!valid || !Number.isFinite(result) || result < 0 || result > (integer ? 2147483647 : 99999999.99)) {
      errors[path] = integer ? "Ingresa un entero mayor o igual a 0." : "Ingresa un precio válido, con hasta 2 decimales.";
    }
    return result;
  }
  const name = text(input, "name", "name", 200, true);
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,180).replace(/-$/, "") || "producto";
  const category_id = text(input, "category_id", "category_id", 36, true);
  if (!isId(category_id)) errors.category_id = "Selecciona una categoría.";
  const price = numeric(input, "price", "price", false)!;
  const sale_price = numeric(input, "sale_price", "sale_price", false, true);
  if (sale_price !== null && sale_price > price) errors.sale_price = "La oferta no puede superar el precio.";
  if (typeof input.active !== "boolean") errors.active = "Selecciona el estado.";
  if (input.id !== undefined && !isId(input.id)) errors.form = "Producto inválido.";
  if (input.id && (typeof input.updated_at !== "string" || !Number.isFinite(Date.parse(input.updated_at)))) errors.form = "Recarga el producto antes de editarlo.";
  if (!Array.isArray(input.variants) || input.variants.length < 1 || input.variants.length > 100) errors.variants = "Agrega entre 1 y 100 variantes.";
  const ids = new Set<string>(), skus = new Set<string>();
  const variants = (Array.isArray(input.variants) ? input.variants.slice(0, 100) : []).map((raw, index) => {
    const v = record(raw), prefix = `variants.${index}.`;
    if (v.id !== undefined && (!isId(v.id) || ids.has(v.id))) errors[prefix + "id"] = "Variante inválida o repetida.";
    if (typeof v.id === "string") ids.add(v.id);
    const sku = text(v, "sku", prefix + "sku", 100);
    if (sku && skus.has(sku)) errors[prefix + "sku"] = "El SKU está repetido.";
    if (sku) skus.add(sku);
    if (typeof v.active !== "boolean") errors[prefix + "active"] = "Selecciona el estado.";
    if (v.stock_changed === true && v.id && (typeof v.expected_inventory_updated_at !== "string" || !Number.isFinite(Date.parse(v.expected_inventory_updated_at)))) errors[prefix + "quantity"] = "Recarga el producto antes de ajustar el stock.";
    return {
      stock_changed: v.stock_changed === true,
      expected_inventory_updated_at: typeof v.expected_inventory_updated_at === "string" ? v.expected_inventory_updated_at : null,
      id: v.id || null, sku: sku || null,
      color: text(v, "color", prefix + "color", 100) || null,
      size: text(v, "size", prefix + "size", 50) || null,
      presentation: text(v, "presentation", prefix + "presentation", 150) || null,
      image_url: image(v, prefix + "image_url"), active: v.active,
      quantity: numeric(v, "quantity", prefix + "quantity", true),
      low_stock_threshold: numeric(v, "low_stock_threshold", prefix + "low_stock_threshold", true),
    };
  });
  const combinations = new Set<string>();
  for (const variant of variants.filter(v => v.active)) {
    const key = [variant.color, variant.size, variant.presentation].map(value => (value ?? "").trim().toLowerCase()).join("|");
    if (combinations.has(key)) errors.variants = "Hay opciones repetidas. Usa una sola fila por color y talla o por presentación.";
    combinations.add(key);
  }
  if (input.active && !variants.some(v => v.active)) errors.variants = "Agrega al menos una opción disponible.";
  const product = { name, slug, category_id, description: text(input, "description", "description", 10000) || null, price, sale_price, image_url: image(input, "image_url"), active: input.active };
  return { errors, product, variants, id: input.id as string | undefined, updated_at: input.updated_at as string | undefined };
}

export function productError(error: unknown): string {
  const e = record(error);
  if (e.message === "INVENTORY_CHANGED") return "El inventario cambió mientras editabas. Recarga y revisa el stock antes de guardar.";
  if (e.message === "PRODUCT_CHANGED") return "Otro cambio modificó este producto. Recarga antes de guardar.";
  if (e.message === "PRODUCT_NOT_FOUND" || e.code === "PGRST116") return "El producto cambió, ya no existe o no tienes acceso. Recarga la página.";
  if (e.code === "42501") return "Tu cuenta no tiene permisos para gestionar productos.";
  if (e.code === "23505") return "Ya existe un producto con esa referencia. Recarga e intenta nuevamente.";
  if (e.code === "23503") return "La categoría o una relación ya no está disponible. Recarga e inténtalo de nuevo.";
  if (["22023", "22P02", "22003", "23514"].includes(String(e.code))) return "Revisa los campos: hay un valor inválido.";
  if (["PGRST202", "PGRST205", "42P01"].includes(String(e.code))) return "La configuración de Productos no está disponible en este proyecto de Supabase.";
  return "No se pudo completar la operación. Inténtalo nuevamente.";
}
