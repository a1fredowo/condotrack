"use client";

import { useEffect, useState } from "react";
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
import { 
  getEstadisticasAvanzadas, 
  getTendenciaSemanal, 
  getDistribucionPorTorre 
} from "@/lib/api/encomiendas";
import { RoleGuard } from "@/components/auth/role-guard";

type TendenciaItem = {
  day: string;
  entregadas: number;
  pendientes: number;
  incidencias: number;
};

type TorreItem = {
  tower: string;
  pendientes: number;
  entregados: number;
  total: number;
};

type TransportistaItem = {
  nombre: string;
  cantidad: number;
  porcentaje: number;
};

export default function EstadisticasPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'conserje']}>
      <EstadisticasContent />
    </RoleGuard>
  );
}

function EstadisticasContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    total: 0,
    pendientes: 0,
    entregados: 0,
    incidencias: 0,
    porcentajeEntrega: 0,
  });
  const [tendenciaSemanal, setTendenciaSemanal] = useState<TendenciaItem[]>([]);
  const [distribucionTorres, setDistribucionTorres] = useState<TorreItem[]>([]);
  const [topTransportistas, setTopTransportistas] = useState<TransportistaItem[]>([]);
  const [tiempoPromedio, setTiempoPromedio] = useState("--");

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setIsLoading(true);
      
      const [stats, tendencia, torres] = await Promise.all([
        getEstadisticasAvanzadas(),
        getTendenciaSemanal(),
        getDistribucionPorTorre(),
      ]);

      // Estadísticas generales
      const porcentaje = stats.total > 0 
        ? Math.round((stats.entregados / stats.total) * 100) 
        : 0;
      
      setEstadisticasGenerales({
        total: stats.total,
        pendientes: stats.pendientes,
        entregados: stats.entregados,
        incidencias: stats.incidencias,
        porcentajeEntrega: porcentaje,
      });

      // Tendencia semanal
      const tendenciaFormateada = tendencia.map((item: any) => ({
        day: new Date(item.fecha).toLocaleDateString('es-CL', { weekday: 'short' }),
        entregadas: item.entregado || 0,
        pendientes: item.pendiente || 0,
        incidencias: item.incidencia || 0,
      }));
      setTendenciaSemanal(tendenciaFormateada);

      // Distribución por torres
      const torresFormateadas = torres.map((item: any) => ({
        tower: `Torre ${item.torre}`,
        pendientes: item.pendientes || 0,
        entregados: item.entregados || 0,
        total: item.cantidad || 0,
      }));
      setDistribucionTorres(torresFormateadas);

      // Calcular tiempo promedio estimado (placeholder)
      if (stats.entregados > 0) {
        setTiempoPromedio("3h 45min");
      }

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxTendencia = tendenciaSemanal.length > 0 
    ? Math.max(...tendenciaSemanal.map(item => item.entregadas + item.pendientes + item.incidencias), 1)
    : 1;

  const maxTorre = distribucionTorres.length > 0
    ? Math.max(...distribucionTorres.map(item => item.total), 1)
    : 1;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Panel de estadísticas"
        description="Análisis en tiempo real del flujo de encomiendas en el edificio."
        actions={
          <>
            <Button variant="outline" onClick={cargarEstadisticas} disabled={isLoading}>
              Actualizar datos
            </Button>
            <Button disabled={isLoading}>Exportar reporte</Button>
          </>
        }
      />

      {/* KPIs Principales */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cargando...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-card-foreground">--</p>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total registradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-card-foreground">
                  {estadisticasGenerales.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Histórico completo
                </p>
              </CardContent>
            </Card>

            <Card className="border border-accent/30 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-card-foreground">
                  {estadisticasGenerales.pendientes}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Por retirar
                </p>
              </CardContent>
            </Card>

            <Card className="border border-success/30 bg-success/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Entregadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-card-foreground">
                  {estadisticasGenerales.entregados}
                </p>
                <p className="mt-1 text-xs text-success">
                  {estadisticasGenerales.porcentajeEntrega}% del total
                </p>
              </CardContent>
            </Card>

            <Card className="border border-warning/30 bg-warning/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Incidencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-card-foreground">
                  {estadisticasGenerales.incidencias}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {/* Gráficos principales */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tendencia semanal */}
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle>Tendencia semanal</CardTitle>
            <CardDescription>
              Evolución de encomiendas en los últimos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Cargando tendencia...
              </div>
            ) : tendenciaSemanal.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay datos suficientes para mostrar la tendencia
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-2 h-48">
                  {tendenciaSemanal.map((item, index) => {
                    const entregadasHeight = (item.entregadas / maxTendencia) * 100;
                    const pendientesHeight = (item.pendientes / maxTendencia) * 100;
                    const incidenciasHeight = (item.incidencias / maxTendencia) * 100;
                    
                    return (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2">
                        <div className="w-full flex flex-col-reverse items-center gap-1 h-40">
                          {item.entregadas > 0 && (
                            <div
                              className="w-full rounded-t-sm bg-success transition-all"
                              style={{ height: `${entregadasHeight}%` }}
                              title={`${item.entregadas} entregadas`}
                            />
                          )}
                          {item.pendientes > 0 && (
                            <div
                              className="w-full rounded-t-sm bg-accent transition-all"
                              style={{ height: `${pendientesHeight}%` }}
                              title={`${item.pendientes} pendientes`}
                            />
                          )}
                          {item.incidencias > 0 && (
                            <div
                              className="w-full rounded-t-sm bg-warning transition-all"
                              style={{ height: `${incidenciasHeight}%` }}
                              title={`${item.incidencias} incidencias`}
                            />
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-success" />
                    Entregadas
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-accent" />
                    Pendientes
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-warning" />
                    Incidencias
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribución por torres */}
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle>Distribución por torre</CardTitle>
            <CardDescription>
              Encomiendas activas en cada edificio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Cargando distribución...
              </div>
            ) : distribucionTorres.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay datos de distribución disponibles
              </div>
            ) : (
              <div className="space-y-6">
                {distribucionTorres.map((torre, index) => {
                  const widthTotal = (torre.total / maxTorre) * 100;
                  const widthPendientes = torre.total > 0 ? (torre.pendientes / torre.total) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-card-foreground">
                          {torre.tower}
                        </span>
                        <span className="text-muted-foreground">
                          {torre.total} total ({torre.pendientes} pendientes)
                        </span>
                      </div>
                      <div className="relative h-8 rounded-lg bg-muted/60 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/80 rounded-lg transition-all"
                          style={{ width: `${widthTotal}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 bg-accent rounded-lg transition-all"
                          style={{ width: `${widthTotal * (widthPendientes / 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-card-foreground mb-1">Objetivo:</p>
                  Mantener menos de 10 encomiendas pendientes por torre
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas adicionales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle>Tiempo promedio de retiro</CardTitle>
            <CardDescription>
              Desde recepción hasta entrega confirmada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-4xl font-bold text-card-foreground">
                {tiempoPromedio}
              </p>
              <div className="rounded-lg border border-success/30 bg-success/5 p-4">
                <p className="text-sm font-medium text-success">Mejora del 18%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Respecto al mes anterior gracias a las notificaciones automáticas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle>Tasa de eficiencia</CardTitle>
            <CardDescription>
              Encomiendas procesadas correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <p className="text-4xl font-bold text-card-foreground">
                  {estadisticasGenerales.total > 0 
                    ? Math.round(((estadisticasGenerales.total - estadisticasGenerales.incidencias) / estadisticasGenerales.total) * 100)
                    : 0}%
                </p>
                <Badge tone="success" className="mb-2">Excelente</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sin incidencias:</span>
                  <span className="font-medium">
                    {estadisticasGenerales.total - estadisticasGenerales.incidencias} de {estadisticasGenerales.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Con problemas:</span>
                  <span className="font-medium text-warning">
                    {estadisticasGenerales.incidencias}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Resumen del sistema</CardTitle>
          <CardDescription>
            Estado general de la plataforma CondoTrack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estado del sistema
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-success">
                <span className="h-2 w-2 rounded-full bg-success" />
                Operativo
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Última actualización
              </p>
              <p className="mt-2 text-sm font-semibold text-card-foreground">
                {new Date().toLocaleString('es-CL', { 
                  day: '2-digit', 
                  month: 'short', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notificaciones enviadas
              </p>
              <p className="mt-2 text-sm font-semibold text-card-foreground">
                {estadisticasGenerales.total * 2} mensajes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}