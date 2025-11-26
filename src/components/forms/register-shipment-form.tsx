"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border/70 bg-card/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30 cursor-pointer";

const labelClass = "text-sm font-medium text-card-foreground";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  departamento?: {
    id: number;
    numero: string;
    torre: string;
  } | null;
}

interface RegisterShipmentFormProps {
  onSubmit: (data: {
    residente: string;
    residenteId?: string;
    departamento: string;
    transportista: string;
    codigoSeguimiento: string;
    prioridad: "normal" | "urgente";
  }) => Promise<void> | void;
  onCancel: () => void;
}

export function RegisterShipmentForm({ onSubmit, onCancel }: RegisterShipmentFormProps) {
  const [tipoRegistro, setTipoRegistro] = useState<"registrado" | "nuevo">("registrado");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("");
  
  const [formData, setFormData] = useState({
    residente: "",
    torre: "A",
    numeroDepartamento: "",
    transportista: "Chilexpress",
    transportistaOtra: "",
    codigoSeguimiento: "",
    prioridad: "normal" as "normal" | "urgente",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios registrados (solo residentes)
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const res = await fetch('/api/usuarios?rol=residente');
        if (res.ok) {
          const data = await res.json();
          setUsuarios(data.usuarios || []);
        }
      } catch (err) {
        console.error('Error cargando usuarios:', err);
      } finally {
        setLoadingUsuarios(false);
      }
    };
    cargarUsuarios();
  }, []);

  // Cuando selecciona un usuario registrado, autocompletar datos
  const handleUsuarioSelect = (usuarioId: string) => {
    setSelectedUsuarioId(usuarioId);
    
    if (usuarioId) {
      const usuario = usuarios.find(u => u.id === usuarioId);
      if (usuario) {
        setFormData(prev => ({
          ...prev,
          residente: usuario.nombre,
          torre: usuario.departamento?.torre || "A",
          numeroDepartamento: usuario.departamento?.numero || "",
        }));
      }
    } else {
      // Limpiar si deselecciona
      setFormData(prev => ({
        ...prev,
        residente: "",
        torre: "A",
        numeroDepartamento: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar según tipo de registro
      if (tipoRegistro === "registrado" && !selectedUsuarioId) {
        throw new Error('Debe seleccionar un residente registrado');
      }

      if (tipoRegistro === "nuevo") {
        if (!formData.residente.trim()) {
          throw new Error('El nombre del residente es requerido');
        }
        if (!formData.numeroDepartamento.trim()) {
          throw new Error('El número de departamento es requerido');
        }
      }

      // Construir departamento en formato correcto
      const departamento = `Torre ${formData.torre} · ${formData.numeroDepartamento}`;
      
      // Obtener transportista final
      const transportista = formData.transportista === "Otro" 
        ? formData.transportistaOtra 
        : formData.transportista;

      if (!transportista.trim()) {
        throw new Error('Debe especificar la empresa transportista');
      }

      await onSubmit({
        residente: formData.residente,
        residenteId: tipoRegistro === "registrado" ? selectedUsuarioId : undefined,
        departamento,
        transportista,
        codigoSeguimiento: formData.codigoSeguimiento,
        prioridad: formData.prioridad,
      });
      
      // Reset form
      setFormData({
        residente: "",
        torre: "A",
        numeroDepartamento: "",
        transportista: "Chilexpress",
        transportistaOtra: "",
        codigoSeguimiento: "",
        prioridad: "normal",
      });
      setSelectedUsuarioId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar encomienda');
      console.error('Error al enviar formulario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="border border-primary/20 bg-card/95">
      <CardHeader>
        <CardTitle>Registrar Nueva Encomienda</CardTitle>
        <CardDescription>
          Complete los datos del paquete recibido. Se generará automáticamente un código QR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Selector de tipo de registro */}
          <div className="space-y-3">
            <label className={labelClass}>Tipo de destinatario</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setTipoRegistro("registrado");
                  setSelectedUsuarioId("");
                  setFormData(prev => ({ ...prev, residente: "", torre: "A", numeroDepartamento: "" }));
                }}
                className={`flex-1 rounded-[var(--radius-sm)] border-2 p-4 text-left transition-all cursor-pointer ${
                  tipoRegistro === "registrado"
                    ? "border-primary bg-primary/10"
                    : "border-border/70 hover:border-border"
                }`}
              >
                <div className="font-medium">👤 Residente registrado</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Seleccionar de la lista de usuarios
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoRegistro("nuevo");
                  setSelectedUsuarioId("");
                  setFormData(prev => ({ ...prev, residente: "", torre: "A", numeroDepartamento: "" }));
                }}
                className={`flex-1 rounded-[var(--radius-sm)] border-2 p-4 text-left transition-all cursor-pointer ${
                  tipoRegistro === "nuevo"
                    ? "border-primary bg-primary/10"
                    : "border-border/70 hover:border-border"
                }`}
              >
                <div className="font-medium">📝 Nuevo destinatario</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ingresar datos manualmente
                </div>
              </button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Si es residente registrado, mostrar selector */}
            {tipoRegistro === "registrado" ? (
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="usuarioSelect" className={labelClass}>
                  Seleccionar Residente <span className="text-destructive">*</span>
                </label>
                <select
                  id="usuarioSelect"
                  value={selectedUsuarioId}
                  onChange={(e) => handleUsuarioSelect(e.target.value)}
                  className={inputClass}
                  disabled={loadingUsuarios}
                >
                  <option value="">
                    {loadingUsuarios ? "Cargando residentes..." : "-- Seleccione un residente --"}
                  </option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} {u.departamento ? `(Torre ${u.departamento.torre} - ${u.departamento.numero})` : "(Sin depto)"}
                    </option>
                  ))}
                </select>
                {usuarios.length === 0 && !loadingUsuarios && (
                  <p className="text-xs text-warning">
                    ⚠️ No hay residentes registrados. Use la opción &quot;Nuevo destinatario&quot;.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Formulario manual para nuevo destinatario */}
                <div className="space-y-2">
                  <label htmlFor="residente" className={labelClass}>
                    Nombre del Destinatario <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="residente"
                    name="residente"
                    type="text"
                    required
                    value={formData.residente}
                    onChange={handleChange}
                    placeholder="Ej: María González"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="torre" className={labelClass}>
                    Torre <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="torre"
                    name="torre"
                    required
                    value={formData.torre}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="A">Torre A</option>
                    <option value="B">Torre B</option>
                    <option value="C">Torre C</option>
                    <option value="D">Torre D</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="numeroDepartamento" className={labelClass}>
                    Número de Departamento <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="numeroDepartamento"
                    name="numeroDepartamento"
                    type="text"
                    required
                    value={formData.numeroDepartamento}
                    onChange={handleChange}
                    placeholder="Ej: 1205"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* Mostrar datos autocompletados si seleccionó un usuario */}
            {tipoRegistro === "registrado" && selectedUsuarioId && (
              <div className="md:col-span-2 rounded-[var(--radius-sm)] bg-muted/30 border border-border/50 p-4">
                <div className="text-xs text-muted-foreground mb-2">Datos del residente seleccionado:</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <div className="font-medium">{formData.residente || "-"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Torre:</span>
                    <div className="font-medium">{formData.torre || "-"}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Departamento:</span>
                    <div className="font-medium">{formData.numeroDepartamento || "-"}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="transportista" className={labelClass}>
                Empresa Transportista <span className="text-destructive">*</span>
              </label>
              <select
                id="transportista"
                name="transportista"
                required
                value={formData.transportista}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Chilexpress">Chilexpress</option>
                <option value="Starken">Starken</option>
                <option value="Blue Express">Blue Express</option>
                <option value="Correos de Chile">Correos de Chile</option>
                <option value="Rappi">Rappi</option>
                <option value="PedidosYa">PedidosYa</option>
                <option value="Uber Eats">Uber Eats</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {formData.transportista === "Otro" && (
              <div className="space-y-2">
                <label htmlFor="transportistaOtra" className={labelClass}>
                  Especificar Transportista <span className="text-destructive">*</span>
                </label>
                <input
                  id="transportistaOtra"
                  name="transportistaOtra"
                  type="text"
                  required
                  value={formData.transportistaOtra}
                  onChange={handleChange}
                  placeholder="Ej: Envía"
                  className={inputClass}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="codigoSeguimiento" className={labelClass}>
                Código de Seguimiento
              </label>
              <input
                id="codigoSeguimiento"
                name="codigoSeguimiento"
                type="text"
                value={formData.codigoSeguimiento}
                onChange={handleChange}
                placeholder="Ej: CHX998234 (opcional)"
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground">
                📦 Opcional. Se generará automáticamente si no se ingresa.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="prioridad" className={labelClass}>
                Prioridad
              </label>
              <select
                id="prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar Encomienda'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
