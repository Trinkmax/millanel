"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { useSiteInfo } from "@/components/storefront/site-info-provider";

const HIDDEN_PATHS = [
  "/checkout",
  "/orden",
  "/ingreso",
  "/admin",
  "/carrito",
];

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const site = useSiteInfo();
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: 1.2,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
      }}
    >
      <Link
        href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent("Hola Cintia, vengo desde la web de Millanel Frías ✨")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="group relative inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#25D366] shadow-deep hover:shadow-lift active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <WhatsAppIcon
          size={28}
          className="relative text-white transition-transform duration-300 group-hover:scale-110"
        />
        {/* Mobile-only tooltip label that fades after first impression */}
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: [0, 1, 1, 0], x: [10, 0, 0, 10] }}
          transition={{
            delay: 2,
            duration: 5,
            times: [0, 0.1, 0.85, 1],
            ease: "easeInOut",
          }}
          className="hidden md:block absolute right-full mr-3 whitespace-nowrap rounded-full bg-navy-900 px-3.5 py-1.5 text-xs text-cream pointer-events-none"
        >
          ¿Necesitás ayuda? Escribinos.
          <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-navy-900 rotate-45" />
        </motion.span>
      </Link>
    </motion.div>
  );
}
