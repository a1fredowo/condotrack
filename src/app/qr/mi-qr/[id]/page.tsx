"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, Package, Truck, Clock, RefreshCw, 
  ArrowLeft, CheckCircle2, AlertTriangle 
} from "lucide-react";
import Link from "next/link";

interface QRData {
  qrDataUrl: string;
  token: string;
  expiraEn: string;
}

interface Encomienda {
  id: string;
  codigo: string;
  transportista: string;
  estado: string;
  fechaRecepcion: string;
}

export default function MiQRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: encomiendaId } = use(params);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [encomienda, setEncomienda] = useState<Encomienda | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Cargar datos de la encomienda
  useEffect(() => {
    if (user && encomiendaId) {
      fetchEncomienda();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, encomiendaId]);

  // Timer para el QR
  useEffect(() => {
    if (!qrData?.expiraEn) return;
    
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(qrData.expiraEn).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) {
        setQrData(null);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [qrData?.expiraEn]);

  const fetchEncomienda = async () => {
    try {
      const response = await fetch(`/api/encomiendas?residenteId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        const enc = data.encomiendas?.find((e: Encomienda) => e.id === encomiendaId);
        
        if (enc) {
          setEncomienda(enc);
          
          // Si ya tiene QR activo, cargarlo
          if (enc.tokenQR && !enc.tokenQR.usado) {
            await generateQR();
          }
        } else {
          setError('Encomienda no encontrada');
        }
      }
    } catch {
      setError('Error al cargar la encomienda');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQR = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/qr/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encomiendaId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setQrData({
          qrDataUrl: data.qrDataUrl,
          token: data.token,
          expiraEn: data.expiraEn,
        });
      } else {
        setError(data.error || 'Error al generar QR');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <QrCode className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !encomienda) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-destructive/30 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">{error}</h2>
            <Link href="/mis-encomiendas">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a mis encomiendas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['residente']} redirectTo="/">
      <div className="mx-auto max-w-lg space-y-6">
      {/* Back button */}
      <Link href="/mis-encomiendas">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis encomiendas
        </Button>
      </Link>

      {/* Encomienda info */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                #{encomienda?.codigo}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1">
                <Truck className="h-3 w-3" />
                {encomienda?.transportista}
              </CardDescription>
            </div>
            <Badge tone={encomienda?.estado === 'pendiente' ? 'warning' : 'success'}>
              {encomienda?.estado === 'pendiente' ? (
                <><Clock className="mr-1 h-3 w-3" />Pendiente</>
              ) : (
                <><CheckCircle2 className="mr-1 h-3 w-3" />Entregado</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recibido: {encomienda && formatDate(encomienda.fechaRecepcion)}
          </p>
        </CardContent>
      </Card>

      {/* QR Card */}
      {encomienda?.estado === 'pendiente' ? (
        <Card className="border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Código QR para retiro
            </CardTitle>
            <CardDescription>
              Muestra este código en conserjería para retirar tu encomienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrData ? (
              <>
                {/* QR Image */}
                <div className="flex justify-center">
                  <div className="rounded-xl border-4 border-primary/20 bg-white p-4 shadow-lg">
                    <img 
                      src={qrData.qrDataUrl} 
                      alt="Código QR" 
                      className="h-64 w-64"
                    />
                  </div>
                </div>

                {/* Timer */}
                <div className={`rounded-lg p-4 text-center ${
                  timeLeft < 60 ? 'bg-destructive/10 border border-destructive/30' : 
                  timeLeft < 300 ? 'bg-warning/10 border border-warning/30' : 
                  'bg-success/10 border border-success/30'
                }`}>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo restante</p>
                  <p className={`text-3xl font-bold ${
                    timeLeft < 60 ? 'text-destructive' : 
                    timeLeft < 300 ? 'text-warning' : 
                    'text-success'
                  }`}>
                    {formatTime(timeLeft)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expira: {formatDate(qrData.expiraEn)}
                  </p>
                </div>

                {/* Regenerate button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={generateQR}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Regenerando...' : 'Generar nuevo código'}
                </Button>
              </>
            ) : (
              <div className="text-center">
                {error && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <div className="mb-6 rounded-full bg-muted/50 p-8 inline-block">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
                
                <p className="mb-6 text-muted-foreground">
                  Genera un código QR para retirar esta encomienda en conserjería.
                </p>
                
                <Button 
                  className="w-full h-12"
                  onClick={generateQR}
                  disabled={isGenerating}
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  {isGenerating ? 'Generando...' : 'Generar código QR'}
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-lg bg-muted/30 p-4">
              <h4 className="font-medium mb-2">📋 Instrucciones</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Muestra este código QR al conserje</li>
                <li>El conserje escaneará el código</li>
                <li>Se confirmará la entrega automáticamente</li>
                <li>¡Listo! Retira tu paquete</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
            <h2 className="text-xl font-bold text-success">Encomienda entregada</h2>
            <p className="mt-2 text-muted-foreground">
              Esta encomienda ya fue retirada exitosamente.
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </RoleGuard>
  );
}
