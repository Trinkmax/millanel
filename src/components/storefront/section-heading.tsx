import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  link?: { href: string; label: string };
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  link,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-2xl space-y-3",
          align === "center" && "mx-auto",
        )}
      >
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight text-navy-900">
          {title}
        </h2>
        {description && (
          <p className="text-mute text-base md:text-lg max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className="self-start md:self-end text-xs uppercase tracking-[0.2em] text-navy hover:text-navy-700 group flex items-center gap-2 transition-colors"
        >
          {link.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
