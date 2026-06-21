import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <SettingsForm
      store={(settings.store ?? {}) as Record<string, string>}
      contact={(settings.contact ?? {}) as Record<string, string>}
      payment={(settings.payment ?? {}) as Record<string, boolean>}
    />
  );
}
