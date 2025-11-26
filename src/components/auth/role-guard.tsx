"use client";

import { useEffect } from "react";
import { useAuth, Rol } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Rol[];
  redirectTo?: string;
}

export function RoleGuard({ children, allowedRoles, redirectTo = "/" }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login");
      } else if (!hasRole(allowedRoles)) {
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-warning" />
          <h2 className="text-xl font-bold">Sesión requerida</h2>
          <p className="mt-2 text-muted-foreground">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">Acceso denegado</h2>
          <p className="mt-2 text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tu rol actual: <span className="font-medium">{user?.rol}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
