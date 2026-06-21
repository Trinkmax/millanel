import type { Tone } from "@/lib/admin/labels";

/* Tono semántico → clases de marca. Centralizado para que chips, barras
   y vacíos hablen el mismo idioma visual. */

export const TONE_CHIP: Record<Tone, string> = {
  neutral: "bg-cream-100 text-navy-700 border-line",
  info: "bg-sky-100 text-navy-800 border-sky-200",
  warn: "bg-[#FBEED1] text-[#876310] border-[#EAD9A8]",
  success: "bg-[#E2EFE0] text-[#3F6B3F] border-[#C7E0C2]",
  danger: "bg-[#FBE0E0] text-[#922C2C] border-[#F0C4C4]",
};

export const TONE_SOFT: Record<Tone, string> = {
  neutral: "bg-cream-100 text-navy-700",
  info: "bg-sky-100 text-navy-800",
  warn: "bg-champagne-50 text-champagne-400",
  success: "bg-[#E2EFE0] text-[#3F6B3F]",
  danger: "bg-blush-50 text-[#922C2C]",
};

export const TONE_DOT: Record<Tone, string> = {
  neutral: "bg-mute",
  info: "bg-navy-400",
  warn: "bg-champagne-400",
  success: "bg-[#5a8a5a]",
  danger: "bg-destructive",
};
