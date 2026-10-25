"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { type CarouselImage, MAX_CAROUSEL_IMAGES, validateCarousel, isCarouselRevision } from "@/lib/home-carousel";
import { ImageUpload, prepareImage, uploadPreparedImage, type PreparedImage } from "../productos/ImageUpload";
import { saveCarousel, type CarouselState } from "./carousel-actions";
import { carouselFailure, type CarouselOperation } from "./carousel-errors";
import layout from "./configuracion.module.css";
import styles from "./CarouselImagesForm.module.css";

type DraftImage = CarouselImage & { local?: PreparedImage; preview?: string };
type UploadRecord = { attempt: string; path: string; status: "pending" | "created" | "existing" | "unknown" };
const serialize = (images: CarouselImage[]) => JSON.stringify(images.map(({ id, image_url, active }) => ({ id, image_url, active })));

export function CarouselImagesForm({ initial, initialRevision, unavailable }: { initial: CarouselImage[]; initialRevision?: string; unavailable?: string }) {
  const [images, setImages] = useState<DraftImage[]>(initial);
  // Do not replace the draft or its revision when a background refresh arrives.
  const [revision, setRevision] = useState(initialRevision);
  const [preparing, setPreparing] = useState(false);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(() => serialize(initial));
  const [state, setState] = useState<CarouselState>({});
  const [uploadLog, setUploadLog] = useState<UploadRecord[]>([]);
  const [progress, setProgress] = useState("");
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const uploaded = useRef(new Set<string>());
  const previews = useRef(new Set<string>());
  const busy = preparing || pending || Boolean(unavailable) || !isCarouselRevision(revision);
  const dirty = serialize(images) !== saved;

  useEffect(() => {
    const urls = previews.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  function change(update: (current: DraftImage[]) => DraftImage[]) {
    setState({}); setNotice("");
    setImages(update);
  }

  function select(image: PreparedImage) {
    if (images.length >= MAX_CAROUSEL_IMAGES) { setNotice("Alcanzaste el máximo de 10 fotografías."); return; }
    if (images.some(item => item.image_url === image.url)) { setNotice("Esta fotografía ya está registrada."); return; }
    const preview = URL.createObjectURL(image.file);
    previews.current.add(preview);
    change(current => [...current, { id: crypto.randomUUID(), image_url: image.url, active: true, local: image, preview }]);
  }

  function move(index: number, direction: number) {
    change(current => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }

  function remove(image: DraftImage) {
    if (image.preview) { URL.revokeObjectURL(image.preview); previews.current.delete(image.preview); }
    change(current => current.filter(item => item.id !== image.id));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current || busy || !dirty) return;
    saving.current = true; setPending(true); setState({}); setNotice("");
    const attempt = crypto.randomUUID();
    let operation: CarouselOperation = "validation";
    try {
      const rows = validateCarousel(images);
      if (!rows) { setState({ error: "Usa un máximo de 10 imágenes válidas, sin duplicados." }); return; }
      setProgress("Validando fotografías…");
      // Validate every local file before the first upload, including after a failed save.
      for (const image of images) {
        if (image.local) {
          const checked = await prepareImage(image.local.file, true);
          if (checked.url !== image.image_url || checked.path !== image.local.path) throw new Error("Invalid image");
        }
      }
      operation = "upload";
      const files = images.filter(image => image.local && !uploaded.current.has(image.local.path));
      for (const [index, image] of files.entries()) {
        const file = image.local!;
        setProgress(`Subiendo fotografía ${index + 1} de ${files.length}…`);
        setUploadLog(current => [...current, { attempt, path: file.path, status: "pending" }]);
        try {
          const result = await uploadPreparedImage(file);
          uploaded.current.add(file.path);
          setUploadLog(current => current.map(record => record.attempt === attempt && record.path === file.path
            ? { ...record, status: result.created ? "created" : "existing" } : record));
        } catch (error) {
          // A lost response may hide a completed upload. Never delete on this basis.
          setUploadLog(current => current.map(record => record.attempt === attempt && record.path === file.path
            ? { ...record, status: "unknown" } : record));
          throw error;
        }
      }
      operation = "save";
      setProgress("Guardando carrusel…");
      const form = new FormData(); form.set("images", serialize(rows));
      form.set("revision", revision!);
      const result = await saveCarousel({}, form);
      if (!result.success || result.error || !isCarouselRevision(result.revision)) {
        setState({ error: result.error || carouselFailure("save", null) });
        return;
      }
      setSaved(serialize(rows)); setImages(rows);
      setRevision(result.revision);
      previews.current.forEach(url => URL.revokeObjectURL(url)); previews.current.clear();
      setState({ success: "Carrusel guardado correctamente.", warning: result.warning });
    } catch (error) {
      setState({ error: carouselFailure(operation, error) });
    } finally {
      saving.current = false; setPending(false); setProgress("");
    }
  }

  return <form onSubmit={submit} className={layout.form}>
    <section className={layout.card}>
      <h2>Carrusel de portada</h2>
      <p>Ordena las fotografías que aparecerán después de los productos nuevos. Los cambios se publican al guardar.</p>
      {unavailable ? <p role="alert" className={layout.errorMessage}>{unavailable}</p>
        : <p role="status">{images.length} / {MAX_CAROUSEL_IMAGES} imágenes registradas</p>}
      <ol className={styles.list}>
        {images.map((image, index) => <li key={image.id} className={styles.item}>
          <div className={styles.preview}><Image src={image.preview || image.image_url} alt={`Fotografía ${index + 1}`} fill sizes="120px" unoptimized={Boolean(image.preview)} /></div>
          <div className={styles.details}>
            <strong>Fotografía {index + 1}</strong>
            <label><input type="checkbox" checked={image.active} disabled={busy} onChange={event => {
              const active = event.target.checked;
              change(current => current.map(item => item.id === image.id ? { ...item, active } : item));
            }} /> Activa</label>
            <div className={styles.buttons}>
              <button type="button" disabled={busy || index === 0} onClick={() => move(index, -1)} aria-label={`Mover fotografía ${index + 1} antes`}>↑</button>
              <button type="button" disabled={busy || index === images.length - 1} onClick={() => move(index, 1)} aria-label={`Mover fotografía ${index + 1} después`}>↓</button>
              <button type="button" disabled={busy} onClick={() => remove(image)}>Eliminar</button>
            </div>
          </div>
        </li>)}
      </ol>
      {images.length < MAX_CAROUSEL_IMAGES ? <ImageUpload label="Agregar fotografía" value="" onBusy={setPreparing} disabled={busy}
        deduplicate onSelect={select} onChange={() => {}} /> : <p role="status">Alcanzaste el máximo de 10 fotografías. Elimina una para agregar otra.</p>}
      {notice && <p role="status">{notice}</p>}
      <p>Las fotografías nuevas se previsualizan localmente y se suben al guardar. Eliminar aquí conserva cualquier archivo que ya exista en Storage.</p>
    </section>
    {dirty && <p role="status">Cambios sin guardar</p>}
    {progress && <p role="status">{progress}</p>}
    {state.error && <p role="alert" className={layout.errorMessage}>{state.error}</p>}
    {state.success && !dirty && <p role="status" className={layout.successMessage}>{state.success}</p>}
    {state.warning && !dirty && <p role="alert">{state.warning}</p>}
    {uploadLog.length > 0 && <details>
      <summary>Archivos de los intentos de guardado</summary>
      <p>Este registro se conserva mientras la pantalla permanece abierta. No se eliminan archivos automáticamente: un intento sin confirmar puede haberse completado.</p>
      <ul>{uploadLog.map((record, index) => <li key={`${record.attempt}-${index}`} style={{ overflowWrap: "anywhere" }}>
        Intento {record.attempt}: {record.path} — {({ pending: "en curso", created: "creado en este intento", existing: "ya existía; reutilizado", unknown: "estado por comprobar" })[record.status]}
      </li>)}</ul>
    </details>}
    <div className={layout.actions}><button className={layout.saveButton} type="submit" disabled={busy || !dirty}>
      {pending ? "GUARDANDO…" : preparing ? "PREPARANDO IMAGEN…" : "GUARDAR CARRUSEL"}
    </button></div>
  </form>;
}
