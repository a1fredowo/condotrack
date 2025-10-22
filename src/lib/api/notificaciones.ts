/**
 * API de Notificaciones para CondoTrack
 * Gestiona las notificaciones enviadas a los residentes sobre sus encomiendas
 */

import { supabase } from '../supabase';

export type NotificacionConDatos = {
  id: string;
  encomiendaId: string;
  medio: string;
  mensaje: string | null;
  entregada: boolean;
  enviadoEn: string;
  encomienda?: {
    id: string;
    codigo: string;
    transportista: string;
    fechaRecepcion: string;
    residente?: {
      id: string;
      nombre: string;
      email: string;
      departamento?: {
        id: number;
        numero: string;
        torre: string;
      };
    };
  };
};

/**
 * Obtiene todas las notificaciones con sus datos relacionados
 */
export async function getNotificaciones(): Promise<NotificacionConDatos[]> {
  const { data, error } = await supabase
    .from('notificaciones')
    .select(`
      *,
      encomienda:encomiendas (
        id,
        codigo,
        transportista,
        fechaRecepcion,
        residente:usuarios (
          id,
          nombre,
          email,
          departamento:departamentos (
            id,
            numero,
            torre
          )
        )
      )
    `)
    .order('enviadoEn', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }

  return data || [];
}

/**
 * Envía un correo de prueba a una dirección específica
 */
export async function enviarNotificacionPrueba(email: string): Promise<void> {
  const response = await fetch('/api/notificaciones/enviar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al enviar correo de prueba');
  }

  return response.json();
}

/**
 * Crea una notificación para una encomienda específica
 */
export async function crearNotificacion(
  encomiendaId: string,
  medio: 'correo' | 'app' | 'sms',
  mensaje?: string
): Promise<NotificacionConDatos> {
  const { data, error } = await supabase
    .from('notificaciones')
    .insert({
      encomiendaId,
      medio,
      mensaje: mensaje || `Nueva encomienda recibida`,
      entregada: false,
    })
    .select(`
      *,
      encomienda:encomiendas (
        id,
        codigo,
        transportista,
        fechaRecepcion,
        residente:usuarios (
          id,
          nombre,
          email,
          departamento:departamentos (
            id,
            numero,
            torre
          )
        )
      )
    `)
    .single();

  if (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }

  return data;
}

/**
 * Marca una notificación como entregada
 */
export async function marcarNotificacionEntregada(
  notificacionId: string
): Promise<void> {
  const { error } = await supabase
    .from('notificaciones')
    .update({ entregada: true })
    .eq('id', notificacionId);

  if (error) {
    console.error('Error al marcar notificación como entregada:', error);
    throw error;
  }
}

/**
 * Obtiene las notificaciones de una encomienda específica
 */
export async function getNotificacionesPorEncomienda(
  encomiendaId: string
): Promise<NotificacionConDatos[]> {
  const { data, error } = await supabase
    .from('notificaciones')
    .select(`
      *,
      encomienda:encomiendas (
        id,
        codigo,
        transportista,
        fechaRecepcion,
        residente:usuarios (
          id,
          nombre,
          email,
          departamento:departamentos (
            id,
            numero,
            torre
          )
        )
      )
    `)
    .eq('encomiendaId', encomiendaId)
    .order('enviadoEn', { ascending: false });

  if (error) {
    console.error('Error al obtener notificaciones de encomienda:', error);
    throw error;
  }

  return data || [];
}
