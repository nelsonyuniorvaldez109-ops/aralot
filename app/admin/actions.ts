"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string };

export async function login(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !password || password.length > 1024) {
    return { error: "Ingresa un correo electrónico válido y tu contraseña." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.status === 429
        ? "Demasiados intentos. Espera unos minutos y vuelve a intentarlo."
        : "Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente." };
    }
  } catch {
    return { error: "No se pudo iniciar sesión. Inténtalo nuevamente." };
  }
  redirect("/admin");
}

export async function logout(_previous: AuthState): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { error: "No se pudo cerrar sesión. Inténtalo nuevamente." };
  } catch {
    return { error: "No se pudo cerrar sesión. Inténtalo nuevamente." };
  }
  redirect("/admin/login");
}
