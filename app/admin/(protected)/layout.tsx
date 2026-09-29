import { AdminNavigation } from "../AdminNavigation";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "../LogoutButton";
import type { ReactNode } from "react";
import styles from "../admin.module.css";


export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.is_anonymous) redirect("/admin/login");
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#admin-content">Saltar al panel</a>
      <aside className={styles.sidebar} aria-label="Panel administrativo">
        <div className={styles.brand}>ARA LOT<span>ADMINISTRACIÓN</span></div>
        <AdminNavigation />
        <p className={styles.sidebarNote}>Administración del catálogo</p>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <span>Panel administrativo</span>
          <span className={styles.status}>Espacio de trabajo</span>
          <LogoutButton />
        </header>
        {children}
      </div>
    </div>
  );
}
