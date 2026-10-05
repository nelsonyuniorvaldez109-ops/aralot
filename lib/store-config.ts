/** Valores de respaldo de ARA LOT. */
export const DEFAULT_WHATSAPP_NUMBER = "18296446731";
export const DEFAULT_DELIVERY_FEE = 100;

export type PublicStoreSettings = {
  whatsappNumber: string;
  deliveryFee: number;
  pickupEnabled: boolean;
  pickupMessage: string;
  shippingMessage: string;
  announcementEnabled: boolean;
  announcementText: string;
};

export const DEFAULT_STORE_SETTINGS: PublicStoreSettings = {
  whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
  deliveryFee: DEFAULT_DELIVERY_FEE,
  pickupEnabled: true,
  pickupMessage:
    "El lugar y horario de recogida se coordinan por WhatsApp.",
  shippingMessage:
    "Realizamos nuestros envíos los fines de semana.",
  announcementEnabled: true,
  announcementText:
    "REALIZAMOS NUESTROS ENVÍOS LOS FINES DE SEMANA",
};

export function calculateOrderTotal(
  subtotal: number,
  method: "delivery" | "pickup" | "",
  deliveryFee = DEFAULT_DELIVERY_FEE
) {
  const appliedDeliveryFee =
    method === "delivery" ? deliveryFee : 0;

  return {
    subtotal,
    deliveryFee: appliedDeliveryFee,
    total: subtotal + appliedDeliveryFee,
  };
}