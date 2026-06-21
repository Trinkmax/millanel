import * as React from "react";
import { Card } from "@/components/ui/card";
import { AdminIcon } from "./admin-icon";
import { cn } from "@/lib/utils";

/* Tarjeta de sección con encabezado claro (ícono + título + ayuda corta).
   La unidad de construcción de los formularios del panel. */

export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-100 text-navy">
                <AdminIcon name={icon} className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-xl leading-tight text-navy-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 max-w-md text-xs text-mute">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5 md:p-6", bodyClassName)}>{children}</div>
    </Card>
  );
}
