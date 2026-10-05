import type { CartItem } from "@/components/cart/CartProvider";
import type { CustomerDetails } from "@/lib/whatsapp-order";

export type Receipt = {
  subtotal: number;
  total: number;
  status: "reserved" | "cancelled" | "expired";
  expiresAt: string;
  whatsappUrl: string | null;
  id: string;
  date: string;
  customer: CustomerDetails;
  items: CartItem[];
  deliveryFee: number;
  shippingMessage: string;
  whatsappNumber: string;
};

export type ReceiptRow = {
  text: string;
  kind: "brand" | "heading" | "text" | "total";
};

const money = (value: number) =>
  `RD$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value)}`;

export function receiptRows(receipt: Receipt): ReceiptRow[] {
  const { customer, items } = receipt;
  const rows: ReceiptRow[] = [];

  const add = (
    text: string,
    kind: ReceiptRow["kind"] = "text"
  ) => rows.push({ text, kind });

  add("ARA LOT", "brand");
  add("RECIBO DE PEDIDO", "heading");
  add(`Pedido: ${receipt.id}`);
  add(`Fecha y hora: ${receipt.date}`);
  add("Solicitud pendiente de confirmación. No acredita pago.");

  add(`Reserva: ${receipt.status === "reserved" ? "Activa" : receipt.status === "cancelled" ? "Cancelada" : "Vencida"}`);
  add(`Vencimiento: ${new Date(receipt.expiresAt).toLocaleString("es-DO")}`);
  add("DATOS DEL CLIENTE", "heading");
  add(`Nombre: ${customer.name}`);
  add(`Teléfono: ${customer.phone}`);

  if (customer.deliveryMethod === "RECOGER") {
    add("Método de entrega: RECOGER");
    add("Estado de entrega: Pendiente de coordinación");
  } else {
    add(
      `Dirección: ${[
        customer.address,
        customer.sector,
        customer.city,
        customer.province,
      ].join(", ")}`
    );

    add(`Referencia: ${customer.reference || "No indicada"}`);
    add(`Método de entrega: ${customer.deliveryMethod}`);
  }

  add("DETALLE DEL PEDIDO", "heading");

  items.forEach((item, index) => {
    add(`${index + 1}. ${item.name}`, "heading");

    if (item.selectedColor) {
      add(`Color: ${item.selectedColor}`);
    }

    if (item.selectedSize) {
      add(`Talla: ${item.selectedSize}`);
    }

    if (item.presentation) {
      add(`Presentación: ${item.presentation}`);
    }

    add(`Cantidad: ${item.quantity}`);
    add(`Precio unitario: ${money(item.price)}`);
    add(`Subtotal: ${money(item.price * item.quantity)}`);
  });

  const { subtotal, deliveryFee, total } = receipt;

  add(`Subtotal: ${money(subtotal)}`);

  add(
    `${
      customer.deliveryMethod === "RECOGER"
        ? "Recogida"
        : "Envío"
    }: ${money(deliveryFee)}`
  );

  add(`TOTAL: ${money(total)}`, "total");

  add("Gracias por elegir ARA LOT.", "heading");
  add(receipt.shippingMessage);

  return rows;
}

export async function receiptImage(
  receipt: Receipt
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  const lines: {
    text: string;
    y: number;
    size: number;
    bold: boolean;
    rule: boolean;
  }[] = [];

  let y = 60;

  for (const row of receiptRows(receipt)) {
    const size =
      row.kind === "brand"
        ? 48
        : row.kind === "total"
        ? 30
        : row.kind === "heading"
        ? 24
        : 22;

    const bold = row.kind !== "text";

    ctx.font = `${
      bold ? "bold" : "normal"
    } ${size}px Georgia, serif`;

    if (bold) {
      y += 24;
    }

    const wrapped: string[] = [];
    let line = "";

    for (const char of row.text) {
      if (
        char === "\n" ||
        ctx.measureText(line + char).width > 780
      ) {
        wrapped.push(line);
        line = char === "\n" ? "" : char;
      } else {
        line += char;
      }
    }

    wrapped.push(line);

    wrapped.forEach((text, index) => {
      lines.push({
        text,
        y,
        size,
        bold,
        rule:
          row.kind === "total" &&
          index === 0,
      });

      y += size * 1.5;
    });
  }

  canvas.width = 900;
  canvas.height = Math.ceil(y + 60);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";
  ctx.textBaseline = "top";

  for (const line of lines) {
    if (line.rule) {
      ctx.beginPath();
      ctx.moveTo(60, line.y - 12);
      ctx.lineTo(840, line.y - 12);
      ctx.stroke();
    }

    ctx.font = `${
      line.bold ? "bold" : "normal"
    } ${line.size}px Georgia, serif`;

    ctx.fillText(
      line.text,
      60,
      line.y
    );
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("PNG unavailable")),
      "image/png"
    )
  );
}