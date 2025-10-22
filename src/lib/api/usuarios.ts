/**
 * API de Usuarios - CondoTrack
 * Funciones para gestionar usuarios/residentes
 */

import { supabase } from '@/lib/supabase';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  departamentoId: number | null;
  departamento?: {
    id: number;
    numero: string;
    torre: string;
  } | null;
}

/**
 * Obtiene todos los usuarios con sus departamentos
 */
export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        departamentoId,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }

    return data as unknown as Usuario[];
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    throw error;
  }
}

/**
 * Obtiene un usuario por su ID
 */
export async function getUsuarioPorId(id: string): Promise<Usuario | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        departamentoId,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }

    return data as unknown as Usuario;
  } catch (error) {
    console.error('Error en getUsuarioPorId:', error);
    return null;
  }
}

/**
 * Busca usuarios por nombre
 */
export async function buscarUsuariosPorNombre(nombre: string): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        departamentoId,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .ilike('nombre', `%${nombre}%`)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al buscar usuarios:', error);
      throw new Error(`Error al buscar usuarios: ${error.message}`);
    }

    return data as unknown as Usuario[];
  } catch (error) {
    console.error('Error en buscarUsuariosPorNombre:', error);
    throw error;
  }
}

/**
 * Crea un nuevo usuario
 */
export async function addUsuario(
  nombre: string,
  email: string,
  departamentoId?: number
): Promise<Usuario> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({ nombre, email, departamentoId })
      .select(`
        id,
        nombre,
        email,
        departamentoId,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .single();

    if (error) {
      console.error('Error al crear usuario:', error);
      throw new Error(`Error al crear usuario: ${error.message}`);
    }

    return data as unknown as Usuario;
  } catch (error) {
    console.error('Error en addUsuario:', error);
    throw error;
  }
}
