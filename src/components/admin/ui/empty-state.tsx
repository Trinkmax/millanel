import * as React from "react";
import { AdminIcon } from "./admin-icon";
import { cn } from "@/lib/utils";

/* Vacío amable: nunca un "No hay datos" frío. Explica qué pasa y, cuando
   se puede, ofrece el próximo paso. */

export function EmptyState({
  icon = "Sparkles",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-cream-100 text-champagne-400">
        <AdminIcon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl text-navy-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-mute">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
