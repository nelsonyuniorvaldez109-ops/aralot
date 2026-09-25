"use client";

import { FormEvent, useState } from "react";
import styles from "./Newsletter.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isValid = emailPattern.test(email.trim());

    setHasError(!isValid);
    setMessage(
      isValid
        ? "Suscripción disponible próximamente."
        : "Ingresa un correo electrónico válido.",
    );
  }

  return (
    <section className={styles.section} aria-labelledby="newsletter-title">
      <div className={`${styles.inner} container`}>
        <div className={styles.intro}>
          <p>COMUNIDAD ARA LOT</p>
          <h2 id="newsletter-title">ÚNETE A NUESTRA COMUNIDAD</h2>
          <span>Recibe novedades, lanzamientos y ofertas de ARA LOT.</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label htmlFor="newsletter-email">Tu correo electrónico</label>
          <div className={styles.controls}>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Tu correo electrónico"
              value={email}
              aria-invalid={hasError}
              aria-describedby={message ? "newsletter-message" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
                if (message) {
                  setMessage("");
                  setHasError(false);
                }
              }}
            />
            <button type="submit">SUSCRIBIRME</button>
          </div>
          <p
            className={`${styles.message} ${hasError ? styles.error : ""}`}
            id="newsletter-message"
            role={hasError ? "alert" : "status"}
          >
            {message}
          </p>
        </form>
      </div>
    </section>
  );
}
