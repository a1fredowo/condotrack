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
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Package, 
  Clock,
  AlertCircle,
  Truck,
  User
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";

interface Encomienda {
  id: string;
  codigo: string;
  transportista: string;
  estado: string;
  fechaRecepcion: string;
  residenteNombre: string;
  residente?: {
    id: string;
    nombre: string;
    email: string;
    departamento?: {
      numero: string;
      torre: string;
    };
  };
}

interface NotificacionHistorial {
  id: string;
  mensaje: string;
  medio: string;
  entregada: boolean;
  enviadoEn: string;
  encomienda?: {
    codigo: string;
    transportista: string;
    residente?: {
      nombre: string;
      email: string;
    };
  };
}

export default function NotificacionesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'conserje']} redirectTo="/">
      <NotificacionesContent />
    </RoleGuard>
  );
}

function NotificacionesContent() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [historial, setHistorial] = useState<NotificacionHistorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Cargar encomiendas pendientes
  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      
      // Cargar encomiendas pendientes
      const resEnc = await fetch('/api/encomiendas?estado=pendiente');
      if (resEnc.ok) {
        const data = await resEnc.json();
        setEncomiendas(data.encomiendas || []);
      }

      // Cargar historial de notificaciones
      const resNotif = await fetch('/api/notificaciones');
      if (resNotif.ok) {
        const data = await resNotif.json();
        setHistorial(data.notificaciones || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Enviar notificación a un residente
  const enviarNotificacion = async (encomienda: Encomienda) => {
    if (!encomienda.residente?.email) {
      setMensaje({ tipo: 'error', texto: 'El residente no tiene email registrado' });
      return;
    }

    setEnviando(encomienda.id);
    setMensaje(null);

    try {
      const res = await fetch('/api/notificaciones/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encomiendaId: encomienda.id,
          email: encomienda.residente.email,
          residenteNombre: encomienda.residente.nombre,
          codigo: encomienda.codigo,
          transportista: encomienda.transportista,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMensaje({ 
          tipo: 'success', 
          texto: `✓ Notificación enviada a ${encomienda.residente.email}` 
        });
        // Recargar datos
        await cargarDatos();
      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: data.error || 'Error al enviar la notificación' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setEnviando(null);
      setTimeout(() => setMensaje(null), 5000);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendientes = encomiendas.filter(e => e.estado === 'pendiente');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Centro de notificaciones"
        description="Envía avisos a los residentes sobre sus encomiendas pendientes."
      />

      {/* Mensaje de estado */}
      {mensaje && (
        <div className={`rounded-lg border p-4 ${
          mensaje.tipo === 'success' 
            ? 'border-success/50 bg-success/10 text-success' 
            : 'border-destructive/50 bg-destructive/10 text-destructive'
        }`}>
          <div className="flex items-center gap-2">
            {mensaje.tipo === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      {/* Encomiendas pendientes para notificar */}
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-warning/20 p-2">
              <Package className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle>Encomiendas pendientes ({pendientes.length})</CardTitle>
              <CardDescription>
                Selecciona una encomienda para notificar al residente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando encomiendas...
            </div>
          ) : pendientes.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-success/50" />
              <p className="text-muted-foreground">No hay encomiendas pendientes</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Todas las encomiendas han sido retiradas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map((enc) => (
                <div
                  key={enc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/50 p-4 hover:border-border transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{enc.residenteNombre || enc.residente?.nombre}</span>
                        <Badge tone="warning" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          Pendiente
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {enc.transportista}
                        </span>
                        <span className="font-mono text-xs">#{enc.codigo}</span>
                      </div>
                      {enc.residente?.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {enc.residente.email}
                        </div>
                      )}
                      {enc.residente?.departamento && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          Torre {enc.residente.departamento.torre} · Depto {enc.residente.departamento.numero}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => enviarNotificacion(enc)}
                    disabled={enviando === enc.id || !enc.residente?.email}
                    className="shrink-0"
                  >
                    {enviando === enc.id ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Notificar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de notificaciones */}
      <Card className="border-border/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Historial de notificaciones</CardTitle>
              <CardDescription>
                Registro de avisos enviados a los residentes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historial.length === 0 ? (
            <div className="py-8 text-center">
              <Mail className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay notificaciones enviadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historial.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border/50 bg-muted/20 p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {notif.encomienda?.residente?.nombre || 'Residente'}
                      </span>
                      <Badge tone="success" className="text-xs">Enviado</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notif.encomienda?.residente?.email}
                    </p>
                    {notif.encomienda && (
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>#{notif.encomienda.codigo}</span>
                        <span>·</span>
                        <span>{notif.encomienda.transportista}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatearFecha(notif.enviadoEn)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
