"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User, Shield, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const publicNavigation: { name: string; href: string; roles?: string[] }[] = [];

const authNavigation = [
  { name: "Encomiendas", href: "/encomiendas", roles: ["admin", "conserje"] },
  { name: "Mis Encomiendas", href: "/mis-encomiendas", roles: ["residente"] },
  { name: "Notificaciones", href: "/notificaciones", roles: ["admin", "conserje"] },
  { name: "Estadísticas", href: "/estadisticas", roles: ["admin"] },
  { name: "QR Scanner", href: "/qr/scanner", roles: ["admin", "conserje"] },
  { name: "Usuarios", href: "/admin/usuarios", roles: ["admin"] },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filtrar navegación según rol
  const navigation = isAuthenticated
    ? authNavigation.filter(item => item.roles.includes(user?.rol || ""))
    : publicNavigation;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const colors = {
      admin: "bg-red-500/20 text-red-400",
      conserje: "bg-blue-500/20 text-blue-400",
      residente: "bg-green-500/20 text-green-400",
    };
    const icons = {
      admin: <Shield className="h-3 w-3" />,
      conserje: <Package className="h-3 w-3" />,
      residente: <User className="h-3 w-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colors[user.rol]}`}>
        {icons[user.rol]}
        {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={isAuthenticated ? (user?.rol === 'residente' ? '/mis-encomiendas' : '/encomiendas') : '/'}
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
              CT
            </span>
            CondoTrack
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 rounded-full border border-border/60 bg-card px-1 py-1 shadow-sm md:flex">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="text-sm text-muted-foreground">...</span>
            ) : isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                {getRoleBadge()}
                <span className="text-sm text-muted-foreground max-w-[150px] truncate">
                  {user?.nombre}
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/auth/login"
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Registrarse
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground md:hidden"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 md:hidden">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-[var(--radius-md)] border border-border/60 px-4 py-3 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground bg-card/70 hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile auth section */}
            <div className="mt-2 border-t border-border/60 pt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-card-foreground">{user?.nombre}</span>
                    {getRoleBadge()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-[var(--radius-md)] border border-border/60 bg-card/70 px-4 py-3 text-center text-sm font-medium text-muted-foreground"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-[var(--radius-md)] bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
