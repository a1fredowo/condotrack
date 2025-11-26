"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, QrCode, LogIn, Package, Loader2 } from "lucide-react";
import Link from "next/link";

interface ValidationResult {
  success: boolean;
  message: string;
  encomienda?: {
    id: string;
    codigo: string;
    residenteNombre: string;
    transportista: string;
    fechaRecepcion: string;
    estado: string;
  };
}

function ValidarQRContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const token = searchParams.get('token');
  
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const canValidate = isAuthenticated && (user?.rol === 'admin' || user?.rol === 'conserje');

  const handleValidate = async () => {
    if (!token || isValidating || !canValidate) return;

    setIsValidating(true);

    try {
      const response = await fetch('/api/qr/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      setResult({
        success: response.ok && data.success,
        message: data.message || data.error || 'Error desconocido',
        encomienda: data.encomienda,
      });
    } catch {
      setResult({
        success: false,
        message: 'Error de conexión al servidor',
      });
    } finally {
      setIsValidating(false);
      setHasValidated(true);
    }
  };

  // Si no hay token
  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border border-destructive/30 bg-destructive/5">
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            <h2 className="text-xl font-bold text-destructive">Token inválido</h2>
            <p className="mt-2 text-muted-foreground">
              No se proporcionó un código QR válido.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-6">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border border-border/70">
          <CardContent className="py-12 text-center">
            <QrCode className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="text-xl font-bold">Código QR detectado</h2>
            <p className="mt-2 text-muted-foreground">
              Para validar esta entrega, debes iniciar sesión como conserje o administrador.
            </p>
            <Link href="/auth/login">
              <Button className="mt-6">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no tiene permisos
  if (!canValidate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border border-warning/30 bg-warning/5">
          <CardContent className="py-12 text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-warning" />
            <h2 className="text-xl font-bold text-warning">Sin permisos</h2>
            <p className="mt-2 text-muted-foreground">
              Solo los conserjes y administradores pueden validar entregas.
            </p>
            <Link href="/">
              <Button variant="outline" className="mt-6">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de validación
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border border-border/70">
        {!hasValidated ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4">
                <QrCode className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Validar entrega</CardTitle>
              <CardDescription>
                Se ha escaneado un código QR de entrega. Confirma para procesar la entrega.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Token
                </p>
                <p className="mt-1 truncate font-mono text-sm">{token.substring(0, 32)}...</p>
              </div>
              
              <Button 
                onClick={handleValidate} 
                disabled={isValidating} 
                className="w-full h-12"
              >
                {isValidating ? "Validando..." : "Confirmar entrega"}
              </Button>
              
              <Link href="/qr/scanner" className="block">
                <Button variant="outline" className="w-full">
                  Volver al escáner
                </Button>
              </Link>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              {result?.success ? (
                <CheckCircle2 className="h-20 w-20 text-success" />
              ) : (
                <XCircle className="h-20 w-20 text-destructive" />
              )}
              
              <div>
                <h3 className={`text-2xl font-bold ${result?.success ? 'text-success' : 'text-destructive'}`}>
                  {result?.success ? '¡Entrega confirmada!' : 'Error'}
                </h3>
                <p className="mt-2 text-muted-foreground">{result?.message}</p>
              </div>

              {result?.encomienda && (
                <div className="w-full rounded-lg border border-success/30 bg-success/5 p-4 text-left">
                  <div className="mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-success" />
                    <span className="font-semibold text-success">Detalles de la entrega</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Residente:</span>
                      <span className="font-medium">{result.encomienda.residenteNombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-mono">{result.encomienda.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transportista:</span>
                      <span>{result.encomienda.transportista}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <Badge tone="success">{result.encomienda.estado}</Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex w-full gap-3 pt-4">
                <Link href="/qr/scanner" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Escanear otro
                  </Button>
                </Link>
                <Link href="/encomiendas" className="flex-1">
                  <Button className="w-full">
                    Ver encomiendas
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border border-border/70">
        <CardContent className="py-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ValidarQRPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ValidarQRContent />
    </Suspense>
  );
}
