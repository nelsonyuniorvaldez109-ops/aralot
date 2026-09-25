"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { OrderSummary } from "./OrderSummary";
import styles from "./Checkout.module.css";

type DeliveryMethod = "" | "delivery" | "pickup";
type PaymentMethod = "" | "cash" | "transfer";
type CheckoutField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "province"
  | "municipality"
  | "sector"
  | "address"
  | "deliveryMethod"
  | "paymentMethod";
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [prepared, setPrepared] = useState(false);

  function clearError(field: CheckoutField) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setPrepared(false);
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

    if (!getValue(formData, "phone")) nextErrors.phone = "Ingresa tu teléfono.";
    if (!getValue(formData, "province")) nextErrors.province = "Ingresa tu provincia.";
    if (!getValue(formData, "municipality")) nextErrors.municipality = "Ingresa tu municipio.";
    if (!getValue(formData, "sector")) nextErrors.sector = "Ingresa tu sector.";
    if (!getValue(formData, "address")) nextErrors.address = "Ingresa tu dirección.";
    if (!deliveryMethod) nextErrors.deliveryMethod = "Selecciona un método de entrega.";
    if (!paymentMethod) nextErrors.paymentMethod = "Selecciona un método de pago.";

    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0] as CheckoutField | undefined;
    if (firstInvalid) {
      setPrepared(false);
      focusFirstInvalid(form, firstInvalid);
      return;
    }

    setPrepared(true);
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
        <form className={styles.form} noValidate onSubmit={handleSubmit}>
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
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="809 000 0000"
                  required
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  onChange={() => clearError("phone")}
                />
                <FieldError id="phone-error" message={errors.phone} />
              </div>
            </div>
          </section>

          <section className={styles.formSection} aria-labelledby="address-title">
            <div className={styles.sectionHeading}>
              <span>02</span>
              <h2 id="address-title">Dirección de entrega</h2>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label htmlFor="province">Provincia</label>
                <input
                  id="province"
                  name="province"
                  type="text"
                  autoComplete="address-level1"
                  required
                  aria-invalid={Boolean(errors.province)}
                  aria-describedby={errors.province ? "province-error" : undefined}
                  onChange={() => clearError("province")}
                />
                <FieldError id="province-error" message={errors.province} />
              </div>

              <div className={styles.field}>
                <label htmlFor="municipality">Municipio</label>
                <input
                  id="municipality"
                  name="municipality"
                  type="text"
                  autoComplete="address-level2"
                  required
                  aria-invalid={Boolean(errors.municipality)}
                  aria-describedby={errors.municipality ? "municipality-error" : undefined}
                  onChange={() => clearError("municipality")}
                />
                <FieldError id="municipality-error" message={errors.municipality} />
              </div>

              <div className={styles.field}>
                <label htmlFor="sector">Sector</label>
                <input
                  id="sector"
                  name="sector"
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
                <textarea id="reference" name="reference" rows={3} />
              </div>
            </div>
          </section>

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
                    clearError("deliveryMethod");
                  }}
                />
                <span>
                  <strong>Delivery</strong>
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
                    clearError("deliveryMethod");
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
                  ? "El costo de entrega será confirmado con el pedido."
                  : "Te informaremos cuando tu pedido esté listo para recoger."}
              </p>
            ) : null}
          </fieldset>

          <fieldset
            className={styles.formSection}
            aria-invalid={Boolean(errors.paymentMethod)}
            aria-describedby={errors.paymentMethod ? "paymentMethod-error" : undefined}
          >
            <legend className={styles.sectionHeading}>
              <span>04</span>
              <strong>Método de pago</strong>
            </legend>

            <div className={styles.methodGrid}>
              <label className={styles.method}>
                <input
                  name="paymentMethod"
                  type="radio"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => {
                    setPaymentMethod("cash");
                    clearError("paymentMethod");
                  }}
                />
                <span>
                  <strong>Efectivo contra entrega</strong>
                  <small>Pago al recibir el pedido.</small>
                </span>
              </label>

              <label className={styles.method}>
                <input
                  name="paymentMethod"
                  type="radio"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={() => {
                    setPaymentMethod("transfer");
                    clearError("paymentMethod");
                  }}
                />
                <span>
                  <strong>Transferencia bancaria</strong>
                  <small>Datos disponibles posteriormente.</small>
                </span>
              </label>
            </div>

            <FieldError id="paymentMethod-error" message={errors.paymentMethod} />
          </fieldset>

          <button className={styles.submitButton} type="submit">
            Confirmar pedido
          </button>

          <p className={styles.privacy}>
            Utilizaremos tus datos únicamente para gestionar tu pedido.
          </p>

          {prepared ? (
            <div className={styles.confirmation} role="status" aria-live="polite">
              <strong>Checkout preparado correctamente.</strong>
              <p>
                El procesamiento definitivo del pedido se habilitará cuando conectemos el
                sistema de pedidos.
              </p>
            </div>
          ) : null}
        </form>

        <OrderSummary items={items} subtotal={subtotal} />
      </div>
    </section>
  );
}
