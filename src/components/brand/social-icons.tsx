import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function InstagramIcon({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(className)}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn(className)}
      {...props}
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.77-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

/**
 * Single-path WhatsApp silhouette — uses currentColor so it
 * inherits the parent text color (e.g. white inside a green button).
 */
export function WhatsAppIcon({ className, size = 16, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn(className)}
      {...props}
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  );
}

/**
 * Full branded WhatsApp logo — green circle background with white
 * phone-bubble glyph inside. Use as a standalone branded mark
 * (e.g. floating button background, contact card highlight).
 */
export function WhatsAppLogo({ className, size = 32, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn(className)}
      {...props}
    >
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path
        fill="#FFFFFF"
        d="M22.553 9.443A9.198 9.198 0 0 0 16.01 6.74c-5.094 0-9.234 4.143-9.236 9.236a9.21 9.21 0 0 0 1.232 4.617L6.7 25.265l4.797-1.258a9.222 9.222 0 0 0 4.412 1.124h.004c5.094 0 9.234-4.144 9.236-9.236a9.16 9.16 0 0 0-2.696-6.452zm-6.542 14.21a7.658 7.658 0 0 1-3.91-1.07l-.281-.166-2.91.763.778-2.836-.182-.292a7.642 7.642 0 0 1-1.172-4.082c.002-4.232 3.448-7.677 7.682-7.677a7.628 7.628 0 0 1 5.432 2.252 7.624 7.624 0 0 1 2.246 5.434c-.002 4.232-3.448 7.678-7.683 7.678zm4.214-5.752c-.231-.116-1.367-.674-1.578-.751-.212-.077-.366-.115-.52.116-.155.231-.598.752-.733.906-.135.155-.27.174-.501.058-.232-.116-.978-.36-1.862-1.149-.687-.614-1.151-1.371-1.286-1.603-.135-.232-.014-.357.101-.473.104-.103.232-.27.347-.405.116-.135.155-.232.232-.386.077-.155.039-.29-.02-.405-.057-.116-.52-1.255-.713-1.717-.188-.451-.378-.39-.52-.397-.135-.007-.289-.008-.443-.008a.852.852 0 0 0-.617.29c-.212.231-.81.79-.81 1.93s.83 2.24.945 2.394c.116.155 1.634 2.495 3.96 3.499.553.239.984.381 1.32.488.555.176 1.06.151 1.46.092.445-.067 1.367-.559 1.56-1.099.192-.54.192-1.003.135-1.1-.058-.097-.212-.155-.444-.27z"
      />
    </svg>
  );
}
