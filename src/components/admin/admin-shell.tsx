"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Package,
  Tags,
  Truck,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { MillanelWordmark } from "@/components/brand/millanel-wordmark";
import { signOut } from "@/lib/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfirmProvider } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

interface AdminShellProps {
  user: { full_name?: string | null; email?: string | null };
  /** Pedidos que requieren acción (para el globito del tab "Pedidos"). */
  pendingCount?: number;
  children: React.ReactNode;
}

export function AdminShell({ user, pendingCount = 0, children }: AdminShellProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const primary: NavItem[] = [
    { href: "/admin", label: "Inicio", icon: Home, exact: true },
    {
      href: "/admin/ordenes",
      label: "Pedidos",
      icon: ShoppingBag,
      badge: pendingCount,
    },
    { href: "/admin/productos", label: "Productos", icon: Package },
  ];
  const secondary: NavItem[] = [
    { href: "/admin/categorias", label: "Categorías", icon: Tags },
    { href: "/admin/envios", label: "Envíos", icon: Truck },
    { href: "/admin/ajustes", label: "Ajustes", icon: SlidersHorizontal },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <ConfirmProvider>
      <div className="flex min-h-screen bg-cream-50">
        {/* ── Sidebar (escritorio) ───────────────────────────── */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-pearl lg:flex">
          <div className="border-b border-line px-6 py-6">
            {/* El wordmark ya es un <Link>; le pasamos el destino directo
                (no lo envolvemos en otro <a> → evita el error de hidratación). */}
            <MillanelWordmark variant="inline" size="sm" href="/admin" />
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {primary.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item)} />
            ))}
            <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute-soft">
              Configuración
            </p>
            {secondary.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item)} />
            ))}
            <div className="mt-4 border-t border-line pt-4">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-mute transition-colors hover:bg-cream-100 hover:text-navy"
              >
                <ExternalLink className="h-4 w-4" />
                Ver mi tienda
              </Link>
            </div>
          </nav>
          <UserFooter user={user} />
        </aside>

        {/* ── Barra superior (mobile) ────────────────────────── */}
        <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-center border-b border-line bg-pearl/95 backdrop-blur lg:hidden">
          <MillanelWordmark variant="inline" size="sm" href="/admin" />
        </div>

        {/* ── Contenido ──────────────────────────────────────── */}
        <main className="min-w-0 flex-1 pt-14 pb-[calc(env(safe-area-inset-bottom)+5rem)] lg:pl-64 lg:pt-0 lg:pb-0">
          {children}
        </main>

        {/* ── Barra de pestañas (mobile) ─────────────────────── */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line bg-pearl/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {primary.map((item) => (
            <TabLink key={item.href} item={item} active={isActive(item)} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              secondary.some((s) => pathname.startsWith(s.href))
                ? "text-navy"
                : "text-mute",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Más
          </button>
        </nav>

        {/* ── "Más" (mobile) ─────────────────────────────────── */}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
            <SheetHeader className="px-5">
              <SheetTitle className="text-2xl">Más opciones</SheetTitle>
            </SheetHeader>
            <div className="space-y-1 px-3 py-4">
              {secondary.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-navy-800 hover:bg-cream-100"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-100 text-navy">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                target="_blank"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-navy-800 hover:bg-cream-100"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cream-100 text-navy">
                  <ExternalLink className="h-4 w-4" />
                </span>
                Ver mi tienda
              </Link>
            </div>
            <div className="border-t border-line px-3 py-4">
              <div className="flex items-center gap-3 px-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {(user.full_name ?? user.email ?? "?")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {user.full_name ?? "Cintia"}
                  </p>
                  <p className="truncate text-xs text-mute">{user.email}</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-2 text-xs font-medium text-navy-700 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </form>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </ConfirmProvider>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-navy text-cream" : "text-navy-700 hover:bg-cream-100",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
            active ? "bg-cream text-navy" : "bg-champagne-300 text-navy-900",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
        active ? "text-navy" : "text-mute",
      )}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {item.badge ? (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-champagne-300 px-1 text-[9px] font-bold text-navy-900">
            {item.badge}
          </span>
        ) : null}
      </span>
      {item.label}
      {active && (
        <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-navy" />
      )}
    </Link>
  );
}

function UserFooter({ user }: { user: AdminShellProps["user"] }) {
  return (
    <div className="border-t border-line px-3 py-3">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {(user.full_name ?? user.email ?? "?").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-navy-900">
            {user.full_name ?? "Cintia"}
          </p>
          <p className="truncate text-xs text-mute">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="rounded-full p-2 text-mute transition-colors hover:bg-cream-100 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
