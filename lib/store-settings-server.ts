import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_STORE_SETTINGS,
  type PublicStoreSettings,
} from "@/lib/store-config";

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