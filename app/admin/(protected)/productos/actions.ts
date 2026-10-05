"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { productAccess } from "./access";
import { isId, productError, validateProduct, type SaveState } from "./model";

export async function saveProduct(_previous: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase, allowed } = await productAccess();
  if (!allowed) return { error: "Tu cuenta no tiene permisos para gestionar productos." };
  let raw: unknown;
  try {
    const payload = formData.get("payload");
    if (typeof payload !== "string" || payload.length > 400000) return { error: "El formulario excede el tamaño permitido." };
    raw = JSON.parse(payload);
  } catch { return { error: "No se pudo leer el formulario." }; }
  const validated = validateProduct(raw);
  if (Object.keys(validated.errors).length) return { error: "Revisa los campos indicados.", fields: validated.errors };
  try {
    const { data: matches, error: lookupError } = await supabase.from("products").select("id").eq("slug", validated.product.slug);
    if (lookupError) return { error: productError(lookupError) };
    if (matches?.some(row => row.id !== validated.id)) validated.product.slug += "-" + crypto.randomUUID().slice(0, 8);
    const { error, data } = await supabase.rpc("admin_save_product_v2", {
      p_product_id: validated.id ?? null,
      p_expected_updated_at: validated.updated_at ?? null,
      p_product: validated.product,
      p_variants: validated.variants,
    });
    if (error) return { error: productError(error) };
    if (!data) return { error: "No se confirmó el guardado. Recarga antes de intentarlo nuevamente." };
  } catch { return { error: "No se pudo confirmar el guardado. Recarga la lista antes de reintentarlo." }; }
  revalidatePath("/admin/productos");
  redirect("/admin/productos?resultado=guardado");
}

export async function deleteProduct(_previous: SaveState, formData: FormData): Promise<SaveState> {
  const { supabase, allowed } = await productAccess();
  if (!allowed) return { error: "Tu cuenta no tiene permisos para eliminar productos." };
  const id = formData.get("id"), updated = formData.get("updated_at");
  if (!isId(id) || typeof updated !== "string" || !Number.isFinite(Date.parse(updated)) || formData.get("confirmation") !== "ELIMINAR") {
    return { error: "Escribe ELIMINAR para confirmar." };
  }
  try {
    // The existing foreign keys cascade to variants and inventory atomically.
    const { error, data } = await supabase.from("products").delete().eq("id", id).eq("updated_at", updated).select("id").single();
    if (error) return { error: productError(error) };
    if (!data) return { error: "El producto no se eliminó. Recarga la lista." };
  } catch { return { error: "No se pudo confirmar la eliminación. Recarga la lista antes de reintentar." }; }
  revalidatePath("/admin/productos");
  redirect("/admin/productos?resultado=eliminado");
}
