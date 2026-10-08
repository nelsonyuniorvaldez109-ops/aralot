import { productAccess } from "../productos/access";
import { SettingsForm } from "./SettingsForm";
import { BannerImagesForm } from "./BannerImagesForm";
import { HeroImageForm } from "./HeroImageForm";
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

  const banners = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://vfsenqecpfzcqahsscsl.supabase.co"
    ? await supabase.from("store_settings").select("id,poloches_banner_image,personal_care_banner_image").eq("id", settings.id).single()
    : null;

  const hero = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://vfsenqecpfzcqahsscsl.supabase.co"
    ? await supabase.from("store_settings").select("id,hero_image").eq("id", settings.id).single()
    : null;

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
      {hero?.data && !hero.error ? <HeroImageForm
        key={`${hero.data.id}:${hero.data.hero_image}`} id={hero.data.id} image={hero.data.hero_image}
      /> : <p role="status">Imagen principal de portada: requiere conexión a TEST y la migración del Hero aplicada.</p>}
      {banners?.data && !banners.error ? <BannerImagesForm
        key={`${banners.data.id}:${banners.data.poloches_banner_image}:${banners.data.personal_care_banner_image}`}
        id={banners.data.id} poloches={banners.data.poloches_banner_image} care={banners.data.personal_care_banner_image}
      /> : <p role="status">Fotografías de portada: requiere conexión a TEST y la migración de banners aplicada.</p>}
    </section>
  );
}
