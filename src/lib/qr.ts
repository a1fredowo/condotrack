/**
 * API de QR - CondoTrack
 * Generación y validación de códigos QR para encomiendas
 */

import QRCode from 'qrcode';
import { supabase } from './supabase';
import crypto from 'crypto';

const QR_EXPIRY_MINUTES = 30; // Tiempo de expiración del QR

export interface TokenQR {
  id: string;
  encomiendaId: string;
  token: string;
  usado: boolean;
  expiraEn: string;
  createdAt: string;
}

export interface QRValidationResult {
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

/**
 * Genera un token único para el QR
 */
function generateQRToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Genera un código QR para una encomienda
 */
export async function generarQREncomienda(encomiendaId: string): Promise<{
  qrDataUrl: string;
  token: string;
  expiraEn: string;
} | null> {
  try {
    // Verificar que la encomienda existe y está pendiente
    const { data: encomienda, error: encError } = await supabase
      .from('encomiendas')
      .select('id, estado, codigo')
      .eq('id', encomiendaId)
      .single();

    if (encError || !encomienda) {
      console.error('Encomienda no encontrada:', encomiendaId);
      return null;
    }

    if (encomienda.estado !== 'pendiente') {
      console.error('Encomienda no está pendiente:', encomienda.estado);
      return null;
    }

    // Eliminar tokens anteriores para esta encomienda
    await supabase
      .from('tokens_qr')
      .delete()
      .eq('encomiendaId', encomiendaId);

    // Generar nuevo token
    const token = generateQRToken();
    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + QR_EXPIRY_MINUTES);

    // Guardar token en BD
    const { error: insertError } = await supabase
      .from('tokens_qr')
      .insert({
        id: crypto.randomUUID(),
        encomiendaId,
        token,
        expiraEn: expiraEn.toISOString(),
        usado: false,
      });

    if (insertError) {
      console.error('Error al guardar token QR:', insertError);
      return null;
    }

    // Generar URL de validación
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const validationUrl = `${baseUrl}/qr/validar?token=${token}`;

    // Generar imagen QR
    const qrDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    console.log('✅ QR generado para encomienda:', encomiendaId);

    return {
      qrDataUrl,
      token,
      expiraEn: expiraEn.toISOString(),
    };
  } catch (error) {
    console.error('Error al generar QR:', error);
    return null;
  }
}

/**
 * Valida un token QR y marca la entrega
 */
export async function validarQREntrega(
  token: string,
  usuarioId: string
): Promise<QRValidationResult> {
  try {
    // Buscar el token
    const { data: tokenData, error: tokenError } = await supabase
      .from('tokens_qr')
      .select('id, encomiendaId, usado, expiraEn')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return {
        success: false,
        message: 'Código QR inválido o no encontrado',
      };
    }

    // Verificar si ya fue usado
    if (tokenData.usado) {
      return {
        success: false,
        message: 'Este código QR ya fue utilizado',
      };
    }

    // Verificar expiración
    if (new Date(tokenData.expiraEn) < new Date()) {
      return {
        success: false,
        message: 'Este código QR ha expirado',
      };
    }

    // Obtener la encomienda
    const { data: encomienda, error: encError } = await supabase
      .from('encomiendas')
      .select('id, codigo, residenteNombre, transportista, fechaRecepcion, estado')
      .eq('id', tokenData.encomiendaId)
      .single();

    if (encError || !encomienda) {
      return {
        success: false,
        message: 'Encomienda no encontrada',
      };
    }

    if (encomienda.estado === 'entregado') {
      return {
        success: false,
        message: 'Esta encomienda ya fue entregada',
      };
    }

    // Marcar token como usado
    await supabase
      .from('tokens_qr')
      .update({ usado: true })
      .eq('id', tokenData.id);

    // Actualizar estado de la encomienda
    await supabase
      .from('encomiendas')
      .update({
        estado: 'entregado',
        fechaEntrega: new Date().toISOString(),
      })
      .eq('id', tokenData.encomiendaId);

    // Registrar log de entrega
    await supabase.from('logs_entrega').insert({
      id: crypto.randomUUID(),
      encomiendaId: tokenData.encomiendaId,
      usuarioId,
      accion: 'qr_validado',
      detalles: JSON.stringify({
        tokenId: tokenData.id,
        validadoEn: new Date().toISOString(),
      }),
    });

    console.log('✅ Entrega validada por QR:', tokenData.encomiendaId);

    return {
      success: true,
      message: 'Entrega confirmada exitosamente',
      encomienda: {
        id: encomienda.id,
        codigo: encomienda.codigo,
        residenteNombre: encomienda.residenteNombre,
        transportista: encomienda.transportista,
        fechaRecepcion: encomienda.fechaRecepcion,
        estado: 'entregado',
      },
    };
  } catch (error) {
    console.error('Error al validar QR:', error);
    return {
      success: false,
      message: 'Error interno al validar el código QR',
    };
  }
}

/**
 * Obtiene el QR activo de una encomienda (si existe)
 */
export async function obtenerQRActivo(encomiendaId: string): Promise<TokenQR | null> {
  try {
    const { data, error } = await supabase
      .from('tokens_qr')
      .select('*')
      .eq('encomiendaId', encomiendaId)
      .eq('usado', false)
      .gt('expiraEn', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data as TokenQR;
  } catch {
    return null;
  }
}

/**
 * Obtiene el tiempo restante de un QR en segundos
 */
export function getTiempoRestanteQR(expiraEn: string): number {
  const ahora = new Date().getTime();
  const expiracion = new Date(expiraEn).getTime();
  return Math.max(0, Math.floor((expiracion - ahora) / 1000));
}

/**
 * Genera QR como SVG string (alternativa sin imagen)
 */
export async function generarQRSVG(encomiendaId: string): Promise<string | null> {
  try {
    const resultado = await generarQREncomienda(encomiendaId);
    if (!resultado) return null;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const validationUrl = `${baseUrl}/qr/validar?token=${resultado.token}`;

    return QRCode.toString(validationUrl, {
      type: 'svg',
      width: 200,
      margin: 1,
    });
  } catch {
    return null;
  }
}
