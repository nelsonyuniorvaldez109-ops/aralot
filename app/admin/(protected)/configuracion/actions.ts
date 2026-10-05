"use server";

import { revalidatePath } from "next/cache";
import { productAccess } from "../productos/access";

export type SettingsState = {
  error?: string;
  success?: string;
};

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