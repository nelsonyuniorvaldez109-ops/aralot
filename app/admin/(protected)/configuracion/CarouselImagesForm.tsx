"use client";
import Image from "next/image";
import { useActionState, useState } from "react";
import { type CarouselImage, MAX_CAROUSEL_IMAGES } from "@/lib/home-carousel";
import { ImageUpload } from "../productos/ImageUpload";
import { saveCarousel } from "./carousel-actions";
import layout from "./configuracion.module.css";
import styles from "./CarouselImagesForm.module.css";

export function CarouselImagesForm({ initial }: { initial: CarouselImage[] }) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [state, action, pending] = useActionState(saveCarousel, {});
  const busy = uploading || pending;
  function move(index: number, direction: number) {
    setImages(current => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }
  return <form action={action} className={layout.form}>
    <input type="hidden" name="images" value={JSON.stringify(images)} />
    <section className={layout.card}>
      <h2>Carrusel de portada</h2>
      <p>Ordena las fotografías que aparecerán después de los productos nuevos. Los cambios se publican al guardar.</p>
      <p role="status">{images.length} / {MAX_CAROUSEL_IMAGES} imágenes registradas</p>
      <ol className={styles.list}>
        {images.map((image, index) => <li key={image.id} className={styles.item}>
          <div className={styles.preview}><Image src={image.image_url} alt={`Fotografía ${index + 1}`} fill sizes="120px" /></div>
          <div className={styles.details}>
            <strong>Fotografía {index + 1}</strong>
            <label><input type="checkbox" checked={image.active} disabled={busy} onChange={event => {
              const active = event.target.checked;
              setImages(current => current.map(item => item.id === image.id ? { ...item, active } : item));
            }} /> Activa</label>
            <div className={styles.buttons}>
              <button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Mover fotografía ${index + 1} antes`}>↑</button>
              <button type="button" disabled={busy || index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Mover fotografía ${index + 1} después`}>↓</button>
              <button type="button" disabled={busy} onClick={() => setImages(current => current.filter(item => item.id !== image.id))}>Eliminar</button>
            </div>
          </div>
        </li>)}
      </ol>
      {images.length < MAX_CAROUSEL_IMAGES ? <ImageUpload label="Agregar fotografía" value="" onBusy={setUploading} disabled={busy}
        deduplicate onChange={url => {
          if (images.some(image => image.image_url === url)) { setNotice("Esta fotografía ya está registrada."); return; }
          setNotice("");
          setImages(current => current.length < MAX_CAROUSEL_IMAGES ? [...current, { id: crypto.randomUUID(), image_url: url, active: true }] : current);
        }} /> : <p role="status">Alcanzaste el máximo de 10 fotografías. Elimina una para agregar otra.</p>}
      {notice && <p role="status">{notice}</p>}
      <p>Eliminar aquí quita la fotografía del carrusel; conserva el archivo en Storage.</p>
    </section>
    {state.error && <p role="alert" className={layout.errorMessage}>{state.error}</p>}
    {state.success && <p role="status" className={layout.successMessage}>{state.success}</p>}
    <div className={layout.actions}><button className={layout.saveButton} type="submit" disabled={busy}>
      {pending ? "GUARDANDO…" : uploading ? "SUBIENDO IMAGEN…" : "GUARDAR CARRUSEL"}
    </button></div>
  </form>;
}
