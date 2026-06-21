"use client";

import { AdminIcon } from "@/components/admin/ui";

/* Mini vista de cómo ven tus clientes el contacto y el pie del sitio.
   Refleja en vivo lo que la dueña está editando (sin guardar todavía),
   para que entienda que esto SÍ cambia el sitio. */

interface StorePreviewProps {
  name: string;
  tagline: string;
  street: string;
  city: string;
  province: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
}

/** Arma la dirección legible a partir de las partes cargadas. */
function buildAddress(street: string, city: string, province: string): string {
  return [street, city, province].map((p) => p.trim()).filter(Boolean).join(", ");
}

/** Muestra el WhatsApp con formato lindo: +54 9 … (sólo visual). */
function prettyWhatsapp(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (!d) return "";
  return "+" + d.replace(/^(\d{2})(\d)(.*)$/, "$1 $2 $3").trim();
}

function Row({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 text-sm text-navy-800">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-100 text-navy">
        <AdminIcon name={icon} className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

export function StorePreview({
  name,
  tagline,
  street,
  city,
  province,
  phone,
  whatsapp,
  email,
  hours,
}: StorePreviewProps) {
  const address = buildAddress(street, city, province);
  const wsp = prettyWhatsapp(whatsapp);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-cream-50 shadow-soft">
      {/* Encabezado tipo pie de sitio */}
      <div className="border-b border-line bg-navy-900 px-5 py-5 text-cream-50">
        <p className="font-display text-xl leading-tight">
          {name.trim() || "Nombre de tu tienda"}
        </p>
        {tagline.trim() && (
          <p className="mt-1 text-sm text-cream-50/70">{tagline.trim()}</p>
        )}
      </div>

      {/* Datos de contacto */}
      <ul className="space-y-3 px-5 py-5">
        {address ? (
          <Row icon="MapPin">{address}</Row>
        ) : (
          <Row icon="MapPin">
            <span className="text-mute">Todavía sin dirección</span>
          </Row>
        )}
        {hours.trim() && <Row icon="Clock">{hours.trim()}</Row>}
        {phone.trim() && <Row icon="Phone">{phone.trim()}</Row>}
        {wsp && (
          <Row icon="MessageCircle">
            <span className="font-medium">WhatsApp</span> · {wsp}
          </Row>
        )}
        {email.trim() && <Row icon="Mail">{email.trim()}</Row>}
      </ul>
    </div>
  );
}
