import { unstable_rethrow } from "next/navigation";

export type CarouselOperation = "authorization" | "query" | "validation" | "upload" | "save" | "refresh";

// Only allowlisted diagnostic codes leave the exception. Never log its message,
// stack, details, request, URL, session or payload.
export function carouselFailure(operation: CarouselOperation, error: unknown): string {
  unstable_rethrow(error);
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const known = new Set(["42501", "401", "403", "42P01", "42703", "42883", "PGRST202", "PGRST204", "PGRST205", "23505", "23514", "22023", "NETWORK_ERROR", "VALIDATION_ERROR"]);
  const candidates = [value.code, value.statusCode, value.status].map(item => typeof item === "string" || typeof item === "number" ? String(item) : "");
  const code = value.message === "CAROUSEL_CONFLICT" ? "CAROUSEL_CONFLICT"
    : candidates.find(item => known.has(item)) ?? (error instanceof TypeError ? "NETWORK_ERROR" : "UNKNOWN");
  const incident = crypto.randomUUID();
  console.error("CAROUSEL_FAILURE", { operation, code, incident });
  let message: string;
  if (code === "CAROUSEL_CONFLICT") message = "El carrusel fue modificado desde otra pestaña o por otro administrador. No se sobrescribió ningún cambio. Tu borrador sigue aquí: abre Configuración en otra pestaña para comparar y conciliar los cambios antes de guardar desde esa versión actualizada.";
  else if (operation === "refresh") message = "Los cambios se guardaron, pero no se pudo actualizar la pantalla. Recarga para verlos; no necesitas volver a guardar.";
  else if (["42501", "401", "403"].includes(code)) message = "No tienes permisos para esta operación del carrusel. Comprueba tu acceso administrativo.";
  else if (["42P01", "42703", "42883", "PGRST202", "PGRST204", "PGRST205"].includes(code)) message = "La configuración del carrusel no está disponible. Solicita revisar su tabla, función y permisos en Supabase.";
  else if (code === "NETWORK_ERROR") message = "No se pudo confirmar la conexión. Comprueba tu conexión y reintenta; tus cambios se conservan.";
  else if (operation === "validation" || ["23505", "23514", "22023", "VALIDATION_ERROR"].includes(code)) message = "Revisa las fotografías: máximo 10, sin duplicados y con formato y tamaño válidos.";
  else message = ({ authorization: "No se pudo comprobar tu autorización. Reintenta.", query: "No se pudieron consultar las fotografías. Recarga para reintentar.", upload: "No se pudo confirmar la subida. Conservamos tus cambios para reintentar.", save: "No se pudo confirmar el guardado. Conservamos tus cambios para reintentar." } as Record<string, string>)[operation];
  return `${message} Incidencia: ${incident}`;
}
