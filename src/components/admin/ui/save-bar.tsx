"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { AdminIcon } from "./admin-icon";

/* Barra flotante de "tenés cambios sin guardar". Aparece sólo cuando hay
   algo para guardar, así nunca se pierde una edición sin querer. Flota por
   encima de la barra de pestañas en mobile y a la derecha del menú en
   escritorio. */

export function SaveBar({
  visible,
  saving,
  onSave,
  onDiscard,
  message = "Tenés cambios sin guardar",
  saveLabel = "Guardar cambios",
}: {
  visible: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  message?: string;
  saveLabel?: string;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 lg:left-64 pb-[calc(env(safe-area-inset-bottom)+76px)] lg:pb-4"
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-line bg-pearl/95 px-4 py-3 shadow-deep backdrop-blur">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-champagne-50 text-champagne-400">
              <AdminIcon name="Sparkles" className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-navy-800">
              {message}
            </span>
            {onDiscard && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDiscard}
                disabled={saving}
              >
                Descartar
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Guardando…" : saveLabel}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
