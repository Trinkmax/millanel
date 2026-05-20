import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-cream hover:bg-navy-700 active:bg-navy-900 shadow-soft hover:shadow-medium hover:-translate-y-0.5",
        secondary:
          "bg-sky text-navy-900 hover:bg-sky-300 border border-sky-300/40",
        outline:
          "border border-navy text-navy hover:bg-navy hover:text-cream",
        ghost: "text-navy hover:bg-navy/5",
        link: "text-navy underline-offset-[6px] hover:underline px-0",
        accent:
          "bg-blush text-navy-900 hover:bg-blush-300 border border-blush-300/40",
        champagne:
          "bg-champagne text-navy-900 hover:bg-champagne-200 shadow-soft",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#1DAE54] shadow-soft hover:shadow-medium",
      },
      size: {
        sm: "h-9 rounded-[6px] px-3 text-xs",
        md: "h-11 rounded-[8px] px-5 text-sm",
        lg: "h-12 rounded-[10px] px-7 text-sm uppercase tracking-[0.16em]",
        xl: "h-14 rounded-[12px] px-9 text-sm uppercase tracking-[0.2em]",
        icon: "h-10 w-10 rounded-full",
        "icon-sm": "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
