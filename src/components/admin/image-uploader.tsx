"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Trash2,
  Loader2,
  ArrowUp,
  ArrowDown,
  Star,
  ImageOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";
import { useConfirm } from "@/components/admin/ui";

export interface ImageItem {
  path: string;
  alt?: string;
}

interface ImageUploaderProps {
  value: ImageItem[];
  onChange: (value: ImageItem[]) => void;
  bucket?: "product-images" | "category-images";
  folder?: string;
  max?: number;
  /**
   * Borrado diferido: cuando la dueña quita una imagen, NO la borramos del
   * Storage en el acto (sería irreversible). En su lugar avisamos al padre
   * con el path, y el padre confirma el borrado real recién al Guardar.
   * Si no se pasa, caemos a borrado inmediato (best-effort).
   */
  onQueueDelete?: (path: string) => void;
}

// Re-exported so existing `from "@/components/admin/image-uploader"` imports
// keep working; the implementation lives in @/lib/storage (server+client safe).
export { publicUrl };

export function ImageUploader({
  value,
  onChange,
  bucket = "product-images",
  folder = "general",
  max = 6,
  onQueueDelete,
}: ImageUploaderProps) {
  const confirm = useConfirm();
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Podés subir hasta ${max} fotos`, {
        description: `Ya tenés ${value.length}. Quitá alguna para sumar otras.`,
      });
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const uploaded: ImageItem[] = [];
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `${folder}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filename, file, {
            cacheControl: "31536000",
            upsert: false,
          });
        if (error) {
          toast.error(`No pudimos subir "${file.name}"`, {
            description: error.message,
          });
          continue;
        }
        uploaded.push({ path: filename, alt: "" });
      }
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(
          uploaded.length === 1
            ? "Foto agregada"
            : `${uploaded.length} fotos agregadas`,
        );
      }
    } finally {
      setUploading(false);
    }
  }

  async function removeAt(idx: number) {
    const item = value[idx];
    if (!item) return;
    const ok = await confirm({
      title: "¿Quitar esta foto?",
      description:
        "Se va a sacar de la galería del producto. Recién se borra del todo cuando tocás Guardar, así que si te arrepentís todavía estás a tiempo.",
      confirmLabel: "Sí, quitar",
      cancelLabel: "No, dejarla",
      tone: "danger",
    });
    if (!ok) return;

    onChange(value.filter((_, i) => i !== idx));

    if (onQueueDelete) {
      // Borrado diferido: el padre la borra del Storage al Guardar.
      onQueueDelete(item.path);
    } else {
      // Sin padre que coordine: borrado inmediato best-effort.
      try {
        const supabase = createClient();
        await supabase.storage.from(bucket).remove([item.path]);
      } catch (err) {
        console.warn("Storage delete failed:", err);
      }
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function makePrincipal(idx: number) {
    if (idx === 0) return;
    move(idx, 0);
    toast.success("Esa foto es la principal ahora");
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-cream-50 px-4 py-3 text-sm text-mute">
          <ImageOff className="h-4 w-4 shrink-0" />
          <span>
            Todavía no hay fotos. La primera que subas será la que se ve en la
            tienda.
          </span>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {value.map((img, idx) => (
            <motion.div
              key={img.path}
              layout
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              className="flex items-center gap-3 rounded-2xl border border-line bg-pearl p-2.5 shadow-whisper"
            >
              {/* Miniatura */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-cream-50">
                <Image
                  src={publicUrl(img.path, bucket)!}
                  alt={img.alt || `Foto ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              {/* Texto / estado */}
              <div className="min-w-0 flex-1">
                {idx === 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne-50 px-2.5 py-1 text-xs font-medium text-champagne-400">
                    <Star className="h-3 w-3" />
                    Foto principal
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makePrincipal(idx)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-navy-700 transition-colors hover:bg-cream-100 hover:text-navy-900"
                  >
                    <Star className="h-3.5 w-3.5" />
                    Hacerla principal
                  </button>
                )}
                <p className="mt-1 truncate text-xs text-mute">Foto {idx + 1}</p>
              </div>

              {/* Controles SIEMPRE visibles, grandes para el dedo */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  aria-label="Subir en el orden"
                  className="grid h-11 w-11 place-items-center rounded-xl text-navy-700 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-25"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === value.length - 1}
                  aria-label="Bajar en el orden"
                  className="grid h-11 w-11 place-items-center rounded-xl text-navy-700 transition-colors hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-25"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  aria-label="Quitar foto"
                  className="grid h-11 w-11 place-items-center rounded-xl text-mute transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {value.length < max && (
        <label
          className={cn(
            "flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-line bg-cream-50 px-4 text-sm font-medium text-navy-700 transition-colors hover:border-navy-300 hover:text-navy-900",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Subir fotos
            </>
          )}
        </label>
      )}

      <p className="text-xs text-mute">
        {value.length} de {max} fotos · La primera es la que se ve en la tienda.
        Usá las flechas para ordenar.
      </p>
    </div>
  );
}
