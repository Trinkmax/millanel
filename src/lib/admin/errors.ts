/* ──────────────────────────────────────────────────────────────
   MILLANEL · Admin — Errores en cristiano

   Nunca mostrarle a la dueña un error crudo de Zod ("too_small…") ni
   de Postgres ("duplicate key value violates unique constraint…").
   `friendlyError()` traduce cualquier error a una frase corta, en
   español, que dice qué pasó y, cuando se puede, qué hacer.
   ────────────────────────────────────────────────────────────── */

import { ZodError } from "zod";

/** Nombres de campo → cómo nombrarlos al hablarle a la dueña. */
const FIELD_LABELS: Record<string, string> = {
  name: "el nombre",
  price: "el precio",
  stock: "el stock",
  slug: "la dirección web",
  code: "el código",
  category_id: "la categoría",
  sort_order: "el orden",
  base_cost: "el costo de envío",
  free_shipping_threshold: "el monto de envío gratis",
  provinces: "las provincias",
  ml: "los mililitros",
  sale_price: "el precio de oferta",
  reference_price: "el precio anterior",
  email: "el email",
  password: "la contraseña",
};

function fieldLabel(path: ReadonlyArray<PropertyKey>): string {
  for (const part of path) {
    if (typeof part === "string" && FIELD_LABELS[part]) return FIELD_LABELS[part];
  }
  return "un dato";
}

function zodIssueMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Revisá los datos cargados.";
  const what = fieldLabel(issue.path);
  const origin = (issue as { origin?: string }).origin;

  switch (issue.code) {
    case "too_small": {
      // Texto vacío / corto, o número por debajo del mínimo.
      if (origin === "string") return `Falta completar ${what}.`;
      return `${capitalize(what)} es demasiado bajo.`;
    }
    case "too_big":
      return `${capitalize(what)} es demasiado alto.`;
    case "invalid_type":
      return `Falta completar ${what}.`;
    case "invalid_format":
      return `${capitalize(what)} no tiene un formato válido.`;
    case "invalid_value":
      return `${capitalize(what)} no es una opción válida.`;
    default:
      return `Revisá ${what}.`;
  }
}

interface PostgrestLike {
  code?: string;
  message?: string;
  details?: string;
}

function isPostgrestLike(e: unknown): e is PostgrestLike {
  return (
    typeof e === "object" &&
    e !== null &&
    ("code" in e || "details" in e) &&
    "message" in e
  );
}

function postgrestMessage(e: PostgrestLike): string {
  switch (e.code) {
    case "23505": // unique_violation
      return "Ya existe un registro con esos datos. Probá con otro nombre o código.";
    case "23503": // foreign_key_violation
      return "No se puede hacer esto porque hay otros datos que dependen de este.";
    case "23502": // not_null_violation
      return "Falta completar un dato obligatorio.";
    case "23514": // check_violation
      return "Alguno de los valores no está permitido (por ejemplo, un precio negativo).";
    case "42501": // insufficient_privilege / RLS
      return "No tenés permiso para hacer este cambio. Cerrá sesión y volvé a entrar.";
    case "PGRST301":
    case "PGRST302":
      return "Se cerró tu sesión. Volvé a entrar para seguir.";
    default:
      return "No pudimos guardar el cambio. Probá de nuevo en un momento.";
  }
}

/** Mensajes crudos de Supabase Auth → español. */
const AUTH_MESSAGES: Record<string, string> = {
  "invalid login credentials":
    "El email o la contraseña no son correctos. Probá de nuevo.",
  "email not confirmed":
    "Todavía no confirmaste tu email. Revisá tu correo o escribinos.",
  "user not found": "No encontramos una cuenta con ese email.",
  "invalid email": "Ese email no parece válido. Revisalo.",
  "email rate limit exceeded":
    "Probaste muchas veces seguidas. Esperá un momento y reintentá.",
  "network error":
    "No pudimos conectarnos. Revisá tu internet y volvé a intentar.",
  "failed to fetch":
    "No pudimos conectarnos. Revisá tu internet y volvé a intentar.",
};

/**
 * Convierte cualquier error en una frase amable en español.
 * Acepta ZodError, errores de Supabase (Postgrest/Auth), Error común,
 * o un string ya armado.
 */
export function friendlyError(error: unknown): string {
  if (!error) return "Ocurrió un problema. Probá de nuevo.";

  if (error instanceof ZodError) return zodIssueMessage(error);

  if (isPostgrestLike(error)) {
    // Algunos errores de auth llegan con shape parecido pero sin code SQL.
    const lower = (error.message ?? "").toLowerCase();
    for (const key in AUTH_MESSAGES) {
      if (lower.includes(key)) return AUTH_MESSAGES[key];
    }
    return postgrestMessage(error);
  }

  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  const lower = raw.toLowerCase();
  for (const key in AUTH_MESSAGES) {
    if (lower.includes(key)) return AUTH_MESSAGES[key];
  }

  // Un ZodError serializado como string (lo que devolvía el código viejo).
  if (raw.trim().startsWith("[") && raw.includes('"code"')) {
    try {
      const issues = JSON.parse(raw);
      if (Array.isArray(issues) && issues[0]?.path) {
        return `Revisá ${fieldLabel(issues[0].path)}.`;
      }
    } catch {
      /* sigue al fallback */
    }
  }

  if (raw && raw.length < 120 && /[áéíóúñ]|[a-z]/i.test(raw) && /\s/.test(raw)) {
    // Texto corto y legible: probablemente ya esté en español/es usable.
    return raw;
  }

  return "No pudimos completar la acción. Probá de nuevo en un momento.";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
