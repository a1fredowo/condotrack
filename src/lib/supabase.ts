/**
 * Cliente de Supabase para CondoTrack
 * 
 * Este archivo configura la conexión con Supabase usando las credenciales
 * proporcionadas en las variables de entorno.
 * 
 * Uso:
 * - En Server Components: usar supabase directamente
 * - En Client Components: usar supabase directamente (usa anon key)
 */

import { createClient } from '@supabase/supabase-js';

// Validar que las variables de entorno estén configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. ' +
    'Por favor configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
  );
}

/**
 * Cliente de Supabase configurado con las credenciales del proyecto
 * Este cliente puede usarse tanto en el servidor como en el cliente
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No persistir sesión en Server Components
  },
});

/**
 * Tipos de la base de datos generados desde el schema de Prisma
 * Estos tipos ayudan con el autocompletado y la validación de TypeScript
 */
export type Database = {
  public: {
    Tables: {
      Departamento: {
        Row: {
          id: number;
          numero: string;
        };
        Insert: {
          id?: number;
          numero: string;
        };
        Update: {
          id?: number;
          numero?: string;
        };
      };
      Usuario: {
        Row: {
          id: string;
          nombre: string;
          email: string;
          departamentoId: number | null;
        };
        Insert: {
          id?: string;
          nombre: string;
          email: string;
          departamentoId?: number | null;
        };
        Update: {
          id?: string;
          nombre?: string;
          email?: string;
          departamentoId?: number | null;
        };
      };
      Encomienda: {
        Row: {
          id: string;
          codigo: string;
          residenteId: string | null;
          transportista: string;
          fechaRecepcion: string;
          estado: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          residenteId?: string | null;
          transportista: string;
          fechaRecepcion?: string;
          estado?: string;
        };
        Update: {
          id?: string;
          codigo?: string;
          residenteId?: string | null;
          transportista?: string;
          fechaRecepcion?: string;
          estado?: string;
        };
      };
      Notificacion: {
        Row: {
          id: string;
          encomiendaId: string;
          medio: string;
          enviadoEn: string;
        };
        Insert: {
          id?: string;
          encomiendaId: string;
          medio: string;
          enviadoEn?: string;
        };
        Update: {
          id?: string;
          encomiendaId?: string;
          medio?: string;
          enviadoEn?: string;
        };
      };
    };
  };
};
