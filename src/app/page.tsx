import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, shipments } from "@/data/mock-data";

const ctaPrimary =
  "inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90";
const ctaSecondary =
  "inline-flex h-12 items-center justify-center rounded-full border border-border/80 bg-card/60 px-6 text-base font-semibold text-foreground transition hover:bg-muted/60";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-card/90 px-6 py-16 shadow-xl shadow-primary/10 md:px-12">
        <div className="absolute inset-0 -z-10 grid-pattern opacity-70" />
        <div className="absolute -right-20 top-16 hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:block" />
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <Badge tone="info" className="w-fit bg-primary/15 text-primary">
              Sprint 1 · UX + UI base
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Gestión inteligente de encomiendas para condominios modernos.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                CondoTrack centraliza la recepción, seguimiento y entrega de paquetes para
                conserjes, residentes y administradores. Este sprint prepara la experiencia
                visual completa del frontend.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/encomiendas" className={ctaPrimary}>
                Demo del conserje
              </Link>
              <Link href="/estadisticas" className={ctaSecondary}>
                Ver dashboard del administrador
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Trazabilidad en tiempo real
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                Notificaciones automáticas
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                Validación QR sin contacto
              </span>
            </div>
          </div>

          <Card className="w-full max-w-sm border border-primary/10 bg-card/70">
            <CardHeader>
              <CardTitle>Resumen diario</CardTitle>
              <CardDescription>Indicadores simulados.</CardDescription>
            </CardHeader>
            <CardContent className="gap-5">
              <ul className="space-y-4 text-sm">
                {dashboardStats.map((stat) => (
                  <li key={stat.label} className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-card-foreground">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">{stat.caption}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">{stat.value}</p>
                      <span className="text-xs text-success">{stat.delta}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="rounded-[var(--radius-md)] bg-muted/60 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Próximo Sprint
                </p>
                <p className="mt-2 text-sm text-card-foreground">
                  Integración con backend Express + PostgreSQL y autenticación.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Conserjes",
            description:
              "Registrar con rapidez las encomiendas, adjuntar transportista y generar QR para retiros seguros.",
            link: { href: "/encomiendas", label: "Ir a vista de encomiendas" },
            accent: "bg-primary/10 text-primary",
          },
          {
            title: "Residentes",
            description:
              "Recibir notificaciones y confirmar retiros desde cualquier dispositivo. Transparencia total.",
            link: { href: "/notificaciones", label: "Ver flujo de alertas" },
            accent: "bg-accent/10 text-accent",
          },
          {
            title: "Administradores",
            description:
              "Monitorear indicadores, controlar incidencias y optimizar logística con métricas en tiempo real.",
            link: { href: "/estadisticas", label: "Explorar estadísticas" },
            accent: "bg-warning/15 text-warning",
          },
        ].map((role) => (
          <Card key={role.title} className="relative overflow-hidden">
            <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs ${role.accent}`}>
              Perfil
            </div>
            <CardHeader className="mb-3">
              <CardTitle>{role.title}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={role.link.href} className="text-sm font-semibold text-primary">
                {role.link.label} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle>Últimas encomiendas registradas</CardTitle>
            <CardDescription>Datos mockeados para validar la tabla del conserje.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-[var(--radius-md)] border border-border/40">
            <div className="hidden grid-cols-[140px_1.2fr_1fr_120px] gap-4 bg-muted/70 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid">
              <span>ID</span>
              <span>Residente</span>
              <span>Transportista</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-border/40">
              {shipments.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[140px_1.2fr_1fr_120px]"
                >
                  <span className="font-medium text-card-foreground">{item.id}</span>
                  <div>
                    <p className="font-medium text-card-foreground">{item.residente}</p>
                    <p className="text-xs text-muted-foreground">{item.departamento}</p>
                  </div>
                  <span className="text-muted-foreground">{item.transportista}</span>
                  <Badge tone={item.estado === "entregado" ? "success" : item.estado === "incidencia" ? "warning" : "info"}>
                    {item.estado}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Roadmap inmediato</CardTitle>
            <CardDescription>
              Próximas entregas del curso para completar CondoTrack.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <ul className="space-y-3 text-sm text-card-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Sprint 2 · Búsqueda y QR</p>
                  <p className="text-muted-foreground">
                    Filtrado por departamento y flujo de validación con código QR simulado.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                <div>
                  <p className="font-medium">Sprint 3 · Backend & Auth</p>
                  <p className="text-muted-foreground">
                    API con Express + PostgreSQL, autenticación y flujos de usuario reales.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-warning" />
                <div>
                  <p className="font-medium">Sprint 4 · Integraciones</p>
                  <p className="text-muted-foreground">
                    Notificaciones productivas (correo/SMS) y métricas avanzadas.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
