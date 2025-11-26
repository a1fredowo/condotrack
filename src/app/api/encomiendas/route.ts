import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET - Obtener encomiendas (filtradas por rol y parámetros)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const user = token ? await getUserFromToken(token) : null;
    
    const { searchParams } = new URL(request.url);
    const residenteId = searchParams.get('residenteId');
    const estado = searchParams.get('estado');

    let query = supabase
      .from('encomiendas')
      .select(`
        *,
        residente:usuarios!encomiendas_residenteId_fkey (
          id, nombre, email,
          departamento:departamentos (id, numero, torre)
        ),
        tokensQR:tokens_qr (id, token, expiraEn, usado)
      `)
      .order('fechaRecepcion', { ascending: false });

    // Si es residente, solo ver sus encomiendas
    if (user?.rol === 'residente') {
      query = query.eq('residenteId', user.id);
    } else if (residenteId) {
      query = query.eq('residenteId', residenteId);
    }

    if (estado && estado !== 'todas') {
      query = query.eq('estado', estado);
    }

    const { data: encomiendas, error } = await query;

    if (error) {
      console.error('Error fetching encomiendas:', error);
      return NextResponse.json({ error: 'Error al obtener encomiendas' }, { status: 500 });
    }

    // Formatear respuesta
    const formatted = (encomiendas || []).map((e: Record<string, unknown>) => {
      // Ensure tokensQR is an array
      const rawTokens = e.tokensQR;
      const tokensQR = Array.isArray(rawTokens) ? rawTokens as Array<{id: string; token: string; expiraEn: string; usado: boolean}> : [];
      const activeToken = tokensQR.find(t => !t.usado && new Date(t.expiraEn) > new Date());
      
      return {
        id: e.id,
        codigo: e.codigo,
        transportista: e.transportista,
        descripcion: e.descripcion,
        estado: e.estado === 'entregado' ? 'retirada' : e.estado, // Mapear para el frontend
        prioridad: e.prioridad,
        fechaRecepcion: e.fechaRecepcion,
        fechaEntrega: e.fechaEntrega,
        residenteNombre: e.residenteNombre,
        residente: e.residente,
        tokenQR: activeToken ? {
          id: activeToken.id,
          token: activeToken.token,
          expiracion: activeToken.expiraEn,
          usado: activeToken.usado,
        } : null,
      };
    });

    return NextResponse.json({ encomiendas: formatted });
  } catch (error) {
    console.error('Error fetching encomiendas:', error);
    return NextResponse.json(
      { error: 'Error al obtener encomiendas' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva encomienda
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const user = token ? await getUserFromToken(token) : null;
    
    // Solo admin y conserje pueden registrar encomiendas
    if (!user || !['admin', 'conserje'].includes(user.rol)) {
      return NextResponse.json(
        { error: 'No tienes permisos para registrar encomiendas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { codigo, transportista, residenteNombre, residenteId, departamento, prioridad } = body;

    if (!codigo || !transportista || !residenteNombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: codigo, transportista, residenteNombre' },
        { status: 400 }
      );
    }

    // Buscar o crear residente si hay info de departamento
    let finalResidenteId = residenteId;
    
    if (!finalResidenteId && departamento) {
      // Parsear departamento "Torre A · 1205"
      const match = departamento.match(/Torre\s+([A-D])\s+·\s+(.+)/i);
      if (match) {
        const [, torre, numero] = match;
        
        // Buscar o crear departamento
        const { data: existingDept } = await supabase
          .from('departamentos')
          .select('id')
          .eq('torre', torre.toUpperCase())
          .eq('numero', numero.trim())
          .single();
        
        let deptId = existingDept?.id;
        
        if (!deptId) {
          const { data: newDept } = await supabase
            .from('departamentos')
            .insert({ torre: torre.toUpperCase(), numero: numero.trim() })
            .select('id')
            .single();
          deptId = newDept?.id;
        }

        if (deptId) {
          // Buscar usuario existente
          const { data: existingUser } = await supabase
            .from('usuarios')
            .select('id')
            .eq('nombre', residenteNombre)
            .eq('departamentoId', deptId)
            .single();

          if (existingUser) {
            finalResidenteId = existingUser.id;
          } else {
            // Crear nuevo usuario
            const email = `${residenteNombre.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@residente.condotrack.local`;
            const { data: newUser } = await supabase
              .from('usuarios')
              .insert({
                nombre: residenteNombre,
                email,
                rol: 'residente',
                departamentoId: deptId,
              })
              .select('id')
              .single();
            finalResidenteId = newUser?.id;
          }
        }
      }
    }

    // Crear encomienda
    const { data: encomienda, error } = await supabase
      .from('encomiendas')
      .insert({
        codigo,
        transportista,
        residenteNombre,
        residenteId: finalResidenteId,
        prioridad: prioridad || 'normal',
        estado: 'pendiente',
        registradoPorId: user.id,
      })
      .select(`
        *,
        residente:usuarios!encomiendas_residenteId_fkey (
          id, nombre,
          departamento:departamentos (numero, torre)
        )
      `)
      .single();

    if (error) {
      console.error('Error creating encomienda:', error);
      return NextResponse.json({ error: 'Error al crear encomienda' }, { status: 500 });
    }

    // Registrar log
    await supabase.from('logs_entrega').insert({
      encomiendaId: encomienda.id,
      usuarioId: user.id,
      accion: 'RECEPCION',
      detalles: JSON.stringify({ transportista }),
    });

    // Crear notificación
    if (finalResidenteId) {
      await supabase.from('notificaciones').insert({
        encomiendaId: encomienda.id,
        medio: 'app',
        mensaje: `Tu encomienda de ${transportista} ha sido recibida. Código: ${codigo}`,
        entregada: true,
      });
    }

    return NextResponse.json({
      success: true,
      encomienda: {
        id: encomienda.id,
        codigo: encomienda.codigo,
        transportista: encomienda.transportista,
        residenteNombre: encomienda.residenteNombre,
        estado: encomienda.estado,
        fechaRecepcion: encomienda.fechaRecepcion,
        residente: encomienda.residente,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating encomienda:', error);
    return NextResponse.json(
      { error: 'Error al crear encomienda' },
      { status: 500 }
    );
  }
}
