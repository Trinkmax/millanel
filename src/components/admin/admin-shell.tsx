"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { motion } from "motion/react";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  user: { full_name?: string | null; email?: string | null };
  children: React.ReactNode;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/ordenes", label: "Órdenes", icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/envios", label: "Zonas de envío", icon: Truck },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-cream-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-line bg-pearl">
        <div className="px-6 py-6 border-b border-line">
          <MillanelWordmark variant="inline" size="sm" />
        </div>
        <SidebarNav pathname={pathname} />
        <SidebarFooter user={user} />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-line bg-pearl">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Menú"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-cream-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <MillanelWordmark variant="inline" size="sm" />
        <div className="w-10" />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-50 bg-navy-900/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="h-full w-72 max-w-[85vw] bg-pearl shadow-deep flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-6 border-b border-line flex items-center justify-between">
              <MillanelWordmark variant="inline" size="sm" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar"
                className="rounded-full p-2 text-mute hover:bg-cream-100 hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SidebarFooter user={user} />
          </motion.aside>
        </motion.div>
      )}

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 px-3 py-6 space-y-0.5">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-navy text-cream"
                : "text-navy-700 hover:bg-cream-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-4 pt-4 border-t border-line">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-mute hover:bg-cream-100 hover:text-navy transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver sitio público
        </Link>
      </div>
    </nav>
  );
}

function SidebarFooter({ user }: { user: AdminShellProps["user"] }) {
  return (
    <div className="px-3 pb-4 pt-2 border-t border-line">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {(user.full_name ?? user.email ?? "?").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-navy-900 truncate">
            {user.full_name ?? "Administrador"}
          </p>
          <p className="text-xs text-mute truncate">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Salir"
            className="rounded-full p-2 text-mute hover:bg-cream-100 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
