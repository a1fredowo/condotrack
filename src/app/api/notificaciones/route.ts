import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

// GET: Obtener historial de notificaciones
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    if (!user || !['admin', 'conserje'].includes(user.rol)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { data: notificaciones, error } = await supabase
      .from('notificaciones')
      .select(`
        id,
        mensaje,
        medio,
        entregada,
        createdAt,
        encomienda:encomiendas (
          id,
          codigo,
          transportista,
          residente:usuarios!encomiendas_residenteId_fkey (
            id,
            nombre,
            email
          )
        )
      `)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error al obtener notificaciones:', error);
      return NextResponse.json({ error: 'Error al obtener notificaciones' }, { status: 500 });
    }

    // Formatear respuesta
    const formatted = (notificaciones || []).map(n => ({
      id: n.id,
      mensaje: n.mensaje,
      medio: n.medio,
      entregada: n.entregada,
      enviadoEn: n.createdAt,
      encomienda: n.encomienda,
    }));

    return NextResponse.json({ notificaciones: formatted });
  } catch (error) {
    console.error('Error en GET /api/notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
