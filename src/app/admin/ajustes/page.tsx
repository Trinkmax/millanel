import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="space-y-2">
        <p className="eyebrow text-mute">Configuración</p>
        <h1 className="font-display text-3xl md:text-4xl text-navy-900">
          Ajustes generales
        </h1>
        <p className="text-mute">
          Datos del local, contacto y métodos de pago disponibles.
        </p>
      </header>
      <SettingsForm
        store={(settings.store ?? {}) as Record<string, string>}
        contact={(settings.contact ?? {}) as Record<string, string>}
        payment={(settings.payment ?? {}) as Record<string, boolean>}
      />
    </div>
  );
}
