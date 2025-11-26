/**
 * API de Logs - CondoTrack
 * Registro de auditoría y logs de entregas
 */

import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export type AccionLog = 
  | 'recepcion' 
  | 'entrega' 
  | 'incidencia' 
  | 'qr_generado' 
  | 'qr_validado'
  | 'notificacion_enviada'
  | 'estado_actualizado';

export interface LogEntrega {
  id: string;
  encomiendaId: string;
  usuarioId: string;
  accion: AccionLog;
  detalles?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  usuario?: {
    nombre: string;
    email: string;
    rol: string;
  };
  encomienda?: {
    codigo: string;
    residenteNombre: string;
  };
}

/**
 * Registra un log de entrega
 */
export async function registrarLog(data: {
  encomiendaId: string;
  usuarioId: string;
  accion: AccionLog;
  detalles?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<boolean> {
  try {
    // Skip if userId is not a valid UUID (like 'sistema')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.usuarioId)) {
      console.log('⚠️ Log omitido: usuarioId no es UUID válido:', data.usuarioId);
      return true; // Return true to not block the flow
    }

    const { error } = await supabase.from('logs_entrega').insert({
      id: crypto.randomUUID(),
      encomiendaId: data.encomiendaId,
      usuarioId: data.usuarioId,
      accion: data.accion,
      detalles: data.detalles ? JSON.stringify(data.detalles) : null,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    if (error) {
      console.error('Error al registrar log:', error);
      return false;
    }

    console.log('📝 Log registrado:', data.accion, 'para encomienda:', data.encomiendaId);
    return true;
  } catch (error) {
    console.error('Error en registrarLog:', error);
    return false;
  }
}

/**
 * Obtiene los logs de una encomienda específica
 */
export async function getLogsEncomienda(encomiendaId: string): Promise<LogEntrega[]> {
  try {
    const { data, error } = await supabase
      .from('logs_entrega')
      .select(`
        *,
        usuario:usuarios (nombre, email, rol)
      `)
      .eq('encomiendaId', encomiendaId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error al obtener logs:', error);
      return [];
    }

    return data as LogEntrega[];
  } catch (error) {
    console.error('Error en getLogsEncomienda:', error);
    return [];
  }
}

/**
 * Obtiene todos los logs con filtros
 */
export async function getLogs(filtros?: {
  accion?: AccionLog;
  usuarioId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
}): Promise<LogEntrega[]> {
  try {
    let query = supabase
      .from('logs_entrega')
      .select(`
        *,
        usuario:usuarios (nombre, email, rol),
        encomienda:encomiendas (codigo, residenteNombre)
      `)
      .order('createdAt', { ascending: false });

    if (filtros?.accion) {
      query = query.eq('accion', filtros.accion);
    }
    if (filtros?.usuarioId) {
      query = query.eq('usuarioId', filtros.usuarioId);
    }
    if (filtros?.fechaInicio) {
      query = query.gte('createdAt', filtros.fechaInicio);
    }
    if (filtros?.fechaFin) {
      query = query.lte('createdAt', filtros.fechaFin);
    }
    if (filtros?.limite) {
      query = query.limit(filtros.limite);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener logs:', error);
      return [];
    }

    return data as LogEntrega[];
  } catch (error) {
    console.error('Error en getLogs:', error);
    return [];
  }
}

/**
 * Obtiene estadísticas de logs para el dashboard
 */
export async function getEstadisticasLogs(): Promise<{
  totalHoy: number;
  entregasHoy: number;
  qrValidadosHoy: number;
  incidenciasHoy: number;
}> {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('logs_entrega')
      .select('accion')
      .gte('createdAt', hoy.toISOString());

    if (error) {
      console.error('Error al obtener estadísticas de logs:', error);
      return { totalHoy: 0, entregasHoy: 0, qrValidadosHoy: 0, incidenciasHoy: 0 };
    }

    const logs: Array<{ accion: string }> = data || [];

    return {
      totalHoy: logs.length,
      entregasHoy: logs.filter(l => l.accion === 'entrega').length,
      qrValidadosHoy: logs.filter(l => l.accion === 'qr_validado').length,
      incidenciasHoy: logs.filter(l => l.accion === 'incidencia').length,
    };
  } catch (error) {
    console.error('Error en getEstadisticasLogs:', error);
    return { totalHoy: 0, entregasHoy: 0, qrValidadosHoy: 0, incidenciasHoy: 0 };
  }
}

/**
 * Calcula tiempo promedio de entrega
 */
export async function getTiempoPromedioEntrega(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('encomiendas')
      .select('fechaRecepcion, fechaEntrega')
      .eq('estado', 'entregado')
      .not('fechaEntrega', 'is', null);

    if (error || !data || data.length === 0) {
      return '--';
    }

    let totalMinutos = 0;
    let count = 0;

    data.forEach((enc: { fechaRecepcion?: string; fechaEntrega?: string }) => {
      if (enc.fechaRecepcion && enc.fechaEntrega) {
        const recepcion = new Date(enc.fechaRecepcion).getTime();
        const entrega = new Date(enc.fechaEntrega).getTime();
        const diffMinutos = (entrega - recepcion) / (1000 * 60);
        if (diffMinutos > 0 && diffMinutos < 10080) { // Máximo 7 días
          totalMinutos += diffMinutos;
          count++;
        }
      }
    });

    if (count === 0) return '--';

    const promedioMinutos = totalMinutos / count;
    
    if (promedioMinutos < 60) {
      return `${Math.round(promedioMinutos)} min`;
    } else if (promedioMinutos < 1440) {
      const horas = Math.floor(promedioMinutos / 60);
      const mins = Math.round(promedioMinutos % 60);
      return `${horas}h ${mins}min`;
    } else {
      const dias = Math.floor(promedioMinutos / 1440);
      const horas = Math.round((promedioMinutos % 1440) / 60);
      return `${dias}d ${horas}h`;
    }
  } catch (error) {
    console.error('Error en getTiempoPromedioEntrega:', error);
    return '--';
  }
}
