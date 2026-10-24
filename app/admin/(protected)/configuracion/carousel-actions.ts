"use server";
import { revalidatePath } from "next/cache";
import { validateCarousel } from "@/lib/home-carousel";
import { productAccess } from "../productos/access";
export type CarouselState = { error?: string; success?: string };
export async function saveCarousel(_previous: CarouselState, form: FormData): Promise<CarouselState> {
  const { supabase, allowed } = await productAccess();
  if (!allowed) return { error: "No tienes permisos para modificar el carrusel." };
  const payload = form.get("images");
  if (typeof payload !== "string" || payload.length > 25000) return { error: "La configuración no es válida." };
  let images;
  try { images = validateCarousel(JSON.parse(payload)); } catch { return { error: "La configuración no es válida." }; }
  if (!images) return { error: "Usa un máximo de 10 imágenes válidas, sin duplicados." };
  try {
    const { error } = await supabase.rpc("admin_save_home_carousel", { p_images: images });
    if (error) return { error: "No se pudo guardar el carrusel. Comprueba los permisos y que la migración esté aplicada, y vuelve a intentarlo." };
  } catch { return { error: "No se pudo conectar. Tus cambios siguen en pantalla; vuelve a intentarlo." }; }
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  return { success: "Carrusel guardado correctamente." };
}
