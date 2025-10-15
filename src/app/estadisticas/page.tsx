import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, towersDistribution, weeklyTrend } from "@/data/mock-data";

const trendMax = Math.max(...weeklyTrend.map((item) => item.entregadas + item.pendientes));
const towerMax = Math.max(...towersDistribution.map((item) => item.activos));

export default function EstadisticasPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard del administrador"
        description="Analiza el desempeño del proceso de encomiendas, incidencias y tiempos de respuesta."
        actions={
          <>
            <Button variant="outline">Descargar informe</Button>
            <Button>Compartir snapshot</Button>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="border border-border/70 bg-card/85">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              <p className="text-3xl font-semibold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-success">{stat.delta}</p>
              <p className="text-xs text-muted-foreground">{stat.caption}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="border border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Tendencia semanal</CardTitle>
            <CardDescription>Comparativo entre entregas y pendientes por día.</CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex items-end gap-3 overflow-x-auto pb-2">
                {weeklyTrend.map((item) => {
                  const entregadasHeight = Math.round((item.entregadas / trendMax) * 100);
                  const pendientesHeight = Math.round((item.pendientes / trendMax) * 100);
                  return (
                    <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full max-w-[48px] flex-col justify-end gap-1 rounded-[var(--radius-sm)] bg-muted/60 p-1">
                        <div
                          className="h-0 rounded-sm bg-primary transition-all"
                          style={{ height: `${entregadasHeight}%` }}
                          aria-label={`Entregadas ${item.entregadas}`}
                        />
                        <div
                          className="h-0 rounded-sm bg-accent transition-all"
                          style={{ height: `${pendientesHeight}%` }}
                          aria-label={`Pendientes ${item.pendientes}`}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="rounded-[var(--radius-md)] border border-border/60 bg-muted/40 px-4 py-3">
                  <p className="font-semibold text-card-foreground">Insights</p>
                  <p className="text-xs text-muted-foreground">
                    Los recordatorios redujeron un 18% el tiempo de retiro promedio respecto a la
                    semana anterior.
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Entregadas
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    Pendientes
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Distribución por torre</CardTitle>
            <CardDescription>Encomiendas activas por edificio.</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <div className="space-y-4 text-sm">
              {towersDistribution.map((tower) => {
                const width = Math.round((tower.activos / towerMax) * 100);
                return (
                  <div key={tower.tower} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-card-foreground">{tower.tower}</span>
                      <span>{tower.activos} activos</span>
                    </div>
                    <div className="h-2 rounded-full bg-card">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${width}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-4 text-xs text-muted-foreground">
              Meta: mantener menos de 10 encomiendas pendientes por torre. Plan de acción focalizado
              en Torre A y C.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Incidencias y acciones</CardTitle>
          <CardDescription>
            Seguimiento simulado de casos abiertos. Se integrará con flujos reales en Sprint 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Casos abiertos",
              value: 2,
              description: "Incidencias activas con seguimiento de administración.",
            },
            {
              title: "Tiempo medio resolución",
              value: "6h 12m",
              description: "Objetivo: < 4h con automatización de reportes.",
            },
            {
              title: "Última actualización",
              value: "07 mar · 11:30",
              description: "Checklist de conserjería completado.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-warning/30 bg-warning/5 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-warning">
                {item.title}
              </p>
              <p className="text-2xl font-semibold text-card-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-border/60 bg-card/90">
        <CardHeader>
          <CardTitle>Checklist de objetivos del Sprint</CardTitle>
          <CardDescription>
            Validaciones visuales para el cierre del Sprint 1 y preparación del Sprint 2.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            {
              label: "UI base para roles clave",
              status: "Completo",
              tone: "success",
            },
            {
              label: "Navegación funcional entre vistas",
              status: "Completo",
              tone: "success",
            },
            {
              label: "Simulación de métricas principales",
              status: "En progreso",
              tone: "info",
            },
            {
              label: "Integración con backend",
              status: "Pendiente Sprint 3",
              tone: "warning",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[var(--radius-md)] border border-border/50 bg-muted/40 px-4 py-3 text-sm text-card-foreground"
            >
              <span>{item.label}</span>
              <Badge tone={item.tone as "success" | "info" | "warning"}>{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
