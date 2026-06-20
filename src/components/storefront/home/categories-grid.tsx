"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/storage";

interface CategoriesGridProps {
  categories: Category[];
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 5);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 5);

    // Active = whichever card's CENTER is closest to the viewport center.
    // (Matches the visual perception: the card that "feels" active.)
    const cards = el.querySelectorAll<HTMLElement>("[data-cat-card]");
    const parentRect = el.getBoundingClientRect();
    const parentCenter = parentRect.left + parentRect.width / 2;
    let closest = 0;
    let closestDistance = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs(cardCenter - parentCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByDirection = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-cat-card]");
    if (!card) return;
    const gap = 24;
    el.scrollBy({
      left: (card.offsetWidth + gap) * direction,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Snap-scroll carousel — only horizontal, never vertical */}
      <div
        ref={scrollerRef}
        className={cn(
          "flex gap-4 md:gap-6",
          // Critical: explicit y-clip prevents the browser from defaulting
          // overflow-y to "auto" when overflow-x is set (CSS spec behavior).
          "overflow-x-auto overflow-y-clip",
          "snap-x snap-mandatory",
          // Escape parent's container-page padding so scroller spans full viewport
          "-mx-5 md:-mx-10",
          // Small symmetric padding. Combined with per-card snap-align
          // (start/center/end) this makes:
          //   • Card 1 → pinned to left edge (small left margin, peek right)
          //   • Middle cards → centered (peek both sides)
          //   • Last card → pinned to right edge (peek left, small right margin)
          "px-5 sm:px-8 md:px-10",
          // Vertical breathing room for shadow + entrance animation
          "py-3 pb-10",
          // Hide scrollbar
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Touch: only intercept HORIZONTAL panning on this carousel;
          // vertical swipes pass through to the page scroll naturally.
          "[touch-action:pan-x]",
        )}
      >
        {categories.map((cat, idx) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            index={idx}
            total={categories.length}
            isFirst={idx === 0}
            isLast={idx === categories.length - 1}
          />
        ))}
      </div>

      {/* Footer: numerical counter + progress + active label + mobile arrows */}
      <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-6">
        {/* Counter */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="font-display italic text-3xl md:text-4xl text-navy-900 num-display leading-none">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-mute-soft font-display text-xl leading-none">/</span>
          <span className="font-display italic text-xl text-mute num-display leading-none">
            {String(categories.length).padStart(2, "0")}
          </span>
        </div>

        {/* Active category name */}
        <p className="hidden md:block eyebrow text-navy-700 truncate shrink-0 max-w-[200px]">
          {categories[activeIndex]?.name}
        </p>

        {/* Progress bar */}
        <div className="flex-1 h-px bg-line relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-navy"
            initial={false}
            animate={{
              width: `${((activeIndex + 1) / categories.length) * 100}%`,
            }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          />
        </div>

        {/* Arrows — always visible (both mobile and desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          <ArrowButton
            direction="left"
            disabled={!canPrev}
            onClick={() => scrollByDirection(-1)}
          />
          <ArrowButton
            direction="right"
            disabled={!canNext}
            onClick={() => scrollByDirection(1)}
          />
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
  small,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Anterior" : "Siguiente"}
      className={cn(
        "group grid place-items-center rounded-full border border-line bg-pearl text-navy transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        small ? "h-10 w-10" : "h-11 w-11",
        "hover:border-navy-400 hover:shadow-soft hover:-translate-y-0.5",
        "active:scale-95",
        "disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none",
      )}
    >
      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
}

function CategoryCard({
  category,
  index,
  total,
  isFirst,
  isLast,
}: {
  category: Category;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <motion.article
      data-cat-card
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: Math.min(index * 0.05, 0.35),
      }}
      className={cn(
        "shrink-0",
        // Mobile snap behavior:
        //   • first → pin to left edge (peek of next on right)
        //   • last  → pin to right edge (peek of prev on left)
        //   • middle → center (peek both sides, symmetric)
        isFirst
          ? "snap-start"
          : isLast
            ? "snap-end"
            : "snap-center",
        // Desktop: simpler — always snap to start since 2–3 cards fit at once
        "md:!snap-start",
        // Editorial sizing — smaller card width = bigger neighbour peek.
        // mobile: ~46px peek on each side · sm: ~112px peek · md+: 2–3 cards visible
        "w-[68vw] sm:w-[56vw] md:w-[44%] lg:w-[34%] xl:w-[30%]",
      )}
    >
      <Link
        href={`/categorias/${category.slug}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-400 focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-3xl"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-sky-100 shadow-soft transition-all duration-500 group-hover:shadow-deep">
          {category.image_path ? (
            <>
              <Image
                src={publicUrl(category.image_path, "category-images")!}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 82vw, (max-width: 768px) 58vw, (max-width: 1024px) 44vw, 30vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                priority={index < 3}
              />
              {/* Editorial gradient + tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/20 to-navy-900/5" />
              <div className="paper-grain absolute inset-0 opacity-40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blush-50 to-cream-100 paper-grain" />
          )}

          {/* Top-left: edition number + line */}
          <div className="absolute top-5 left-5 md:top-6 md:left-6 flex items-center gap-3 z-10">
            <span
              className={cn(
                "font-display italic text-2xl md:text-3xl num-display leading-none",
                category.image_path ? "text-cream/90" : "text-navy-900/50",
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <motion.span
              initial={{ width: 24 }}
              whileHover={{ width: 56 }}
              className={cn(
                "h-px w-6 transition-all duration-500",
                category.image_path
                  ? "bg-cream/50 group-hover:w-14 group-hover:bg-cream"
                  : "bg-navy-300 group-hover:w-14 group-hover:bg-navy",
              )}
            />
          </div>

          {/* Top-right: arrow circle */}
          <span
            className={cn(
              "absolute top-5 right-5 md:top-6 md:right-6 z-10 grid h-10 w-10 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              category.image_path
                ? "bg-cream/15 backdrop-blur-md border border-cream/30 text-cream group-hover:bg-cream group-hover:text-navy group-hover:rotate-45 group-hover:border-cream"
                : "bg-navy/10 text-navy group-hover:bg-navy group-hover:text-cream group-hover:rotate-45",
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>

          {/* Bottom content */}
          <div
            className={cn(
              "absolute inset-x-5 md:inset-x-7 bottom-5 md:bottom-7 z-10 space-y-2.5",
              category.image_path ? "text-cream" : "text-navy-900",
            )}
          >
            <p
              className={cn(
                "eyebrow",
                category.image_path ? "!text-cream/70" : "!text-navy-700",
              )}
            >
              Sección {String(index + 1).padStart(2, "0")} de {String(total).padStart(2, "0")}
            </p>
            <h3
              className={cn(
                "font-display text-3xl md:text-4xl lg:text-[40px] xl:text-5xl leading-[0.98] tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1",
                category.image_path
                  ? "text-cream drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
                  : "text-navy-900",
              )}
            >
              {category.name}
            </h3>
            {category.description && (
              <p
                className={cn(
                  "text-sm md:text-[15px] line-clamp-2 leading-snug max-w-md",
                  category.image_path ? "text-cream/85" : "text-navy-900/70",
                )}
              >
                {category.description}
              </p>
            )}
            <div
              className={cn(
                "pt-1.5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] transition-all duration-500",
                category.image_path ? "text-cream" : "text-navy",
              )}
            >
              <span className="link-line">Descubrir</span>
              <ArrowUpRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
