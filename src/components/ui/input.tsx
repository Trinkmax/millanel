import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-[8px] border border-line bg-pearl px-3.5 py-2 text-base md:text-[15px] text-foreground placeholder:text-mute-soft transition-colors duration-200 focus-visible:outline-none focus-visible:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-100 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
