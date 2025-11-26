/**
 * API Route: QR - Generar
 */

import { NextRequest, NextResponse } from 'next/server';
import { generarQREncomienda } from '@/lib/qr';
import { getUserFromToken } from '@/lib/auth';
import { registrarLog } from '@/lib/api/logs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    // Verificar autenticación (solo admin y conserje pueden generar QR)
    let userId = 'sistema';
    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        userId = user.id;
      }
    }

    const body = await request.json();
    const { encomiendaId } = body;

    if (!encomiendaId) {
      return NextResponse.json(
        { error: 'ID de encomienda requerido' },
        { status: 400 }
      );
    }

    const resultado = await generarQREncomienda(encomiendaId);

    if (!resultado) {
      return NextResponse.json(
        { error: 'No se pudo generar el código QR' },
        { status: 400 }
      );
    }

    // Registrar log
    await registrarLog({
      encomiendaId,
      usuarioId: userId,
      accion: 'qr_generado',
      detalles: { expiraEn: resultado.expiraEn },
    });

    return NextResponse.json({
      success: true,
      qrDataUrl: resultado.qrDataUrl,
      token: resultado.token,
      expiraEn: resultado.expiraEn,
    });
  } catch (error) {
    console.error('Error al generar QR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
