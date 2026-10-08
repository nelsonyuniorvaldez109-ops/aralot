"use client";

import { useActionState, useState } from "react";
import { ImageUpload } from "../productos/ImageUpload";
import { updateBannerImages, type SettingsState } from "./actions";
import styles from "./configuracion.module.css";

export function BannerImagesForm({ id, poloches, care }: { id: string; poloches: string | null; care: string | null }) {
  const [first, setFirst] = useState(poloches ?? "");
  const [second, setSecond] = useState(care ?? "");
  const [uploads, setUploads] = useState(0);
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateBannerImages, {});
  const busy = pending || uploads > 0;
  const test = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://vfsenqecpfzcqahsscsl.supabase.co";
  function uploading(value: boolean) { setUploads(count => count + (value ? 1 : -1)); }

  return <form action={action} className={styles.form}>
    <input type="hidden" name="settings_id" value={id} />
    <input type="hidden" name="poloches_banner_image" value={first} />
    <input type="hidden" name="personal_care_banner_image" value={second} />
    <section className={styles.card}>
      <h2>Fotografías de portada</h2>
      <p>Revisa la vista previa y guarda para publicar. Se conservan las fotografías anteriores en Storage.</p>
      {!test && <p role="alert">Disponible únicamente en ARA LOT producción.</p>}
      <div className={styles.grid}>
        <ImageUpload label="Nuevos Poloches" value={first || "/images/banners/poloches.webp"} onChange={setFirst} onBusy={uploading} disabled={!test || busy} />
        <ImageUpload label="Cuidado Personal" value={second || "/images/banners/personal-care.webp"} onChange={setSecond} onBusy={uploading} disabled={!test || busy} />
      </div>
    </section>
    {state.error && <p className={styles.errorMessage} role="alert">{state.error}</p>}
    {state.success && <p className={styles.successMessage} role="status">{state.success}</p>}
    <div className={styles.actions}><button className={styles.saveButton} type="submit" disabled={!test || busy}>
      {pending ? "GUARDANDO…" : uploads ? "SUBIENDO IMAGEN…" : "GUARDAR IMÁGENES"}
    </button></div>
  </form>;
}
