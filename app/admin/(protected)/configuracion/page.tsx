import { productAccess } from "../productos/access";
import { SettingsForm } from "./SettingsForm";
import { BannerImagesForm } from "./BannerImagesForm";
import { HeroImageForm } from "./HeroImageForm";
import { CarouselImagesForm } from "./CarouselImagesForm";
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

  const carousel = await supabase.from("home_carousel_images")
    .select("id,image_url,active").order("sort_order");

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
      <CarouselImagesForm
        key={carousel.error ? "unavailable" : "available"}
        initial={carousel.data ?? []}
        unavailable={carousel.error
          ? ["42P01", "PGRST205"].includes(carousel.error.code)
            ? "El carrusel está pendiente de activación en Supabase. Debe aplicarse la migración home-carousel.sql y después recargar esta página."
            : "No se pudieron cargar las fotografías. Comprueba la conexión y los permisos, y recarga esta página antes de subir o guardar imágenes."
          : !carousel.data ? "No se pudieron cargar las fotografías. Recarga esta página para reintentar." : undefined}
      />
      {hero?.data && !hero.error ? <HeroImageForm
        key={`${hero.data.id}:${hero.data.hero_image}`} id={hero.data.id} image={hero.data.hero_image}
      /> : <p role="status">Imagen principal de portada: requiere conexión a Supabase y la migración de imágenes aplicada.</p>}
      {banners?.data && !banners.error ? <BannerImagesForm
        key={`${banners.data.id}:${banners.data.poloches_banner_image}:${banners.data.personal_care_banner_image}`}
        id={banners.data.id} poloches={banners.data.poloches_banner_image} care={banners.data.personal_care_banner_image}
      /> : <p role="status">Fotografías de portada: requiere conexión a Supabase y la migración de imágenes aplicada.</p>}
    </section>
  );
}
