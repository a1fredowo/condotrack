/**
 * API Route: Usuarios (Admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET: Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    console.log('[API Usuarios] Token presente:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    console.log('[API Usuarios] Usuario obtenido:', user?.nombre, 'Rol:', user?.rol);
    
    // Admin y conserje pueden ver usuarios
    if (!user || !['admin', 'conserje'].includes(user.rol)) {
      console.log('[API Usuarios] Acceso denegado - user:', !!user, 'rol:', user?.rol);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    const busqueda = searchParams.get('q');

    let query = supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        rol,
        activo,
        createdAt,
        departamentoId,
        departamentos (
          id,
          numero,
          torre
        )
      `)
      .order('createdAt', { ascending: false });

    if (rol) {
      query = query.eq('rol', rol);
    }

    if (busqueda) {
      query = query.or(`nombre.ilike.%${busqueda}%,email.ilike.%${busqueda}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener usuarios:', error);
      return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }

    // Mapear departamentos a departamento para el frontend
    const usuarios = data?.map(u => ({
      ...u,
      departamento: u.departamentos,
    })) || [];

    return NextResponse.json({ success: true, usuarios });
  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// POST: Crear usuario
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, email, password, rol, torre, numeroDepartamento } = body;

    if (!nombre || !email) {
      return NextResponse.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
    }

    // Verificar email único
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existente) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Buscar o crear departamento
    let departamentoId: number | null = null;
    if (torre && numeroDepartamento) {
      const { data: dept } = await supabase
        .from('departamentos')
        .select('id')
        .eq('torre', torre)
        .eq('numero', numeroDepartamento)
        .single();

      if (dept) {
        departamentoId = dept.id;
      } else {
        const { data: nuevoDept } = await supabase
          .from('departamentos')
          .insert({ torre, numero: numeroDepartamento })
          .select('id')
          .single();
        departamentoId = nuevoDept?.id || null;
      }
    }

    const hashedPassword = password ? await hashPassword(password) : null;

    const { data: nuevoUsuario, error } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        email: email.toLowerCase(),
        password: hashedPassword,
        rol: rol || 'residente',
        activo: true,
        departamentoId,
      })
      .select(`
        id,
        nombre,
        email,
        rol,
        activo,
        departamentoId,
        departamentos (id, numero, torre)
      `)
      .single();

    if (error) {
      console.error('Error al crear usuario:', error);
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }

    return NextResponse.json({ success: true, usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PATCH: Actualizar usuario
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, nombre, email, rol, activo, password } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const updateData: Record<string, string | boolean> = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email.toLowerCase();
    if (rol) updateData.rol = rol;
    if (typeof activo === 'boolean') updateData.activo = activo;
    if (password) updateData.password = await hashPassword(password);

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        nombre,
        email,
        rol,
        activo,
        departamentoId,
        departamentos (id, numero, torre)
      `)
      .single();

    if (error) {
      console.error('Error al actualizar usuario:', error);
      return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }

    const usuario = data ? { ...data, departamento: data.departamentos } : null;
    return NextResponse.json({ success: true, usuario });
  } catch (error) {
    console.error('Error en PATCH /api/usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // No permitir eliminarse a sí mismo
    if (id === user.id) {
      return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 });
    }

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar usuario:', error);
      return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error en DELETE /api/usuarios:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
