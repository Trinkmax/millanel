import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, KeyRound, MailWarning } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { NewPasswordForm } from "./new-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crear nueva contraseña",
  robots: { index: false, follow: false },
};

export default async function NuevaClavePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  const supabase = await createClient();

  // El enlace del email llega con ?code= — lo canjeamos por una sesión.
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Enlace ya usado, vencido o inválido: lo manejamos abajo mirando la sesión.
    }
  }

  // ¿Quedó una sesión válida para poder cambiar la clave?
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasSession = Boolean(user);

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-cream-50">
      {/* Panel visual (sólo desktop) — navy + wordmark */}
      <div className="hidden lg:flex relative bg-navy text-cream items-center justify-center overflow-hidden paper-grain">
        <div className="absolute inset-0 halo-sky opacity-30" />
        <div className="relative px-16 max-w-md space-y-6 z-10">
          <MillanelWordmark variant="logo" tone="dark" size="lg" href={null} />
          <div className="space-y-3">
            <p className="eyebrow text-cream/60">Tu panel de Millanel</p>
            <h2 className="font-display text-5xl leading-tight">
              Elegí una clave{" "}
              <em className="italic font-normal text-blush-200">
                que recuerdes.
              </em>
            </h2>
            <p className="text-cream/70 text-base leading-relaxed">
              Anotala en un lugar seguro. Con esta contraseña vas a entrar a tu
              tienda desde la compu o el celular.
            </p>
          </div>
        </div>
      </div>

      {/* Lado del contenido */}
      <div className="flex flex-col px-6 py-10 md:px-16 md:py-16">
        <div>
          <Link
            href="/ingreso"
            className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al ingreso
          </Link>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            <header className="lg:hidden">
              <MillanelWordmark variant="inline" size="sm" />
            </header>

            {hasSession ? (
              <>
                <header className="space-y-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky/50 text-navy-700">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl text-navy-900 leading-tight">
                    Creá tu nueva contraseña
                  </h1>
                  <p className="text-base text-mute leading-relaxed">
                    Elegí una contraseña nueva y la guardamos. Después entrás
                    directo a tu panel.
                  </p>
                </header>

                <NewPasswordForm />
              </>
            ) : (
              <>
                <header className="space-y-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blush/40 text-navy-700">
                    <MailWarning className="h-5 w-5" />
                  </span>
                  <h1 className="font-display text-4xl md:text-5xl text-navy-900 leading-tight">
                    Ese enlace ya no sirve
                  </h1>
                  <p className="text-base text-mute leading-relaxed">
                    El enlace para cambiar la contraseña vence al rato o se usa
                    una sola vez. No pasa nada: pedí uno nuevo y te llega otro
                    correo en segundos.
                  </p>
                </header>

                <Link
                  href="/ingreso"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-navy px-7 text-sm uppercase tracking-[0.16em] text-cream shadow-soft transition-all duration-300 hover:bg-navy-700 hover:shadow-medium hover:-translate-y-0.5"
                >
                  Pedir un enlace nuevo
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
