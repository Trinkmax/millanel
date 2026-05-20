"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FormField } from "@/components/ui/form-field";
import { upsertCategory, deleteCategory } from "@/lib/actions/admin";
import type { Category } from "@/lib/supabase/types";
import { toast } from "sonner";

interface CategoryManagerProps {
  initial: Category[];
}

interface Draft {
  id?: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  featured: boolean;
  active: boolean;
}

const empty = (sortOrder = 999): Draft => ({
  name: "",
  slug: "",
  description: "",
  sort_order: sortOrder,
  featured: false,
  active: true,
});

export function CategoryManager({ initial }: CategoryManagerProps) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>(
    initial.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      sort_order: c.sort_order,
      featured: c.featured,
      active: c.active,
    })),
  );
  const [newDraft, setNewDraft] = useState<Draft>(empty());
  const [, startTransition] = useTransition();

  function update(idx: number, patch: Partial<Draft>) {
    setDrafts((arr) => arr.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function save(idx: number) {
    const d = drafts[idx];
    startTransition(async () => {
      const r = await upsertCategory(d, d.id);
      if (!r.ok) {
        toast.error(r.error);
      } else {
        toast.success(`"${d.name}" guardada`);
        router.refresh();
      }
    });
  }

  function remove(idx: number) {
    const d = drafts[idx];
    if (!d.id) {
      setDrafts((arr) => arr.filter((_, i) => i !== idx));
      return;
    }
    if (!confirm(`¿Eliminar "${d.name}"?`)) return;
    startTransition(async () => {
      const r = await deleteCategory(d.id!);
      if (!r.ok) {
        toast.error(r.error);
      } else {
        setDrafts((arr) => arr.filter((_, i) => i !== idx));
        toast.success("Categoría eliminada");
      }
    });
  }

  function addNew() {
    if (!newDraft.name.trim()) return;
    startTransition(async () => {
      const r = await upsertCategory(newDraft);
      if (!r.ok) {
        toast.error(r.error);
      } else {
        toast.success("Categoría creada");
        setNewDraft(empty(drafts.length * 10 + 100));
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft, idx) => (
        <Card key={draft.id ?? `new-${idx}`}>
          <CardContent className="p-5 !pt-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              <div className="lg:col-span-3">
                <FormField label="Nombre">
                  <Input
                    value={draft.name}
                    onChange={(e) => update(idx, { name: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="lg:col-span-3">
                <FormField label="Slug">
                  <Input
                    value={draft.slug}
                    onChange={(e) => update(idx, { slug: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="lg:col-span-4">
                <FormField label="Descripción">
                  <Textarea
                    rows={2}
                    value={draft.description}
                    onChange={(e) => update(idx, { description: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="lg:col-span-1 space-y-3">
                <FormField label="Orden">
                  <Input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) =>
                      update(idx, { sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </FormField>
              </div>
              <div className="lg:col-span-1 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-xs text-mute">
                  Activa
                  <Switch
                    checked={draft.active}
                    onCheckedChange={(v) => update(idx, { active: v })}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-mute">
                  Destacada
                  <Switch
                    checked={draft.featured}
                    onCheckedChange={(v) => update(idx, { featured: v })}
                  />
                </div>
                <div className="flex gap-1 pt-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => remove(idx)}
                    className="!text-destructive hover:!bg-destructive/10"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    onClick={() => save(idx)}
                    aria-label="Guardar"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* New category */}
      <Card className="border-dashed">
        <CardContent className="p-5 !pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-3">
              <FormField label="Nueva categoría">
                <Input
                  value={newDraft.name}
                  onChange={(e) =>
                    setNewDraft({ ...newDraft, name: e.target.value })
                  }
                  placeholder="Ej: Belleza editorial"
                />
              </FormField>
            </div>
            <div className="lg:col-span-3">
              <FormField label="Slug">
                <Input
                  value={newDraft.slug}
                  onChange={(e) =>
                    setNewDraft({ ...newDraft, slug: e.target.value })
                  }
                  placeholder="se genera solo"
                />
              </FormField>
            </div>
            <div className="lg:col-span-4">
              <FormField label="Descripción">
                <Textarea
                  rows={2}
                  value={newDraft.description}
                  onChange={(e) =>
                    setNewDraft({ ...newDraft, description: e.target.value })
                  }
                />
              </FormField>
            </div>
            <div className="lg:col-span-2 flex justify-end pt-6">
              <Button type="button" onClick={addNew}>
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-mute italic flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Las categorías se muestran ordenadas por el campo "Orden".
      </p>
    </div>
  );
}
