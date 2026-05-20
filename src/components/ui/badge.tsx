import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy text-cream",
        soft: "bg-cream-100 text-navy-700 border border-line",
        sky: "bg-sky text-navy-900",
        blush: "bg-blush text-navy-900",
        champagne: "bg-champagne-100 text-champagne-400 border border-champagne-200",
        outline: "border border-navy text-navy",
        success: "bg-[#E2EFE0] text-[#3F6B3F]",
        warn: "bg-[#FBEED1] text-[#876310]",
        danger: "bg-[#FBE0E0] text-[#922C2C]",
        new: "bg-blush text-navy-900",
        promo: "bg-navy text-cream",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
