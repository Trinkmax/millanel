"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/admin/errors";

export async function signIn(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const next = formData.get("next")?.toString() ?? "/admin";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { ok: false as const, error: friendlyError(error) };
  }
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Origen absoluto del sitio (https://midominio) a partir de la request. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Envía un correo con un enlace para elegir una nueva contraseña. */
export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Escribí tu email para enviarte el enlace." };
  }
  const supabase = await createClient();
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/ingreso/nueva-clave`,
  });
  if (error) return { ok: false as const, error: friendlyError(error) };
  return { ok: true as const };
}

/** Cambia la contraseña del usuario en sesión (flujo de recuperación). */
export async function updatePassword(password: string) {
  if (!password || password.length < 6) {
    return {
      ok: false as const,
      error: "La contraseña tiene que tener al menos 6 caracteres.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false as const, error: friendlyError(error) };
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requireAdmin() {
  const result = await getCurrentUser();
  if (!result || result.profile?.role !== "admin") {
    redirect("/ingreso");
  }
  return result;
}
