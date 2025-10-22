"use client";

import { useState, useMemo, useEffect } from "react";
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
  getEncomiendas, 
  addEncomienda, 
  type EncomiendaConDatos,
  type EstadoEncomienda 
} from "@/lib/api/encomiendas";
import { RegisterShipmentForm } from "@/components/forms/register-shipment-form";

const inputClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border/70 bg-card/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30";

const statusTone: Record<EstadoEncomienda, "info" | "success" | "warning"> = {
  pendiente: "info",
  entregado: "success",
  incidencia: "warning",
};

/**
 * Formatea una fecha ISO a formato legible español
 */
function formatearFecha(isoDate: string): { fecha: string; hora: string } {
  const date = new Date(isoDate);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = meses[date.getMonth()];
  const año = date.getFullYear();
  
  const horas = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");
  
  return {
    fecha: `${dia} ${mes} ${año}`,
    hora: `${horas}:${minutos}`,
  };
}

export default function EncomiendasPage() {
  const [shipments, setShipments] = useState<EncomiendaConDatos[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    departamento: "",
    transportista: "todos",
    estado: "todos",
    fecha: "",
  });

  // Cargar encomiendas al montar el componente
  useEffect(() => {
    cargarEncomiendas();
  }, []);

  // Función para cargar encomiendas desde Supabase
  const cargarEncomiendas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEncomiendas();
      setShipments(data);
    } catch (err) {
      console.error('Error al cargar encomiendas:', err);
      setError('Error al cargar las encomiendas. Por favor, verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para filtrar las encomiendas
  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      // Filtro por departamento (busca en número y torre)
      if (filters.departamento) {
        const deptNumero = shipment.residente?.departamento?.numero || '';
        const deptTorre = shipment.residente?.departamento?.torre || '';
        const searchTerm = filters.departamento.toLowerCase();
        
        if (!deptNumero.includes(searchTerm) && !deptTorre.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }
      
      // Filtro por transportista
      if (filters.transportista !== "todos" && shipment.transportista !== filters.transportista) {
        return false;
      }
      
      // Filtro por estado
      if (filters.estado !== "todos" && shipment.estado !== filters.estado) {
        return false;
      }
      
      // Filtro por fecha
      if (filters.fecha) {
        const shipmentDate = new Date(shipment.fechaRecepcion).toISOString().split('T')[0];
        if (shipmentDate !== filters.fecha) {
          return false;
        }
      }
      
      return true;
    });
  }, [shipments, filters]);

  // Función para exportar a CSV
  const exportToCSV = () => {
    const headers = ["ID", "Residente", "Departamento", "Transportista", "Fecha Recepción", "Hora", "Estado", "Código Seguimiento"];
    const csvData = filteredShipments.map(item => {
      const { fecha, hora } = formatearFecha(item.fechaRecepcion);
      const deptInfo = item.residente?.departamento 
        ? `Torre ${item.residente.departamento.torre} · ${item.residente.departamento.numero}`
        : 'N/A';
      
      return [
        item.id,
        item.residenteNombre || item.residente?.nombre || 'Desconocido',
        deptInfo,
        item.transportista,
        fecha,
        hora,
        item.estado,
        item.codigo
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `encomiendas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddShipment = async (data: {
    residente: string;
    departamento: string;
    transportista: string;
    codigoSeguimiento: string;
    prioridad: "normal" | "urgente";
  }) => {
    try {
      await addEncomienda({
        codigo: data.codigoSeguimiento || `ENV-${Date.now()}`,
        transportista: data.transportista,
        residenteNombre: data.residente,
        departamento: data.departamento,
        prioridad: data.prioridad,
      });
      
      // Recargar encomiendas
      await cargarEncomiendas();
      setShowForm(false);
    } catch (err) {
      console.error('Error al registrar encomienda:', err);
      throw new Error('Error al registrar la encomienda. Por favor, intenta de nuevo.');
    }
  };

  const upcoming = shipments.filter((item) => item.estado === "pendiente").slice(0, 3);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Panel del conserje"
        description="Registra y controla las encomiendas recibidas en cada torre. Filtra por departamento, transportista o estado."
        actions={
          <>
            <Button variant="outline" onClick={exportToCSV}>Exportar CSV</Button>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "Registrar encomienda"}
            </Button>
          </>
        }
      />

      {showForm && (
        <RegisterShipmentForm
          onSubmit={handleAddShipment}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card className="border border-border/70 bg-card/85">
        <CardHeader>
          <CardTitle>Filtros rápidos</CardTitle>
          <CardDescription>Busca encomiendas por diferentes criterios.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Departamento
            <input 
              className={inputClass} 
              placeholder="Ej: Torre B · 304"
              value={filters.departamento}
              onChange={(e) => setFilters({ ...filters, departamento: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Transportista
            <select 
              className={inputClass}
              value={filters.transportista}
              onChange={(e) => setFilters({ ...filters, transportista: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="Chilexpress">Chilexpress</option>
              <option value="Starken">Starken</option>
              <option value="Blue Express">Blue Express</option>
              <option value="Correos de Chile">Correos de Chile</option>
              <option value="Rappi">Rappi</option>
              <option value="PedidosYa">PedidosYa</option>
              <option value="Uber Eats">Uber Eats</option>
              <option value="Otro">Otro</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Estado
            <select 
              className={inputClass}
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="entregado">Entregado</option>
              <option value="incidencia">Incidencia</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-medium text-muted-foreground">
            Fecha recepción
            <input 
              type="date" 
              className={inputClass}
              value={filters.fecha}
              onChange={(e) => setFilters({ ...filters, fecha: e.target.value })}
            />
          </label>
        </CardContent>
      </Card>

      <Card className="border border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle>Registro de encomiendas ({filteredShipments.length})</CardTitle>
          <CardDescription>
            Historial completo de paquetes recibidos con trazabilidad en tiempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden rounded-[var(--radius-md)] border border-border/60">
          <div className="hidden grid-cols-[120px_1.4fr_1fr_1fr_110px_120px] gap-6 bg-muted/60 px-5 py-3 text-xs font-medium text-muted-foreground lg:grid">
            <span>ID</span>
            <span>Residente</span>
            <span>Transportista</span>
            <span>Recepción</span>
            <span>Código</span>
            <span className="text-center">Estado</span>
          </div>
          <div className="divide-y divide-border/50">
            {filteredShipments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                No se encontraron encomiendas con los filtros aplicados.
              </div>
            ) : (
              filteredShipments.map((item) => {
                const { fecha, hora } = formatearFecha(item.fechaRecepcion);
                const deptInfo = item.residente?.departamento 
                  ? `Torre ${item.residente.departamento.torre} · ${item.residente.departamento.numero}`
                  : 'N/A';
                
                return (
                  <div
                    key={item.id}
                    className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[120px_1.4fr_1fr_1fr_110px_120px]"
                  >
                    <span className="font-semibold text-card-foreground">{item.id.substring(0, 8)}</span>
                    <div>
                      <p className="font-medium text-card-foreground">
                        {item.residenteNombre || item.residente?.nombre || 'Desconocido'}
                      </p>
                      <p className="text-xs text-muted-foreground">{deptInfo}</p>
                    </div>
                    <span className="text-muted-foreground">{item.transportista}</span>
                    <div className="text-xs text-muted-foreground">
                      {fecha} · {hora} hrs
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{item.codigo}</span>
                    <div className="flex justify-center">
                      <Badge tone={statusTone[item.estado]} className="capitalize">
                        {item.estado}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Próximos retiros coordinados</CardTitle>
            <CardDescription>Recordatorios automáticos para paquetes pendientes.</CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            <ol className="space-y-4 text-sm">
              {isLoading ? (
                <li className="text-center text-muted-foreground py-4">
                  Cargando...
                </li>
              ) : upcoming.length === 0 ? (
                <li className="text-center text-muted-foreground py-4">
                  No hay encomiendas pendientes
                </li>
              ) : (
                upcoming.map((item, index) => {
                  const deptInfo = item.residente?.departamento 
                    ? `Torre ${item.residente.departamento.torre} · ${item.residente.departamento.numero}`
                    : 'N/A';
                  
                  return (
                    <li key={item.id} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {item.residenteNombre || item.residente?.nombre || 'Desconocido'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deptInfo} · Retiro estimado 18:00 hrs
                        </p>
                      </div>
                      <Badge tone="info" className="ml-auto">
                        Notificado
                      </Badge>
                    </li>
                  );
                })
              )}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incidencias activas</CardTitle>
            <CardDescription>Seguimiento de paquetes en estado especial.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3 text-sm">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-4">
                Cargando...
              </div>
            ) : shipments.filter((item) => item.estado === "incidencia").length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No hay incidencias activas
              </div>
            ) : (
              shipments
                .filter((item) => item.estado === "incidencia")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-warning/30 bg-warning/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-warning">
                        {item.residenteNombre || item.residente?.nombre || 'Desconocido'}
                      </p>
                      <Badge tone="warning">Incidencia</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paquete reportado con daño visible. Se requiere evidencia fotográfica al
                      momento del retiro.
                    </p>
                    <span className="text-xs text-muted-foreground">Caso #{item.id.substring(0, 8)}</span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
