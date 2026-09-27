import { calculateOrderTotal } from "@/lib/store-config";
import type { CartItem } from "@/components/cart/CartProvider";

export type CustomerDetails = {
  name: string;
  phone: string;
  email: string;
  address: string;
  sector: string;
  city: string;
  province: string;
  reference: string;
  deliveryMethod: string;
};

const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const price = (value: number) => `RD$${amount.format(value)}`;

export function buildWhatsAppUrl(
  number: string,
  items: CartItem[],
  customer: CustomerDetails,
  receipt?: { id: string; date: string },
): string | null {
  if (!/^[1-9]\d{7,14}$/.test(number) || items.length === 0) return null;

  const products = items.map((item, index) => [
    `${index + 1}. ${item.name}`,
    item.selectedSize && `Talla: ${item.selectedSize}`,
    item.selectedColor && `Color: ${item.selectedColor}`,
    item.presentation && `Presentación: ${item.presentation}`,
    `Cantidad: ${item.quantity}`,
    `Precio unitario: ${price(item.price)}`,
    `Subtotal: ${price(item.price * item.quantity)}`,
  ].filter(Boolean).join("\n")).join("\n\n");
  const { subtotal, deliveryFee, total } = calculateOrderTotal(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    customer.deliveryMethod === "RECOGER" ? "pickup" : "delivery",
  );
  const message = [
    "Hola, quiero realizar el siguiente pedido:",
    ...(receipt ? [`Pedido: ${receipt.id} (referencia local)`, `Fecha y hora: ${receipt.date}`] : []),
    "", "PEDIDO", "--------------------", "", products, "",
    "--------------------",
    `Subtotal: ${price(subtotal)}`,
    `${customer.deliveryMethod === "RECOGER" ? "Recogida" : "Envío"}: ${price(deliveryFee)}`,
    `TOTAL: ${price(total)}`,
    "", "DATOS DEL CLIENTE", "",
    `Nombre: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    `Correo: ${customer.email}`,
    ...(customer.deliveryMethod === "RECOGER" ? [
      "Método de entrega: RECOGER",
      "Lugar y horario: Pendientes de coordinación",
    ] : [
      `Dirección: ${customer.address}`,
      `Sector: ${customer.sector}`,
      `Ciudad: ${customer.city}`,
      `Provincia: ${customer.province}`,
      `Referencia: ${customer.reference || "No indicada"}`,
      `Método de entrega: ${customer.deliveryMethod}`,
    ]),
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
