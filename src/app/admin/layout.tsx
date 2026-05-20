import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/ingreso?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    // Not admin → render minimal forbidden screen
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="font-display text-4xl text-navy-900">Acceso restringido</h1>
          <p className="text-mute">
            Esta sección es sólo para administradores. Si necesitás acceso,
            contactá a Cintia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminShell user={{ full_name: profile.full_name, email: profile.email }}>
      {children}
    </AdminShell>
  );
}
