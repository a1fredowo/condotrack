"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/role-guard";
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
  QrCode, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Package,
  Clock,
  CameraOff
} from "lucide-react";

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

export default function QRScannerPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [recentValidations, setRecentValidations] = useState<ValidationResult[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);

  // Verificar permisos
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.rol !== 'admin' && user?.rol !== 'conserje'))) {
      // Redirigir si no tiene permisos
    }
  }, [isAuthenticated, user, authLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const validateToken = useCallback(async (token: string) => {
    if (!token || isValidating) return;

    // Extraer token de URL si es necesario
    let cleanToken = token;
    if (token.includes('token=')) {
      const url = new URL(token);
      cleanToken = url.searchParams.get('token') || token;
    }

    setIsValidating(true);
    setResult(null);

    try {
      const response = await fetch('/api/qr/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });

      const data = await response.json();

      const validationResult: ValidationResult = {
        success: response.ok && data.success,
        message: data.message || data.error || 'Error desconocido',
        encomienda: data.encomienda,
      };

      setResult(validationResult);

      if (validationResult.success) {
        setRecentValidations(prev => [validationResult, ...prev.slice(0, 4)]);
        stopScanner();
      }
    } catch {
      setResult({
        success: false,
        message: 'Error de conexión al servidor',
      });
    } finally {
      setIsValidating(false);
      setManualToken("");
    }
  }, [isValidating]);

  const startScanner = async () => {
    setCameraError(null);
    
    try {
      // Import html5-qrcode dynamically
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (!scannerRef.current) return;
      
      const scannerId = 'qr-scanner-region';
      
      // Create scanner element if not exists
      if (!document.getElementById(scannerId)) {
        const scannerElement = document.createElement('div');
        scannerElement.id = scannerId;
        scannerRef.current.appendChild(scannerElement);
      }
      
      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR escaneado exitosamente
          validateToken(decodedText);
        },
        () => {
          // Error de escaneo (ignorar, es normal mientras busca)
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error al iniciar scanner:", error);
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current as { stop: () => Promise<void>; clear: () => void };
        await scanner.stop();
        scanner.clear();
        html5QrCodeRef.current = null;
      }
    } catch (error) {
      console.error("Error al detener scanner:", error);
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      validateToken(manualToken.trim());
    }
  };

  const resetResult = () => {
    setResult(null);
  };

  return (
    <RoleGuard allowedRoles={['admin', 'conserje']} redirectTo="/">
      <div className="space-y-10">
        <PageHeader
          title="Escáner QR"
          description="Valida la entrega de encomiendas escaneando el código QR del residente."
        />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Scanner Section */}
        <Card className="border border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear código
            </CardTitle>
            <CardDescription>
              Usa la cámara para escanear el QR del residente o ingresa el código manualmente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera View */}
            <div 
              ref={scannerRef}
              className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/60 bg-black"
            >
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground z-10 bg-black">
                  {cameraError ? (
                    <>
                      <CameraOff className="h-16 w-16 opacity-50" />
                      <p className="text-sm text-destructive text-center px-4">{cameraError}</p>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-16 w-16 opacity-50" />
                      <p className="text-sm">Presiona el botón para iniciar el escáner</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-3">
              {isScanning ? (
                <Button onClick={stopScanner} variant="outline" className="flex-1">
                  <XCircle className="mr-2 h-4 w-4" />
                  Detener
                </Button>
              ) : (
                <Button onClick={startScanner} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Iniciar cámara
                </Button>
              )}
            </div>

            {/* Manual Input */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o ingresa manualmente</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Código o token del QR"
                className="h-11 flex-1 rounded-[var(--radius-sm)] border border-border/70 bg-card/80 px-4 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30"
              />
              <Button type="submit" disabled={isValidating || !manualToken.trim()}>
                {isValidating ? "Validando..." : "Validar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          {/* Current Result */}
          {result && (
            <Card className={`border-2 ${result.success ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  {result.success ? (
                    <CheckCircle2 className="h-16 w-16 text-success" />
                  ) : (
                    <XCircle className="h-16 w-16 text-destructive" />
                  )}
                  
                  <div>
                    <h3 className={`text-xl font-bold ${result.success ? 'text-success' : 'text-destructive'}`}>
                      {result.success ? '¡Entrega confirmada!' : 'Validación fallida'}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
                  </div>

                  {result.encomienda && (
                    <div className="w-full rounded-lg border border-border/50 bg-card/50 p-4 text-left">
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
                      </div>
                    </div>
                  )}

                  <Button onClick={resetResult} variant="outline" className="mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Escanear otro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Validations */}
          <Card className="border border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Validaciones recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentValidations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Las validaciones exitosas aparecerán aquí
                </p>
              ) : (
                <div className="space-y-3">
                  {recentValidations.map((validation, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                    >
                      <div className="rounded-full bg-success/20 p-2">
                        <Package className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {validation.encomienda?.residenteNombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {validation.encomienda?.codigo} · {validation.encomienda?.transportista}
                        </p>
                      </div>
                      <Badge tone="success">Entregado</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  Solicita al residente que muestre su código QR
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  Escanea el código con la cámara o ingresa el token manualmente
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  Verifica que los datos correspondan al residente
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  Entrega la encomienda tras la confirmación exitosa
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </RoleGuard>
  );
}
