/**
 * Sistema de Autenticación - CondoTrack
 * Gestión de sesiones, tokens y roles
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'condotrack-secret-key-2025';
const TOKEN_EXPIRY = '7d';

export type Rol = 'admin' | 'conserje' | 'residente';

export interface UsuarioAuth {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  departamento?: {
    id: number;
    numero: string;
    torre: string;
  } | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
  rol: Rol;
  iat?: number;
  exp?: number;
}

/**
 * Hash de contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verificar contraseña
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generar token JWT
 */
export function generateToken(user: UsuarioAuth): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    rol: user.rol,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verificar token JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Login de usuario
 */
export async function login(email: string, password: string): Promise<{ user: UsuarioAuth; token: string } | null> {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        password,
        rol,
        activo,
        departamentoId,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !usuario) {
      console.log('Usuario no encontrado:', email);
      return null;
    }

    if (!usuario.activo) {
      console.log('Usuario inactivo:', email);
      return null;
    }

    // Si no tiene contraseña, permitir acceso con cualquier contraseña (migración)
    if (usuario.password) {
      const isValid = await verifyPassword(password, usuario.password);
      if (!isValid) {
        console.log('Contraseña incorrecta para:', email);
        return null;
      }
    }

    const dept = Array.isArray(usuario.departamento) ? usuario.departamento[0] : usuario.departamento;
    const user: UsuarioAuth = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol as Rol,
      departamento: dept ? { id: dept.id, numero: dept.numero, torre: dept.torre } : null,
    };

    const token = generateToken(user);

    // Guardar sesión en BD
    const expiraEn = new Date();
    expiraEn.setDate(expiraEn.getDate() + 7);

    await supabase.from('sesiones').insert({
      usuarioId: user.id,
      token,
      expiraEn: expiraEn.toISOString(),
    });

    return { user, token };
  } catch (error) {
    console.error('Error en login:', error);
    return null;
  }
}

/**
 * Registrar nuevo usuario
 */
export async function register(data: {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
  departamentoId?: number;
}): Promise<UsuarioAuth | null> {
  try {
    const hashedPassword = await hashPassword(data.password);

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert({
        nombre: data.nombre,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        rol: data.rol || 'residente',
        departamentoId: data.departamentoId,
        activo: true,
      })
      .select(`
        id,
        nombre,
        email,
        rol,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .single();

    if (error) {
      console.error('Error al registrar usuario:', error);
      return null;
    }

    const deptReg = Array.isArray(usuario.departamento) ? usuario.departamento[0] : usuario.departamento;
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol as Rol,
      departamento: deptReg ? { id: deptReg.id, numero: deptReg.numero, torre: deptReg.torre } : null,
    };
  } catch (error) {
    console.error('Error en register:', error);
    return null;
  }
}

/**
 * Obtener usuario por token
 */
export async function getUserFromToken(token: string): Promise<UsuarioAuth | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) {
      console.log('[Auth] Token JWT inválido o expirado');
      return null;
    }

    console.log('[Auth] Token válido para userId:', payload.userId, 'rol:', payload.rol);

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        rol,
        activo,
        departamento:departamentos (
          id,
          numero,
          torre
        )
      `)
      .eq('id', payload.userId)
      .eq('activo', true)
      .single();

    if (error) {
      console.log('[Auth] Error buscando usuario:', error.message);
      return null;
    }

    if (!usuario) {
      console.log('[Auth] Usuario no encontrado o inactivo');
      return null;
    }

    console.log('[Auth] Usuario encontrado:', usuario.nombre, 'rol:', usuario.rol);

    const deptUser = Array.isArray(usuario.departamento) ? usuario.departamento[0] : usuario.departamento;
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol as Rol,
      departamento: deptUser ? { id: deptUser.id, numero: deptUser.numero, torre: deptUser.torre } : null,
    };
  } catch (error) {
    console.error('[Auth] Error en getUserFromToken:', error);
    return null;
  }
}

/**
 * Logout - invalidar sesión
 */
export async function logout(token: string): Promise<boolean> {
  try {
    await supabase.from('sesiones').delete().eq('token', token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verificar permisos por rol
 */
export function hasPermission(userRol: Rol, requiredRoles: Rol[]): boolean {
  return requiredRoles.includes(userRol);
}

/**
 * Middleware helper para verificar autenticación
 */
export function requireAuth(requiredRoles?: Rol[]) {
  return async (token: string): Promise<UsuarioAuth | null> => {
    const user = await getUserFromToken(token);
    if (!user) return null;
    if (requiredRoles && !hasPermission(user.rol, requiredRoles)) return null;
    return user;
  };
}
