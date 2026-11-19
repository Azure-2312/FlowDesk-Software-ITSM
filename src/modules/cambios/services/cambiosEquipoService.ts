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
              u.cargo
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
