import { productAccess } from "../productos/access";
import { SettingsForm } from "./SettingsForm";
import styles from "./configuracion.module.css";

export default async function SettingsPage() {
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return (
      <section className={styles.page}>
        <div className={styles.errorBox}>
          Tu cuenta no tiene permisos para acceder a la configuración.
        </div>
      </section>
    );
  }

  const { data: settings, error } = await supabase
    .from("store_settings")
    .select(`
      id,
      whatsapp_number,
      delivery_fee,
      weekend_shipping_only,
      contact_email,
      instagram_url,
      pickup_enabled,
      pickup_message,
      shipping_message,
      announcement_enabled,
      announcement_text
    `)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("STORE SETTINGS READ ERROR:", error);

    return (
      <section className={styles.page}>
        <div className={styles.errorBox}>
          No se pudo cargar la configuración de la tienda.
        </div>
      </section>
    );
  }

  if (!settings) {
    return (
      <section className={styles.page}>
        <div className={styles.errorBox}>
          No existe una configuración para la tienda.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>ADMINISTRACIÓN</p>
          <h1>Configuración</h1>
          <p className={styles.description}>
            Administra la información general, los envíos, la recogida y los
            avisos de la tienda.
          </p>
        </div>
      </div>

      <SettingsForm settings={settings} />
    </section>
  );
}