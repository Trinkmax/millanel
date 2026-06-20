"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";

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
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Máximo ${max} imágenes`);
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
          toast.error(`Error subiendo ${file.name}`, {
            description: error.message,
          });
          continue;
        }
        uploaded.push({ path: filename, alt: "" });
      }
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} imagen(es) subida(s)`);
      }
    } finally {
      setUploading(false);
    }
  }

  async function removeAt(idx: number) {
    const item = value[idx];
    if (!item) return;
    onChange(value.filter((_, i) => i !== idx));
    // Best-effort delete from storage
    try {
      const supabase = createClient();
      await supabase.storage.from(bucket).remove([item.path]);
    } catch (err) {
      console.warn("Storage delete failed:", err);
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <AnimatePresence>
          {value.map((img, idx) => (
            <motion.div
              key={img.path}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="group relative aspect-square rounded-lg overflow-hidden border border-line bg-cream-50"
            >
              <Image
                src={publicUrl(img.path, bucket)!}
                alt={img.alt ?? `Imagen ${idx + 1}`}
                fill
                sizes="200px"
                className="object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[9px] uppercase tracking-wider bg-navy text-cream px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  aria-label="Mover izquierda"
                  className="rounded-full bg-cream/90 text-navy p-1.5 hover:bg-cream disabled:opacity-30"
                >
                  <GripVertical className="h-3 w-3 -rotate-90" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  aria-label="Eliminar"
                  className="rounded-full bg-destructive text-cream p-1.5 hover:opacity-90"
                >
                  <X className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === value.length - 1}
                  aria-label="Mover derecha"
                  className="rounded-full bg-cream/90 text-navy p-1.5 hover:bg-cream disabled:opacity-30"
                >
                  <GripVertical className="h-3 w-3 rotate-90" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {value.length < max && (
          <label
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed border-line bg-cream-50 flex flex-col items-center justify-center gap-1.5 text-mute hover:border-navy-300 hover:text-navy transition-colors cursor-pointer",
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
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span className="text-[10px] uppercase tracking-wider font-medium">
                  Subir
                </span>
              </>
            )}
          </label>
        )}
      </div>
      <p className="text-xs text-mute">
        {value.length}/{max} imágenes · La primera es la principal. Arrastrá para reordenar.
      </p>
    </div>
  );
}
