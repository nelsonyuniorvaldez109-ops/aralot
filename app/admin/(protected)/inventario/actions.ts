"use server";

import { revalidatePath } from "next/cache";
import { productAccess } from "../productos/access";

export type InventoryState = {
  error?: string;
  success?: string;
};

export async function addInventory(
  _previous: InventoryState,
  formData: FormData
): Promise<InventoryState> {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return {
      error: "Tu cuenta no tiene permisos para gestionar el inventario.",
    };
  }

  const inventoryId = formData.get("inventory_id");
  const unitsRaw = formData.get("units");

  if (
    typeof inventoryId !== "string" ||
    typeof unitsRaw !== "string"
  ) {
    return {
      error: "Los datos enviados no son válidos.",
    };
  }

  const units = Number(unitsRaw);

  if (
    !Number.isInteger(units) ||
    units <= 0 ||
    units > 100000
  ) {
    return {
      error: "La cantidad debe ser un número entero mayor que 0.",
    };
  }

  const { data: inventory, error: readError } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("id", inventoryId)
    .single();

  if (readError || !inventory) {
    return {
      error: "No se encontró el registro de inventario.",
    };
  }

  const currentQuantity = Number(inventory.quantity ?? 0);
  const newQuantity = currentQuantity + units;

  const { error: updateError } = await supabase
    .from("inventory")
    .update({
      quantity: newQuantity,
    })
    .eq("id", inventoryId);

  if (updateError) {
    return {
      error: "No se pudieron agregar las unidades.",
    };
  }

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");

  return {
    success: `${units} unidades agregadas correctamente.`,
  };
}

export async function adjustInventory(
  _previous: InventoryState,
  formData: FormData
): Promise<InventoryState> {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return {
      error: "Tu cuenta no tiene permisos para gestionar el inventario.",
    };
  }

  const inventoryId = formData.get("inventory_id");
  const quantityRaw = formData.get("quantity");

  if (
    typeof inventoryId !== "string" ||
    typeof quantityRaw !== "string"
  ) {
    return {
      error: "Los datos enviados no son válidos.",
    };
  }

  const quantity = Number(quantityRaw);

  if (
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > 100000
  ) {
    return {
      error: "La existencia debe ser un número entero entre 0 y 100000.",
    };
  }

  const { data, error } = await supabase
    .from("inventory")
    .update({
      quantity,
    })
    .eq("id", inventoryId)
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: "No se pudo ajustar el inventario.",
    };
  }

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");

  return {
    success: `Inventario ajustado a ${quantity} unidades.`,
  };
}