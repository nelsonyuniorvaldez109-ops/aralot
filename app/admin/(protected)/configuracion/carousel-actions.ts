"use server";
import { revalidatePath } from "next/cache";
import { validateCarousel, isCarouselRevision } from "@/lib/home-carousel";
import { productAccess } from "../productos/access";
import { carouselFailure } from "./carousel-errors";
export type CarouselState = { error?: string; success?: string; warning?: string; revision?: string };
export async function saveCarousel(_previous: CarouselState, form: FormData): Promise<CarouselState> {
  let access;
  try { access = await productAccess(); }
  catch (error) { return { error: carouselFailure("authorization", error) }; }
  const { supabase, allowed } = access;
  if (!allowed) return { error: carouselFailure("authorization", { code: "42501" }) };
  const payload = form.get("images");
  const expectedRevision = form.get("revision");
  let images;
  try {
    if (!isCarouselRevision(expectedRevision) || typeof payload !== "string" || payload.length > 25000) throw new Error();
    images = validateCarousel(JSON.parse(payload));
    if (!images) throw new Error();
  } catch (error) { return { error: carouselFailure("validation", error) }; }
  let revision: string;
  try {
    const { data, error } = await supabase.rpc("admin_save_home_carousel_v2", { p_images: images, p_expected_revision: expectedRevision });
    if (error) return { error: carouselFailure("save", error) };
    if (!isCarouselRevision(data)) return { error: carouselFailure("save", null) };
    revision = data;
  } catch (error) { return { error: carouselFailure("save", error) }; }
  // Persistence is confirmed. A cache failure must not be reported as a failed save.
  const success = "Carrusel guardado correctamente.";
  try {
    revalidatePath("/");
    revalidatePath("/admin/configuracion");
  } catch (error) { return { success, revision, warning: carouselFailure("refresh", error) }; }
  return { success, revision };
}
