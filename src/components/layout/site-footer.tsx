import Link from "next/link";

const footerLinks = [
  { label: "Roadmap", href: "#roadmap" },
  { label: "Equipo", href: "#equipo" },
  { label: "Contacto", href: "#contacto" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-base font-semibold text-foreground">CondoTrack</p>
            <p className="text-sm text-muted-foreground">
              Gestión inteligente de encomiendas para comunidades modernas.
            </p>
          </div>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} CondoTrack. Proyecto académico - Ingeniería de Software.
        </p>
      </div>
    </footer>
  );
}
