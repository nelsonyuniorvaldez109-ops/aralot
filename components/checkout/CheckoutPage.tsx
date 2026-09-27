"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { ReceiptPreview } from "./ReceiptPreview";
import type { Receipt } from "./receipt";
import { deliveryLocations, findDeliveryProvince } from "@/data/delivery-locations";
import { OrderSummary } from "./OrderSummary";
import styles from "./Checkout.module.css";

type DeliveryMethod = "" | "delivery" | "pickup";
type CheckoutField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "province"
  | "municipality"
  | "sector"
  | "address"
  | "reference"
  | "deliveryMethod";
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const fieldLimits = { firstName: 80, lastName: 80, phone: 25, address: 200, reference: 300, email: 254, province: 100, municipality: 100, sector: 100 } as const;

const addressFields = new Set(["province", "municipality", "sector", "address", "reference"]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value: string): string | null {
  const compact = value.replace(/[\s-]/g, "");
  if (!/^(?:\+?1)?(?:809|829|849)\d{7}$/.test(compact)) return null;
  const local = compact.replace(/^\+?1/, "");
  return `+1 ${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className={styles.error} id={id} role="alert">
      {message}
    </p>
  ) : null;
}

function getValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function CheckoutPage() {
  const { items, ready, subtotal } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const municipalities = findDeliveryProvince(province)?.municipalities ?? [];
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [feedback, setFeedback] = useState("");
  const [receipt, setReceipt] = useState<Receipt>();

  function clearError(field: CheckoutField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFeedback("");
  }

  function focusFirstInvalid(form: HTMLFormElement, field: CheckoutField) {
    window.requestAnimationFrame(() => {
      const control = form.querySelector<HTMLElement>(`[name="${field}"]`);
      control?.focus();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors: CheckoutErrors = {};

    if (!getValue(formData, "firstName")) nextErrors.firstName = "Ingresa tu nombre.";
    if (!getValue(formData, "lastName")) nextErrors.lastName = "Ingresa tus apellidos.";

    const email = getValue(formData, "email");
    if (!emailPattern.test(email)) nextErrors.email = "Ingresa un correo válido.";

    const phone = normalizePhone(getValue(formData, "phone"));
    if (!phone) nextErrors.phone = "Ingresa un número de teléfono válido.";
    if (deliveryMethod === "delivery") {
    const selectedProvince = findDeliveryProvince(getValue(formData, "province"));
    if (!selectedProvince) nextErrors.province = "Selecciona una provincia.";
    if (!selectedProvince?.municipalities.includes(getValue(formData, "municipality"))) {
      nextErrors.municipality = "Selecciona un municipio de la provincia indicada.";
    }
    if (!getValue(formData, "sector")) nextErrors.sector = "Ingresa tu sector.";
    if (!getValue(formData, "address")) nextErrors.address = "Ingresa tu dirección.";
    }
    if (!deliveryMethod) nextErrors.deliveryMethod = "Selecciona un método de entrega.";

    for (const [field, limit] of Object.entries(fieldLimits)) {
      if (deliveryMethod !== "delivery" && addressFields.has(field)) continue;
      if (String(formData.get(field) ?? "").length > limit) {
        nextErrors[field as CheckoutField] = field === "phone" ? "Ingresa un número de teléfono válido." : `Usa como máximo ${limit} caracteres.`;
      }
    }
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0] as CheckoutField | undefined;
    if (firstInvalid) {
      setFeedback("");
      focusFirstInvalid(form, firstInvalid);
      return;
    }

    if (!ready || items.length === 0 || !phone) return;

    const customer = {
      name: `${getValue(formData, "firstName")} ${getValue(formData, "lastName")}`,
      phone,
      email,
      province: deliveryMethod === "delivery" ? getValue(formData, "province") : "",
      city: deliveryMethod === "delivery" ? getValue(formData, "municipality") : "",
      sector: deliveryMethod === "delivery" ? getValue(formData, "sector") : "",
      address: deliveryMethod === "delivery" ? getValue(formData, "address") : "",
      reference: deliveryMethod === "delivery" ? getValue(formData, "reference") : "",
      deliveryMethod: deliveryMethod === "pickup" ? "RECOGER" : "ENVÍO",
    };

    const now = new Date();
    const random = Array.from(crypto.getRandomValues(new Uint32Array(2)), value => value.toString(36)).join("").toUpperCase();
    setReceipt({
      id: `ARA-${now.getTime().toString(36).toUpperCase()}-${random}`,
      date: now.toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" }),
      customer,
      items: items.map(item => ({ ...item })),
    });
  }

  if (!ready) {
    return (
      <section className={styles.loading} aria-live="polite">
        <p>Cargando checkout…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.empty} aria-labelledby="empty-checkout-title">
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="empty-checkout-title">Tu carrito está vacío</h1>
        <p>Agrega productos antes de continuar con el checkout.</p>
        <Link href="/#new-products">Ver productos</Link>
      </section>
    );
  }

  return (
    <section className={styles.checkout} aria-labelledby="checkout-title">
      <header className={styles.heading}>
        <p className={styles.eyebrow}>ARA LOT</p>
        <h1 id="checkout-title">Checkout</h1>
        <p>Completa tus datos para preparar el pedido.</p>
      </header>

      <div className={styles.layout}>
        <form className={styles.form} noValidate onSubmit={handleSubmit} onChange={() => setReceipt(undefined)}>
          <section className={styles.formSection} aria-labelledby="customer-title">
            <div className={styles.sectionHeading}>
              <span>01</span>
              <h2 id="customer-title">Información del cliente</h2>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="firstName">Nombre</label>
                <input
                  id="firstName"
                  name="firstName"
                  maxLength={fieldLimits.firstName}
                  type="text"
                  autoComplete="given-name"
                  required
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  onChange={() => clearError("firstName")}
                />
                <FieldError id="firstName-error" message={errors.firstName} />
              </div>

              <div className={styles.field}>
                <label htmlFor="lastName">Apellidos</label>
                <input
                  id="lastName"
                  name="lastName"
                  maxLength={fieldLimits.lastName}
                  type="text"
                  autoComplete="family-name"
                  required
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  onChange={() => clearError("lastName")}
                />
                <FieldError id="lastName-error" message={errors.lastName} />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  name="email"
                  maxLength={fieldLimits.email}
                  type="email"
                  autoComplete="email"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  onChange={() => clearError("email")}
                />
                <FieldError id="email-error" message={errors.email} />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone">Teléfono / WhatsApp</label>
                <input
                  id="phone"
                  name="phone"
                  maxLength={fieldLimits.phone}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="809-555-1234"
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-example phone-error" : "phone-example"}
                  onChange={() => clearError("phone")}
                />
                <small id="phone-example">Ejemplo: 809-555-1234</small>
                <FieldError id="phone-error" message={errors.phone} />
              </div>
            </div>
          </section>

          {deliveryMethod === "delivery" && (
          <section className={styles.formSection} aria-labelledby="address-title">
            <div className={styles.sectionHeading}>
              <span>02</span>
              <h2 id="address-title">Dirección de entrega</h2>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="province">Provincia *</label>
                <select
                  id="province"
                  name="province"
                  autoComplete="address-level1"
                  value={province}
                  required
                  aria-invalid={Boolean(errors.province)}
                  aria-describedby={errors.province ? "province-error" : undefined}
                  onChange={(event) => {
                    setProvince(event.target.value);
                    setMunicipality("");
                    clearError("province");
                    clearError("municipality");
                  }}
                >
                  <option value="">Selecciona una provincia</option>
                  {deliveryLocations.map(location => (
                    <option key={location.name} value={location.name}>{location.name}</option>
                  ))}
                </select>
                <FieldError id="province-error" message={errors.province} />
              </div>

              <div className={styles.field}>
                <label htmlFor="municipality">Municipio *</label>
                <select
                  id="municipality"
                  name="municipality"
                  autoComplete="address-level2"
                  value={municipality}
                  disabled={!province}
                  required
                  aria-invalid={Boolean(errors.municipality)}
                  aria-describedby={errors.municipality ? "municipality-error" : undefined}
                  onChange={(event) => {
                    setMunicipality(event.target.value);
                    clearError("municipality");
                  }}
                >
                  <option value="">Selecciona un municipio</option>
                  {municipalities.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <FieldError id="municipality-error" message={errors.municipality} />
              </div>

              <div className={styles.field}>
                <label htmlFor="sector">Sector</label>
                <input
                  id="sector"
                  name="sector"
                  maxLength={fieldLimits.sector}
                  type="text"
                  autoComplete="address-level3"
                  required
                  aria-invalid={Boolean(errors.sector)}
                  aria-describedby={errors.sector ? "sector-error" : undefined}
                  onChange={() => clearError("sector")}
                />
                <FieldError id="sector-error" message={errors.sector} />
              </div>

              <div className={`${styles.field} ${styles.fullField}`}>
                <label htmlFor="address">Dirección</label>
                <input
                  id="address"
                  name="address"
                  maxLength={fieldLimits.address}
                  type="text"
                  autoComplete="street-address"
                  required
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  onChange={() => clearError("address")}
                />
                <FieldError id="address-error" message={errors.address} />
              </div>

              <div className={`${styles.field} ${styles.fullField}`}>
                <label htmlFor="reference">
                  Referencia <span>Opcional</span>
                </label>
                <textarea id="reference" name="reference" rows={3} maxLength={fieldLimits.reference}
                  aria-invalid={Boolean(errors.reference)}
                  aria-describedby={errors.reference ? "reference-error" : undefined}
                  onChange={() => clearError("reference")} />
                <FieldError id="reference-error" message={errors.reference} />
              </div>
            </div>
          </section>
          )}

          <fieldset
            className={styles.formSection}
            aria-invalid={Boolean(errors.deliveryMethod)}
            aria-describedby={errors.deliveryMethod ? "deliveryMethod-error" : undefined}
          >
            <legend className={styles.sectionHeading}>
              <span>03</span>
              <strong>Método de entrega</strong>
            </legend>

            <div className={styles.methodGrid}>
              <label className={styles.method}>
                <input
                  name="deliveryMethod"
                  type="radio"
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={() => {
                    setDeliveryMethod("delivery");
                    setErrors(current => Object.fromEntries(Object.entries(current).filter(([field]) => field !== "deliveryMethod" && !addressFields.has(field))));
                    setFeedback("");
                  }}
                />
                <span>
                  <strong>ENVÍO</strong>
                  <small>Entrega en la dirección indicada.</small>
                </span>
              </label>

              <label className={styles.method}>
                <input
                  name="deliveryMethod"
                  type="radio"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={() => {
                    setDeliveryMethod("pickup");
                    setErrors(current => Object.fromEntries(Object.entries(current).filter(([field]) => field !== "deliveryMethod" && !addressFields.has(field))));
                    setFeedback("");
                  }}
                />
                <span>
                  <strong>Recoger</strong>
                  <small>Recoger personalmente.</small>
                </span>
              </label>
            </div>

            <FieldError id="deliveryMethod-error" message={errors.deliveryMethod} />
            {deliveryMethod ? (
              <p className={styles.methodNote} aria-live="polite">
                {deliveryMethod === "delivery"
                  ? "El costo de envío está incluido en el total del resumen."
                  : "El lugar y horario de recogida serán coordinados directamente con ARA LOT por WhatsApp."}
              </p>
            ) : null}
          </fieldset>

          <button className={styles.submitButton} type="submit">
            FINALIZAR PEDIDO POR WHATSAPP
          </button>

          <p className={styles.privacy}>
            Utilizaremos tus datos únicamente para gestionar tu pedido.
          </p>

          {feedback ? (
            <div className={styles.confirmation} role="status" aria-live="polite">
              <p>{feedback}</p>
            </div>
          ) : null}
        </form>

        <OrderSummary items={items} subtotal={subtotal} deliveryMethod={deliveryMethod} />
      </div>
      {receipt && JSON.stringify(receipt.items) === JSON.stringify(items) && (
        <ReceiptPreview key={receipt.id} receipt={receipt} />
      )}
    </section>
  );
}
