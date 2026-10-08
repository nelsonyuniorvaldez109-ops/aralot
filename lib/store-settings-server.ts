import "server-only";
import { safeImage } from "@/lib/products/images";

import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_STORE_SETTINGS,
  type PublicStoreSettings,
} from "@/lib/store-config";

// Separate read keeps existing checkout settings independent of this migration.
export async function getBannerImages(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (url !== "https://vfsenqecpfzcqahsscsl.supabase.co" || !key) return [];
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("store_settings")
      .select("poloches_banner_image,personal_care_banner_image").limit(1).maybeSingle();
    if (error || !data) return [];
    return [safeImage(data.poloches_banner_image), safeImage(data.personal_care_banner_image)];
  } catch { return []; }
}

export async function getHeroImage(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (url !== "https://vfsenqecpfzcqahsscsl.supabase.co" || !key) return "";
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from("store_settings")
      .select("hero_image").limit(1).maybeSingle();
    return error ? "" : safeImage(data?.hero_image);
  } catch { return ""; }
}

export async function getPublicStoreSettings(): Promise<PublicStoreSettings> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error("Falta la configuración privada de Supabase.");
    return DEFAULT_STORE_SETTINGS;
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("store_settings")
    .select(`
      whatsapp_number,
      delivery_fee,
      pickup_enabled,
      pickup_message,
      shipping_message,
      announcement_enabled,
      announcement_text
    `)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error("STORE SETTINGS PUBLIC READ ERROR:", error);
    return DEFAULT_STORE_SETTINGS;
  }

  return {
    whatsappNumber:
      data.whatsapp_number || DEFAULT_STORE_SETTINGS.whatsappNumber,

    deliveryFee:
      typeof data.delivery_fee === "number"
        ? data.delivery_fee
        : DEFAULT_STORE_SETTINGS.deliveryFee,

    pickupEnabled:
      typeof data.pickup_enabled === "boolean"
        ? data.pickup_enabled
        : DEFAULT_STORE_SETTINGS.pickupEnabled,

    pickupMessage:
      data.pickup_message || DEFAULT_STORE_SETTINGS.pickupMessage,

    shippingMessage:
      data.shipping_message || DEFAULT_STORE_SETTINGS.shippingMessage,

    announcementEnabled:
      typeof data.announcement_enabled === "boolean"
        ? data.announcement_enabled
        : DEFAULT_STORE_SETTINGS.announcementEnabled,

    announcementText:
      data.announcement_text || DEFAULT_STORE_SETTINGS.announcementText,
  };
}
