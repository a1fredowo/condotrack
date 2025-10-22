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

// QR más realista simulando un código de validación
const qrMatrix: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
  [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0],
];

export default function QRPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Validación con código QR"
        description="Sistema de verificación segura para retiro de encomiendas."
        actions={
          <>
            <Button variant="outline">Regenerar código</Button>
            <Button>Confirmar entrega</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>Código de validación</CardTitle>
            <CardDescription>
              Presenta este código al conserje para retirar tu encomienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mx-auto flex max-w-[300px] flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-border/70 bg-card/80 p-6 shadow-inner shadow-primary/10">
              <div className="grid grid-cols-21 gap-0.5 rounded-[var(--radius-sm)] bg-white p-4 shadow-sm">
                {qrMatrix.flatMap((row, i) =>
                  row.map((cell, j) => (
                    <span
                      key={`${i}-${j}`}
                      className={cell ? "h-3 w-3 bg-black" : "h-3 w-3 bg-white"}
                    />
                  )),
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Escanea este código en conserjería
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/60 bg-muted/40 p-4 text-sm text-card-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado del retiro</span>
                <Badge tone="info">Pendiente</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Última actualización: 22 oct 2025 · 14:30 hrs
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border/50 bg-card/70 p-3 text-xs text-muted-foreground">
                Código de seguridad: <span className="font-mono text-sm text-card-foreground">CT-8745-QR</span>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-amber-500/50 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Este código expira en 8 minutos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Proceso de retiro</CardTitle>
            <CardDescription>
              Pasos para completar el retiro de tu encomienda de forma segura.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm">
            <ol className="space-y-4">
              {[
                {
                  title: "Muestra el código QR",
                  detail:
                    "Presenta este código al conserje desde tu dispositivo móvil o impreso.",
                },
                {
                  title: "Verificación del conserje",
                  detail:
                    "El conserje escaneará el código para validar la autenticidad del retiro.",
                },
                {
                  title: "Confirmación inmediata",
                  detail:
                    "El sistema verifica la información y actualiza el estado a 'Entregado'.",
                },
                {
                  title: "Notificación de entrega",
                  detail:
                    "Recibirás una confirmación instantánea del retiro exitoso.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm shadow-primary/20">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-card-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>Características de seguridad</CardTitle>
          <CardDescription>
            Medidas a implementar para garantizar la seguridad del proceso.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Códigos de un solo uso",
              description: "Cada QR es único y expira automáticamente después de 10 minutos o su uso.",
            },
            {
              title: "Validación cruzada",
              description:
                "El sistema verifica múltiples datos de seguridad antes de autorizar el retiro.",
            },
            {
              title: "Registro completo",
              description:
                "Cada transacción queda registrada con fecha, hora y usuario que realizó la entrega.",
            },
          ].map((scenario) => (
            <div
              key={scenario.title}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border/50 bg-muted/40 p-4 text-sm"
            >
              <p className="font-semibold text-card-foreground">{scenario.title}</p>
              <p className="text-xs text-muted-foreground">{scenario.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
