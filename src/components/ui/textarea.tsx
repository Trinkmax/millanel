import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-[8px] border border-line bg-pearl px-3.5 py-2.5 text-base md:text-[15px] text-foreground placeholder:text-mute-soft transition-colors duration-200 focus-visible:outline-none focus-visible:border-navy-400 focus-visible:ring-2 focus-visible:ring-navy-100 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
