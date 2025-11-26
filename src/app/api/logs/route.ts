/**
 * API Route: Logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { getLogs, getEstadisticasLogs, getTiempoPromedioEntrega } from '@/lib/api/logs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const accion = searchParams.get('accion') as 'recepcion' | 'entrega' | 'incidencia' | 'qr_generado' | 'qr_validado' | null;
    const limite = searchParams.get('limite');

    const [logs, estadisticas, tiempoPromedio] = await Promise.all([
      getLogs({
        accion: accion || undefined,
        limite: limite ? parseInt(limite) : 50,
      }),
      getEstadisticasLogs(),
      getTiempoPromedioEntrega(),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      estadisticas,
      tiempoPromedio,
    });
  } catch (error) {
    console.error('Error en GET /api/logs:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
