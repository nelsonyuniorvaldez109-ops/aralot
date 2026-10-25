/* eslint-disable @next/next/no-img-element -- Admin previews retain existing and public Storage URLs without changing storefront image configuration. */
"use client";
import { safeImage } from "@/lib/products/images";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./products.module.css";
export type PreparedImage = { file: File; path: string; url: string; deduplicate: boolean };

export async function prepareImage(file: File, deduplicate = false): Promise<PreparedImage> {
 const extensions: Record<string,string> = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
 if (!extensions[file.type] || !file.size || file.size > 10*1024*1024) throw new Error("Selecciona una imagen JPEG, PNG o WEBP de hasta 10 MB.");
 if (deduplicate && !({"image/jpeg": /\.jpe?g$/i, "image/png": /\.png$/i, "image/webp": /\.webp$/i}[file.type]?.test(file.name))) {
  throw new Error("La extensión debe coincidir con el formato JPG, PNG o WEBP de la imagen.");
 }
 const bitmap = await createImageBitmap(file); bitmap.close();
 const filename = deduplicate
  ? "carousel-" + Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await file.arrayBuffer())), byte => byte.toString(16).padStart(2,"0")).join("")
  : crypto.randomUUID();
 const path = filename+"."+extensions[file.type];
 const url = safeImage(createClient().storage.from("product-images").getPublicUrl(path).data.publicUrl);
 if (!url) throw new Error("La configuración de imágenes no está disponible.");
 return { file, path, url, deduplicate };
}

export async function uploadPreparedImage(image: PreparedImage): Promise<{ created: boolean }> {
 const { error } = await createClient().storage.from("product-images").upload(image.path, image.file, {contentType:image.file.type,upsert:false});
 const duplicate = image.deduplicate && error && (String(error.statusCode) === "409" ||
  (String(error.statusCode) === "400" && /^(?:the resource|asset) already exists\.?$/i.test(error.message)));
 if (error && !duplicate) throw error;
 return { created: !error };
}

export function ImageUpload({ value, onChange, onBusy, disabled = false, label, deduplicate = false, onSelect }: { value: string; onChange: (url: string) => void; onBusy: (busy: boolean) => void; disabled?: boolean; label: string; deduplicate?: boolean; onSelect?: (image: PreparedImage) => void }) {
 const id = useId();
 const [busy,setBusy]=useState(false), [error,setError]=useState("");
 async function upload(file?: File) {
  if (!file) return;
  setError("");
  setBusy(true); onBusy(true);
  let prepared: PreparedImage;
  try {
   prepared = await prepareImage(file, deduplicate);
  } catch(error) {
   setError(error instanceof Error ? error.message : "No se pudo leer la imagen.");
   setBusy(false); onBusy(false); return;
  }
  try {
   if (onSelect) onSelect(prepared);
   else { await uploadPreparedImage(prepared); onChange(prepared.url); }
  } catch {setError("No se pudo subir la imagen. Comprueba tu sesión, permisos y conexión e inténtalo otra vez.");}
  finally {setBusy(false);onBusy(false);}
 }
 return <div className={styles.upload}>
  <label htmlFor={id}>{label}</label>
  {safeImage(value) ? <img src={safeImage(value)} alt={label} className={styles.preview}/> : <div className={styles.imagePlaceholder} aria-hidden="true">＋</div>}
  <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={e=>{void upload(e.target.files?.[0]); e.target.value="";}} aria-describedby={id+"-status"}/>
  <p id={id+"-status"} role="status">{busy?(onSelect?"Preparando vista previa…":"Subiendo imagen…"):error||"Seleccionar imagen · JPEG, PNG o WEBP · Máximo 10 MB"}</p>
 </div>;
}
