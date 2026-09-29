"use client";

import { useActionState } from "react";
import { logout } from "./actions";
import styles from "./admin.module.css";

export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, { error: "" });
  return (
    <form action={action} className={styles.logout} aria-busy={pending}>
      <button type="submit" disabled={pending}>{pending ? "Cerrando sesión…" : "Cerrar sesión"}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
