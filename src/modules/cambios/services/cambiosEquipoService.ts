// ============================================================================
// SERVICIO DE EQUIPO DE TRABAJO EN CAMBIOS (ITIL v4)
// ============================================================================
// Consulta el equipo de soporte al que pertenece el usuario, su cambio RFC
// activo en curso y el historial de cambios resueltos individualmente o en equipo.
// ============================================================================

import { query, queryRow } from "@/shared/lib/db";

export interface IntegranteEquipo {
  id_usuario: number;
  nombre_completo: string;
  correo: string;
  cargo: string | null;
  rol: string;
}

export interface CambioEquipoResumen {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  descripcion: string | null;
  tipo_cambio: string;
  id_estado: number;
  nombre_estado: string;
  color_estado: string;
  ventana_inicio: string | null;
  ventana_fin: string | null;
  codigo_ci: string | null;
  nombre_ci: string | null;
  solicitante: string;
  responsable: string;
  plan_implementacion: string | null;
  plan_rollback: string | null;
}

export interface DatosEquipoTrabajo {
  nombreEquipo: string;
  descripcionEquipo: string;
  integrantes: IntegranteEquipo[];
  cambioActivo: CambioEquipoResumen | null;
  historial: CambioEquipoResumen[];
}

function mapearEstado(idEstado: number): { nombre: string; color: string } {
  switch (idEstado) {
    case 1:
      return { nombre: "Borrador", color: "#64748b" };
    case 2:
      return { nombre: "En Aprobación", color: "#d97706" };
    case 3:
      return { nombre: "Aprobado", color: "#2563eb" };
    case 4:
      return { nombre: "En Implementación", color: "#7c3aed" };
    case 5:
      return { nombre: "Implementado", color: "#059669" };
    case 6:
      return { nombre: "Cerrado", color: "#10b981" };
    case 7:
      return { nombre: "Cancelado / Rechazado", color: "#dc2626" };
    default:
      return { nombre: "En Proceso", color: "#3b82f6" };
  }
}

export async function obtenerDatosEquipoTrabajo(idUsuario: number): Promise<DatosEquipoTrabajo> {
  // 1. Obtener departamento y datos del usuario
  const usuarioInfo = await queryRow<{
    id_departamento: number | null;
    depto_nombre: string | null;
  }>(
    `SELECT u.id_departamento, COALESCE(d.nombre, 'Equipo Técnico de Soporte') AS depto_nombre
     FROM usuario u
     LEFT JOIN departamento_ti d ON d.id_departamento = u.id_departamento
     WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  const idDepto = usuarioInfo?.id_departamento;
  const nombreEquipo = usuarioInfo?.depto_nombre || "Equipo Técnico de Soporte";

  // 2. Obtener integrantes del equipo
  let integrantes: IntegranteEquipo[] = [];
  if (idDepto) {
    const rows = await query<{
      id_usuario: number;
      nombre_completo: string;
      correo: string;
      cargo: string | null;
    }>(
      `SELECT u.id_usuario,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre_completo,
              u.correo_electronico AS correo,
              COALESCE((
                SELECT p.nombre FROM usuario_perfiles up
                JOIN perfiles p ON p.id_perfil = up.id_perfil
                WHERE up.id_usuario = u.id_usuario AND up.estado_registro = true
                LIMIT 1
              ), 'Especialista Técnico') AS cargo
       FROM usuario u
       WHERE u.id_departamento = $1 AND u.estado_registro = true
       ORDER BY u.nombres ASC`,
      [idDepto]
    );

    integrantes = rows.map((r) => ({
      id_usuario: r.id_usuario,
      nombre_completo: r.nombre_completo,
      correo: r.correo,
      cargo: r.cargo,
      rol: r.id_usuario === idUsuario ? "Tú (Especialista)" : "Compañero de Equipo",
    }));
  }

  // 3. Consultar cambio RFC activo (solo puede tener 1 cambio en curso: estados 2, 3 o 4)
  const activoRow = await queryRow<any>(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.descripcion, c.tipo_cambio, c.id_estado,
            c.ventana_inicio, c.ventana_fin, c.plan_implementacion, c.plan_rollback,
            ci.codigo_ci, ci.nombre AS nombre_ci,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable
     FROM cambio c
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = c.id_ci_afectado
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true
       AND (
         c.id_usuario_responsable = $1
         OR c.id_usuario_solicitante = $1
         OR ($2::int IS NOT NULL AND c.id_usuario_responsable IN (SELECT u2.id_usuario FROM usuario u2 WHERE u2.id_departamento = $2))
       )
       AND c.id_estado IN (2, 3, 4)
     ORDER BY c.id_estado DESC, c.fecha_creacion DESC
     LIMIT 1`,
    [idUsuario, idDepto || null]
  );

  let cambioActivo: CambioEquipoResumen | null = null;
  if (activoRow) {
    const { nombre: nombre_estado, color: color_estado } = mapearEstado(activoRow.id_estado);
    cambioActivo = {
      id_cambio: activoRow.id_cambio,
      codigo_cambio: activoRow.codigo_cambio,
      titulo: activoRow.titulo,
      descripcion: activoRow.descripcion,
      tipo_cambio: activoRow.tipo_cambio,
      id_estado: activoRow.id_estado,
      nombre_estado,
      color_estado,
      ventana_inicio: activoRow.ventana_inicio,
      ventana_fin: activoRow.ventana_fin,
      codigo_ci: activoRow.codigo_ci,
      nombre_ci: activoRow.nombre_ci,
      solicitante: activoRow.solicitante || "Sistema",
      responsable: activoRow.responsable || "Sin asignar",
      plan_implementacion: activoRow.plan_implementacion,
      plan_rollback: activoRow.plan_rollback,
    };
  }

  // 4. Consultar historial de cambios anteriores resueltos (estados 5, 6, 7)
  const historialRows = await query<any>(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.descripcion, c.tipo_cambio, c.id_estado,
            c.ventana_inicio, c.ventana_fin, c.plan_implementacion, c.plan_rollback,
            ci.codigo_ci, ci.nombre AS nombre_ci,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable
     FROM cambio c
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = c.id_ci_afectado
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true
       AND (
         c.id_usuario_responsable = $1
         OR c.id_usuario_solicitante = $1
         OR ($2::int IS NOT NULL AND c.id_usuario_responsable IN (SELECT u2.id_usuario FROM usuario u2 WHERE u2.id_departamento = $2))
       )
       AND c.id_estado IN (5, 6, 7)
     ORDER BY c.fecha_creacion DESC
     LIMIT 8`,
    [idUsuario, idDepto || null]
  );

  const historial: CambioEquipoResumen[] = historialRows.map((r) => {
    const { nombre: nombre_estado, color: color_estado } = mapearEstado(r.id_estado);
    return {
      id_cambio: r.id_cambio,
      codigo_cambio: r.codigo_cambio,
      titulo: r.titulo,
      descripcion: r.descripcion,
      tipo_cambio: r.tipo_cambio,
      id_estado: r.id_estado,
      nombre_estado,
      color_estado,
      ventana_inicio: r.ventana_inicio,
      ventana_fin: r.ventana_fin,
      codigo_ci: r.codigo_ci,
      nombre_ci: r.nombre_ci,
      solicitante: r.solicitante || "Sistema",
      responsable: r.responsable || "Sin asignar",
      plan_implementacion: r.plan_implementacion,
      plan_rollback: r.plan_rollback,
    };
  });

  return {
    nombreEquipo,
    descripcionEquipo: `Área técnica de soporte asignada para intervenciones de infraestructura y servicios.`,
    integrantes,
    cambioActivo,
    historial,
  };
}

export interface EquipoTICompleto {
  id_departamento: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  supervisor_nombre: string;
  total_integrantes: number;
  cambios_activos: number;
  integrantes: {
    id_usuario: number;
    nombre: string;
    correo: string;
    cargo: string;
  }[];
}

export async function obtenerTodosLosEquiposTrabajo(): Promise<EquipoTICompleto[]> {
  const deptos = await query<any>(`
    SELECT d.id_departamento, d.codigo, d.nombre, d.descripcion,
           CONCAT(s.nombres, ' ', s.apellido_paterno) AS supervisor_nombre
    FROM departamento_ti d
    LEFT JOIN usuario s ON s.id_usuario = d.id_supervisor
    WHERE d.estado_registro = true
    ORDER BY d.nombre ASC
  `);

  const usuarios = await query<any>(`
    SELECT u.id_usuario, u.id_departamento,
           CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
           u.correo_electronico AS correo,
           COALESCE(p.nombre, 'Técnico') AS cargo
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
    LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
    WHERE u.estado_registro = true
    ORDER BY u.nombres
  `);

  const cambiosActivos = await query<any>(`
    SELECT u.id_departamento, COUNT(c.id_cambio)::int AS total
    FROM cambio c
    JOIN usuario u ON u.id_usuario = c.id_usuario_responsable
    WHERE c.estado_registro = true AND c.id_estado IN (2, 3, 4)
    GROUP BY u.id_departamento
  `);

  const mapaActivos = new Map<number, number>();
  cambiosActivos.forEach((c) => mapaActivos.set(c.id_departamento, c.total));

  return deptos.map((d) => {
    const ints = usuarios.filter((u) => u.id_departamento === d.id_departamento);
    return {
      id_departamento: d.id_departamento,
      codigo: d.codigo || `DEP-${d.id_departamento}`,
      nombre: d.nombre,
      descripcion: d.descripcion || "Equipo técnico de operaciones TI",
      supervisor_nombre: d.supervisor_nombre || "Sin supervisor asignado",
      total_integrantes: ints.length,
      cambios_activos: mapaActivos.get(d.id_departamento) || 0,
      integrantes: ints.map((i) => ({
        id_usuario: i.id_usuario,
        nombre: i.nombre,
        correo: i.correo,
        cargo: i.cargo,
      })),
    };
  });
}

export async function listarCambiosSinAsignar(): Promise<any[]> {
  return query(`
    SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.descripcion, c.tipo_cambio,
           c.id_estado, c.fecha_creacion,
           it.nombre AS impacto_nombre,
           pt.nombre AS prioridad_nombre,
           CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre
    FROM cambio c
    LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
    LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = c.id_prioridad
    LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
    WHERE c.estado_registro = true
      AND c.id_usuario_responsable IS NULL
    ORDER BY c.fecha_creacion DESC
  `);
}

export async function asignarResponsableCambio(idCambio: number, idUsuarioResponsable: number) {
  return queryRow(`
    UPDATE cambio
    SET id_usuario_responsable = $2,
        fecha_modificacion = now()
    WHERE id_cambio = $1 AND estado_registro = true
    RETURNING id_cambio, codigo_cambio, id_usuario_responsable
  `, [idCambio, idUsuarioResponsable]);
}

export async function crearNuevoEquipoTrabajo(codigo: string, nombre: string, descripcion: string, idSupervisor?: number) {
  return queryRow(`
    INSERT INTO departamento_ti (codigo, nombre, descripcion, id_supervisor, estado_registro)
    VALUES ($1, $2, $3, $4, true)
    RETURNING id_departamento, codigo, nombre, descripcion
  `, [codigo.trim().toUpperCase(), nombre.trim(), descripcion.trim(), idSupervisor || null]);
}

export async function obtenerTecnicosDisponibles() {
  return query(`
    SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
           u.correo_electronico AS correo, u.id_departamento, d.nombre AS departamento_nombre
    FROM usuario u
    JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
    LEFT JOIN departamento_ti d ON d.id_departamento = u.id_departamento
    WHERE u.estado_registro = true AND up.id_perfil IN (2, 4, 8)
    ORDER BY u.nombres
  `);
}
