/**
 * API Route: Buscar residentes (autocompletado)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, residentes: [] });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .eq('rol', 'residente')
      .eq('activo', true)
      .or(`nombre.ilike.%${q}%,email.ilike.%${q}%`)
      .order('nombre', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error al buscar residentes:', error);
      return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      residentes: data || [] 
    });
  } catch (error) {
    console.error('Error en buscar residentes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
