"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { receiptImage, receiptRows, type Receipt } from "./receipt";
import styles from "./ReceiptPreview.module.css";

export function ReceiptPreview({ receipt, onConfirm }: { receipt: Receipt; onConfirm: () => Promise<Receipt> }) {
  const { items, removeItem } = useCart();
  const heading = useRef<HTMLHeadingElement>(null);
  const [image, setImage] = useState<{ file: File; url: string }>();
  const [message, setMessage] = useState("");
  const [sharing, setSharing] = useState(false);
  const confirming = useRef(false);
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
 const whatsapp = receipt.status === "reserved" || receipt.status === "confirmed" ? receipt.whatsappUrl : null;
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
        {whatsapp && <button type="button" onClick={async () => {
          if (confirming.current) return;
          confirming.current = true;
          setMessage("Confirmando pedido…");
          try {
            const confirmed = await onConfirm();
            if (!confirmed.whatsappUrl) throw new Error("No se pudo abrir WhatsApp. Reintenta.");
            // Same-tab navigation avoids popup blocking after the server request.
            window.location.assign(confirmed.whatsappUrl);
            items.forEach((item) => removeItem(item.key));
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "No se pudo confirmar el pedido. Reintenta.");
          } finally { confirming.current = false; }
        }}>Abrir pedido en WhatsApp</button>}
      </div>
      <p>WhatsApp abrirá el resumen de texto. Puedes adjuntar la imagen descargada o compartirla desde tu dispositivo.</p>
      <p role="status" aria-live="polite">{message || (!image ? "Preparando imagen del recibo…" : "Recibo listo para compartir o guardar.")}</p>
    </section>
  );
}
