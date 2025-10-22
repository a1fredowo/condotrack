"use client";

import { useEffect, useState } from "react";
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
import { getNotificaciones, enviarNotificacionPrueba, type NotificacionConDatos } from "@/lib/api/notificaciones";
import { Mail, Smartphone, Send, CheckCircle2, Clock } from "lucide-react";

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<NotificacionConDatos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const cargarNotificaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getNotificaciones();
      setNotifications(data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError('Error al cargar las notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const handleEnviarPrueba = async () => {
    try {
      setIsSendingTest(true);
      setError(null);
      setTestSuccess(null);
      
      await enviarNotificacionPrueba("alfredohv26@gmail.com");
      
      setTestSuccess("✓ Correo de prueba enviado exitosamente a alfredohv26@gmail.com");
      setTimeout(() => setTestSuccess(null), 5000);
      
      // Recargar notificaciones para mostrar la nueva
      await cargarNotificaciones();
    } catch (err) {
      console.error('Error al enviar correo de prueba:', err);
      setError('Error al enviar el correo de prueba. Verifica la configuración.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const formatearFecha = (isoDate: string) => {
    const date = new Date(isoDate);
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = meses[date.getMonth()];
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");
    
    return `${dia} ${mes} · ${horas}:${minutos}`;
  };

  return (
    <div className="space-y-10">
      <PageHeader
        title="Centro de notificaciones"
        description="Sistema de comunicación automatizada con los residentes."
        actions={
          <Button 
            onClick={handleEnviarPrueba} 
            disabled={isSendingTest || isLoading}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSendingTest ? "Enviando..." : "Enviar correo de prueba"}
          </Button>
        }
      />

      {/* Estado actual y futuro */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Sistema actual</CardTitle>
                <CardDescription>En funcionamiento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Actualmente, <strong className="text-card-foreground">CondoTrack notifica por correo electrónico</strong> cuando 
              llega una nueva encomienda. El residente recibe:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>Alerta inmediata al correo registrado</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>Información del paquete y transportista</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                <span>Instrucciones para el retiro</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/20 p-2">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Próximamente</CardTitle>
                <CardDescription>Aplicación móvil</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Con la <strong className="text-card-foreground">App CondoTrack</strong>, los residentes recibirán 
              notificaciones push en tiempo real con funciones avanzadas:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-accent mt-0.5" />
                <span>Notificaciones instantáneas push</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-accent mt-0.5" />
                <span>Código QR para retiro sin contacto</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-accent mt-0.5" />
                <span>Autorización de terceros digitalmente</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cargarNotificaciones}
              className="mt-3"
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {testSuccess && (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-6">
            <p className="text-sm text-success">{testSuccess}</p>
          </CardContent>
        </Card>
      )}

      {/* Historial de notificaciones */}
      <Card className="border border-border/70">
        <CardHeader>
          <CardTitle>Historial de notificaciones ({notifications.length})</CardTitle>
          <CardDescription>
            Registro de todos los correos enviados a los residentes sobre sus encomiendas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones registradas todavía
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Las notificaciones aparecerán aquí cuando se registren nuevas encomiendas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => {
                const residenteNombre = item.encomienda?.residente?.nombre || 'Residente desconocido';
                const residenteEmail = item.encomienda?.residente?.email || 'No especificado';
                const deptInfo = item.encomienda?.residente?.departamento 
                  ? `Torre ${item.encomienda.residente.departamento.torre} · Depto ${item.encomienda.residente.departamento.numero}`
                  : 'N/A';
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold text-card-foreground">
                            {residenteNombre}
                          </p>
                          <Badge tone={item.entregada ? "success" : "info"} className="text-xs">
                            {item.entregada ? "Entregada" : "Enviada"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {residenteEmail} · {deptInfo}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatearFecha(item.enviadoEn)}
                      </span>
                    </div>
                    
                    {item.mensaje && (
                      <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                        {item.mensaje}
                      </div>
                    )}
                    
                    {item.encomienda && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                          Código: {item.encomienda.codigo}
                        </span>
                        {item.encomienda.transportista && (
                          <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">
                            {item.encomienda.transportista}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plantilla de correo actual */}
      <Card className="border border-border/80">
        <CardHeader>
          <CardTitle>Plantilla de correo electrónico</CardTitle>
          <CardDescription>
            Mensaje que reciben actualmente los residentes cuando llega una encomienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 bg-muted/30 p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-card-foreground">
                Asunto: 📦 Nueva encomienda recibida - CondoTrack
              </p>
              <div className="h-px bg-border/50" />
            </div>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Hola <strong className="text-card-foreground">{'{{nombre}}'}</strong>,</p>
              
              <p>
                Te informamos que ha llegado una nueva encomienda para ti en la conserjería del edificio.
              </p>
              
              <div className="rounded-md bg-card p-4 space-y-2 border border-border/50">
                <p className="text-xs font-semibold text-card-foreground uppercase tracking-wide">
                  Detalles de la encomienda
                </p>
                <div className="space-y-1 text-xs">
                  <p><strong>Código:</strong> {'{{codigo}}'}</p>
                  <p><strong>Transportista:</strong> {'{{transportista}}'}</p>
                  <p><strong>Fecha de llegada:</strong> {'{{fecha}}'}</p>
                  <p><strong>Ubicación:</strong> Torre {'{{torre}}'} · Departamento {'{{numero}}'}</p>
                </div>
              </div>
              
              <p>
                Por favor, acércate a la conserjería para retirar tu paquete presentando tu RUT o identificación.
              </p>
              
              <p className="text-xs italic">
                Si tienes alguna consulta, responde este correo o contacta a la administración del edificio.
              </p>
              
              <div className="pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground/80">
                  Este es un correo automático generado por CondoTrack · Sistema de gestión de encomiendas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
