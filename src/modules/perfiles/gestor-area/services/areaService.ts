import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Servicio del portal del Gestor de Área (perfil 5).
 * Alcance: el departamento empresarial (`usuario.id_departamento_empresa`) del
 * usuario; los tickets se relacionan por `ticket.id_departamento_empresa`.
 */

async function areaDeUsuario(idUsuario: number) {
  const area = await queryRow<{ id_departamento_empresa: number; nombre: string }>(
    `SELECT u.id_departamento_empresa, d.nombre
     FROM usuario u
     JOIN departamento_empresa d ON d.id_departamento_empresa = u.id_departamento_empresa
     WHERE u.id_usuario = $1 AND d.estado_registro = true`,
    [idUsuario]
  );
  if (!area || !area.id_departamento_empresa) {
    throw new ErrorDominio("Tu usuario no tiene un departamento empresarial activo asignado.", 409);
  }
  return area;
}

/** Condición reutilizable: cambios que afectan al área empresarial $1. */
const CAMBIOS_DEL_AREA = `(
  c.id_usuario_solicitante IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = $1)
  OR c.id_incidente_origen IN (SELECT id_ticket FROM ticket WHERE id_departamento_empresa = $1)
)`;

export async function obtenerPanelArea(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);

  const kpis = await queryRow<any>(
    `SELECT
       COUNT(*) FILTER (WHERE et.es_terminal = false)::int AS abiertos,
       COUNT(*) FILTER (WHERE et.es_terminal = true)::int AS cerrados,
       COUNT(*) FILTER (WHERE t.estado_aprobacion = 'PENDIENTE_APROBACION')::int AS aprobaciones_pendientes,
       COUNT(*) FILTER (WHERE et.es_terminal = false AND t.fecha_limite_sla < now())::int AS vencidos,
       ROUND(AVG(t.calificacion_csat)::numeric, 2) AS csat_promedio
     FROM ticket t
     LEFT JOIN estado_ticket et ON et.id_estado = t.id_estado
     WHERE t.estado_registro = true AND t.id_departamento_empresa = $1`,
    [area.id_departamento_empresa]
  );

  const cambiosProximos = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado,
            CASE c.id_estado WHEN 3 THEN 'Aprobado' WHEN 4 THEN 'En Planificación' WHEN 5 THEN 'En Ejecución' ELSE 'Programado' END AS estado_nombre,
            c.ventana_inicio, c.ventana_fin
     FROM cambio c
     WHERE c.estado_registro = true AND c.id_estado IN (3, 4, 5)
       AND c.ventana_fin >= now() - interval '1 day'
       AND ${CAMBIOS_DEL_AREA}
     ORDER BY c.ventana_inicio ASC`,
    [area.id_departamento_empresa]
  );

  return {
    departamento: area.nombre,
    kpis: {
      abiertos: kpis?.abiertos ?? 0,
      cerrados: kpis?.cerrados ?? 0,
      aprobaciones_pendientes: kpis?.aprobaciones_pendientes ?? 0,
      vencidos: kpis?.vencidos ?? 0,
      csat_promedio:
        kpis?.csat_promedio !== null && kpis?.csat_promedio !== undefined ? Number(kpis.csat_promedio) : null,
    },
    cambiosProximos,
  };
}

export async function listarAprobacionesNegocio(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.justificacion,
            c.ventana_inicio, c.ventana_fin, c.fecha_creacion,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre
     FROM cambio c
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND c.id_estado = 2
       AND ${CAMBIOS_DEL_AREA}
       AND NOT EXISTS (
         SELECT 1 FROM cambio_aprobacion ca
         WHERE ca.id_cambio = c.id_cambio AND ca.id_usuario_aprobador = $2 AND ca.estado_registro = true
       )
     ORDER BY c.fecha_creacion ASC`,
    [area.id_departamento_empresa, idUsuario]
  );
}

export async function resolverAprobacionNegocio(
  idUsuario: number,
  idCambio: number,
  decision: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO", "OBSERVADO"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBADO, RECHAZADO u OBSERVADO.");
  }
  if (!comentario || String(comentario).trim().length < 3) {
    throw new ErrorDominio("El comentario de la decisión es obligatorio.");
  }

  const area = await areaDeUsuario(idUsuario);
  const alcance = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM cambio c
       WHERE c.id_cambio = $2 AND c.estado_registro = true AND ${CAMBIOS_DEL_AREA}
     ) AS existe`,
    [area.id_departamento_empresa, idCambio]
  );
  if (!alcance?.existe) throw new ErrorDominio("El cambio no afecta a tu área.", 404);

  const aprobacion = await queryRow<any>(
    `INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cambio_aprobacion, id_cambio, decision, fecha_decision`,
    [idCambio, idUsuario, normalizada, String(comentario).trim()]
  );

  if (normalizada === "APROBADO") {
    await query(`UPDATE cambio SET id_estado = 3 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  } else if (normalizada === "RECHAZADO") {
    await query(`UPDATE cambio SET id_estado = 8 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  }

  return { mensaje: "Decisión registrada.", aprobacion };
}

export async function listarHistorialDecisiones(idUsuario: number) {
  return query(
    `SELECT ca.id_cambio_aprobacion, ca.id_cambio, ca.decision, ca.comentario, ca.fecha_decision,
            c.codigo_cambio, c.titulo, c.tipo_cambio
     FROM cambio_aprobacion ca
     JOIN cambio c ON c.id_cambio = ca.id_cambio
     WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true
     ORDER BY ca.fecha_decision DESC`,
    [idUsuario]
  );
}

export async function listarDelegaciones(idUsuario: number) {
  return query(
    `SELECT d.id_delegacion, d.fecha_desde, d.fecha_hasta, d.motivo, d.fecha_creacion,
            d.id_usuario_delegado,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS delegado_nombre
     FROM aprobacion_delegacion d
     JOIN usuario u ON u.id_usuario = d.id_usuario_delegado
     WHERE d.id_usuario_delegante = $1 AND d.estado_registro = true
     ORDER BY d.fecha_desde DESC`,
    [idUsuario]
  );
}

export async function crearDelegacion(idUsuario: number, body: any) {
  const area = await areaDeUsuario(idUsuario);
  const idDelegado = Number(body.id_usuario_delegado);
  const desde = body.fecha_desde;
  const hasta = body.fecha_hasta;
  if (!idDelegado || !desde || !hasta) {
    throw new ErrorDominio("Debes indicar el suplente y el rango de fechas.");
  }
  if (new Date(hasta).getTime() < new Date(desde).getTime()) {
    throw new ErrorDominio("La fecha de fin debe ser posterior o igual a la de inicio.");
  }
  if (idDelegado === idUsuario) {
    throw new ErrorDominio("No puedes delegarte a ti mismo.");
  }

  const pertenece = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM usuario WHERE id_usuario = $1 AND id_departamento_empresa = $2 AND estado_registro = true
     ) AS existe`,
    [idDelegado, area.id_departamento_empresa]
  );
  if (!pertenece?.existe) throw new ErrorDominio("El suplente debe pertenecer a tu área.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO aprobacion_delegacion (id_usuario_delegante, id_usuario_delegado, fecha_desde, fecha_hasta, motivo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_delegacion, id_usuario_delegado, fecha_desde, fecha_hasta, motivo`,
    [idUsuario, idDelegado, desde, hasta, body.motivo ?? null]
  );
  return { mensaje: "Delegación registrada.", delegacion: fila };
}

export async function eliminarDelegacion(idUsuario: number, idDelegacion: number) {
  const fila = await queryRow<any>(
    `UPDATE aprobacion_delegacion
     SET estado_registro = false
     WHERE id_delegacion = $1 AND id_usuario_delegante = $2 AND estado_registro = true
     RETURNING id_delegacion`,
    [idDelegacion, idUsuario]
  );
  if (!fila) throw new ErrorDominio("La delegación no existe.", 404);
  return { mensaje: "Delegación eliminada." };
}

export async function listarCambiosImpacto(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado,
            CASE c.id_estado WHEN 3 THEN 'Aprobado' WHEN 4 THEN 'En Planificación' WHEN 5 THEN 'En Ejecución' ELSE 'Programado' END AS estado_nombre,
            c.ventana_inicio, c.ventana_fin,
            it.nombre AS impacto_nombre
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     WHERE c.estado_registro = true AND c.id_estado IN (3, 4, 5)
       AND c.ventana_fin >= now() - interval '7 days'
       AND ${CAMBIOS_DEL_AREA}
     ORDER BY c.ventana_inicio ASC`,
    [area.id_departamento_empresa]
  );
}

export async function listarActivosArea(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);
  return query(
    `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            a.estado_activo, a.fecha_adquisicion, a.fecha_fin_garantia,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS custodio_nombre
     FROM activo a
     LEFT JOIN usuario u ON u.id_usuario = a.id_usuario_custodio
     WHERE a.estado_registro = true
       AND a.id_usuario_custodio IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = $1)
     ORDER BY a.codigo_patrimonial ASC`,
    [area.id_departamento_empresa]
  );
}

export async function listarContratosArea(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);
  return query(
    `SELECT la.id_asignacion, ls.id_licencia, ls.nombre_software, ls.fabricante, ls.tipo_licencia,
            ls.fecha_vencimiento, ls.cantidad_adquirida, ls.cantidad_en_uso,
            la.fecha_asignacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM licencia_asignacion la
     JOIN licencia_software ls ON ls.id_licencia = la.id_licencia
     LEFT JOIN usuario u ON u.id_usuario = la.id_usuario
     WHERE ls.estado_registro = true AND la.fecha_devolucion IS NULL
       AND la.id_usuario IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = $1)
     ORDER BY ls.nombre_software ASC`,
    [area.id_departamento_empresa]
  );
}

export async function obtenerReportesArea(idUsuario: number) {
  const area = await areaDeUsuario(idUsuario);

  const porServicio = await query<any>(
    `SELECT
       COALESCE(s.nombre, 'Sin servicio') AS servicio,
       COUNT(*)::int AS tickets,
       COUNT(*) FILTER (WHERE et.es_terminal = false)::int AS abiertos,
       COUNT(*) FILTER (WHERE et.es_terminal = false AND t.fecha_limite_sla < now())::int AS vencidos
     FROM ticket t
     LEFT JOIN servicio_catalogo s ON s.id_servicio = t.id_servicio
     LEFT JOIN estado_ticket et ON et.id_estado = t.id_estado
     WHERE t.estado_registro = true AND t.id_departamento_empresa = $1
     GROUP BY s.nombre
     ORDER BY tickets DESC`,
    [area.id_departamento_empresa]
  );

  const resumen = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE t.sla_cumplido = true)::int AS sla_cumplidos,
       COUNT(*) FILTER (WHERE t.calificacion_csat IS NOT NULL)::int AS evaluados,
       ROUND(AVG(t.calificacion_csat)::numeric, 2) AS csat_promedio
     FROM ticket t
     WHERE t.estado_registro = true AND t.id_departamento_empresa = $1`,
    [area.id_departamento_empresa]
  );

  const costo = await queryRow<any>(
    `SELECT COALESCE(SUM(DISTINCT ls.costo_anual), 0) AS costo_referencial
     FROM licencia_asignacion la
     JOIN licencia_software ls ON ls.id_licencia = la.id_licencia
     WHERE la.fecha_devolucion IS NULL AND ls.estado_registro = true
       AND la.id_usuario IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = $1)`,
    [area.id_departamento_empresa]
  );

  const total = resumen?.total ?? 0;
  const slaCumplidos = resumen?.sla_cumplidos ?? 0;

  return {
    departamento: area.nombre,
    resumen: {
      total,
      sla_cumplidos: slaCumplidos,
      sla_porcentaje: total > 0 ? Math.round((slaCumplidos / total) * 100) : null,
      evaluados: resumen?.evaluados ?? 0,
      csat_promedio:
        resumen?.csat_promedio !== null && resumen?.csat_promedio !== undefined
          ? Number(resumen.csat_promedio)
          : null,
      costo_referencial: Number(costo?.costo_referencial ?? 0),
    },
    porServicio,
  };
}
