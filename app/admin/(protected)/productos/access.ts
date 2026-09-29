import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function productAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user || user.is_anonymous) redirect("/admin/login");
  const permission = await supabase.rpc("is_admin");
  return { supabase, allowed: !permission.error && permission.data === true };
}
