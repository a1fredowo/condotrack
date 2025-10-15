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
import { notifications } from "@/data/mock-data";

const channelsLabel: Record<"correo" | "app" | "sms", string> = {
  correo: "Correo",
  app: "App CondoTrack",
  sms: "SMS",
};

const channelColor: Record<"correo" | "app" | "sms", string> = {
  correo: "bg-primary/10 text-primary",
  app: "bg-accent/15 text-accent",
  sms: "bg-warning/15 text-warning",
};

export default function NotificacionesPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Centro de notificaciones"
        description="Visualiza cómo CondoTrack comunica a los residentes cada etapa del proceso."
        actions={
          <>
            <Button variant="outline">Configurar canales</Button>
            <Button>Enviar recordatorio</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="border border-border/70 bg-card/85">
          <CardHeader>
            <CardTitle>Historial reciente</CardTitle>
            <CardDescription>
              Mensajes simulados según las historias de usuario del Sprint 1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-border/60 bg-card/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-card-foreground">
                    {item.residente}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.departamento}</p>
                  <p className="text-sm text-muted-foreground/90">{item.mensaje}</p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <span className="text-xs text-muted-foreground">{item.enviadaEl}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${channelColor[item.canal]}`}
                  >
                    {channelsLabel[item.canal]}
                  </span>
                  <Badge tone={item.entregada ? "success" : "info"}>
                    {item.entregada ? "Entregada" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle>Flujo de comunicación</CardTitle>
            <CardDescription>
              Pasos que seguirá el residente cuando reciba una nueva encomienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4 text-sm">
            <ol className="space-y-4">
              {[
                {
                  title: "Recepción en conserjería",
                  caption:
                    "El sistema genera la notificación automática con la información del paquete.",
                },
                {
                  title: "Recordatorio inteligente",
                  caption: "Si el residente no confirma, se agenda un recordatorio por SMS.",
                },
                {
                  title: "Validación de retiro",
                  caption:
                    "El residente presenta el QR desde la app. El conserje confirma el retiro.",
                },
                {
                  title: "Encuesta opcional",
                  caption: "Se habilita un feedback rápido para detectar incidencias.",
                },
              ].map((step, index) => (
                <li key={step.title} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-sm font-semibold text-primary shadow-sm shadow-primary/20">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-card-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.caption}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border/80 bg-card/90">
        <CardHeader>
          <CardTitle>Plantillas preconfiguradas</CardTitle>
          <CardDescription>
            Ejemplos para personalizar mensajes desde el panel administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Nuevo paquete recibido",
              body:
                "Hola {{nombre}}, tu encomienda de {{transportista}} llegó a las {{hora}}. Retírala en conserjería presentando tu QR.",
            },
            {
              title: "Recordatorio automático",
              body:
                "Hola {{nombre}}, tu paquete sigue pendiente. Recuerda que puedes autorizar a un tercero con el QR compartido.",
            },
            {
              title: "Incidencia reportada",
              body:
                "Hola {{nombre}}, tu paquete presenta una incidencia. Escríbenos respondiendo este mensaje o contacta a la administración.",
            },
            {
              title: "Confirmación de entrega",
              body:
                "¡Gracias, {{nombre}}! Se registró el retiro de tu encomienda. Si hubo novedades, cuéntanos respondiendo este mensaje.",
            },
          ].map((template) => (
            <div
              key={template.title}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border/50 bg-muted/40 p-4"
            >
              <p className="text-sm font-semibold text-card-foreground">{template.title}</p>
              <p className="text-xs text-muted-foreground">{template.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
