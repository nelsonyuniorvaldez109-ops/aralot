"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { WHATSAPP_NUMBER } from "@/lib/store-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp-order";
import { receiptImage, receiptRows, type Receipt } from "./receipt";
import styles from "./ReceiptPreview.module.css";

export function ReceiptPreview({ receipt }: { receipt: Receipt }) {
  const { items, removeItem } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  const [image, setImage] = useState<{ file: File; url: string }>();
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    heading.current?.focus();
    let active = true;
    let url: string | undefined;
    receiptImage(receipt).then(blob => {
      if (!active) return;
      url = URL.createObjectURL(blob);
      setImage({ file: new File([blob], `${receipt.id}.png`, { type: "image/png" }), url });
    }).catch(() => { if (active) setMessage("No se pudo generar la imagen. Vuelve a finalizar el pedido para intentarlo otra vez."); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [receipt]);

  function download() {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image.url; link.download = image.file.name;
    document.body.appendChild(link); link.click(); link.remove();
  }
  async function share() {
    if (!image || sharing) return;
    setSharing(true);
    try {
      if (navigator.share && navigator.canShare?.({ files: [image.file] })) {
        await navigator.share({ files: [image.file], title: `ARA LOT — ${receipt.id}` });
      } else download();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setMessage("No se pudo compartir. Puedes descargar la imagen y adjuntarla manualmente.");
      }
    } finally { setSharing(false); }
  }
  const whatsapp = buildWhatsAppUrl(WHATSAPP_NUMBER, receipt.items, receipt.customer, { id: receipt.id, date: receipt.date });
  return (
    <section className={styles.preview} aria-labelledby="receipt-preview-title">
      <h2 id="receipt-preview-title" ref={heading} tabIndex={-1}>Vista previa del recibo</h2>
      <div className={styles.paper}>
        {receiptRows(receipt).map((row, index) => row.kind === "heading"
          ? <h3 className={styles.heading} key={index}>{row.text}</h3>
          : <p className={styles[row.kind]} key={index}>{row.text}</p>)}
      </div>
      <div className={styles.actions}>
        <button type="button" disabled={!image || sharing} onClick={share}>Compartir imagen</button>
        <button type="button" disabled={!image} onClick={download}>Descargar recibo</button>
        {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={(event) => {
          event.preventDefault();
          window.open(whatsapp, "_blank", "noopener,noreferrer");
          items.forEach((item) => removeItem(item.key));
        }}>Abrir pedido en WhatsApp</a>}
      </div>
      <p>WhatsApp abrirá el resumen de texto. Puedes adjuntar la imagen descargada o compartirla desde tu dispositivo.</p>
      <p role="status" aria-live="polite">{message || (!image ? "Preparando imagen del recibo…" : "Recibo listo para compartir o guardar.")}</p>
    </section>
  );
}
