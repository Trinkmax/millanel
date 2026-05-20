"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { motion } from "motion/react";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface CatalogFiltersProps {
  categories: Category[];
  totalCount: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre: A → Z" },
  { value: "name-desc", label: "Nombre: Z → A" },
];

export function CatalogFilters({ categories, totalCount }: CatalogFiltersProps) {
  return (
    <>
      <DesktopFilters categories={categories} />
      <MobileFilters categories={categories} totalCount={totalCount} />
    </>
  );
}

function useFilterState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const p = new URLSearchParams(params);
    if (value === null || value === "") p.delete(key);
    else p.set(key, value);
    p.delete("page");
    const q = p.toString();
    startTransition(() => {
      router.push(`${pathname}${q ? `?${q}` : ""}`, { scroll: false });
    });
  }

  function toggle(key: string) {
    update(key, params.get(key) ? null : "1");
  }

  return {
    update,
    toggle,
    isPending,
    cat: params.get("cat"),
    q: params.get("q"),
    nuevos: !!params.get("nuevos"),
    destacados: !!params.get("destacados"),
    promo: !!params.get("promo"),
    sort: params.get("sort") ?? "newest",
  };
}

function DesktopFilters({ categories }: { categories: Category[] }) {
  const { update, toggle, cat, nuevos, destacados, promo, sort } = useFilterState();

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
      <div className="space-y-8">
        <FilterBlock title="Ordenar por">
          <Select value={sort} onValueChange={(v) => update("sort", v === "newest" ? null : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterBlock>

        <FilterBlock title="Categorías">
          <CategoryList
            categories={categories}
            value={cat}
            onChange={(v) => update("cat", v)}
          />
        </FilterBlock>

        <FilterBlock title="Selección">
          <ul className="flex flex-col gap-2">
            <FilterCheck label="Productos nuevos" checked={nuevos} onChange={() => toggle("nuevos")} />
            <FilterCheck label="Destacados" checked={destacados} onChange={() => toggle("destacados")} />
            <FilterCheck label="En promoción" checked={promo} onChange={() => toggle("promo")} />
          </ul>
        </FilterBlock>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            update("cat", null);
            update("nuevos", null);
            update("destacados", null);
            update("promo", null);
            update("sort", null);
            update("q", null);
          }}
        >
          <X className="h-3.5 w-3.5" /> Limpiar filtros
        </Button>
      </div>
    </aside>
  );
}

function MobileFilters({
  categories,
  totalCount,
}: {
  categories: Category[];
  totalCount: number;
}) {
  const { update, toggle, cat, nuevos, destacados, promo, sort } = useFilterState();

  return (
    <div className="lg:hidden flex items-center justify-between gap-2 mb-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[88vw] max-w-sm bg-cream-50 flex flex-col gap-0 p-0">
          <SheetHeader className="border-b border-line">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <FilterBlock title="Categorías">
              <CategoryList
                categories={categories}
                value={cat}
                onChange={(v) => update("cat", v)}
              />
            </FilterBlock>
            <FilterBlock title="Selección">
              <ul className="flex flex-col gap-3">
                <FilterCheck label="Productos nuevos" checked={nuevos} onChange={() => toggle("nuevos")} />
                <FilterCheck label="Destacados" checked={destacados} onChange={() => toggle("destacados")} />
                <FilterCheck label="En promoción" checked={promo} onChange={() => toggle("promo")} />
              </ul>
            </FilterBlock>
          </div>
        </SheetContent>
      </Sheet>

      <Select value={sort} onValueChange={(v) => update("sort", v === "newest" ? null : v)}>
        <SelectTrigger className="w-[180px] h-9 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">{title}</p>
      {children}
    </div>
  );
}

function FilterCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <li>
      <Label className="flex items-center gap-2.5 cursor-pointer hover:text-navy-900 transition-colors normal-case tracking-normal !text-sm font-normal text-navy-900">
        <Checkbox checked={checked} onCheckedChange={onChange} />
        <span>{label}</span>
      </Label>
    </li>
  );
}

function CategoryList({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      <li>
        <CategoryItem active={!value} onClick={() => onChange(null)}>
          Todas las categorías
        </CategoryItem>
      </li>
      {categories.map((c) => (
        <li key={c.id}>
          <CategoryItem active={value === c.slug} onClick={() => onChange(c.slug)}>
            {c.name}
          </CategoryItem>
        </li>
      ))}
    </ul>
  );
}

function CategoryItem({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full text-left py-1.5 text-sm transition-colors",
        active ? "text-navy-900 font-medium" : "text-mute hover:text-navy-700",
      )}
    >
      {active && (
        <motion.span
          layoutId="cat-pill"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] bg-navy rounded-full"
        />
      )}
      <span className={cn(active && "pl-3")}>{children}</span>
    </button>
  );
}
