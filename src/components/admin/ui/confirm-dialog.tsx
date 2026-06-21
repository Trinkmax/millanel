"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminIcon } from "./admin-icon";
import { cn } from "@/lib/utils";

/* Confirmación de marca que reemplaza al window.confirm() del navegador.
   Uso:
     const confirm = useConfirm();
     if (await confirm({ title: "¿Eliminar?", tone: "danger" })) { … }
*/

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  icon?: string;
}

type Resolver = (value: boolean) => void;

const ConfirmContext = React.createContext<
  (options: ConfirmOptions) => Promise<boolean>
>(() => Promise.resolve(false));

export function useConfirm() {
  return React.useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolver = React.useRef<Resolver | null>(null);

  const confirm = React.useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = React.useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  }, []);

  const danger = options?.tone === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={!!options}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
      >
        <DialogContent className="max-w-md">
          {options && (
            <>
              <DialogHeader>
                <div
                  className={cn(
                    "mb-1 grid h-12 w-12 place-items-center rounded-full",
                    danger
                      ? "bg-blush-100 text-destructive"
                      : "bg-sky-100 text-navy",
                  )}
                >
                  <AdminIcon
                    name={options.icon ?? (danger ? "TriangleAlert" : "CircleAlert")}
                    className="h-5 w-5"
                  />
                </div>
                <DialogTitle>{options.title}</DialogTitle>
                {options.description && (
                  <DialogDescription>{options.description}</DialogDescription>
                )}
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => settle(false)}
                >
                  {options.cancelLabel ?? "Cancelar"}
                </Button>
                <Button
                  type="button"
                  variant={danger ? "destructive" : "primary"}
                  onClick={() => settle(true)}
                >
                  {options.confirmLabel ?? "Sí, continuar"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
