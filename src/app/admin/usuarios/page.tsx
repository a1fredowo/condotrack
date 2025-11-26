"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Plus, Search, Edit2, Trash2, Shield, UserCheck, UserX, 
  Building2, Mail, Phone, AlertTriangle
} from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'conserje' | 'residente';
  activo: boolean;
  departamento?: {
    numero: string;
    torre?: string;
  };
  createdAt: string;
}

export default function AdminUsuariosPage() {
  const { user, isAuthenticated, hasRole } = useAuth();
  const router = useRouter();
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRol, setFilterRol] = useState<string>("todos");
  const [filterActivo, setFilterActivo] = useState<string>("todos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar acceso
  useEffect(() => {
    if (!isAuthenticated || !hasRole(['admin'])) {
      router.push('/');
    }
  }, [isAuthenticated, hasRole, router]);

  // Cargar usuarios
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.usuarios || []);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, activo: boolean) => {
    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !activo }),
      });

      if (response.ok) {
        setUsuarios(prev => prev.map(u => 
          u.id === userId ? { ...u, activo: !activo } : u
        ));
      }
    } catch {
      setError('Error al actualizar usuario');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/usuarios/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsuarios(prev => prev.filter(u => u.id !== userId));
      }
    } catch {
      setError('Error al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRol = filterRol === 'todos' || u.rol === filterRol;
    const matchesActivo = filterActivo === 'todos' || 
                         (filterActivo === 'activos' && u.activo) ||
                         (filterActivo === 'inactivos' && !u.activo);
    return matchesSearch && matchesRol && matchesActivo;
  });

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return <Badge tone="warning"><Shield className="mr-1 h-3 w-3" />Admin</Badge>;
      case 'conserje':
        return <Badge tone="default"><UserCheck className="mr-1 h-3 w-3" />Conserje</Badge>;
      case 'residente':
        return <Badge tone="secondary"><Users className="mr-1 h-3 w-3" />Residente</Badge>;
      default:
        return <Badge>{rol}</Badge>;
    }
  };

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
    conserjes: usuarios.filter(u => u.rol === 'conserje').length,
    residentes: usuarios.filter(u => u.rol === 'residente').length,
  };

  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de usuarios</h1>
          <p className="mt-1 text-muted-foreground">
            Administra los usuarios del sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activos}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.conserjes}</p>
                <p className="text-sm text-muted-foreground">Conserjes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.residentes}</p>
                <p className="text-sm text-muted-foreground">Residentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="conserje">Conserjes</option>
              <option value="residente">Residentes</option>
            </select>
            <select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Usuarios ({filteredUsuarios.length})</CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">
              Cargando usuarios...
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron usuarios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Usuario</th>
                    <th className="pb-3 font-medium">Contacto</th>
                    <th className="pb-3 font-medium">Rol</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Departamento</th>
                    <th className="pb-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="group hover:bg-muted/30">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                            {usuario.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{usuario.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              Creado: {new Date(usuario.createdAt).toLocaleDateString('es-CL')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {usuario.email}
                          </div>
                          {usuario.telefono && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {usuario.telefono}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        {getRolBadge(usuario.rol)}
                      </td>
                      <td className="py-4">
                        {usuario.activo ? (
                          <Badge tone="success">Activo</Badge>
                        ) : (
                          <Badge tone="destructive">Inactivo</Badge>
                        )}
                      </td>
                      <td className="py-4">
                        {usuario.departamento ? (
                          <span className="text-sm">
                            {usuario.departamento.torre && `Torre ${usuario.departamento.torre} - `}
                            Depto {usuario.departamento.numero}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingUser(usuario)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleUserStatus(usuario.id, usuario.activo)}
                          >
                            {usuario.activo ? (
                              <UserX className="h-4 w-4 text-warning" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-success" />
                            )}
                          </Button>
                          {usuario.id !== user?.id && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteUser(usuario.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
          }}
          onSave={() => {
            fetchUsuarios();
            setShowCreateModal(false);
            setEditingUser(null);
          }}
        />
      )}
      </div>
    </RoleGuard>
  );
}

interface UserModalProps {
  user: Usuario | null;
  onClose: () => void;
  onSave: () => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    password: '',
    rol: user?.rol || 'residente',
    activo: user?.activo ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const url = user ? `/api/usuarios/${user.id}` : '/api/usuarios';
      const method = user ? 'PATCH' : 'POST';
      
      const body: Record<string, unknown> = { ...formData };
      if (!formData.password) {
        delete body.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        onSave();
      } else {
        setError(data.error || 'Error al guardar usuario');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">
          {user ? 'Editar usuario' : 'Nuevo usuario'}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {user ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required={!user}
              minLength={6}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Rol</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value as 'admin' | 'conserje' | 'residente' }))}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="residente">Residente</option>
              <option value="conserje">Conserje</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="activo" className="text-sm font-medium">
              Usuario activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
