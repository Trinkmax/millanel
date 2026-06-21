import * as React from "react";
import { cn } from "@/lib/utils";

/* Contenedor de página y encabezado consistentes en todo el panel.
   Padding generoso, tipografía Fraunces para los títulos, aire para que
   nada se sienta apretado. */

export function AdminPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl space-y-6 p-5 md:space-y-8 md:p-8 lg:p-10",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        {eyebrow && <p className="eyebrow text-mute">{eyebrow}</p>}
        <h1 className="font-display text-3xl text-navy-900 md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-xl text-sm text-mute md:text-base">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
