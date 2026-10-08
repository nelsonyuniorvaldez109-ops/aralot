"use client";

import { useActionState, useState } from "react";
import { ImageUpload } from "../productos/ImageUpload";
import { updateHeroImage, type SettingsState } from "./actions";
import styles from "./configuracion.module.css";

export function HeroImageForm({ id, image }: { id: string; image: string | null }) {
  const [selected, setSelected] = useState(image ?? "");
  const [uploading, setUploading] = useState(false);
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateHeroImage, {});
  const test = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://vfsenqecpfzcqahsscsl.supabase.co";
  const busy = pending || uploading;

  return <form action={action} className={styles.form}>
    <input type="hidden" name="settings_id" value={id} />
    <input type="hidden" name="hero_image" value={selected} />
    <section className={styles.card}>
      <h2>Imagen principal de portada</h2>
      <p>Selecciona una fotografía y revisa la vista previa antes de guardar. Una composición horizontal con el modelo a la derecha deja espacio para los textos.</p>
      <ImageUpload label="Fotografía del Hero" value={selected || "/images/hero/ara-lot-hero.webp"}
        onChange={setSelected} onBusy={setUploading} disabled={!test || busy} />
      <p>La imagen anterior se conserva en Storage. La portada cambia únicamente al guardar.</p>
      {!test && <p role="alert">Disponible únicamente en ARA LOT producción.</p>}
    </section>
    {state.error && <p className={styles.errorMessage} role="alert">{state.error}</p>}
    {state.success && <p className={styles.successMessage} role="status">{state.success}</p>}
    <div className={styles.actions}>
      <button className={styles.saveButton} type="submit" disabled={!test || busy}>
        {pending ? "GUARDANDO…" : uploading ? "SUBIENDO IMAGEN…" : "GUARDAR IMAGEN PRINCIPAL"}
      </button>
    </div>
  </form>;
}
