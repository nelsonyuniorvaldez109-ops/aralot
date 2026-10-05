"use server";

import { safeImage } from "@/lib/products/images";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { productAccess } from "../productos/access";

export async function updateCategory(formData: FormData) {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    throw new Error("No tienes permisos para modificar categorías.");
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const imageUrl =
    String(formData.get("image_url") ?? "").trim() || null;

  if (imageUrl && !safeImage(imageUrl)) throw new Error("Selecciona una imagen del almacenamiento autorizado (JPEG, PNG o WEBP).");

  const sortOrderRaw = String(formData.get("sort_order") ?? "0");
  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  // Checkbox marcado = categoría activa.
  const active = formData.get("active") === "true";

  if (!id) {
    throw new Error("Categoría no válida.");
  }

  if (!name) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("El orden debe ser un número válido.");
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      description,
      image_url: imageUrl,
      active,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando categoría:", error);

    throw new Error(
      `No se pudo actualizar la categoría: ${error.message}`
    );
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/productos");

  redirect("/admin/categorias?resultado=guardado");
}

export async function createCategory(formData: FormData) {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    throw new Error("No tienes permisos para crear categorías.");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const imageUrl =
    String(formData.get("image_url") ?? "").trim() || null;

  if (imageUrl && !safeImage(imageUrl)) throw new Error("Selecciona una imagen del almacenamiento autorizado (JPEG, PNG o WEBP).");

  const sortOrderRaw = String(formData.get("sort_order") ?? "0");
  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  // Checkbox marcado = categoría activa.
  const active = formData.get("active") === "true";

  if (!name) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("El orden debe ser un número válido.");
  }

  // Generar slug automáticamente.
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new Error(
      "No se pudo generar un identificador para la categoría."
    );
  }

  // Evitar categorías con el mismo slug.
  const { data: existing, error: checkError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (checkError) {
    throw new Error(
      `No se pudo comprobar la categoría: ${checkError.message}`
    );
  }

  if (existing) {
    throw new Error(
      "Ya existe una categoría con ese nombre."
    );
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      name,
      slug,
      description,
      image_url: imageUrl,
      active,
      sort_order: sortOrder,
    });

  if (error) {
    console.error("Error creando categoría:", error);

    throw new Error(
      `No se pudo crear la categoría: ${error.message}`
    );
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
  revalidatePath("/productos");

  redirect("/admin/categorias?resultado=creado");
}