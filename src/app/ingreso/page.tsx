import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";

export const metadata: Metadata = {
  title: "Acceso admin",
  robots: { index: false, follow: false },
};

export default function IngresoPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-cream-50">
      {/* Visual side */}
      <div className="hidden lg:flex relative bg-navy text-cream items-center justify-center overflow-hidden paper-grain">
        <div className="absolute inset-0 halo-sky opacity-30" />
        <div className="relative px-16 max-w-md space-y-6 z-10">
          <MillanelWordmark variant="logo" tone="dark" size="lg" href={null} />
          <div className="space-y-3">
            <p className="eyebrow text-cream/60">Panel administrativo</p>
            <h2 className="font-display text-5xl leading-tight">
              Gestioná tu Millanel <em className="italic font-normal text-blush-200">con calma.</em>
            </h2>
            <p className="text-cream/70 text-base leading-relaxed">
              Cargá productos, subí fotos, controlá pedidos y mirá las métricas
              del mes. Todo desde un solo lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col px-6 py-10 md:px-16 md:py-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-mute hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al sitio
          </Link>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            <header className="space-y-2 lg:hidden">
              <MillanelWordmark variant="inline" size="sm" />
            </header>
            <header className="space-y-3">
              <p className="eyebrow">Acceso</p>
              <h1 className="font-display text-4xl md:text-5xl text-navy-900 leading-tight">
                Ingresá a tu panel
              </h1>
              <p className="text-sm text-mute">
                Acceso restringido para administradores.
              </p>
            </header>

            <Suspense>
              <LoginForm />
            </Suspense>

            <p className="text-xs text-mute italic">
              ¿Olvidaste tu contraseña? Escribinos a{" "}
              <a
                href="mailto:soporte@millanelfrias.ar"
                className="text-navy hover:underline"
              >
                soporte@millanelfrias.ar
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
