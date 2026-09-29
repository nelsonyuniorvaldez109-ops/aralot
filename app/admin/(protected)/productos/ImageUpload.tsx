/* eslint-disable @next/next/no-img-element -- Admin previews retain existing and public Storage URLs without changing storefront image configuration. */
"use client";
import { useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./products.module.css";
export function ImageUpload({ value, onChange, onBusy, disabled = false, label }: { value: string; onChange: (url: string) => void; onBusy: (busy: boolean) => void; disabled?: boolean; label: string }) {
 const id = useId();
 const [busy,setBusy]=useState(false), [error,setError]=useState("");
 async function upload(file?: File) {
  if (!file) return;
  setError("");
  const extensions: Record<string,string> = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
  if (!extensions[file.type] || !file.size || file.size > 10*1024*1024) { setError("Selecciona una imagen JPEG, PNG o WEBP de hasta 10 MB."); return; }
  setBusy(true); onBusy(true);
  try {
   const bitmap = await createImageBitmap(file); bitmap.close();
   const client=createClient();
   const path=crypto.randomUUID()+"."+extensions[file.type];
   const {error}=await client.storage.from("product-images").upload(path,file,{contentType:file.type,upsert:false});
   if(error) throw error;
   onChange(client.storage.from("product-images").getPublicUrl(path).data.publicUrl);
  } catch {setError("No se pudo subir la imagen. Comprueba tu sesión, permisos y conexión e inténtalo otra vez.");}
  finally {setBusy(false);onBusy(false);}
 }
 return <div className={styles.upload}>
  <label htmlFor={id}>{label}</label>
  {value ? /* Public Storage URLs and existing URLs need no Next image allowlist. */ <img src={value} alt={label} className={styles.preview}/> : <div className={styles.imagePlaceholder} aria-hidden="true">＋</div>}
  <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||busy} onChange={e=>{void upload(e.target.files?.[0]); e.target.value="";}} aria-describedby={id+"-status"}/>
  <p id={id+"-status"} role="status">{busy?"Subiendo imagen…":error||"Seleccionar imagen · JPEG, PNG o WEBP · Máximo 10 MB"}</p>
 </div>;
}
