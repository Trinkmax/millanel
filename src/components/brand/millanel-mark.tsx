import { cn } from "@/lib/utils";

interface MillanelMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function MillanelMark({
  className,
  size = 32,
  ...props
}: MillanelMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-navy", className)}
      {...props}
    >
      <g fill="currentColor">
        {/* Six teardrop petals around center */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            d="M50 8 C 60 22, 60 38, 50 50 C 40 38, 40 22, 50 8 Z"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="7.5" />
      </g>
    </svg>
  );
}
