"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Eye,
  Plus,
  X,
  Sparkles,
  Layers,
  ChevronDown,
  Settings2,
  ImageIcon,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
import {
  AdminPage,
  PageHeader,
  SectionCard,
  MoneyInput,
  SaveBar,
  useConfirm,
} from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import { ImageUploader, type ImageItem } from "@/components/admin/image-uploader";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
  type ProductFormInput,
} from "@/lib/actions/admin";
import type { Category, Product } from "@/lib/supabase/types";
import { parseSizes, minSizePrice } from "@/lib/variants";
import { formatPrice } from "@/lib/format";
import { publicUrl } from "@/lib/storage";
import { slugify, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

/* Construye el estado inicial del formulario a partir del producto (o vacío). */
function buildInitial(product?: Product): ProductFormInput {
  return {
    name: product?.name ?? "",
    code: product?.code ?? "",
    slug: product?.slug ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    category_id: product?.category_id ?? null,
    section: product?.section ?? "",
    price: Number(product?.price ?? 0),
    reference_price: product?.reference_price
      ? Number(product.reference_price)
      : null,
    sale_price: product?.sale_price ? Number(product.sale_price) : null,
    promotion: product?.promotion ?? "",
    stock: product?.stock ?? 0,
    track_stock: product?.track_stock ?? false,
    featured: product?.featured ?? false,
    is_new: product?.is_new ?? false,
    active: product?.active ?? true,
    tags: product?.tags ?? [],
    images: ((product?.images ?? []) as unknown as ImageItem[]).filter(Boolean),
    sizes: parseSizes(product?.sizes),
    fragrance_number: product?.fragrance_number ?? null,
    alternativa_a: product?.alternativa_a ?? null,
    alternativa_marca: product?.alternativa_marca ?? null,
  };
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const isEdit = !!product;

  const initial = useMemo(() => buildInitial(product), [product]);
  const [form, setForm] = useState<ProductFormInput>(initial);
  const [tagInput, setTagInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pending, startTransition] = useTransition();

  // Fotos a borrar del Storage recién al Guardar (borrado diferido reversible).
  const [pendingDeletes, setPendingDeletes] = useState<string[]>([]);

  function update<K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // ── ¿Hay cambios sin guardar? ────────────────────────────────────────────
  // Comparamos contra el estado inicial. Incluye las fotos en cola de borrado.
  const dirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(initial) ||
      pendingDeletes.length > 0,
    [form, initial, pendingDeletes],
  );

  // ── Slug autogenerado (sólo informativo / avanzado) ──────────────────────
  const effectiveSlug = (form.slug?.trim() || slugify(form.name)) || "—";

  // ── Alternativa olfativa ─────────────────────────────────────────────────
  const [isAlt, setIsAlt] = useState(
    !!product?.alternativa_a || product?.fragrance_number != null,
  );
  // Conservamos los datos en un "cajón" por si la dueña reactiva el toggle.
  const altStash = useRef({
    fragrance_number: form.fragrance_number,
    alternativa_a: form.alternativa_a,
    alternativa_marca: form.alternativa_marca,
  });

  function toggleAlt(v: boolean) {
    setIsAlt(v);
    if (!v) {
      // Guardamos lo cargado antes de "vaciar" para el payload.
      altStash.current = {
        fragrance_number: form.fragrance_number,
        alternativa_a: form.alternativa_a,
        alternativa_marca: form.alternativa_marca,
      };
      setForm((f) => ({
        ...f,
        alternativa_a: null,
        alternativa_marca: null,
        fragrance_number: null,
      }));
    } else {
      // Restauramos lo que había en el cajón.
      setForm((f) => ({
        ...f,
        fragrance_number: altStash.current.fragrance_number ?? null,
        alternativa_a: altStash.current.alternativa_a ?? null,
        alternativa_marca: altStash.current.alternativa_marca ?? null,
      }));
    }
  }

  // ── Tamaños / variantes ──────────────────────────────────────────────────
  const sizes = form.sizes ?? [];
  const hasSizes = sizes.length > 0;
  const setSizes = (next: ProductFormInput["sizes"]) => update("sizes", next);
  const addSize = () =>
    setSizes([...sizes, { ml: 0, label: "", price: 0, sale_price: null }]);
  const removeSize = (i: number) =>
    setSizes(sizes.filter((_, idx) => idx !== i));
  const updateSize = (
    i: number,
    patch: Partial<ProductFormInput["sizes"][number]>,
  ) => setSizes(sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const applyPreset = () =>
    setSizes([
      { ml: 30, label: "30 ml", price: 10499.99, sale_price: null },
      { ml: 60, label: "60 ml", price: 14499.99, sale_price: null },
      { ml: 100, label: "100 ml", price: 17999.99, sale_price: null },
    ]);

  // ── Oferta (toggle que revela el precio de oferta) ───────────────────────
  const [onSale, setOnSale] = useState(form.sale_price != null);
  const saleStash = useRef<number | null>(form.sale_price ?? null);
  function toggleSale(v: boolean) {
    setOnSale(v);
    if (!v) {
      saleStash.current = form.sale_price ?? null;
      update("sale_price", null);
    } else {
      update("sale_price", saleStash.current ?? null);
    }
  }

  // ── Reconciliar con el producto guardado ─────────────────────────────────
  // Cuando el server refresca el producto (router.refresh() tras guardar u
  // ocultar), `initial` se recalcula. Resincronizamos el formulario para que
  // la SaveBar no quede pegada en "cambios sin guardar". Lo hacemos en render
  // (patrón "firma anterior"), no con un efecto, para evitar renders en cascada.
  const initialSig = JSON.stringify(initial);
  const [syncedSig, setSyncedSig] = useState(initialSig);
  if (initialSig !== syncedSig) {
    setSyncedSig(initialSig);
    setForm(initial);
    setPendingDeletes([]);
    setIsAlt(!!product?.alternativa_a || product?.fragrance_number != null);
    setOnSale(initial.sale_price != null);
  }

  // ── Etiquetas ────────────────────────────────────────────────────────────
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

  // ── Validación amable en cliente (campo exacto, sin Zod crudo) ────────────
  function validate(payload: ProductFormInput): string | null {
    if (payload.name.trim().length < 2) {
      return "Falta el nombre del perfume (al menos 2 letras).";
    }
    if (!hasSizes) {
      // Precio único: tiene que haber un precio.
      if (!payload.price || payload.price <= 0) {
        return "Cargá el precio que ve el cliente.";
      }
      if (onSale && payload.sale_price != null && payload.sale_price >= payload.price) {
        return "El precio de oferta tiene que ser menor que el precio normal.";
      }
    } else {
      // Con tamaños: avisamos la fila a medias en vez de descartarla en silencio.
      for (const s of sizes) {
        const touched = s.ml > 0 || s.price > 0 || !!s.label;
        if (!touched) continue;
        const name = s.label || (s.ml > 0 ? `${s.ml} ml` : "un tamaño");
        if (!s.ml || s.ml <= 0) {
          return `Falta los mililitros del tamaño "${name}".`;
        }
        if (!s.price || s.price <= 0) {
          return `Falta el precio del tamaño ${s.ml} ml.`;
        }
        if (s.sale_price != null && s.sale_price >= s.price) {
          return `La oferta del tamaño ${s.ml} ml tiene que ser menor que su precio.`;
        }
      }
    }
    return null;
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
  function onSave() {
    // Normalización final: filtrar filas vacías y poner etiqueta por defecto.
    const payload: ProductFormInput = {
      ...form,
      sizes: (form.sizes ?? [])
        .filter((s) => s.ml > 0 && s.price > 0)
        .map((s) => ({ ...s, label: s.label || `${s.ml} ml` })),
    };

    const problem = validate(payload);
    if (problem) {
      toast.error("Revisá un dato", { description: problem });
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);
      if (!result.ok) {
        toast.error("No se pudo guardar", { description: result.error });
        return;
      }

      // Recién ahora borramos del Storage las fotos que la dueña sacó.
      if (pendingDeletes.length > 0) {
        try {
          const supabase = createClient();
          await supabase.storage.from("product-images").remove(pendingDeletes);
        } catch (err) {
          console.warn("Storage cleanup failed:", err);
        }
        setPendingDeletes([]);
      }

      toast.success(isEdit ? "Cambios guardados" : "Perfume creado");
      if (!isEdit && "id" in result && result.id) {
        router.push(`/admin/productos/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  // ── Descartar cambios ────────────────────────────────────────────────────
  async function onDiscard() {
    const ok = await confirm({
      title: "¿Descartar los cambios?",
      description:
        "Vas a perder lo que editaste desde la última vez que guardaste. Las fotos que subiste quedan en su lugar.",
      confirmLabel: "Sí, descartar",
      cancelLabel: "Seguir editando",
      tone: "danger",
      icon: "RotateCcw",
    });
    if (!ok) return;
    setForm(initial);
    setPendingDeletes([]);
    setIsAlt(!!product?.alternativa_a || product?.fragrance_number != null);
    setOnSale(initial.sale_price != null);
    toast.success("Volvimos a la última versión guardada");
  }

  // ── Eliminar / ocultar ───────────────────────────────────────────────────
  function onDelete() {
    if (!isEdit) return;
    startTransition(async () => {
      // 1) Ofrecemos primero la opción segura: ocultar.
      const wantsDelete = await confirm({
        title: `¿Eliminar "${product.name}"?`,
        description: (
          <span>
            Se borra para siempre: desaparece del catálogo y de la tienda, junto
            con sus fotos. <strong>No se puede deshacer.</strong>
            <br />
            <br />
            Si sólo querés sacarlo de la tienda por un tiempo, mejor{" "}
            <strong>ocultalo</strong> con el botón de abajo y queda guardado.
          </span>
        ),
        confirmLabel: "Eliminar para siempre",
        cancelLabel: "Mejor no",
        tone: "danger",
      });
      if (!wantsDelete) return;

      const result = await deleteProduct(product.id);
      if (!result.ok) {
        toast.error("No se pudo eliminar", { description: result.error });
        return;
      }
      toast.success("Producto eliminado");
      router.push("/admin/productos");
    });
  }

  function onHide() {
    if (!isEdit) return;
    startTransition(async () => {
      const result = await toggleProductActive(product.id, false);
      if (!result.ok) {
        toast.error("No se pudo ocultar", { description: result.error });
        return;
      }
      // No tocamos el form local: router.refresh() trae active=false del server
      // y la reconciliación lo refleja (evita un "cambios sin guardar" fantasma).
      toast.success("Listo, ya no aparece en la tienda", {
        description: "Lo podés volver a mostrar cuando quieras.",
      });
      router.refresh();
    });
  }

  // ── Aviso al salir si quedan cambios sin guardar ─────────────────────────
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // ── Datos para la tarjeta "Así se verá" ──────────────────────────────────
  const heroPath = form.images[0]?.path ?? null;
  const heroUrl = heroPath ? publicUrl(heroPath) : null;
  const previewFrom = hasSizes ? minSizePrice(sizes) : null;
  const previewPrice = form.price;
  const previewSale = onSale ? form.sale_price : null;

  return (
    <>
      {/* Evitamos el submit accidental con Enter: el guardado es siempre por botón. */}
      <form onSubmit={(e) => e.preventDefault()}>
        <AdminPage className="pb-28">
          <PageHeader
            eyebrow={
              <Link
                href="/admin/productos"
                className="inline-flex items-center gap-1.5 text-mute transition-colors hover:text-navy-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a productos
              </Link>
            }
            title={
              isEdit ? form.name || "Editar perfume" : "Cargar un perfume nuevo"
            }
            subtitle={
              isEdit
                ? "Editá los datos y tocá Guardar cuando termines."
                : "Completá lo básico y guardá. Después podés agregar fotos y tamaños."
            }
            actions={
              isEdit && (
                <Button type="button" variant="ghost" size="sm" asChild>
                  <Link href={`/productos/${product.slug}`} target="_blank">
                    <Eye className="h-3.5 w-3.5" />
                    Ver en la tienda
                  </Link>
                </Button>
              )
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Columna principal */}
            <div className="space-y-6 lg:col-span-2">
              {/* ── Lo básico ────────────────────────────────────────────── */}
              <SectionCard
                title="Lo básico"
                description="El nombre es lo único obligatorio para empezar."
                icon="Sparkles"
              >
                <div className="space-y-5">
                  <Field
                    label="Nombre del perfume"
                    required
                    hint="Tal cual querés que lo vea el cliente."
                  >
                    <Input
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      onKeyDown={preventEnterSubmit}
                      placeholder="Ej: Perfume Afrodisíaco para mujer"
                    />
                  </Field>
                  <Field
                    label="Frase corta"
                    hint="Aparece debajo del nombre en los listados. Opcional."
                  >
                    <Textarea
                      value={form.short_description ?? ""}
                      onChange={(e) =>
                        update("short_description", e.target.value)
                      }
                      rows={2}
                      placeholder="Floral, dulce, ideal para el día."
                    />
                  </Field>
                  <Field
                    label="Descripción completa"
                    hint="Notas, características, modo de uso… lo que quieras contar. Opcional."
                  >
                    <Textarea
                      value={form.description ?? ""}
                      onChange={(e) => update("description", e.target.value)}
                      rows={6}
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* ── Fotos ────────────────────────────────────────────────── */}
              <SectionCard
                title="Fotos"
                description="Subí hasta 6. La primera es la que se muestra en la tienda."
                icon="Sparkles"
              >
                <ImageUploader
                  value={form.images}
                  onChange={(v) => update("images", v)}
                  folder={form.code || "general"}
                  onQueueDelete={(path) =>
                    setPendingDeletes((prev) =>
                      prev.includes(path) ? prev : [...prev, path],
                    )
                  }
                />
              </SectionCard>

              {/* ── Precio ───────────────────────────────────────────────── */}
              <SectionCard
                title="Precio"
                description={
                  hasSizes
                    ? "Este producto tiene tamaños: el precio se carga en cada tamaño, más abajo."
                    : "Lo que paga el cliente por este perfume."
                }
                icon="Sparkles"
              >
                {hasSizes && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-navy-800">
                    <Layers className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                    <span>
                      Como cargaste tamaños (30 / 60 / 100 ml), el precio de cada
                      uno manda. El precio de acá abajo queda sin usar.
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    "space-y-5 transition-opacity",
                    hasSizes && "pointer-events-none opacity-40",
                  )}
                  aria-disabled={hasSizes}
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Precio que ve el cliente"
                      required={!hasSizes}
                    >
                      <MoneyInput
                        value={form.price}
                        onChange={(n) => update("price", n ?? 0)}
                        allowEmpty={false}
                        placeholder="14.499"
                        disabled={hasSizes}
                      />
                    </Field>
                    <Field
                      label="Precio anterior / tachado"
                      hint="Se muestra cruzado al lado del precio. Opcional."
                    >
                      <MoneyInput
                        value={form.reference_price ?? null}
                        onChange={(n) => update("reference_price", n)}
                        placeholder="Sin precio anterior"
                        disabled={hasSizes}
                      />
                    </Field>
                  </div>

                  {/* Oferta como toggle que revela el precio de oferta */}
                  <div className="rounded-xl border border-line bg-cream-50 p-4">
                    <label className="flex items-center justify-between gap-3">
                      <span>
                        <span className="block text-sm font-medium text-navy-900">
                          En oferta
                        </span>
                        <span className="block text-xs text-mute">
                          Mostramos el descuento con el precio normal tachado.
                        </span>
                      </span>
                      <Switch
                        checked={onSale}
                        onCheckedChange={toggleSale}
                        disabled={hasSizes}
                      />
                    </label>
                    <AnimatePresence initial={false}>
                      {onSale && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4">
                            <Field
                              label="Precio de oferta"
                              hint="Tiene que ser menor que el precio normal."
                            >
                              <MoneyInput
                                value={form.sale_price ?? null}
                                onChange={(n) => update("sale_price", n)}
                                placeholder="9.999"
                                disabled={hasSizes}
                              />
                            </Field>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Field
                    label="Texto de promoción"
                    hint="Cartelito extra. Ej: “Llevá 2 y pagá menos”. Opcional."
                  >
                    <Input
                      value={form.promotion ?? ""}
                      onChange={(e) => update("promotion", e.target.value)}
                      onKeyDown={preventEnterSubmit}
                      placeholder="Llevá 2 a $X cada uno…"
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* ── Tamaños ──────────────────────────────────────────────── */}
              <SectionCard
                title="Tamaños"
                description="Si el perfume viene en varios tamaños, cargalos acá y el cliente elige. Si no, dejalo vacío."
                icon="Package"
                action={
                  !hasSizes && (
                    <button
                      type="button"
                      onClick={applyPreset}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 text-xs font-medium text-navy-800 transition-all hover:bg-sky-100 active:scale-95"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Cargar 30 · 60 · 100
                    </button>
                  )
                }
              >
                {hasSizes ? (
                  <div className="space-y-3">
                    {/* Encabezados visibles también en mobile, por fila */}
                    {sizes.map((s, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="rounded-2xl border border-line bg-cream-50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-navy-700">
                            Tamaño {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSize(i)}
                            aria-label="Quitar tamaño"
                            className="grid h-9 w-9 place-items-center rounded-lg text-mute transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <MiniField label="Mililitros">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={s.ml || ""}
                              placeholder="60"
                              onKeyDown={preventEnterSubmit}
                              onChange={(e) => {
                                const ml = parseInt(e.target.value) || 0;
                                const auto =
                                  !s.label || s.label === `${s.ml} ml`;
                                updateSize(i, {
                                  ml,
                                  ...(auto
                                    ? { label: ml ? `${ml} ml` : "" }
                                    : {}),
                                });
                              }}
                            />
                          </MiniField>
                          <MiniField label="Nombre">
                            <Input
                              value={s.label}
                              placeholder="60 ml"
                              onKeyDown={preventEnterSubmit}
                              onChange={(e) =>
                                updateSize(i, { label: e.target.value })
                              }
                            />
                          </MiniField>
                          <MiniField label="Precio">
                            <MoneyInput
                              value={s.price || null}
                              onChange={(n) =>
                                updateSize(i, { price: n ?? 0 })
                              }
                              placeholder="14.499"
                            />
                          </MiniField>
                          <MiniField label="Oferta">
                            <MoneyInput
                              value={s.sale_price ?? null}
                              onChange={(n) =>
                                updateSize(i, { sale_price: n })
                              }
                              placeholder="Sin oferta"
                            />
                          </MiniField>
                        </div>
                      </motion.div>
                    ))}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={addSize}
                        className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-navy-700 transition-colors hover:bg-cream-100 hover:text-navy-900"
                      >
                        <Plus className="h-4 w-4" /> Agregar otro tamaño
                      </button>
                      <p className="text-sm">
                        <span className="text-mute">En la tienda: </span>
                        <span className="font-display text-navy-900">
                          desde {formatPrice(minSizePrice(sizes))}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-3">
                    <p className="text-sm text-mute">
                      Por ahora este perfume tiene un precio único. Agregá
                      tamaños sólo si querés ofrecer varias medidas.
                    </p>
                    <button
                      type="button"
                      onClick={addSize}
                      className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-line bg-pearl px-4 text-sm font-medium text-navy-700 transition-colors hover:bg-cream-100"
                    >
                      <Plus className="h-4 w-4" /> Agregar un tamaño
                    </button>
                  </div>
                )}
              </SectionCard>

              {/* ── Alternativa olfativa ─────────────────────────────────── */}
              <SectionCard
                title="¿Es una alternativa?"
                description="Activalo si imita a un perfume de marca conocida."
                icon="Sparkles"
                action={
                  <Switch checked={isAlt} onCheckedChange={toggleAlt} />
                }
              >
                <AnimatePresence initial={false} mode="wait">
                  {isAlt ? (
                    <motion.div
                      key="alt-on"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5">
                        <div className="grid grid-cols-[110px_1fr] gap-4">
                          <MiniField label="Número">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={form.fragrance_number ?? ""}
                              placeholder="62"
                              onKeyDown={preventEnterSubmit}
                              onChange={(e) =>
                                update(
                                  "fragrance_number",
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                )
                              }
                            />
                          </MiniField>
                          <MiniField label="Marca o casa">
                            <Input
                              value={form.alternativa_marca ?? ""}
                              placeholder="Kenzo"
                              onKeyDown={preventEnterSubmit}
                              onChange={(e) =>
                                update(
                                  "alternativa_marca",
                                  e.target.value || null,
                                )
                              }
                            />
                          </MiniField>
                        </div>
                        <Field label="Perfume original que imita">
                          <Input
                            value={form.alternativa_a ?? ""}
                            placeholder="Flower"
                            onKeyDown={preventEnterSubmit}
                            onChange={(e) =>
                              update("alternativa_a", e.target.value || null)
                            }
                          />
                        </Field>
                        <div>
                          <p className="mb-2 text-xs text-mute">
                            En la tienda se va a ver así:
                          </p>
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs text-navy-800">
                            <Sparkles className="h-3 w-3 text-sky-500" />
                            Alternativa a:{" "}
                            <span className="font-medium">
                              {form.alternativa_a || "Perfume"}
                              {form.alternativa_marca
                                ? ` de ${form.alternativa_marca}`
                                : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="alt-off"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-mute"
                    >
                      Apagado. Activalo si este perfume es una alternativa a uno
                      de marca y querés mostrarlo así.
                    </motion.p>
                  )}
                </AnimatePresence>
              </SectionCard>

              {/* ── Opciones avanzadas ───────────────────────────────────── */}
              <div className="rounded-xl border border-line bg-card shadow-whisper">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left md:px-6"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream-100 text-navy">
                      <Settings2 className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block font-display text-xl text-navy-900">
                        Opciones avanzadas
                      </span>
                      <span className="block text-xs text-mute">
                        Código, dirección web y datos internos. Casi nunca hace
                        falta tocarlos.
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-mute transition-transform",
                      showAdvanced && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5 border-t border-line px-5 py-5 md:px-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <Field
                            label="Código interno"
                            hint="Para tu control. También organiza las fotos."
                          >
                            <Input
                              value={form.code ?? ""}
                              onChange={(e) => update("code", e.target.value)}
                              onKeyDown={preventEnterSubmit}
                              placeholder="01536044"
                            />
                          </Field>
                          <Field
                            label="Sección del catálogo"
                            hint="Referencia del catálogo impreso. Opcional."
                          >
                            <Input
                              value={form.section ?? ""}
                              onChange={(e) =>
                                update("section", e.target.value)
                              }
                              onKeyDown={preventEnterSubmit}
                              placeholder="Páginas 002-003"
                            />
                          </Field>
                        </div>
                        <Field
                          label="Dirección web (se genera sola)"
                          hint="Es el final del link en la tienda. Si la dejás vacía, la armamos con el nombre."
                        >
                          <Input
                            value={form.slug ?? ""}
                            onChange={(e) => update("slug", e.target.value)}
                            onKeyDown={preventEnterSubmit}
                            placeholder={effectiveSlug}
                          />
                          <p className="mt-1.5 text-xs text-mute">
                            Quedaría:{" "}
                            <span className="font-mono text-navy-700">
                              /productos/{effectiveSlug}
                            </span>
                          </p>
                        </Field>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Zona de eliminar (sólo edición) ──────────────────────── */}
              {isEdit && (
                <SectionCard
                  title="Quitar este perfume"
                  description="Cuidado: eliminar es para siempre. Ocultar es seguro y reversible."
                  icon="XCircle"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {form.active && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onHide}
                        disabled={pending}
                        className="flex-1"
                      >
                        <EyeOff className="h-4 w-4" />
                        Ocultar de la tienda
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onDelete}
                      disabled={pending}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar para siempre
                    </Button>
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Columna lateral */}
            <aside className="space-y-6">
              {/* ── Así se verá ──────────────────────────────────────────── */}
              <SectionCard
                title="Así se verá"
                description="Una idea de cómo aparece en la tienda."
                icon="Sparkles"
              >
                <div className="overflow-hidden rounded-2xl border border-line bg-pearl shadow-soft">
                  <div className="relative aspect-square bg-cream-50">
                    {heroUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroUrl}
                        alt={form.name || "Vista previa"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-mute-soft">
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-xs">Sin foto todavía</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    {isAlt && form.alternativa_a && (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] text-navy-800">
                        <Sparkles className="h-3 w-3 text-sky-500" />
                        Alternativa a: {form.alternativa_a}
                        {form.alternativa_marca
                          ? ` de ${form.alternativa_marca}`
                          : ""}
                      </span>
                    )}
                    <p className="font-display text-lg leading-tight text-navy-900">
                      {form.name || "Nombre del perfume"}
                    </p>
                    {previewFrom != null ? (
                      <p className="text-sm text-navy-900">
                        <span className="text-mute">desde </span>
                        <span className="num-display">
                          {formatPrice(previewFrom)}
                        </span>
                      </p>
                    ) : previewSale != null && previewSale < previewPrice ? (
                      <p className="flex items-baseline gap-2">
                        <span className="num-display text-base text-navy-900">
                          {formatPrice(previewSale)}
                        </span>
                        <span className="text-xs text-mute line-through">
                          {formatPrice(previewPrice)}
                        </span>
                      </p>
                    ) : (
                      <p className="num-display text-base text-navy-900">
                        {previewPrice > 0 ? formatPrice(previewPrice) : "—"}
                      </p>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* ── Estado ───────────────────────────────────────────────── */}
              <SectionCard title="Estado" icon="Sparkles">
                <div className="space-y-1">
                  <ToggleRow
                    label="Visible en la tienda"
                    hint="Si lo apagás, deja de aparecer pero no se borra."
                    checked={form.active}
                    onChange={(v) => update("active", v)}
                  />
                  <ToggleRow
                    label="Destacado"
                    hint="Aparece resaltado en la página principal."
                    checked={form.featured}
                    onChange={(v) => update("featured", v)}
                  />
                  <ToggleRow
                    label="Marcar como nuevo"
                    hint="Le pone la etiqueta de “Nuevo”."
                    checked={form.is_new}
                    onChange={(v) => update("is_new", v)}
                  />
                  <div className="my-2 h-px bg-line" />
                  <ToggleRow
                    label="Llevar stock"
                    hint="Activá si querés controlar cuántas unidades quedan."
                    checked={form.track_stock}
                    onChange={(v) => update("track_stock", v)}
                  />
                  <AnimatePresence initial={false}>
                    {form.track_stock && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <Field label="Unidades disponibles">
                            <Input
                              type="number"
                              inputMode="numeric"
                              value={form.stock}
                              onKeyDown={preventEnterSubmit}
                              onChange={(e) =>
                                update("stock", parseInt(e.target.value) || 0)
                              }
                            />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SectionCard>

              {/* ── Categoría y etiquetas ────────────────────────────────── */}
              <SectionCard title="Organización" icon="Sparkles">
                <div className="space-y-5">
                  <Field label="Categoría">
                    <Select
                      value={form.category_id ?? ""}
                      onValueChange={(v) => update("category_id", v || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Elegí una…" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field
                    label="Etiquetas"
                    hint="Palabras para encontrarlo. Escribí y apretá Enter."
                  >
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="hombre, dulce, verano…"
                    />
                    {form.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => removeTag(t)}
                            className="group inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-xs text-navy-700 transition-colors hover:bg-blush-100"
                          >
                            {t}
                            <X className="h-3 w-3 text-mute group-hover:text-destructive" />
                          </button>
                        ))}
                      </div>
                    )}
                  </Field>
                </div>
              </SectionCard>
            </aside>
          </div>
        </AdminPage>
      </form>

      {/* Barra pegajosa de guardado. En "nuevo" siempre está disponible. */}
      <SaveBar
        visible={dirty || !isEdit}
        saving={pending}
        onSave={onSave}
        onDiscard={isEdit && dirty ? onDiscard : undefined}
        message={
          isEdit
            ? "Tenés cambios sin guardar"
            : "Cuando termines, guardá el perfume"
        }
        saveLabel={isEdit ? "Guardar cambios" : "Crear perfume"}
      />
    </>
  );
}

/* ── Helpers de UI locales (sentence-case, sin micro-labels en MAYÚSCULA) ── */

function preventEnterSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "Enter") e.preventDefault();
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-navy-900">
        {label}
        {required && <span className="text-blush-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-navy-700">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        {hint && <span className="block text-xs text-mute">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
