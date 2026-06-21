"use client";

import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

/* Tarjeta de contacto del cliente con acciones reales: mailto y un botón
   de WhatsApp con el número NORMALIZADO a formato internacional y un
   mensaje ya escrito. Si el teléfono guardado no trae código de país,
   asumimos Argentina (54 9) de forma defensiva, para que el link siempre
   abra el chat correcto. */

interface CustomerContactProps {
  name: string;
  email: string;
  phone: string | null;
  dni: string | null;
  orderNumber: string;
}

/** Saca el "15" de celular: al inicio, o justo después del código de área
 *  (primeros 2 a 4 dígitos) cuando sacarlo deja un nacional de 10 dígitos. */
function stripMobile15(d: string): string {
  if (d.startsWith("15")) return d.slice(2);
  for (let i = 2; i <= 4; i++) {
    if (d.slice(i, i + 2) === "15" && d.length - 2 === 10) {
      return d.slice(0, i) + d.slice(i + 2);
    }
  }
  return d;
}

/** Normaliza un teléfono argentino a formato internacional para wa.me.
 *  Reglas defensivas:
 *   - Deja sólo dígitos; saca el prefijo internacional "00".
 *   - Si ya trae 54, lo normaliza a 54 9 + nacional (sin 0 ni 15).
 *   - Si es local: saca el 0 interurbano y el 15 (esté al inicio o tras el área).
 *   - Antepone 54 9 (Argentina, celular). */
export function normalizeArgentinePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // Prefijo internacional "00…" → fuera.
  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("54")) {
    let rest = digits.slice(2);
    if (rest.startsWith("9")) rest = rest.slice(1); // 549 → nos quedamos el nacional
    if (rest.startsWith("0")) rest = rest.slice(1);
    rest = stripMobile15(rest);
    return `549${rest}`;
  }

  // Número local: 0 (interurbano) + área + 15 (celular) + abonado.
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = stripMobile15(digits);

  return `549${digits}`;
}

export function CustomerContact({
  name,
  email,
  phone,
  dni,
  orderNumber,
}: CustomerContactProps) {
  const waNumber = normalizeArgentinePhone(phone);
  const firstName = name.trim().split(/\s+/)[0] || name;
  const waMessage = encodeURIComponent(
    `Hola ${firstName}, sobre tu pedido ${orderNumber}…`,
  );
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${waMessage}`
    : null;

  return (
    <div className="space-y-4">
      {/* Datos */}
      <div className="space-y-1">
        <p className="font-medium text-navy-900">{name}</p>
        {dni && <p className="text-xs text-mute">DNI {dni}</p>}
        {phone && <p className="num-display text-sm text-mute">{phone}</p>}
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 text-sm text-mute transition-colors hover:text-navy"
        >
          <Mail className="h-3.5 w-3.5" />
          {email}
        </a>
      </div>

      {/* Acciones de contacto: targets grandes para el celular */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {waHref ? (
          <Button asChild variant="whatsapp" size="md" className="flex-1">
            <a href={waHref} target="_blank" rel="noreferrer">
              <Phone className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
          </Button>
        ) : (
          <p className="flex-1 rounded-[8px] border border-line bg-cream-50 px-3 py-2.5 text-center text-xs text-mute">
            No hay teléfono para escribir por WhatsApp.
          </p>
        )}
        <Button asChild variant="outline" size="md" className="flex-1">
          <a href={`mailto:${email}`}>
            <Mail className="h-4 w-4" />
            Enviar email
          </a>
        </Button>
      </div>
    </div>
  );
}
