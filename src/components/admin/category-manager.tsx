"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { upsertCategory, deleteCategory } from "@/lib/actions/admin";
import { friendlyError } from "@/lib/admin/errors";
import { useConfirm, EmptyState } from "@/components/admin/ui";
import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { CategoryCard } from "./categories/category-card";
import { NewCategoryCard } from "./categories/new-category-card";
import {
  type CategoryDraft,
  toDraft,
  toInput,
  isDirty,
} from "./categories/types";

/* Orquestador de la pantalla de Categorías (client).
   - Lista ordenada por sort_order con flechas ↑/↓ que recalculan el orden en
     pasos de 10 y guardan SOLO las categorías que cambiaron de posición.
   - Edición en línea por fila con barra propia de "cambios sin guardar".
   - Buscador local para saltar entre las 16.
   - Crear, eliminar (con alternativa segura "ocultar") y reordenar, todo con
     feedback real {ok,error}. */

interface CategoryManagerProps {
  initial: Category[];
}

/** Paso entre órdenes. Deja aire para insertar sin renumerar todo. */
const STEP = 10;

export function CategoryManager({ initial }: CategoryManagerProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [, startTransition] = useTransition();

  // Estado editado en pantalla.
  const [drafts, setDrafts] = useState<CategoryDraft[]>(() =>
    [...initial]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toDraft),
  );
  // Copia "original" (lo último guardado) para detectar cambios por fila.
  const [saved, setSaved] = useState<CategoryDraft[]>(() =>
    [...initial]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(toDraft),
  );

  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Mapa id → original, para comparar sin depender del orden.
  const savedById = useMemo(() => {
    const m = new Map<string, CategoryDraft>();
    for (const d of saved) if (d.id) m.set(d.id, d);
    return m;
  }, [saved]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drafts;
    return drafts.filter((d) => d.name.toLowerCase().includes(q));
  }, [drafts, query]);

  const visibleCount = drafts.filter((d) => d.active).length;
  const nextSortOrder =
    drafts.length === 0
      ? STEP
      : Math.max(...drafts.map((d) => d.sort_order)) + STEP;

  function patchDraft(id: string, patch: Partial<CategoryDraft>) {
    setDrafts((arr) =>
      arr.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  }

  function discardDraft(id: string) {
    const original = savedById.get(id);
    if (!original) return;
    setDrafts((arr) => arr.map((d) => (d.id === id ? { ...original } : d)));
  }

  /* Guardar una categoría existente. */
  function saveDraft(id: string) {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;
    if (draft.name.trim().length < 2) {
      toast.error("Poné un nombre de al menos 2 letras.");
      return;
    }
    setSavingId(id);
    startTransition(async () => {
      try {
        const r = await upsertCategory(toInput(draft), id);
        if (!r.ok) {
          toast.error(r.error ?? "No pudimos guardar la categoría.");
          return;
        }
        // El estado guardado pasa a ser el actual (con slug recalculado).
        const persisted = toInput(draft);
        const newSaved: CategoryDraft = {
          ...draft,
          slug: persisted.slug ?? draft.slug,
          description: persisted.description ?? "",
          image_path: persisted.image_path ?? null,
        };
        setSaved((arr) =>
          arr.map((d) => (d.id === id ? newSaved : d)),
        );
        setDrafts((arr) =>
          arr.map((d) => (d.id === id ? newSaved : d)),
        );
        toast.success(`"${draft.name.trim()}" guardada.`);
        router.refresh();
      } catch (e) {
        toast.error(friendlyError(e));
      } finally {
        setSavingId(null);
      }
    });
  }

  /* Crear una categoría nueva (card unificada). */
  function createDraft(draft: CategoryDraft) {
    setSavingId("__new__");
    startTransition(async () => {
      try {
        const r = await upsertCategory(toInput(draft));
        if (!r.ok || !r.id) {
          toast.error(r.error ?? "No pudimos crear la categoría.");
          return;
        }
        const created: CategoryDraft = {
          ...draft,
          id: r.id,
          name: draft.name.trim(),
          description: draft.description.trim(),
          image_path: draft.image_path || null,
        };
        setDrafts((arr) => [...arr, created]);
        setSaved((arr) => [...arr, created]);
        toast.success(`"${created.name}" creada.`);
        router.refresh();
      } catch (e) {
        toast.error(friendlyError(e));
      } finally {
        setSavingId(null);
      }
    });
  }

  /* Eliminar con confirmación y alternativa segura "ocultar en su lugar". */
  async function handleDelete(id: string) {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    const choice = await confirm({
      title: `¿Eliminar "${draft.name.trim()}"?`,
      description:
        "Esta sección puede tener productos asociados. Eliminarla es definitivo. Si solo querés sacarla del sitio por ahora, mejor ocultala: la podés volver a mostrar cuando quieras.",
      confirmLabel: "Eliminar para siempre",
      cancelLabel: "Mejor, ocultarla",
      tone: "danger",
      icon: "Trash2",
    });

    if (choice) {
      // Confirmó eliminar.
      setSavingId(id);
      startTransition(async () => {
        try {
          const r = await deleteCategory(id);
          if (!r.ok) {
            toast.error(r.error);
            return;
          }
          setDrafts((arr) => arr.filter((d) => d.id !== id));
          setSaved((arr) => arr.filter((d) => d.id !== id));
          toast.success("Categoría eliminada.");
          router.refresh();
        } catch (e) {
          toast.error(friendlyError(e));
        } finally {
          setSavingId(null);
        }
      });
      return;
    }

    // Eligió la alternativa segura: ocultar (active=false), si estaba visible.
    if (draft.active) {
      setSavingId(id);
      startTransition(async () => {
        try {
          const hidden = { ...draft, active: false };
          const r = await upsertCategory(toInput(hidden), id);
          if (!r.ok) {
            toast.error(r.error ?? "No pudimos ocultar la categoría.");
            return;
          }
          setDrafts((arr) =>
            arr.map((d) => (d.id === id ? hidden : d)),
          );
          setSaved((arr) =>
            arr.map((d) => (d.id === id ? hidden : d)),
          );
          toast.success("Listo, la ocultamos. Ya no se ve en la tienda.");
          router.refresh();
        } catch (e) {
          toast.error(friendlyError(e));
        } finally {
          setSavingId(null);
        }
      });
    }
  }

  /* Reordenar: mueve la fila id en `dir` posiciones dentro del orden global,
     recalcula sort_order en pasos y guarda SOLO las categorías afectadas. */
  function move(id: string, dir: -1 | 1) {
    const prevDrafts = drafts; // orden previo, por si hay que revertir
    const ordered = [...drafts]; // ya está por sort_order
    const from = ordered.findIndex((d) => d.id === id);
    const to = from + dir;
    if (from === -1 || to < 0 || to >= ordered.length) return;

    // Reordeno el arreglo.
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);

    // Recalculo sort_order en pasos limpios (10, 20, 30, …).
    const renumbered = ordered.map((d, i) => ({
      ...d,
      sort_order: (i + 1) * STEP,
    }));

    // Sólo las que cambiaron de número se guardan.
    const changed = renumbered.filter((d) => {
      const prev = drafts.find((x) => x.id === d.id);
      return prev && prev.sort_order !== d.sort_order && d.id;
    });

    // Update optimista de la UI (orden + números).
    setDrafts(renumbered);

    if (changed.length === 0) return;

    setReordering(true);
    startTransition(async () => {
      try {
        const results = await Promise.all(
          changed.map((d) => {
            // Persisto SOLO el cambio de orden: parto del último estado guardado
            // de esa fila (no del editado), así reordenar nunca confirma sin
            // querer un nombre/descripción/imagen que todavía no se guardó.
            const base = (d.id && savedById.get(d.id)) || d;
            return upsertCategory(
              toInput({ ...base, sort_order: d.sort_order }),
              d.id,
            );
          }),
        );
        const failed = results.find((r) => !r.ok);
        if (failed && !failed.ok) {
          toast.error(failed.error ?? "No pudimos guardar el nuevo orden.");
          // Revierto al orden previo (el que había antes de mover).
          setDrafts(prevDrafts);
          router.refresh();
          return;
        }
        // El orden nuevo queda como "guardado" para esas filas.
        setSaved((arr) => {
          const map = new Map(arr.map((d) => [d.id, d]));
          for (const d of renumbered) {
            if (d.id && map.has(d.id)) {
              map.set(d.id, { ...map.get(d.id)!, sort_order: d.sort_order });
            }
          }
          return [...map.values()].sort((a, b) => a.sort_order - b.sort_order);
        });
        toast.success("Orden actualizado.");
        router.refresh();
      } catch (e) {
        toast.error(friendlyError(e));
        router.refresh();
      } finally {
        setReordering(false);
      }
    });
  }

  const searching = query.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Buscador local (filtra por nombre) — sólo si hay varias */}
      {drafts.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar una sección por nombre…"
            aria-label="Buscar una sección por nombre"
            className="flex h-11 w-full rounded-[8px] border border-line bg-pearl py-2 pl-10 pr-9 text-base text-foreground transition-colors placeholder:text-mute-soft focus-visible:border-navy-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-100 md:text-[15px]"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Borrar búsqueda"
              className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-cream-100 hover:text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Resumen corto */}
      {!searching && drafts.length > 0 && (
        <p className="text-sm text-mute">
          {visibleCount === drafts.length
            ? "Todas las secciones están visibles en la tienda."
            : `${visibleCount} de ${drafts.length} visibles en la tienda · El orden de arriba abajo es el que ve la clienta.`}
        </p>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        searching ? (
          <div className="rounded-2xl border border-line bg-card">
            <EmptyState
              icon="Search"
              title="No encontramos esa sección"
              description={`No hay ninguna que se llame "${query.trim()}". Probá con otro nombre.`}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-card">
            <EmptyState
              icon="Tags"
              title="Todavía no hay secciones"
              description="Las secciones agrupan tus productos y aparecen en el menú de la tienda. Creá la primera abajo."
            />
          </div>
        )
      ) : (
        <div className={cn("space-y-3", reordering && "opacity-95")}>
          {filtered.map((draft) => {
            // Índice y total dentro del ORDEN GLOBAL (no del filtrado), para que
            // las flechas muevan respecto a la lista real.
            const globalIndex = drafts.findIndex((d) => d.id === draft.id);
            const original = draft.id ? savedById.get(draft.id) : undefined;
            const dirty = original ? isDirty(draft, original) : true;
            return (
              <CategoryCard
                key={draft.id}
                draft={draft}
                index={globalIndex}
                total={drafts.length}
                dirty={dirty}
                saving={savingId === draft.id}
                reordering={reordering}
                onChange={(patch) => patchDraft(draft.id!, patch)}
                onSave={() => saveDraft(draft.id!)}
                onDiscard={() => discardDraft(draft.id!)}
                onDelete={() => handleDelete(draft.id!)}
                onMoveUp={() => move(draft.id!, -1)}
                onMoveDown={() => move(draft.id!, 1)}
              />
            );
          })}
        </div>
      )}

      {/* Crear nueva (sólo cuando no estás filtrando, para no confundir) */}
      {!searching && (
        <NewCategoryCard
          nextSortOrder={nextSortOrder}
          saving={savingId === "__new__"}
          onCreate={createDraft}
        />
      )}
    </div>
  );
}
