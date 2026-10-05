"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "./actions";
import styles from "./configuracion.module.css";

type Settings = {
  id: string;
  whatsapp_number: string | null;
  delivery_fee: number | null;
  weekend_shipping_only: boolean | null;
  contact_email: string | null;
  instagram_url: string | null;
  pickup_enabled: boolean | null;
  pickup_message: string | null;
  shipping_message: string | null;
  announcement_enabled: boolean | null;
  announcement_text: string | null;
};

type SettingsFormProps = {
  settings: Settings;
};

const initialState: SettingsState = {};

export function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateSettings,
    initialState
  );

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="settings_id" value={settings.id} />

      {/* INFORMACIÓN DE CONTACTO */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Información de contacto</h2>
            <p>
              Datos utilizados para que los clientes puedan comunicarse con la
              tienda.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="whatsapp_number">WhatsApp</label>

            <input
              id="whatsapp_number"
              name="whatsapp_number"
              type="tel"
              defaultValue={settings.whatsapp_number ?? ""}
              placeholder="18296446731"
              required
            />

            <small>
              Número que recibirá los pedidos finalizados desde la tienda.
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="contact_email">Correo electrónico</label>

            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings.contact_email ?? ""}
              placeholder="correo@ejemplo.com"
              required
            />

            <small>
              Correo principal utilizado para información de contacto.
            </small>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="instagram_url">Instagram</label>

            <input
              id="instagram_url"
              name="instagram_url"
              type="url"
              defaultValue={settings.instagram_url ?? ""}
              placeholder="https://www.instagram.com/usuario"
            />
          </div>
        </div>
      </div>

      {/* ENVÍOS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Envíos</h2>
            <p>
              Configura el costo y la información relacionada con las
              entregas.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="delivery_fee">Costo de envío (RD$)</label>

            <input
              id="delivery_fee"
              name="delivery_fee"
              type="number"
              min="0"
              max="100000"
              step="0.01"
              defaultValue={settings.delivery_fee ?? 0}
              required
            />
          </div>

          <div className={styles.switchField}>
            <div>
              <strong>Envíos solo fines de semana</strong>
              <span>
                Indica que la tienda realiza sus entregas durante los fines de
                semana.
              </span>
            </div>

            <label className={styles.switch}>
              <input
                type="checkbox"
                name="weekend_shipping_only"
                defaultChecked={Boolean(settings.weekend_shipping_only)}
              />
              <span className={styles.slider} />
            </label>
          </div>

          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="shipping_message">Mensaje de envío</label>

            <textarea
              id="shipping_message"
              name="shipping_message"
              rows={3}
              maxLength={500}
              defaultValue={settings.shipping_message ?? ""}
              placeholder="Información que verá el cliente sobre los envíos."
            />

            <small>Máximo 500 caracteres.</small>
          </div>
        </div>
      </div>

      {/* RECOGIDA */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Recogida</h2>
            <p>
              Controla si los clientes pueden seleccionar la opción de
              recogida.
            </p>
          </div>
        </div>

        <div className={styles.switchField}>
          <div>
            <strong>Permitir recogida</strong>
            <span>
              Habilita la opción de recogida para los pedidos.
            </span>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              name="pickup_enabled"
              defaultChecked={Boolean(settings.pickup_enabled)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor="pickup_message">Mensaje de recogida</label>

          <textarea
            id="pickup_message"
            name="pickup_message"
            rows={3}
            maxLength={500}
            defaultValue={settings.pickup_message ?? ""}
            placeholder="Explica cómo se coordina la recogida."
          />

          <small>Máximo 500 caracteres.</small>
        </div>
      </div>

      {/* BARRA DE ANUNCIOS */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Barra de anuncios</h2>
            <p>
              Controla el mensaje informativo que aparece en la parte superior
              de la tienda.
            </p>
          </div>
        </div>

        <div className={styles.switchField}>
          <div>
            <strong>Mostrar barra de anuncios</strong>
            <span>
              Puedes ocultarla temporalmente sin eliminar el mensaje.
            </span>
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              name="announcement_enabled"
              defaultChecked={Boolean(settings.announcement_enabled)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.field}>
          <label htmlFor="announcement_text">Mensaje</label>

          <textarea
            id="announcement_text"
            name="announcement_text"
            rows={2}
            maxLength={250}
            defaultValue={settings.announcement_text ?? ""}
            placeholder="Escribe el anuncio que aparecerá en la tienda."
          />

          <small>Máximo 250 caracteres.</small>
        </div>
      </div>

      {/* RESULTADO DEL GUARDADO */}
      {state.error && (
        <div className={styles.errorMessage} role="alert">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className={styles.successMessage} role="status">
          {state.success}
        </div>
      )}

      {/* BOTÓN GUARDAR */}
      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={pending}
        >
          {pending ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
        </button>
      </div>
    </form>
  );
}