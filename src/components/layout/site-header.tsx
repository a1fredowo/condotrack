"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Encomiendas", href: "/encomiendas" },
  { name: "Notificaciones", href: "/notificaciones" },
  { name: "Estadísticas", href: "/estadisticas" },
  { name: "QR", href: "/qr" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary/15 text-primary">
              CT
            </span>
            CondoTrack
          </Link>
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
          <div className="flex items-center gap-3">
            <Link
              href="/encomiendas"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline-flex"
            >
              Modo demo
            </Link>
            <Link
              href="#contacto"
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Solicitar acceso
            </Link>
          </div>
        </div>
        <nav className="mt-3 flex items-center gap-2 overflow-x-auto md:hidden">
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
                  "rounded-full border border-border/60 px-4 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground bg-card/70",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
