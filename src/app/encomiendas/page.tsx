import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { shipments, DeliveryStatus } from "@/data/mock-data";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border/70 bg-card/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30";

const statusTone: Record<DeliveryStatus, "info" | "success" | "warning"> = {
  pendiente: "info",
  entregado: "success",
  incidencia: "warning",
};

export default function EncomiendasPage() {
  const upcoming = shipments.filter((item) => item.estado === "pendiente").slice(0, 3);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Panel del conserje"
        description="Registra y controla las encomiendas recibidas en cada torre. Filtra por departamento, transportista o estado."
        actions={
          <>
            <Button variant="outline">Exportar CSV</Button>
            <Button>Registrar encomienda</Button>
          </>
        }
      />

      <Card className="border border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>Filtros rápidos</CardTitle>
          <CardDescription>Interacción simulada para Sprint 2.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Departamento
            <input className={inputClass} placeholder="Ej: Torre B · 304" />
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Transportista
            <input className={inputClass} placeholder="Starken, Chilexpress..." />
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Estado
            <select className={inputClass}>
              <option>Todos</option>
              <option>Pendientes</option>
              <option>Entregados</option>
              <option>Incidencias</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Fecha recepción
            <input type="date" className={inputClass} defaultValue="2025-03-07" />
          </label>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Registro de encomiendas</CardTitle>
          <CardDescription>
            Tabla responsiva con estados, horarios y códigos de seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-[var(--radius-md)] border border-border/60">
          <div className="hidden grid-cols-[120px_1.4fr_1fr_1fr_110px_120px] gap-6 bg-muted/60 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid">
            <span>ID</span>
            <span>Residente</span>
            <span>Transportista</span>
            <span>Recepción</span>
            <span>Código</span>
            <span>Estado</span>
          </div>
          <div className="divide-y divide-border/50">
            {shipments.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[120px_1.4fr_1fr_1fr_110px_120px]"
              >
                <span className="font-semibold text-card-foreground">{item.id}</span>
                <div>
                  <p className="font-medium text-card-foreground">{item.residente}</p>
                  <p className="text-xs text-muted-foreground">{item.departamento}</p>
                </div>
                <span className="text-muted-foreground">{item.transportista}</span>
                <div className="text-xs text-muted-foreground">
                  {item.fechaRecepcion} · {item.horaRecepcion} hrs
                </div>
                <span className="font-mono text-xs text-muted-foreground">{item.codigoSeguimiento}</span>
                <Badge tone={statusTone[item.estado]} className="capitalize">
                  {item.estado}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Próximos retiros coordinados</CardTitle>
            <CardDescription>Recordatorios automáticos para paquetes pendientes.</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <ol className="space-y-4 text-sm">
              {upcoming.map((item, index) => (
                <li key={item.id} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-card-foreground">{item.residente}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.departamento} · Retiro estimado 18:00 hrs
                    </p>
                  </div>
                  <Badge tone="info" className="ml-auto">
                    Notificado
                  </Badge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incidencias activas</CardTitle>
            <CardDescription>Seguimiento de paquetes en estado especial.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3 text-sm">
            {shipments
              .filter((item) => item.estado === "incidencia")
              .map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-warning/30 bg-warning/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-warning">{item.residente}</p>
                    <Badge tone="warning">Incidencia</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paquete reportado con daño visible. Se requiere evidencia fotográfica al
                    momento del retiro.
                  </p>
                  <span className="text-xs text-muted-foreground">Caso #{item.id}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
