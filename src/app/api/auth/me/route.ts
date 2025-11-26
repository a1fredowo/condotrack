/**
 * API Route: Me (obtener usuario actual)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, logout } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);

    if (!user) {
      const response = NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      return response;
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      await logout(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });

    response.cookies.delete('auth-token');
    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
