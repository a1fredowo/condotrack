"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEncomiendas, getEstadisticasEncomiendas, type EncomiendaConDatos } from "@/lib/api/encomiendas";

const ctaPrimary =
  "inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90";
const ctaSecondary =
  "inline-flex h-12 items-center justify-center rounded-full border border-border/80 bg-card/60 px-6 text-base font-semibold text-foreground transition hover:bg-muted/60";

export default function HomePage() {
  const [shipments, setShipments] = useState<EncomiendaConDatos[]>([]);
  const [stats, setStats] = useState({
    totalHoy: 0,
    pendientes: 0,
    entregados: 0,
    incidencias: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setIsLoading(true);
        const [encomiendasData, estadisticas] = await Promise.all([
          getEncomiendas(),
          getEstadisticasEncomiendas()
        ]);
        
        setShipments(encomiendasData);
        setStats({
          totalHoy: estadisticas.total,
          pendientes: estadisticas.pendientes,
          entregados: estadisticas.entregados,
          incidencias: estadisticas.incidencias
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    cargarDatos();
  }, []);

  const dashboardStats = [
    {
      label: "Recibidas hoy",
      caption: "Total de encomiendas ingresadas",
      value: isLoading ? "..." : stats.totalHoy.toString(),
      delta: "+12%"
    },
    {
      label: "Pendientes",
      caption: "Esperan ser retiradas",
      value: isLoading ? "..." : stats.pendientes.toString(),
      delta: "-5%"
    },
    {
      label: "Entregadas",
      caption: "Completadas exitosamente",
      value: isLoading ? "..." : stats.entregados.toString(),
      delta: "+18%"
    }
  ];
  
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-card/90 px-6 py-16 shadow-xl shadow-primary/10 md:px-12">
        <div className="absolute inset-0 -z-10 grid-pattern opacity-70" />
        <div className="absolute -right-20 top-16 hidden h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:block" />
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <Badge tone="info" className="w-fit bg-primary/15 text-primary">
              Sistema Digital · Gestión de Encomiendas
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Gestión inteligente de encomiendas para edificios y condominios.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                CondoTrack digitaliza la recepción y entrega de paquetes, eliminando el riesgo de extravío 
                y optimizando el tiempo de conserjes y residentes. Trazabilidad completa desde la recepción 
                hasta la entrega final con validación QR.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/encomiendas" className={ctaPrimary}>
                Acceder al sistema
              </Link>
              <Link href="/estadisticas" className={ctaSecondary}>
                Ver panel de control
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
              <CardTitle>Métricas del día</CardTitle>
              <CardDescription>Indicadores operacionales en tiempo real.</CardDescription>
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
                  Beneficios del sistema
                </p>
                <p className="mt-2 text-sm text-card-foreground">
                  Reducción del 85% en extravíos y optimización del tiempo de gestión en conserjería.
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
              "Registre encomiendas de forma rápida y segura. Genera códigos QR automáticamente para cada paquete y gestiona las entregas con trazabilidad completa.",
            link: { href: "/encomiendas", label: "Acceder al panel" },
            accent: "bg-primary/10 text-primary",
          },
          {
            title: "Residentes",
            description:
              "Reciba notificaciones instantáneas cuando llegue un paquete. Consulte el estado de sus encomiendas y confirme retiros desde cualquier dispositivo.",
            link: { href: "/notificaciones", label: "Ver notificaciones" },
            accent: "bg-accent/10 text-accent",
          },
          {
            title: "Administradores",
            description:
              "Monitoree la operación completa del edificio. Analice métricas de eficiencia, identifique patrones y optimice la gestión logística.",
            link: { href: "/estadisticas", label: "Ver estadísticas" },
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
            <CardDescription>Registro en tiempo real de paquetes recibidos en el edificio.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden rounded-[var(--radius-md)] border border-border/40">
            <div className="hidden grid-cols-[140px_1.2fr_1fr_120px] gap-4 bg-muted/70 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid">
              <span>ID</span>
              <span>Residente</span>
              <span>Transportista</span>
              <span className="text-center">Estado</span>
            </div>
            <div className="divide-y divide-border/40">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Cargando encomiendas...
                </div>
              ) : shipments.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay encomiendas registradas
                </div>
              ) : (
                shipments.slice(0, 5).map((item) => {
                  const deptInfo = item.residente?.departamento 
                    ? `Torre ${item.residente.departamento.torre} · ${item.residente.departamento.numero}`
                    : 'N/A';
                  
                  return (
                    <div
                      key={item.id}
                      className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[140px_1.2fr_1fr_120px]"
                    >
                      <span className="font-medium text-card-foreground">{item.id.substring(0, 8)}</span>
                      <div>
                        <p className="font-medium text-card-foreground">{item.residente?.nombre || 'Desconocido'}</p>
                        <p className="text-xs text-muted-foreground">{deptInfo}</p>
                      </div>
                      <span className="text-muted-foreground">{item.transportista}</span>
                      <div className="flex justify-center">
                        <Badge tone={item.estado === "entregado" ? "success" : item.estado === "incidencia" ? "warning" : "info"}>
                          {item.estado}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Transformación Digital</CardTitle>
            <CardDescription>
              Del caos operacional a la gestión profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
                <span>⚠️</span> Sin CondoTrack
              </h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• Registro manual con cuadernos</li>
                <li>• Paquetes extraviados frecuentemente</li>
                <li>• Conserjes sobrecargados</li>
                <li>• Residentes sin información</li>
              </ul>
            </div>
            
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                <span>✓</span> Con CondoTrack
              </h4>
              <ul className="space-y-1.5 text-sm text-card-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">📱</span>
                  <span>Registro digital en segundos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">🔔</span>
                  <span>Notificaciones automáticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">📊</span>
                  <span>Trazabilidad completa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">⚡</span>
                  <span>Validación QR instantánea</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
              <span className="text-xs font-medium text-card-foreground">Impacto medible</span>
              <span className="text-sm font-semibold text-success">-85% extravíos</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
