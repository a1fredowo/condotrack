import { supabase } from '@/lib/supabase';

/**
 * Tipo de estado de una encomienda
 */
export type EstadoEncomienda = 'pendiente' | 'entregado' | 'incidencia';

/**
 * Tipo de prioridad de una encomienda
 */
export type PrioridadEncomienda = 'normal' | 'urgente';

/**
 * Filtros disponibles para búsqueda de encomiendas
 */
export interface FiltrosEncomienda {
  departamento?: string;
  transportista?: string;
  estado?: EstadoEncomienda | 'todos';
  fechaInicio?: string;
  fechaFin?: string;
  residenteNombre?: string;
}

/**
 * Interfaz para una encomienda completa con datos relacionados
 */
export interface EncomiendaConDatos {
  id: string;
  codigo: string;
  transportista: string;
  fechaRecepcion: string;
  estado: EstadoEncomienda;
  prioridad: PrioridadEncomienda;
  residenteId: string | null;
  residenteNombre: string; // 👈 NUEVO: Siempre presente
  residente: {
    id: string;
    nombre: string;
    email: string;
    departamento: {
      numero: string;
      torre: string;
    } | null;
  } | null;
}

// Actualizar NuevaEncomienda
export interface NuevaEncomienda {
  codigo: string;
  transportista: string;
  residenteNombre: string; // 👈 NUEVO: Obligatorio
  residenteId?: string; // 👈 NUEVO: Opcional - si ya existe el usuario
  departamento?: string;
  prioridad?: PrioridadEncomienda;
}

// Actualizar getEncomiendas para incluir residenteNombre
export async function getEncomiendas(filtros?: FiltrosEncomienda): Promise<EncomiendaConDatos[]> {
  try {
    console.log('🔍 Iniciando consulta a Supabase...');
    
    let query = supabase
      .from('encomiendas')
      .select('*') // Ahora incluye residenteNombre
      .order('fechaRecepcion', { ascending: false });

    // Aplicar filtros de base de datos
    if (filtros?.estado && filtros.estado !== 'todos') {
      query = query.eq('estado', filtros.estado);
    }
    if (filtros?.transportista) {
      query = query.ilike('transportista', `%${filtros.transportista}%`);
    }
    if (filtros?.fechaInicio) {
      query = query.gte('fechaRecepcion', filtros.fechaInicio);
    }
    if (filtros?.fechaFin) {
      query = query.lte('fechaRecepcion', filtros.fechaFin);
    }

    const { data: encomiendas, error: errorEncomiendas } = await query;
    
    console.log('📊 Paso 1 - Encomiendas obtenidas:', encomiendas?.length || 0);

    if (errorEncomiendas) {
      console.error('Error al obtener encomiendas:', errorEncomiendas);
      throw errorEncomiendas;
    }

    if (!encomiendas || encomiendas.length === 0) {
      console.warn('⚠️ No se encontraron encomiendas');
      return [];
    }

    // Obtener IDs únicos de residentes
    const residenteIds = [...new Set(
      encomiendas
        .map(e => e.residenteId)
        .filter((id): id is string => id !== null)
    )];

    console.log('📊 Paso 2 - IDs de residentes:', residenteIds.length);

    // Obtener usuarios solo si hay IDs
    let usuarios: any[] = [];
    if (residenteIds.length > 0) {
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('id, nombre, email, departamentoId')
        .in('id', residenteIds);
      
      usuarios = usuariosData || [];
      console.log('📊 Paso 3 - Usuarios obtenidos:', usuarios.length);
    }

    // Obtener departamentos
    const departamentoIds = [...new Set(
      usuarios
        .map(u => u.departamentoId)
        .filter((id): id is number => id !== null)
    )];

    let departamentos: any[] = [];
    if (departamentoIds.length > 0) {
      const { data: departamentosData } = await supabase
        .from('departamentos')
        .select('id, numero, torre')
        .in('id', departamentoIds);
      
      departamentos = departamentosData || [];
      console.log('📊 Paso 4 - Departamentos obtenidos:', departamentos.length);
    }

    // Combinar datos
    const resultado = encomiendas.map((enc: any) => {
      const usuario = usuarios.find((u: any) => u.id === enc.residenteId);
      const departamento = usuario?.departamentoId 
        ? departamentos.find((d: any) => d.id === usuario.departamentoId) 
        : null;

      return {
        id: enc.id,
        codigo: enc.codigo,
        transportista: enc.transportista,
        fechaRecepcion: enc.fechaRecepcion,
        estado: enc.estado,
        prioridad: enc.prioridad,
        residenteId: enc.residenteId,
        residenteNombre: enc.residenteNombre, // 👈 NUEVO: Desde DB
        residente: usuario ? {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          departamento: departamento ? {
            numero: departamento.numero,
            torre: departamento.torre
          } : null
        } : null
      };
    });

    // Filtros en memoria
    let filtrado = resultado;

    if (filtros?.departamento) {
      filtrado = filtrado.filter((e) => {
        const dept = e.residente?.departamento;
        const searchTerm = filtros.departamento!.toLowerCase();
        return (
          dept?.numero?.toLowerCase().includes(searchTerm) ||
          dept?.torre?.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (filtros?.residenteNombre) {
      filtrado = filtrado.filter((e) => {
        return e.residenteNombre?.toLowerCase().includes(filtros.residenteNombre!.toLowerCase());
      });
    }

    console.log('✅ Total procesado:', filtrado.length);
    return filtrado as EncomiendaConDatos[];
  } catch (error) {
    console.error('💥 Error crítico en getEncomiendas:', error);
    throw error;
  }
}

/**
 * Busca o crea un usuario por nombre y departamento
 * También crea el departamento si no existe
 */
async function buscarOCrearUsuario(nombre: string, departamentoStr: string) {
  try {
    console.log('🔍 Buscando o creando usuario:', { nombre, departamentoStr });
    
    // Parsear "Torre A · 1205" -> { torre: "A", numero: "1205" }
    const match = departamentoStr.match(/Torre\s+([A-D])\s+·\s+(.+)/i);
    
    if (!match) {
      console.warn('⚠️ Formato de departamento no válido:', departamentoStr);
      return null;
    }

    const [, torre, numero] = match;
    const torreUpper = torre.toUpperCase();
    const numeroTrim = numero.trim();
    
    console.log('📍 Parseado:', { torre: torreUpper, numero: numeroTrim });
    
    // 1. Buscar departamento existente
    const { data: deptExistente } = await supabase
      .from('departamentos')
      .select('id')
      .eq('numero', numeroTrim)
      .eq('torre', torreUpper)
      .maybeSingle();

    let departamentoId: number;

    if (deptExistente) {
      console.log('🏢 Departamento existente encontrado:', deptExistente.id);
      departamentoId = deptExistente.id;
    } else {
      // Crear nuevo departamento
      const { data: nuevoDept, error: createDeptError } = await supabase
        .from('departamentos')
        .insert({ 
          numero: numeroTrim, 
          torre: torreUpper 
        })
        .select('id')
        .single();

      if (createDeptError) {
        console.error('❌ Error al crear departamento:', createDeptError);
        return null;
      }

      console.log('✅ Departamento creado:', nuevoDept.id);
      departamentoId = nuevoDept.id;
    }

    // 2. Buscar usuario existente por nombre Y departamento
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('nombre', nombre.trim())
      .eq('departamentoId', departamentoId)
      .maybeSingle();

    // Si el usuario existe, retornarlo
    if (usuarioExistente) {
      console.log('👤 Usuario existente encontrado:', usuarioExistente.id);
      return usuarioExistente;
    }

    // 3. Crear usuario nuevo
    const emailBase = nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '.')
      .replace(/[^a-z0-9.]/g, '');
    
    const timestamp = Date.now();
    const email = `${emailBase}.${timestamp}@residente.condotrack.local`;

    const { data: nuevoUsuario, error: createUserError } = await supabase
      .from('usuarios')
      .insert({
        nombre: nombre.trim(),
        email,
        departamentoId: departamentoId,
      })
      .select('id')
      .single();

    if (createUserError) {
      console.error('❌ Error al crear usuario:', createUserError);
      return null;
    }

    console.log('✅ Usuario creado exitosamente:', nuevoUsuario.id);
    return nuevoUsuario;
  } catch (error) {
    console.error('💥 Error crítico en buscarOCrearUsuario:', error);
    return null;
  }
}

// Actualizar addEncomienda
export async function addEncomienda(datos: NuevaEncomienda): Promise<EncomiendaConDatos> {
  try {
    console.log('📝 Registrando nueva encomienda:', datos);
    
    let residenteId: string | null = datos.residenteId || null;

    // Si NO se proporcionó residenteId pero sí departamento, buscar o crear usuario
    if (!residenteId && datos.departamento) {
      const usuarioCreado = await buscarOCrearUsuario(
        datos.residenteNombre,
        datos.departamento
      );
      residenteId = usuarioCreado?.id || null;
      
      if (residenteId) {
        console.log('✅ Usuario vinculado:', residenteId);
      } else {
        console.warn('⚠️ No se pudo vincular usuario, encomienda sin residenteId');
      }
    } else if (residenteId) {
      console.log('✅ Usuario ya existente vinculado:', residenteId);
    }

    // Crear encomienda CON residenteNombre
    const { data: nuevaEncomienda, error } = await supabase
      .from('encomiendas')
      .insert({
        codigo: datos.codigo,
        transportista: datos.transportista,
        residenteId,
        residenteNombre: datos.residenteNombre, // 👈 NUEVO: Siempre guardado
        estado: 'pendiente',
        prioridad: datos.prioridad || 'normal',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar encomienda:', error);
      throw new Error(`Error al crear encomienda: ${error.message}`);
    }

    console.log('✅ Encomienda creada exitosamente:', nuevaEncomienda);

    // Crear notificación automática solo si hay residenteId
    if (residenteId) {
      await crearNotificacion(
        nuevaEncomienda.id,
        'app',
        `Tu encomienda de ${datos.transportista} ha sido recibida. Código: ${datos.codigo}`
      );
    }

    // Recargar encomiendas para obtener datos completos
    const todasEncomiendas = await getEncomiendas();
    const encomiendaCompleta = todasEncomiendas.find(e => e.id === nuevaEncomienda.id);
    
    if (!encomiendaCompleta) {
      throw new Error('Error al recuperar la encomienda creada');
    }

    return encomiendaCompleta;
  } catch (error) {
    console.error('💥 Error crítico en addEncomienda:', error);
    throw error;
  }
}

/**
 * Crea una notificación para una encomienda
 */
async function crearNotificacion(encomiendaId: string, medio: string, mensaje: string) {
  try {
    await supabase.from('notificaciones').insert({
      encomiendaId,
      medio,
      mensaje,
      entregada: true,
    });
    console.log('📬 Notificación creada para encomienda:', encomiendaId);
  } catch (error) {
    console.error('Error al crear notificación:', error);
  }
}

/**
 * Actualiza el estado de una encomienda
 */
export async function updateEstadoEncomienda(
  id: string,
  nuevoEstado: EstadoEncomienda
): Promise<EncomiendaConDatos | null> {
  try {
    const { error } = await supabase
      .from('encomiendas')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar estado:', error);
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }

    // Recargar encomienda actualizada
    const encomiendas = await getEncomiendas();
    return encomiendas.find(e => e.id === id) || null;
  } catch (error) {
    console.error('Error en updateEstadoEncomienda:', error);
    throw error;
  }
}

/**
 * Elimina una encomienda
 */
export async function deleteEncomienda(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('encomiendas').delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar encomienda:', error);
      throw new Error(`Error al eliminar encomienda: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error en deleteEncomienda:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de encomiendas
 */
export async function getEstadisticasEncomiendas() {
  try {
    const { count: total } = await supabase
      .from('encomiendas')
      .select('*', { count: 'exact', head: true });

    const { count: pendientes } = await supabase
      .from('encomiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente');

    const { count: entregados } = await supabase
      .from('encomiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'entregado');

    const { count: incidencias } = await supabase
      .from('encomiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'incidencia');

    return {
      total: total || 0,
      pendientes: pendientes || 0,
      entregados: entregados || 0,
      incidencias: incidencias || 0,
    };
  } catch (error) {
    console.error('Error en getEstadisticasEncomiendas:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas avanzadas para el dashboard
 */
export async function getEstadisticasAvanzadas() {
  try {
    const stats = await getEstadisticasEncomiendas();
    const tasaEntrega = stats.total > 0 
      ? ((stats.entregados / stats.total) * 100).toFixed(1)
      : '0.0';

    return {
      ...stats,
      tasaEntrega: parseFloat(tasaEntrega),
    };
  } catch (error) {
    console.error('Error en getEstadisticasAvanzadas:', error);
    throw error;
  }
}

/**
 * Obtiene la tendencia semanal de encomiendas
 */
export async function getTendenciaSemanal() {
  try {
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

    const { data, error } = await supabase
      .from('encomiendas')
      .select('fechaRecepcion, estado')
      .gte('fechaRecepcion', haceUnaSemana.toISOString());

    if (error) throw error;

    // Agrupar por día
    const agrupado: Record<string, { pendiente: number; entregado: number }> = {};
    
    data?.forEach((enc: { fechaRecepcion: string; estado: string }) => {
      const fecha = new Date(enc.fechaRecepcion).toISOString().split('T')[0];
      if (!agrupado[fecha]) {
        agrupado[fecha] = { pendiente: 0, entregado: 0 };
      }
      if (enc.estado === 'pendiente') agrupado[fecha].pendiente++;
      if (enc.estado === 'entregado') agrupado[fecha].entregado++;
    });

    return Object.entries(agrupado).map(([fecha, datos]) => ({
      fecha,
      ...datos,
    }));
  } catch (error) {
    console.error('Error en getTendenciaSemanal:', error);
    return [];
  }
}

/**
 * Obtiene la distribución de encomiendas por torre
 */
export async function getDistribucionPorTorre() {
  try {
    const encomiendas = await getEncomiendas();
    
    const distribucion = encomiendas.reduce((acc, enc) => {
      const torre = enc.residente?.departamento?.torre || 'Sin Torre';
      acc[torre] = (acc[torre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribucion).map(([torre, cantidad]) => ({
      torre,
      cantidad,
    }));
  } catch (error) {
    console.error('Error en getDistribucionPorTorre:', error);
    return [];
  }
}