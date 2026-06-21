"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { publicUrl } from "@/lib/storage";
import { useConfirm } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* Una sola imagen por categoría. Sube al bucket 'category-images' y devuelve
   el path bucket-relativo al padre (que lo guarda en image_path). El preview
   se resuelve con publicUrl(path, 'category-images') recién al renderizar, así
   sobrevive una migración de proyecto. */

interface CategoryImageProps {
  value: string | null;
  onChange: (path: string | null) => void;
  /** Carpeta dentro del bucket (usamos el slug o "nuevas" para las que aún no existen). */
  folder?: string;
  disabled?: boolean;
}

export function CategoryImage({
  value,
  onChange,
  folder = "categorias",
  disabled,
}: CategoryImageProps) {
  const confirm = useConfirm();
  const [uploading, setUploading] = useState(false);
  const preview = publicUrl(value, "category-images");

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${folder}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("category-images")
        .upload(filename, file, {
          cacheControl: "31536000",
          upsert: false,
        });
      if (error) {
        toast.error("No pudimos subir la imagen", {
          description: error.message,
        });
        return;
      }
      onChange(filename);
      toast.success("Imagen lista. Acordate de guardar la categoría.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    const ok = await confirm({
      title: "¿Quitar la imagen de la categoría?",
      description:
        "Se va a sacar de esta sección. El cambio recién queda firme cuando guardás la categoría.",
      confirmLabel: "Sí, quitar",
      cancelLabel: "No, dejarla",
      tone: "danger",
      icon: "Image",
    });
    if (!ok) return;
    onChange(null);
  }

  // Con imagen: preview grande + botón de quitar siempre visible.
  if (preview) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-cream-50">
          <Image
            src={preview}
            alt="Imagen de la categoría"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className={cn(
              "inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-pearl px-4 text-sm font-medium text-navy-700 transition-colors hover:border-navy-300 hover:text-navy-900",
              (uploading || disabled) && "pointer-events-none opacity-60",
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading || disabled}
              onChange={(e) => {
                handleFile(e.target.files?.[0] ?? null);
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
                Cambiar imagen
              </>
            )}
          </label>
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading || disabled}
            className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-mute transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Quitar
          </button>
        </div>
      </div>
    );
  }

  // Sin imagen: zona para subir.
  return (
    <label
      className={cn(
        "flex h-20 cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line bg-cream-50 px-4 text-sm font-medium text-navy-700 transition-colors hover:border-navy-300 hover:text-navy-900",
        (uploading || disabled) && "pointer-events-none opacity-60",
      )}
    >
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading || disabled}
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pearl text-mute">
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ImageOff className="h-5 w-5" />
        )}
      </span>
      <span className="text-mute">
        {uploading ? (
          "Subiendo imagen…"
        ) : (
          <>
            Subí una imagen para que la sección se vea linda.
            <span className="block text-xs text-mute-soft">
              Es opcional. Una sola foto por categoría.
            </span>
          </>
        )}
      </span>
    </label>
  );
}
