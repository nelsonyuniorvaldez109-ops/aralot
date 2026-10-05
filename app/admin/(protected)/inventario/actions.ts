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

  const { error } = await supabase.rpc("admin_add_inventory", {
    p_inventory_id: inventoryId, p_units: units,
  });
  if (error) return { error: "No se pudieron agregar las unidades. Comprueba que la actualización SQL de inventario esté instalada." };

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

  const expected = formData.get("expected_updated_at");
  if (typeof expected !== "string" || !Number.isFinite(Date.parse(expected))) {
    return { error: "Recarga el inventario antes de ajustar el stock." };
  }
  const { error } = await supabase.rpc("admin_adjust_inventory", {
    p_inventory_id: inventoryId, p_quantity: quantity, p_expected_updated_at: expected,
  });
  if (error) return { error: error.message === "INVENTORY_CHANGED"
    ? "El stock cambió mientras editabas. Recarga y revisa la cantidad antes de ajustar."
    : "No se pudo ajustar el inventario. Comprueba la actualización SQL e inténtalo nuevamente." };

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath("/");

  return {
    success: `Inventario ajustado a ${quantity} unidades.`,
  };
}