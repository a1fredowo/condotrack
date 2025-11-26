"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";

const inputClass =
  "h-12 w-full rounded-[var(--radius-sm)] border border-border/70 bg-card/80 px-4 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/30";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    torre: "A",
    numeroDepartamento: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const result = await register({
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      torre: formData.torre,
      numeroDepartamento: formData.numeroDepartamento,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      setError(result.error || "Error al registrar");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Card className="w-full max-w-md border border-success/30 bg-success/5">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
              <UserPlus className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-card-foreground">¡Registro exitoso!</h2>
            <p className="mt-2 text-muted-foreground">
              Redirigiendo al inicio de sesión...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-8">
      <Card className="w-full max-w-md border border-border/70 bg-card/95">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate como residente para recibir notificaciones de tus encomiendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium text-card-foreground">
                Nombre completo <span className="text-destructive">*</span>
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="María González"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-card-foreground">
                Correo electrónico <span className="text-destructive">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className={inputClass}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="torre" className="text-sm font-medium text-card-foreground">
                  Torre
                </label>
                <select
                  id="torre"
                  value={formData.torre}
                  onChange={(e) => setFormData({ ...formData, torre: e.target.value })}
                  className={inputClass}
                >
                  <option value="A">Torre A</option>
                  <option value="B">Torre B</option>
                  <option value="C">Torre C</option>
                  <option value="D">Torre D</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="numeroDepartamento" className="text-sm font-medium text-card-foreground">
                  Departamento
                </label>
                <input
                  id="numeroDepartamento"
                  type="text"
                  value={formData.numeroDepartamento}
                  onChange={(e) => setFormData({ ...formData, numeroDepartamento: e.target.value })}
                  placeholder="Ej: 1205"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                Contraseña <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className={`${inputClass} pr-12`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
                Confirmar contraseña <span className="text-destructive">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repite tu contraseña"
                className={inputClass}
                autoComplete="new-password"
              />
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>

            <div className="space-y-3 pt-4 text-center text-sm">
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
