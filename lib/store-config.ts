/** Official ARA LOT WhatsApp number, international digits only. */
export const WHATSAPP_NUMBER = "18296446731";

/** Provisional delivery fee in Dominican pesos; update here when the rate changes. */
export const DELIVERY_FEE = 100;

export function calculateOrderTotal(subtotal: number, method: "delivery" | "pickup" | "") {
  const deliveryFee = method === "delivery" ? DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
