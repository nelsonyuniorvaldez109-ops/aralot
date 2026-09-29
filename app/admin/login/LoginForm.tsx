"use client";

import { useActionState } from "react";
import { login } from "../actions";
import styles from "./login.module.css";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: "" });
  return (
    <main className={styles.page} id="admin-login">
      <section className={styles.card} aria-labelledby="login-title">
        <p className={styles.brand}>ARA LOT</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p className={styles.description}>Accede al panel administrativo.</p>
        <form action={formAction} aria-busy={pending}>
          <label htmlFor="admin-email">Correo electrónico</label>
          <input id="admin-email" name="email" type="email" autoComplete="username" maxLength={254} required aria-describedby={state.error ? "login-error" : undefined} />
          <label htmlFor="admin-password">Contraseña</label>
          <input id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={1024} required aria-describedby={state.error ? "login-error" : undefined} />
          {state.error && <p className={styles.error} id="login-error" role="alert">{state.error}</p>}
          <button type="submit" disabled={pending}>{pending ? "Iniciando sesión…" : "Iniciar sesión"}</button>
        </form>
      </section>
    </main>
  );
}
