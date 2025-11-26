"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getEncomiendas, getEstadisticasEncomiendas, type EncomiendaConDatos } from "@/lib/api/encomiendas";
import { 
  Package, 
  QrCode, 
  Bell, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Users,
  Zap,
  Lock
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [shipments, setShipments] = useState<EncomiendaConDatos[]>([]);
  const [stats, setStats] = useState({
    totalHoy: 0,
    pendientes: 0,
    entregados: 0,
    incidencias: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Redirect residents directly to mis-encomiendas
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.rol === 'residente') {
      router.replace('/mis-encomiendas');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    async function cargarDatos() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
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
    
    if (!authLoading) {
      cargarDatos();
    }
  }, [isAuthenticated, authLoading]);

  // Si no está autenticado, mostrar landing page
  if (!authLoading && !isAuthenticated) {
    return <LandingPage />;
  }

  // If resident, show loading while redirecting
  if (user?.rol === 'residente') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    );
  }

  // Dashboard para admin y conserje
  return <AuthenticatedDashboard 
    user={user} 
    stats={stats} 
    shipments={shipments} 
    isLoading={isLoading || authLoading} 
  />;
}

// Landing Page para visitantes
function LandingPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-primary/5 px-6 py-20 shadow-2xl shadow-primary/10 md:px-12">
        <div className="absolute inset-0 -z-10 grid-pattern opacity-50" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Badge tone="info" className="mb-6 bg-primary/15 text-primary">
            Plataforma de Gestión de Encomiendas
          </Badge>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            La solución definitiva para{" "}
            <span className="text-primary">condominios modernos</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            CondoTrack digitaliza completamente la gestión de encomiendas en edificios y condominios. 
            Trazabilidad total, notificaciones automáticas y validación QR para una experiencia sin fricciones.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/auth/register">
              <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-primary/30">
                Comenzar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="h-14 px-8 text-base">
                Iniciar sesión
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Configuración en minutos
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Soporte incluido
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Todo lo que necesitas para gestionar encomiendas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Una plataforma completa diseñada específicamente para las necesidades de edificios residenciales
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: QrCode,
              title: "Validación QR",
              description: "Cada encomienda genera un código QR único. El residente lo presenta al retirar y el conserje lo escanea para confirmar la entrega.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              icon: Bell,
              title: "Notificaciones Automáticas",
              description: "Los residentes reciben alertas instantáneas por email cuando llega una encomienda. Sin más llamadas ni visitas innecesarias.",
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              icon: BarChart3,
              title: "Dashboard de Estadísticas",
              description: "Métricas en tiempo real: tiempos de entrega, volumen por torre, eficiencia operacional y más.",
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              icon: Shield,
              title: "Control de Acceso",
              description: "Tres roles diferenciados: Administrador, Conserje y Residente. Cada uno ve exactamente lo que necesita.",
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              icon: Clock,
              title: "Trazabilidad Completa",
              description: "Registro detallado de cada acción: quién recibió, cuándo se notificó, quién entregó y a qué hora.",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: Zap,
              title: "Autocompletado Inteligente",
              description: "Registro rápido de encomiendas con búsqueda de residentes. El sistema aprende y sugiere automáticamente.",
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
          ].map((feature) => (
            <Card key={feature.title} className="group border border-border/60 transition-all hover:border-primary/30 hover:shadow-lg">
              <CardHeader>
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Una plataforma, tres experiencias
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Cada usuario accede a las funciones que necesita según su rol en el condominio
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: Shield,
              role: "Administrador",
              description: "Gestión completa del sistema",
              features: [
                "Dashboard de estadísticas avanzadas",
                "Gestión de usuarios y permisos",
                "Logs de auditoría completos",
                "Configuración del condominio",
                "Reportes exportables",
              ],
              color: "border-red-500/30 bg-red-500/5",
              iconColor: "text-red-500",
            },
            {
              icon: Package,
              role: "Conserje",
              description: "Operación diaria eficiente",
              features: [
                "Registro rápido de encomiendas",
                "Escáner QR para validar entregas",
                "Vista de pendientes por torre",
                "Autocompletado de residentes",
                "Notificaciones automáticas",
              ],
              color: "border-blue-500/30 bg-blue-500/5",
              iconColor: "text-blue-500",
            },
            {
              icon: Users,
              role: "Residente",
              description: "Control de tus encomiendas",
              features: [
                "Notificaciones instantáneas",
                "Historial de encomiendas",
                "Código QR personal para retiros",
                "Estado en tiempo real",
                "Acceso desde cualquier dispositivo",
              ],
              color: "border-green-500/30 bg-green-500/5",
              iconColor: "text-green-500",
            },
          ].map((role) => (
            <Card key={role.role} className={`border-2 ${role.color}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${role.color}`}>
                    <role.icon className={`h-6 w-6 ${role.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle>{role.role}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-shrink-0 ${role.iconColor}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-[var(--radius-lg)] border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 px-6 py-16 text-center md:px-12">
        <Building2 className="mx-auto mb-6 h-16 w-16 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Transforma la gestión de tu condominio
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Únete a los edificios que ya disfrutan de una gestión de encomiendas moderna, 
          eficiente y sin papel. Comienza hoy mismo.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/auth/register">
            <Button size="lg" className="h-14 px-10 text-base shadow-lg shadow-primary/30">
              Crear cuenta gratis
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" size="lg" className="h-14 px-10 text-base">
              Ya tengo cuenta
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          Tus datos están protegidos con encriptación de nivel empresarial
        </div>
      </section>
    </div>
  );
}

// Dashboard para usuarios autenticados
function AuthenticatedDashboard({ 
  user, 
  stats, 
  shipments, 
  isLoading 
}: { 
  user: { nombre: string; rol: string } | null; 
  stats: { totalHoy: number; pendientes: number; entregados: number }; 
  shipments: EncomiendaConDatos[]; 
  isLoading: boolean;
}) {
  const dashboardStats = [
    {
      label: "Total registradas",
      caption: "Encomiendas en el sistema",
      value: isLoading ? "..." : stats.totalHoy.toString(),
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Pendientes",
      caption: "Esperan ser retiradas",
      value: isLoading ? "..." : stats.pendientes.toString(),
      icon: Clock,
      color: "text-warning",
    },
    {
      label: "Entregadas",
      caption: "Completadas exitosamente",
      value: isLoading ? "..." : stats.entregados.toString(),
      icon: CheckCircle2,
      color: "text-success",
    },
  ];

  const quickActions = user?.rol === 'admin' || user?.rol === 'conserje' 
    ? [
        { label: "Registrar encomienda", href: "/encomiendas", icon: Package },
        { label: "Escanear QR", href: "/qr/scanner", icon: QrCode },
        { label: "Ver estadísticas", href: "/estadisticas", icon: BarChart3 },
      ]
    : [
        { label: "Mis encomiendas", href: "/mis-encomiendas", icon: Package },
        { label: "Mi código QR", href: "/qr", icon: QrCode },
        { label: "Notificaciones", href: "/notificaciones", icon: Bell },
      ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <section className="rounded-[var(--radius-lg)] border border-border/60 bg-gradient-to-r from-card/95 via-card/90 to-primary/5 px-6 py-8 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              ¡Hola, {user?.nombre?.split(' ')[0] || 'Usuario'}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              {user?.rol === 'admin' && "Panel de administración del sistema"}
              {user?.rol === 'conserje' && "Panel de gestión de encomiendas"}
              {user?.rol === 'residente' && "Revisa el estado de tus encomiendas"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="gap-2">
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="border border-border/70">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-full bg-muted/50 p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground/70">{stat.caption}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent Shipments */}
      {(user?.rol === 'admin' || user?.rol === 'conserje') && (
        <Card className="border border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimas encomiendas</CardTitle>
              <CardDescription>Registro reciente de paquetes</CardDescription>
            </div>
            <Link href="/encomiendas">
              <Button variant="outline" size="sm">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50">
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Cargando...
                </div>
              ) : shipments.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay encomiendas registradas
                </div>
              ) : (
                shipments.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {item.residenteNombre || item.residente?.nombre || 'Desconocido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.transportista} · {item.codigo}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      tone={item.estado === "entregado" ? "success" : item.estado === "incidencia" ? "warning" : "info"}
                    >
                      {item.estado}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
