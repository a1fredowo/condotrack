/**
 * API Route: Register
 */

import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, password, rol, torre, numeroDepartamento } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Buscar o crear departamento si se proporciona
    let departamentoId: number | undefined;
    
    if (torre && numeroDepartamento) {
      const { data: deptExistente } = await supabase
        .from('departamentos')
        .select('id')
        .eq('numero', numeroDepartamento)
        .eq('torre', torre)
        .single();

      if (deptExistente) {
        departamentoId = deptExistente.id;
      } else {
        const { data: nuevoDept } = await supabase
          .from('departamentos')
          .insert({ numero: numeroDepartamento, torre })
          .select('id')
          .single();
        
        if (nuevoDept) {
          departamentoId = nuevoDept.id;
        }
      }
    }

    const user = await register({
      nombre,
      email,
      password,
      rol: rol || 'residente',
      departamentoId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Usuario registrado exitosamente',
    });
  } catch (error) {
    console.error('Error en register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
