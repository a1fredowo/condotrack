"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Clock, CheckCircle2, QrCode,
  Truck, Calendar, AlertCircle, PackageOpen
} from "lucide-react";
import Link from "next/link";

interface Encomienda {
  id: string;
  codigo: string;
  transportista: string;
  descripcion?: string;
  estado: 'pendiente' | 'retirada';
  fechaRecepcion: string;
  fechaEntrega?: string;
  tokenQR?: {
    id: string;
    token: string;
    expiracion: string;
    usado: boolean;
  };
}

export default function MisEncomiendasPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState<string>("todas");

  // Verificar acceso
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const fetchEncomiendas = async () => {
    try {
      const response = await fetch(`/api/encomiendas?residenteId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setEncomiendas(data.encomiendas || []);
      }
    } catch (error) {
      console.error('Error fetching encomiendas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar encomiendas
  useEffect(() => {
    if (user) {
      fetchEncomiendas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filtrar encomiendas
  const filteredEncomiendas = encomiendas.filter(e => {
    if (filterEstado === 'todas') return true;
    return e.estado === filterEstado;
  });

  const pendientes = encomiendas.filter(e => e.estado === 'pendiente');
  const retiradas = encomiendas.filter(e => e.estado === 'retirada');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isQRValid = (tokenQR?: Encomienda['tokenQR']) => {
    if (!tokenQR || tokenQR.usado) return false;
    return new Date(tokenQR.expiracion) > new Date();
  };

  return (
    <RoleGuard allowedRoles={['residente']} redirectTo="/">
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mis encomiendas</h1>
        <p className="mt-1 text-muted-foreground">
          Revisa tus paquetes pendientes y genera códigos QR para retirarlos
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{encomiendas.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendientes.length}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{retiradas.length}</p>
                <p className="text-sm text-muted-foreground">Retiradas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending */}
      {pendientes.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Tienes {pendientes.length} encomienda{pendientes.length > 1 ? 's' : ''} por retirar</p>
              <p className="text-sm text-muted-foreground">
                Genera un código QR y preséntalo en conserjería para retirar tus paquetes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button 
          variant={filterEstado === 'todas' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterEstado('todas')}
        >
          Todas
        </Button>
        <Button 
          variant={filterEstado === 'pendiente' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterEstado('pendiente')}
        >
          <Clock className="mr-1 h-3 w-3" />
          Pendientes
        </Button>
        <Button 
          variant={filterEstado === 'retirada' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterEstado('retirada')}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Retiradas
        </Button>
      </div>

      {/* Encomiendas list */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">
          Cargando encomiendas...
        </div>
      ) : filteredEncomiendas.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <PackageOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No hay encomiendas</h3>
            <p className="mt-1 text-muted-foreground">
              {filterEstado === 'todas' 
                ? 'Aún no tienes encomiendas registradas.' 
                : `No tienes encomiendas ${filterEstado === 'pendiente' ? 'pendientes' : 'retiradas'}.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEncomiendas.map((encomienda) => (
            <Card 
              key={encomienda.id} 
              className={`border-border/50 transition-colors hover:border-border ${
                encomienda.estado === 'pendiente' ? 'ring-1 ring-warning/30' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      #{encomienda.codigo}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      {encomienda.transportista}
                    </CardDescription>
                  </div>
                  {encomienda.estado === 'pendiente' ? (
                    <Badge tone="warning">
                      <Clock className="mr-1 h-3 w-3" />
                      Pendiente
                    </Badge>
                  ) : (
                    <Badge tone="success">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Retirada
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {encomienda.descripcion && (
                  <p className="text-sm text-muted-foreground">{encomienda.descripcion}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Recibido: {formatDate(encomienda.fechaRecepcion)}</span>
                  </div>
                  {encomienda.fechaEntrega && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span>Entregado: {formatDate(encomienda.fechaEntrega)}</span>
                    </div>
                  )}
                </div>

                {encomienda.estado === 'pendiente' && (
                  <div className="border-t border-border/50 pt-4">
                    {isQRValid(encomienda.tokenQR) ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                          <p className="text-sm font-medium text-success">QR activo</p>
                          <p className="text-xs text-muted-foreground">
                            Expira: {formatDate(encomienda.tokenQR!.expiracion)}
                          </p>
                        </div>
                        <Link href={`/qr/mi-qr/${encomienda.id}`}>
                          <Button className="w-full">
                            <QrCode className="mr-2 h-4 w-4" />
                            Ver código QR
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href={`/qr/mi-qr/${encomienda.id}`}>
                        <Button className="w-full">
                          <QrCode className="mr-2 h-4 w-4" />
                          Generar QR para retiro
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
