"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Rol = 'admin' | 'conserje' | 'residente';

export interface Usuario {
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

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    torre?: string;
    numeroDepartamento?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  hasRole: (roles: Rol[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' });
    } finally {
      setUser(null);
    }
  };

  const register = async (data: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    torre?: string;
    numeroDepartamento?: string;
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Error al registrar' };
      }
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const hasRole = (roles: Rol[]) => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
