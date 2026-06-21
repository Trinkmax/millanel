import * as React from "react";
import { formatPrice } from "@/lib/format";

/* Mini gráfico de ventas (barras). Sobrio: navy con la barra más alta en
   champagne para que el "mejor día" salte a la vista. Server-safe (sin
   estado ni hooks): recibe los puntos ya calculados y dibuja SVG inline.
   Si no hay datos, el page no lo renderiza. */

export interface SparkPoint {
  /** Fecha en formato YYYY-MM-DD (tal como la devuelve el RPC). */
  day: string;
  total: number;
}

export function SalesSparkline({ data }: { data: SparkPoint[] }) {
  // Tope para la escala: al menos 1 para no dividir por cero.
  const max = Math.max(1, ...data.map((d) => d.total));
  const best = data.reduce(
    (acc, d) => (d.total > acc.total ? d : acc),
    data[0],
  );

  // Etiquetas legibles del primer y último día (es-AR, día + mes corto).
  const firstLabel = shortLabel(data[0]?.day);
  const lastLabel = shortLabel(data[data.length - 1]?.day);

  return (
    <div>
      <div
        className="flex h-28 items-end gap-1.5"
        role="img"
        aria-label={`Ventas por día. Mejor día: ${shortLabel(best?.day)} con ${formatPrice(Number(best?.total ?? 0))}.`}
      >
        {data.map((d) => {
          const value = Number(d.total) || 0;
          // Mínimo 6% de alto para que un día con ventas chicas siga visible.
          const pct = Math.max(6, Math.round((value / max) * 100));
          const isBest = best && d.day === best.day && value > 0;
          return (
            <div
              key={d.day}
              className="group relative flex flex-1 items-end"
              style={{ height: "100%" }}
            >
              <div
                className={
                  isBest
                    ? "w-full rounded-t-[4px] bg-champagne-300 transition-colors"
                    : "w-full rounded-t-[4px] bg-navy-200 transition-colors group-hover:bg-navy-300"
                }
                style={{ height: `${pct}%` }}
              />
              {/* Detalle al pasar el dedo/mouse — extra, no info crítica. */}
              <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[11px] text-cream opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
                {shortLabel(d.day)} · {formatPrice(value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-mute">
        <span>{firstLabel}</span>
        {best && Number(best.total) > 0 && (
          <span className="text-navy-700">
            Mejor día: {shortLabel(best.day)} · {formatPrice(Number(best.total))}
          </span>
        )}
        <span>{lastLabel}</span>
      </div>
    </div>
  );
}

/** YYYY-MM-DD → "12 jun" en es-AR, sin desfase de zona horaria. */
function shortLabel(day?: string): string {
  if (!day) return "—";
  // Interpretar como fecha local (mediodía evita saltos por UTC).
  const d = new Date(`${day}T12:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d
    .toLocaleDateString("es-AR", { day: "numeric", month: "short" })
    .replace(".", "");
}
