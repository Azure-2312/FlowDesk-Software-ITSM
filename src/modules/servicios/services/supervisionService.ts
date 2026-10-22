import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Servicio de supervisión (perfil 4).
 * Alcance: tickets, cambios y activos del área técnica del supervisor
 * (departamentos donde `departamento_ti.id_supervisor` = usuario).
 */

type Sesion = { id_usuario: number };

const DEPTS_DEL_SUPERVISOR = `SELECT d.id_departamento FROM departamento_ti d
   WHERE d.id_supervisor = $1 AND d.estado_registro = true`;

const AREA_TICKETS = `t.id_departamento IN (${DEPTS_DEL_SUPERVISOR})`;
const AREA_ACTIVOS = `a.id_departamento IN (${DEPTS_DEL_SUPERVISOR})`;
const AREA_CAMBIOS = `c.id_usuario_solicitante IN (
   SELECT u.id_usuario FROM usuario u
   WHERE u.id_departamento IN (${DEPTS_DEL_SUPERVISOR})
)`;

export async function obtenerPanelSupervision(sesion: Sesion) {
  const kpis = await queryRow<any>(
    `SELECT
       COUNT(*) FILTER (WHERE t.fecha_cierre IS NULL)::int AS abiertos,
       COUNT(*) FILTER (WHERE t.fecha_cierre IS NULL AND t.id_usuario_asignado IS NULL)::int AS sin_asignar,
       COUNT(*) FILTER (WHERE t.fecha_cierre IS NULL AND t.fecha_limite_sla < now())::int AS vencidos,
       COUNT(*) FILTER (WHERE t.fecha_cierre IS NULL AND t.fecha_limite_sla BETWEEN now() AND now() + interval '4 hours')::int AS por_vencer,
       ROUND(AVG(t.calificacion_csat)::numeric, 2) AS csat_promedio
     FROM ticket t
     WHERE t.estado_registro = true AND ${AREA_TICKETS}`,
    [sesion.id_usuario]
  );

  const tecnicos = await query<any>(
    `SELECT
       u.id_usuario,
       CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
       COUNT(t.id_ticket) FILTER (WHERE t.fecha_cierre IS NULL)::int AS asignados_abiertos,
       COUNT(t.id_ticket) FILTER (WHERE t.fecha_cierre IS NULL AND t.fecha_limite_sla < now())::int AS vencidos
     FROM usuario u
     LEFT JOIN ticket t ON t.id_usuario_asignado = u.id_usuario AND t.estado_registro = true
     WHERE u.id_departamento IN (${DEPTS_DEL_SUPERVISOR}) AND u.estado_registro = true
     GROUP BY u.id_usuario, u.nombres, u.apellido_paterno
     ORDER BY asignados_abiertos DESC`,
    [sesion.id_usuario]
  );

  const alertasRow = await queryRow<any>(
    `SELECT
       (SELECT COUNT(*)::int FROM incidente_mayor im
          WHERE im.estado = 'ABIERTO' AND im.estado_registro = true) AS incidentes_mayores,
       (SELECT COUNT(*)::int FROM ticket t
          WHERE t.estado_registro = true AND ${AREA_TICKETS}
            AND t.fecha_cierre IS NULL AND t.id_usuario_asignado IS NULL AND t.id_prioridad IN (1, 2)) AS p1p2_sin_asignar,
       (SELECT COUNT(*)::int FROM cambio c
          WHERE c.estado_registro = true AND ${AREA_CAMBIOS} AND c.id_estado = 2) AS aprobaciones_pendientes`,
    [sesion.id_usuario]
  );

  const sobrecargados = tecnicos.filter((t) => t.asignados_abiertos >= 10).length;

  return {
    kpis: {
      abiertos: kpis?.abiertos ?? 0,
      sin_asignar: kpis?.sin_asignar ?? 0,
      vencidos: kpis?.vencidos ?? 0,
      por_vencer: kpis?.por_vencer ?? 0,
      csat_promedio: kpis?.csat_promedio !== null && kpis?.csat_promedio !== undefined ? Number(kpis.csat_promedio) : null,
    },
    alertas: {
      incidentes_mayores: alertasRow?.incidentes_mayores ?? 0,
      p1p2_sin_asignar: alertasRow?.p1p2_sin_asignar ?? 0,
      aprobaciones_pendientes: alertasRow?.aprobaciones_pendientes ?? 0,
      tecnicos_sobrecargados: sobrecargados,
    },
    tecnicos,
  };
}

export async function listarEscalamientos(sesion: Sesion) {
  return query(
    `SELECT
       t.id_ticket, t.codigo_ticket, t.titulo, t.id_estado, et.nombre AS estado_nombre,
       t.id_prioridad, pt.nombre AS prioridad_nombre,
       t.fecha_limite_sla,
       CASE WHEN t.fecha_limite_sla < now() THEN 'VENCIDO' ELSE 'EN_RIESGO' END AS riesgo,
       CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS asignado_nombre
     FROM ticket t
     LEFT JOIN estado_ticket et ON et.id_estado = t.id_estado
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = t.id_prioridad
     LEFT JOIN usuario ua ON ua.id_usuario = t.id_usuario_asignado
     WHERE t.estado_registro = true AND ${AREA_TICKETS}
       AND t.fecha_cierre IS NULL
       AND t.fecha_limite_sla <= now() + interval '4 hours'
     ORDER BY t.fecha_limite_sla ASC`,
    [sesion.id_usuario]
  );
}

export async function listarIncumplimientos(sesion: Sesion) {
  const porServicio = await query<any>(
    `SELECT
       COALESCE(s.nombre, 'Sin servicio') AS servicio,
       COUNT(*)::int AS vencidos
     FROM ticket t
     LEFT JOIN servicio_catalogo s ON s.id_servicio = t.id_servicio
     WHERE t.estado_registro = true AND ${AREA_TICKETS}
       AND t.fecha_limite_sla < now()
     GROUP BY s.nombre
     ORDER BY vencidos DESC`,
    [sesion.id_usuario]
  );

  const porTecnico = await query<any>(
    `SELECT
       COALESCE(CONCAT(u.nombres, ' ', u.apellido_paterno), 'Sin asignar') AS tecnico,
       COUNT(*)::int AS vencidos,
       COUNT(*) FILTER (WHERE t.fecha_cierre IS NULL)::int AS aun_abiertos
     FROM ticket t
     LEFT JOIN usuario u ON u.id_usuario = t.id_usuario_asignado
     WHERE t.estado_registro = true AND ${AREA_TICKETS}
       AND t.fecha_limite_sla < now()
     GROUP BY u.id_usuario, u.nombres, u.apellido_paterno
     ORDER BY vencidos DESC`,
    [sesion.id_usuario]
  );

  const total = await queryRow<any>(
    `SELECT COUNT(*)::int AS vencidos
     FROM ticket t
     WHERE t.estado_registro = true AND ${AREA_TICKETS} AND t.fecha_limite_sla < now()`,
    [sesion.id_usuario]
  );

  return { total: total?.vencidos ?? 0, porServicio, porTecnico };
}

export async function listarProductividad(sesion: Sesion) {
  return query(
    `SELECT
       u.id_usuario,
       CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico,
       COUNT(t.id_ticket) FILTER (WHERE t.fecha_cierre IS NOT NULL)::int AS resueltos,
       ROUND(AVG(EXTRACT(EPOCH FROM (t.fecha_resolucion - t.fecha_creacion)) / 3600)::numeric, 1) AS horas_promedio,
       ROUND(AVG(t.calificacion_csat)::numeric, 2) AS csat_promedio,
       COUNT(t.id_ticket) FILTER (WHERE t.sla_cumplido = false)::int AS sla_incumplidos
     FROM usuario u
     LEFT JOIN ticket t ON t.id_usuario_asignado = u.id_usuario AND t.estado_registro = true
     WHERE u.id_departamento IN (${DEPTS_DEL_SUPERVISOR}) AND u.estado_registro = true
     GROUP BY u.id_usuario, u.nombres, u.apellido_paterno
     ORDER BY resueltos DESC`,
    [sesion.id_usuario]
  );
}

export async function listarAprobacionesTecnicas(sesion: Sesion) {
  return query(
    `SELECT
       c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado, c.ventana_inicio, c.ventana_fin,
       c.justificacion,
       CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
       c.fecha_creacion
     FROM cambio c
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND ${AREA_CAMBIOS} AND c.id_estado = 2
     ORDER BY c.fecha_creacion ASC`,
    [sesion.id_usuario]
  );
}

export async function listarCambiosProgramables(sesion: Sesion) {
  return query(
    `SELECT
       c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado,
       CASE c.id_estado WHEN 3 THEN 'Aprobado' WHEN 4 THEN 'En Planificación' ELSE 'Programado' END AS estado_nombre,
       c.ventana_inicio, c.ventana_fin,
       CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre
     FROM cambio c
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND ${AREA_CAMBIOS} AND c.id_estado IN (3, 4)
     ORDER BY c.ventana_inicio ASC`,
    [sesion.id_usuario]
  );
}

export async function listarBajasPendientes(sesion: Sesion) {
  return query(
    `SELECT
       s.id_solicitud, s.motivo, s.estado, s.fecha_solicitud,
       a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
       CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM solicitud_baja_activo s
     JOIN activo a ON a.id_activo = s.id_activo
     LEFT JOIN usuario u ON u.id_usuario = s.id_usuario_solicita
     WHERE s.estado_registro = true AND ${AREA_ACTIVOS}
     ORDER BY (s.estado = 'PENDIENTE') DESC, s.fecha_solicitud DESC`,
    [sesion.id_usuario]
  );
}

export async function listarRecursosEquipo(sesion: Sesion, tipo?: string | null) {
  const params: any[] = [sesion.id_usuario];
  let filtro = "";
  if (tipo) {
    filtro = " AND r.tipo = $2";
    params.push(String(tipo).toUpperCase());
  }
  return query(
    `SELECT r.id_recurso, r.tipo, r.nombre, r.contenido, r.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS creador_nombre
     FROM equipo_recurso_compartido r
     LEFT JOIN usuario u ON u.id_usuario = r.id_usuario_creacion
     WHERE r.estado_registro = true
       AND (r.id_departamento IN (${DEPTS_DEL_SUPERVISOR}) OR r.id_departamento IS NULL)${filtro}
     ORDER BY r.tipo, r.nombre`,
    params
  );
}

export async function crearRecursoEquipo(sesion: Sesion, body: any) {
  const tipo = String(body.tipo || "").toUpperCase();
  if (!["VISTA", "RESPUESTA"].includes(tipo)) {
    throw new ErrorDominio("El tipo debe ser VISTA o RESPUESTA.");
  }
  const nombre = String(body.nombre || "").trim();
  if (nombre.length < 3) throw new ErrorDominio("El nombre debe tener al menos 3 caracteres.");

  const fila = await queryRow<any>(
    `INSERT INTO equipo_recurso_compartido (tipo, nombre, contenido, id_departamento, id_usuario_creacion)
     VALUES ($1, $2, $3::jsonb, $4, $5)
     RETURNING id_recurso, tipo, nombre, contenido, fecha_creacion`,
    [tipo, nombre, JSON.stringify(body.contenido ?? {}), body.id_departamento ?? null, sesion.id_usuario]
  );
  return { mensaje: "Recurso del equipo creado.", recurso: fila };
}

export async function eliminarRecursoEquipo(sesion: Sesion, idRecurso: number) {
  const fila = await queryRow<any>(
    `UPDATE equipo_recurso_compartido
     SET estado_registro = false
     WHERE id_recurso = $1 AND estado_registro = true
     RETURNING id_recurso`,
    [idRecurso]
  );
  if (!fila) throw new ErrorDominio("El recurso no existe.", 404);
  return { mensaje: "Recurso eliminado." };
}

export async function listarProblemasSinAsignar(sesion: Sesion) {
  return query(
    `SELECT
       p.id_problema, p.codigo_problema, p.titulo, p.id_estado,
       pt.nombre AS prioridad_nombre,
       p.fecha_creacion,
       CONCAT(u.nombres, ' ', u.apellido_paterno) AS asignado_nombre
     FROM problema p
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true
       AND p.id_departamento IN (${DEPTS_DEL_SUPERVISOR})
     ORDER BY (p.id_usuario_asignado IS NULL) DESC, p.fecha_creacion ASC`,
    [sesion.id_usuario]
  );
}

export async function asignarProblema(sesion: Sesion, idProblema: number, idUsuarioAsignado: number) {
  if (!idUsuarioAsignado) throw new ErrorDominio("Debes seleccionar un responsable.");
  const alcance = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM problema p
       WHERE p.id_problema = $1 AND p.estado_registro = true
         AND p.id_departamento IN (${DEPTS_DEL_SUPERVISOR})
     ) AS existe`,
    [idProblema, sesion.id_usuario]
  );
  if (!alcance?.existe) throw new ErrorDominio("Problema no encontrado en tu área.", 404);

  const fila = await queryRow<any>(
    `UPDATE problema
     SET id_usuario_asignado = $2, usuario_modificacion = $3, fecha_modificacion = now()
     WHERE id_problema = $1
     RETURNING id_problema, codigo_problema, id_usuario_asignado`,
    [idProblema, idUsuarioAsignado, sesion.id_usuario]
  );
  return { mensaje: "Problema asignado.", problema: fila };
}
