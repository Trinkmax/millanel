"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function SearchDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim().length === 0) return;
    setOpen(false);
    router.push(`/productos?q=${encodeURIComponent(q.trim())}`);
    setQ("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar productos"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-100 transition-colors",
          className,
        )}
      >
        <Search className="h-5 w-5" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-xl sm:!rounded-2xl !p-0 overflow-hidden">
          <DialogTitle className="sr-only">Buscar productos</DialogTitle>
          <DialogDescription className="sr-only">
            Buscá perfumes, cosmética, mate y más
          </DialogDescription>
          <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Search className="h-5 w-5 text-mute" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscá un perfume, una crema, un mate…"
              className="flex-1 bg-transparent text-[15px] font-sans focus:outline-none placeholder:text-mute-soft"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-mute hover:text-navy transition-colors"
                aria-label="Limpiar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="px-5 py-4 text-xs text-mute flex flex-wrap items-center gap-3">
            <span>
              Presioná <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-line text-navy-700 font-mono text-[10px]">Enter</kbd> para buscar
            </span>
            <span>·</span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-cream-100 border border-line text-navy-700 font-mono text-[10px]">Esc</kbd> para cerrar
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
