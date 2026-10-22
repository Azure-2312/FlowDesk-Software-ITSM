import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Servicio del portal del Auditor (perfil 6). Lectura transversal de la
 * operación y de la bitácora de auditoría del sistema; los informes son
 * documentos de auditoría (no modifican la operación).
 */

export async function obtenerPanelAuditoria() {
  const [eventos, accesosFallidos, cambiosSinAprobacion, bajasMes, informesAbiertos] = await Promise.all([
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM log_auditoria_sistema WHERE fecha_creacion >= now() - interval '30 days'`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM log_acceso WHERE exitoso = false AND fecha >= now() - interval '7 days'`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio c
       WHERE c.estado_registro = true AND c.id_estado IN (5, 6)
         AND NOT EXISTS (
           SELECT 1 FROM cambio_aprobacion ca
           WHERE ca.id_cambio = c.id_cambio AND ca.decision = 'APROBADO' AND ca.estado_registro = true
         )`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM activo
       WHERE estado_registro = true AND estado_activo = 'BAJA'
         AND fecha_inactivacion >= date_trunc('month', now())`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM informe_auditoria WHERE estado_registro = true AND estado <> 'CERRADO'`
    ),
  ]);

  const cmdb = await queryRow<{ c: number }>(
    `SELECT (
       (SELECT COUNT(*) FROM activo a
          WHERE a.estado_registro = true
            AND NOT EXISTS (SELECT 1 FROM elemento_configuracion ci WHERE ci.id_activo = a.id_activo AND ci.estado_registro = true))
       + (SELECT COUNT(*) FROM elemento_configuracion ci
          WHERE ci.estado_registro = true AND ci.id_activo IS NULL)
       + (SELECT COUNT(*) FROM elemento_configuracion ci
          WHERE ci.estado_registro = true
            AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci))
     )::int AS c`
  );

  // Hallazgos: lista corta de los incumplimientos más relevantes.
  const hallazgos: { tipo: string; severidad: "ALTA" | "MEDIA" | "BAJA"; detalle: string; referencia: string }[] = [];

  const cambiosIrregulares = await query<{ codigo_cambio: string; titulo: string; id_estado: number }>(
    `SELECT c.codigo_cambio, c.titulo, c.id_estado FROM cambio c
     WHERE c.estado_registro = true AND c.id_estado IN (5, 6)
       AND NOT EXISTS (
         SELECT 1 FROM cambio_aprobacion ca
         WHERE ca.id_cambio = c.id_cambio AND ca.decision = 'APROBADO' AND ca.estado_registro = true
       )
     ORDER BY c.id_cambio DESC LIMIT 5`
  );
  for (const c of cambiosIrregulares) {
    hallazgos.push({
      tipo: "Cambio sin autorización",
      severidad: "ALTA",
      detalle: `${c.codigo_cambio} · ${c.titulo}`,
      referencia: `estado ${c.id_estado}`,
    });
  }

  const autoaprobaciones = await query<{ codigo_ticket: string; titulo: string }>(
    `SELECT t.codigo_ticket, t.titulo
     FROM ticket_aprobacion ta
     JOIN ticket t ON t.id_ticket = ta.id_ticket
     WHERE ta.estado_registro = true AND ta.estado_decision = 'APROBADO'
       AND ta.id_usuario_aprobador = t.id_usuario_solicitante
     ORDER BY ta.fecha_decision DESC LIMIT 5`
  );
  for (const t of autoaprobaciones) {
    hallazgos.push({
      tipo: "Autoaprobación (SoD)",
      severidad: "ALTA",
      detalle: `${t.codigo_ticket} · ${t.titulo}`,
      referencia: "aprobador = solicitante",
    });
  }

  const bajasSinMotivo = await query<{ codigo_patrimonial: string }>(
    `SELECT codigo_patrimonial FROM activo
     WHERE estado_registro = true AND estado_activo = 'BAJA'
       AND (motivo_inactivacion IS NULL OR btrim(motivo_inactivacion) = '')
     ORDER BY fecha_inactivacion DESC NULLS LAST LIMIT 5`
  );
  for (const a of bajasSinMotivo) {
    hallazgos.push({
      tipo: "Baja sin sustento",
      severidad: "MEDIA",
      detalle: `Activo ${a.codigo_patrimonial}`,
      referencia: "falta motivo de baja",
    });
  }

  return {
    kpis: {
      eventos_auditoria: eventos?.c ?? 0,
      accesos_fallidos: accesosFallidos?.c ?? 0,
      cambios_sin_aprobacion: cambiosSinAprobacion?.c ?? 0,
      cmdb_inconsistencias: cmdb?.c ?? 0,
      bajas_mes: bajasMes?.c ?? 0,
      informes_abiertos: informesAbiertos?.c ?? 0,
    },
    hallazgos,
  };
}

export async function contarMuestreo() {
  const fila = await queryRow<any>(
    `SELECT
       (SELECT COUNT(*) FROM ticket WHERE estado_registro = true)::int AS tickets,
       (SELECT COUNT(*) FROM cambio WHERE estado_registro = true)::int AS cambios,
       (SELECT COUNT(*) FROM activo WHERE estado_registro = true AND estado_activo = 'BAJA')::int AS bajas`
  );
  return {
    tickets: fila?.tickets ?? 0,
    cambios: fila?.cambios ?? 0,
    bajas: fila?.bajas ?? 0,
  };
}

export async function generarMuestreo(tipo: string, tamano: number) {
  const t = String(tipo || "").toLowerCase();
  const n = Math.min(Math.max(Number(tamano) || 10, 1), 100);

  if (t === "tickets") {
    return query(
      `SELECT t.id_ticket AS id, t.codigo_ticket AS codigo, t.titulo, et.nombre AS estado,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable, t.fecha_creacion
       FROM ticket t
       LEFT JOIN estado_ticket et ON et.id_estado = t.id_estado
       LEFT JOIN usuario u ON u.id_usuario = t.id_usuario_solicitante
       WHERE t.estado_registro = true
       ORDER BY random() LIMIT $1`,
      [n]
    );
  }
  if (t === "cambios") {
    return query(
      `SELECT c.id_cambio AS id, c.codigo_cambio AS codigo, c.titulo,
              CASE c.id_estado WHEN 1 THEN 'Registrado' WHEN 2 THEN 'Evaluación CAB' WHEN 3 THEN 'Aprobado'
                WHEN 4 THEN 'En Planificación' WHEN 5 THEN 'En Ejecución' WHEN 6 THEN 'Exitoso'
                WHEN 7 THEN 'Fallido' WHEN 8 THEN 'Cancelado' ELSE 'Desconocido' END AS estado,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable, c.fecha_creacion
       FROM cambio c
       LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_solicitante
       WHERE c.estado_registro = true
       ORDER BY random() LIMIT $1`,
      [n]
    );
  }
  if (t === "bajas") {
    return query(
      `SELECT a.id_activo AS id, a.codigo_patrimonial AS codigo, a.marca || ' ' || a.modelo AS titulo,
              a.estado_activo AS estado,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable, a.fecha_inactivacion AS fecha_creacion
       FROM activo a
       LEFT JOIN usuario u ON u.id_usuario = a.usuario_inactivacion
       WHERE a.estado_registro = true AND a.estado_activo = 'BAJA'
       ORDER BY random() LIMIT $1`,
      [n]
    );
  }
  throw new ErrorDominio("Tipo de muestreo no válido. Usa tickets, cambios o bajas.");
}

export async function listarInformes() {
  return query(
    `SELECT i.id_informe, i.codigo_informe, i.titulo, i.periodo, i.hallazgos, i.recomendaciones,
            i.estado, i.fecha_creacion, i.fecha_cierre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS auditor_nombre
     FROM informe_auditoria i
     LEFT JOIN usuario u ON u.id_usuario = i.id_auditor
     WHERE i.estado_registro = true
     ORDER BY i.fecha_creacion DESC`
  );
}

export async function crearInforme(idAuditor: number, body: any) {
  const vTitulo = validarTexto(body.titulo, 5, 200, "El título del informe", true);
  if (!vTitulo.valido) throw new ErrorDominio(vTitulo.mensaje!);
  const vPeriodo = validarTexto(body.periodo, 4, 60, "El periodo", true);
  if (!vPeriodo.valido) throw new ErrorDominio(vPeriodo.mensaje!);
  const vHallazgos = validarTexto(body.hallazgos, 10, 8000, "Los hallazgos", true);
  if (!vHallazgos.valido) throw new ErrorDominio(vHallazgos.mensaje!);

  const year = new Date().getFullYear();
  const countRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) AS c FROM informe_auditoria WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
    [year]
  );
  const correlativo = String(parseInt(countRow?.c || "0", 10) + 1).padStart(4, "0");
  const codigo = `AUD-${year}-${correlativo}`;

  const fila = await queryRow<any>(
    `INSERT INTO informe_auditoria (codigo_informe, titulo, periodo, hallazgos, recomendaciones, id_auditor)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_informe, codigo_informe`,
    [codigo, String(body.titulo).trim(), String(body.periodo).trim(), String(body.hallazgos).trim(), body.recomendaciones ?? null, idAuditor]
  );
  return { mensaje: "Informe de auditoría registrado.", informe: fila };
}

export async function actualizarEstadoInforme(idAuditor: number, idInforme: number, estado: string) {
  const normalizado = String(estado || "").toUpperCase();
  if (!["BORRADOR", "EMITIDO", "CERRADO"].includes(normalizado)) {
    throw new ErrorDominio("Estado no válido. Usa BORRADOR, EMITIDO o CERRADO.");
  }
  const fila = await queryRow<any>(
    `UPDATE informe_auditoria
     SET estado = $1,
         fecha_cierre = CASE WHEN $1 = 'CERRADO' THEN now() ELSE fecha_cierre END
     WHERE id_informe = $2 AND estado_registro = true
     RETURNING id_informe, estado`,
    [normalizado, idInforme]
  );
  if (!fila) throw new ErrorDominio("El informe no existe.", 404);
  return { mensaje: "Estado del informe actualizado.", informe: fila };
}
