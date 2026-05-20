"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Separator } from "@/components/ui/separator";
import { ImageUploader, type ImageItem } from "@/components/admin/image-uploader";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFormInput,
} from "@/lib/actions/admin";
import type { Category, Product } from "@/lib/supabase/types";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState<ProductFormInput>({
    name: product?.name ?? "",
    code: product?.code ?? "",
    slug: product?.slug ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? null,
    section: product?.section ?? "",
    price: Number(product?.price ?? 0),
    reference_price: product?.reference_price ? Number(product.reference_price) : null,
    sale_price: product?.sale_price ? Number(product.sale_price) : null,
    promotion: product?.promotion ?? "",
    stock: product?.stock ?? 0,
    track_stock: product?.track_stock ?? false,
    featured: product?.featured ?? false,
    is_new: product?.is_new ?? false,
    active: product?.active ?? true,
    tags: product?.tags ?? [],
    images: ((product?.images ?? []) as unknown as ImageItem[]).filter(Boolean),
  });
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof ProductFormInput>(key: K, value: ProductFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || form.tags.includes(t)) return;
    update("tags", [...form.tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    update(
      "tags",
      form.tags.filter((x) => x !== t),
    );
  }

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, form)
        : await createProduct(form);
      if (!result.ok) {
        setError(result.error);
        toast.error("Error", { description: result.error });
        return;
      }
      toast.success(isEdit ? "Producto actualizado" : "Producto creado");
      if (!isEdit && "id" in result && result.id) {
        router.push(`/admin/productos/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (!isEdit || !confirm(`¿Eliminar "${product.name}"? Esta acción es permanente.`))
      return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) {
        toast.error("Error", { description: result.error });
        return;
      }
      toast.success("Producto eliminado");
      router.push("/admin/productos");
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="space-y-6 p-6 md:p-10"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-mute hover:text-navy transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Productos
          </Link>
          <h1 className="font-display text-3xl md:text-4xl text-navy-900">
            {isEdit ? form.name || "Editar producto" : "Nuevo producto"}
          </h1>
          {isEdit && product.code && (
            <p className="text-xs text-mute uppercase tracking-wider">
              Código {product.code}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link href={`/productos/${product.slug}`} target="_blank">
                <Eye className="h-3.5 w-3.5" />
                Ver
              </Link>
            </Button>
          )}
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={pending}
              className="!text-destructive hover:!bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h2 className="font-display text-xl text-navy-900">Información</h2>
              <FormField label="Nombre" required>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  placeholder="Ej: Eau de Parfum Afrodisíaco x 100ml"
                />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Código" hint="Ej: 01536044">
                  <Input
                    value={form.code ?? ""}
                    onChange={(e) => update("code", e.target.value)}
                  />
                </FormField>
                <FormField label="Slug (URL)" hint="Se genera automáticamente">
                  <Input
                    value={form.slug ?? ""}
                    onChange={(e) => update("slug", e.target.value)}
                    placeholder="eau-de-parfum-afrodisiaco-x-100ml"
                  />
                </FormField>
              </div>
              <FormField
                label="Descripción corta"
                hint="Resumen breve que aparece en listados"
              >
                <Textarea
                  value={form.short_description ?? ""}
                  onChange={(e) => update("short_description", e.target.value)}
                  rows={2}
                />
              </FormField>
              <FormField label="Descripción completa">
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => update("description", e.target.value)}
                  rows={6}
                  placeholder="Notas, características, modo de uso..."
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h2 className="font-display text-xl text-navy-900">Imágenes</h2>
              <ImageUploader
                value={form.images}
                onChange={(v) => update("images", v)}
                folder={form.code ?? "general"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h2 className="font-display text-xl text-navy-900">Precios</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="PVP" hint="Precio venta público" required>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      update("price", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </FormField>
                <FormField label="PVR" hint="Precio referencia (admin)">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.reference_price ?? ""}
                    onChange={(e) =>
                      update(
                        "reference_price",
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                  />
                </FormField>
                <FormField label="Precio oferta" hint="Si está en descuento">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.sale_price ?? ""}
                    onChange={(e) =>
                      update(
                        "sale_price",
                        e.target.value ? parseFloat(e.target.value) : null,
                      )
                    }
                  />
                </FormField>
              </div>
              <FormField label="Promoción (texto)">
                <Input
                  value={form.promotion ?? ""}
                  onChange={(e) => update("promotion", e.target.value)}
                  placeholder="Llevá 2 a $X c/u..."
                />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h2 className="font-display text-xl text-navy-900">Estado</h2>
              <ToggleField
                label="Activo en el catálogo"
                checked={form.active}
                onChange={(v) => update("active", v)}
              />
              <ToggleField
                label="Destacado"
                checked={form.featured}
                onChange={(v) => update("featured", v)}
              />
              <ToggleField
                label="Nuevo"
                checked={form.is_new}
                onChange={(v) => update("is_new", v)}
              />
              <Separator />
              <ToggleField
                label="Llevar stock"
                checked={form.track_stock}
                onChange={(v) => update("track_stock", v)}
              />
              {form.track_stock && (
                <FormField label="Stock disponible">
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) =>
                      update("stock", parseInt(e.target.value) || 0)
                    }
                  />
                </FormField>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 !pt-6 space-y-4">
              <h2 className="font-display text-xl text-navy-900">
                Categorización
              </h2>
              <FormField label="Categoría">
                <Select
                  value={form.category_id ?? ""}
                  onValueChange={(v) => update("category_id", v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí una..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Sección catálogo">
                <Input
                  value={form.section ?? ""}
                  onChange={(e) => update("section", e.target.value)}
                  placeholder="Páginas 002-003"
                />
              </FormField>
              <FormField label="Etiquetas" hint="Presioná Enter para agregar">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="hombre, nuevo, promo..."
                />
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => removeTag(t)}
                        className="inline-flex items-center gap-1 rounded-full bg-cream-100 hover:bg-blush-100 px-2.5 py-1 text-xs text-navy-700 transition-colors group"
                      >
                        {t}
                        <span className="text-mute group-hover:text-destructive">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </FormField>
            </CardContent>
          </Card>
        </aside>
      </div>
    </form>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-navy-900">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
