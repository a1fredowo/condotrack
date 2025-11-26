/**
 * API Route: QR - Validar
 */

import { NextRequest, NextResponse } from 'next/server';
import { validarQREntrega } from '@/lib/qr';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value;
    
    // Verificar autenticación
    let userId = '';
    if (authToken) {
      const user = await getUserFromToken(authToken);
      if (user) {
        userId = user.id;
        
        // Solo admin y conserje pueden validar QR
        if (user.rol !== 'admin' && user.rol !== 'conserje') {
          return NextResponse.json(
            { error: 'No tienes permisos para validar entregas' },
            { status: 403 }
          );
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para validar entregas' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token QR requerido' },
        { status: 400 }
      );
    }

    const resultado = await validarQREntrega(token, userId);

    if (!resultado.success) {
      return NextResponse.json(
        { error: resultado.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      encomienda: resultado.encomienda,
    });
  } catch (error) {
    console.error('Error al validar QR:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET para validación desde URL del QR
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token QR requerido' },
      { status: 400 }
    );
  }

  // Redirigir a la página de validación
  return NextResponse.redirect(new URL(`/qr/validar?token=${token}`, request.url));
}
