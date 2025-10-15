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

const qrMatrix: number[][] = [
  [1, 1, 1, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 1],
  [0, 1, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0],
  [1, 1, 0, 0, 1, 1, 1, 1],
];

export default function QRPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Validación con código QR"
        description="Vista demo para que el residente confirme la entrega y el conserje valide el retiro."
        actions={
          <>
            <Button variant="outline">Reenviar QR</Button>
            <Button>Confirmar entrega</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>QR dinámico</CardTitle>
            <CardDescription>
              Código simulado para la demostración. El QR final será generado por backend en Sprint
              3.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-6">
            <div className="mx-auto flex max-w-[260px] flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-border/70 bg-card/80 p-6 shadow-inner shadow-primary/10">
              <div className="grid grid-cols-8 gap-1 rounded-[var(--radius-sm)] bg-card p-3 shadow-sm">
                {qrMatrix.flatMap((row, i) =>
                  row.map((cell, j) => (
                    <span
                      key={`${i}-${j}`}
                      className={cell ? "h-5 w-5 bg-foreground" : "h-5 w-5 bg-card"}
                    />
                  )),
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Escanea este código en conserjería para confirmar el retiro.
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/60 bg-muted/40 p-4 text-sm text-card-foreground">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado del retiro</span>
                <Badge tone="info">Pendiente</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Última actualización: 07 mar 2025 · 11:05 hrs
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border/50 bg-card/70 p-3 text-xs text-muted-foreground">
                Código de seguridad: <span className="font-mono text-sm text-card-foreground">8745-QR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Pasos para validar</CardTitle>
            <CardDescription>
              Guía del proceso que seguirá el residente y el conserje durante el retiro.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm">
            <ol className="space-y-4">
              {[
                {
                  title: "Residente abre la app",
                  detail:
                    "Selecciona la encomienda pendiente y presiona “Mostrar QR”. El código se genera con vencimiento breve.",
                },
                {
                  title: "Conserje escanea el código",
                  detail:
                    "Desde el panel del conserje se habilita la cámara o un lector externo para validar el QR.",
                },
                {
                  title: "Validación cruzada",
                  detail:
                    "El sistema verifica coincidencia con el código de seguridad y marca el estado como entregado.",
                },
                {
                  title: "Registro instantáneo",
                  detail:
                    "El historial se actualiza en dashboard y se envía confirmación al residente.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm shadow-primary/20">
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
          <CardTitle>Escenarios contemplados</CardTitle>
          <CardDescription>
            Reglas de negocio a considerar cuando se integre el backend y autenticación.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Expiración automática",
              description: "Cada QR tendrá un tiempo de vida de 10 minutos para mayor seguridad.",
            },
            {
              title: "Delegación autorizada",
              description:
                "Los residentes podrán delegar el retiro compartiendo un código temporal adicional.",
            },
            {
              title: "Bitácora de evidencias",
              description:
                "Se adjuntará foto opcional del retiro para cerrar incidencias sin fricción.",
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
