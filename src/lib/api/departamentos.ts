/**
 * API de Departamentos - CondoTrack
 * Funciones para gestionar departamentos
 */

import { supabase } from '@/lib/supabase';

export interface Departamento {
  id: number;
  numero: string;
  torre: string;
}

/**
 * Obtiene todos los departamentos
 */
export async function getDepartamentos(): Promise<Departamento[]> {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .order('torre', { ascending: true })
      .order('numero', { ascending: true });

    if (error) {
      console.error('Error al obtener departamentos:', error);
      throw new Error(`Error al obtener departamentos: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error en getDepartamentos:', error);
    throw error;
  }
}

/**
 * Obtiene un departamento por su ID
 */
export async function getDepartamentoPorId(id: number): Promise<Departamento | null> {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener departamento:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en getDepartamentoPorId:', error);
    return null;
  }
}

/**
 * Crea un nuevo departamento
 */
export async function addDepartamento(numero: string, torre: string): Promise<Departamento> {
  try {
    const { data, error } = await supabase
      .from('departamentos')
      .insert({ numero, torre })
      .select()
      .single();

    if (error) {
      console.error('Error al crear departamento:', error);
      throw new Error(`Error al crear departamento: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error en addDepartamento:', error);
    throw error;
  }
}
