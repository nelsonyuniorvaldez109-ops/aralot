"use server";

import { revalidatePath } from "next/cache";
import { productAccess } from "../productos/access";
import { safeImage } from "@/lib/products/images";

export async function updateBannerImages(_previous: SettingsState, formData: FormData): Promise<SettingsState> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://vfsenqecpfzcqahsscsl.supabase.co") {
    return { error: "Esta configuración está habilitada únicamente en ARA LOT producci�n." };
  }
  const { supabase, allowed } = await productAccess();
  if (!allowed) return { error: "Tu cuenta no tiene permisos para modificar la configuración." };
  const id = formData.get("settings_id");
  const poloches = formData.get("poloches_banner_image");
  const care = formData.get("personal_care_banner_image");
  if (typeof id !== "string" || typeof poloches !== "string" || typeof care !== "string" ||
      [poloches, care].some(value => value.length > 2048 || (value !== "" && !safeImage(value)))) {
    return { error: "Selecciona imágenes del almacenamiento autorizado." };
  }
  try {
    const { data, error } = await supabase.from("store_settings").update({
      poloches_banner_image: poloches || null,
      personal_care_banner_image: care || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select("id").single();
    if (error || !data) return { error: "No se pudieron guardar las imágenes. Comprueba la migración y tus permisos." };
  } catch { return { error: "No se pudo confirmar el guardado. Recarga para comprobarlo antes de reintentar." }; }
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  return { success: "Imágenes de portada guardadas correctamente." };
}

export type SettingsState = {
  error?: string;
  success?: string;
};

export async function updateHeroImage(_previous: SettingsState, formData: FormData): Promise<SettingsState> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://vfsenqecpfzcqahsscsl.supabase.co") {
    return { error: "Esta configuración está habilitada únicamente en ARA LOT producci�n." };
  }
  const { supabase, allowed } = await productAccess();
  if (!allowed) return { error: "Tu cuenta no tiene permisos para modificar la configuración." };
  const id = formData.get("settings_id");
  const image = formData.get("hero_image");
  if (typeof id !== "string" || typeof image !== "string" || image.length > 2048 ||
      (image !== "" && (!safeImage(image) || !/^https:\/\/vfsenqecpfzcqahsscsl\.supabase\.co\/storage\/v1\/object\/public\/product-images\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(image)))) {
    return { error: "Selecciona una fotografía del almacenamiento autorizado de TEST." };
  }
  try {
    const { data, error } = await supabase.from("store_settings").update({
      hero_image: image || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select("id").single();
    if (error || !data) return { error: "No se pudo guardar la imagen principal. Comprueba la migración y tus permisos." };
  } catch { return { error: "No se pudo confirmar el guardado. Recarga para comprobarlo antes de reintentar." }; }
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  return { success: "Imagen principal de portada guardada correctamente." };
}

export async function updateSettings(
  _previous: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  // 1. Comprobar que el usuario sea administrador.
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return {
      error: "Tu cuenta no tiene permisos para modificar la configuración.",
    };
  }

  // 2. Obtener los datos enviados por el formulario.
  const settingsId = formData.get("settings_id");
  const whatsappNumber = formData.get("whatsapp_number");
  const deliveryFeeRaw = formData.get("delivery_fee");
  const contactEmail = formData.get("contact_email");
  const instagramUrl = formData.get("instagram_url");
  const pickupMessage = formData.get("pickup_message");
  const shippingMessage = formData.get("shipping_message");
  const announcementText = formData.get("announcement_text");

  // Los checkbox solo aparecen en FormData cuando están marcados.
  const weekendShippingOnly = formData.get("weekend_shipping_only") === "on";
  const pickupEnabled = formData.get("pickup_enabled") === "on";
  const announcementEnabled = formData.get("announcement_enabled") === "on";

  // 3. Comprobar que recibimos los campos esperados.
  if (
    typeof settingsId !== "string" ||
    typeof whatsappNumber !== "string" ||
    typeof deliveryFeeRaw !== "string" ||
    typeof contactEmail !== "string" ||
    typeof instagramUrl !== "string" ||
    typeof pickupMessage !== "string" ||
    typeof shippingMessage !== "string" ||
    typeof announcementText !== "string"
  ) {
    return {
      error: "Los datos enviados no son válidos.",
    };
  }

  // 4. Limpiar espacios innecesarios.
  const cleanWhatsapp = whatsappNumber.replace(/\D/g, "");
  const cleanEmail = contactEmail.trim();
  const cleanInstagram = instagramUrl.trim();
  const cleanPickupMessage = pickupMessage.trim();
  const cleanShippingMessage = shippingMessage.trim();
  const cleanAnnouncementText = announcementText.trim();

  // 5. Validar WhatsApp.
  if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 15) {
    return {
      error: "Introduce un número de WhatsApp válido.",
    };
  }

  // 6. Validar el costo de envío.
  const deliveryFee = Number(deliveryFeeRaw);

  if (
    !Number.isFinite(deliveryFee) ||
    deliveryFee < 0 ||
    deliveryFee > 100000
  ) {
    return {
      error: "El costo de envío no es válido.",
    };
  }

  // 7. Validar correo electrónico.
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return {
      error: "Introduce un correo electrónico válido.",
    };
  }

  // 8. Validar Instagram si se proporciona.
  if (cleanInstagram) {
    try {
      const instagram = new URL(cleanInstagram);

      if (
        instagram.protocol !== "https:" ||
        !["instagram.com", "www.instagram.com"].includes(
          instagram.hostname.toLowerCase()
        )
      ) {
        return {
          error: "El enlace de Instagram debe pertenecer a instagram.com.",
        };
      }
    } catch {
      return {
        error: "El enlace de Instagram no es válido.",
      };
    }
  }

  // 9. Evitar textos excesivamente grandes.
  if (
    cleanPickupMessage.length > 500 ||
    cleanShippingMessage.length > 500 ||
    cleanAnnouncementText.length > 250
  ) {
    return {
      error: "Uno de los mensajes supera el límite permitido.",
    };
  }

  // 10. Guardar únicamente la fila de configuración indicada.
  const { data, error } = await supabase
    .from("store_settings")
    .update({
      whatsapp_number: cleanWhatsapp,
      delivery_fee: deliveryFee,
      weekend_shipping_only: weekendShippingOnly,
      contact_email: cleanEmail,
      instagram_url: cleanInstagram || null,
      pickup_enabled: pickupEnabled,
      pickup_message: cleanPickupMessage || null,
      shipping_message: cleanShippingMessage || null,
      announcement_enabled: announcementEnabled,
      announcement_text: cleanAnnouncementText || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settingsId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("STORE SETTINGS UPDATE ERROR:", error);

    return {
      error: "No se pudo guardar la configuración.",
    };
  }

  // 11. Actualizar las páginas que pueden utilizar esta configuración.
  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  revalidatePath("/checkout");

  return {
    success: "Configuración guardada correctamente.",
  };
}
