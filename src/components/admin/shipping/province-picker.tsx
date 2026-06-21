"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PROVINCES_AR } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* Selector amable de provincias: la dueña ve y elige NOMBRES reales
   (c.name), pero por debajo guardamos siempre los códigos (c.code) en
   provinces[]. Nunca le pedimos un código a mano. Es opcional e
   informativo: una zona sin provincias igual funciona. */

const NAME_BY_CODE = new Map<string, string>(
  PROVINCES_AR.map((p) => [p.code, p.name]),
);

export function provinceName(code: string): string {
  return NAME_BY_CODE.get(code) ?? code;
}

export function ProvincePicker({
  value,
  onChange,
}: {
  /** Códigos seleccionados (ej: ["AR-C", "AR-B"]). */
  value: string[];
  onChange: (codes: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  function toggle(code: string) {
    onChange(
      value.includes(code)
        ? value.filter((c) => c !== code)
        : [...value, code],
    );
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROVINCES_AR;
    return PROVINCES_AR.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-3">
      {/* Provincias ya elegidas, como fichas que se sacan con un toque */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-cream-100 pl-3 pr-2 text-sm text-navy-800 transition-colors hover:border-navy-400"
            >
              {provinceName(code)}
              <X className="h-3.5 w-3.5 text-mute" aria-hidden />
              <span className="sr-only">Quitar {provinceName(code)}</span>
            </button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
          >
            Limpiar
          </Button>
        </div>
      )}

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscá una provincia…"
      />

      {/* Lista de provincias para tildar. Alto acotado con scroll. */}
      <div className="max-h-56 overflow-y-auto rounded-xl border border-line bg-pearl">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-mute">
            No encontramos ninguna provincia con ese nombre.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((p) => {
              const checked = value.includes(p.code);
              return (
                <li key={p.code}>
                  <button
                    type="button"
                    onClick={() => toggle(p.code)}
                    aria-pressed={checked}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-cream-100"
                  >
                    <span
                      className={cn(
                        checked ? "font-medium text-navy-900" : "text-navy-700",
                      )}
                    >
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                        checked
                          ? "border-navy bg-navy text-cream"
                          : "border-line bg-pearl",
                      )}
                    >
                      {checked && <Check className="h-3.5 w-3.5" aria-hidden />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
