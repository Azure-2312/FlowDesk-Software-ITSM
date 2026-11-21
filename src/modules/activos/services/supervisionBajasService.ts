import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Resolución de solicitudes de baja de activos por parte del Supervisor
 * (perfil 4). Lógica de dominio del activo movida desde
 * src/modules/perfiles/supervisor para que el rol solo conserve su UI.
 */
export async function listarBajasAprobaciones(
  sesion: { id_usuario: number; id_perfil?: number },
  vista: string = "pendientes"
) {
  const esHistorial = vista === "historial";
  const estadoCondicion = esHistorial
    ? "s.estado IN ('APROBADA', 'RECHAZADA')"
    : "s.estado = 'PENDIENTE'";

  const params: any[] = [];
  let filtroAlcance = "";

  if (sesion.id_perfil === 1) {
    filtroAlcance = "";
  } else if (sesion.id_perfil === 5) {
    const area = await queryRow<{ id_departamento_empresa: number }>(
      `SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1`,
      [sesion.id_usuario]
    );
    if (!area?.id_departamento_empresa) {
      return [];
    }
    params.push(area.id_departamento_empresa);
    filtroAlcance = `AND (uc.id_departamento_empresa = $${params.length} OR us.id_departamento_empresa = $${params.length})`;
  } else if (sesion.id_perfil === 4) {
    params.push(sesion.id_usuario);
    filtroAlcance = `AND a.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = $${params.length} AND d.estado_registro = true
    )`;
  } else {
    params.push(sesion.id_usuario);
    filtroAlcance = `AND (s.id_usuario_solicita = $${params.length} OR a.id_usuario_custodio = $${params.length})`;
  }

  const sql = `
    SELECT
      s.id_solicitud,
      s.id_activo,
      s.motivo,
      s.estado,
      s.comentario_resolucion,
      s.fecha_solicitud,
      s.fecha_resolucion,
      a.codigo_patrimonial,
      a.tipo_activo,
      a.marca,
      a.modelo,
      CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
      CONCAT(uc.nombres, ' ', uc.apellido_paterno) AS custodio_nombre,
      CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS resolutor_nombre
    FROM solicitud_baja_activo s
    JOIN activo a ON a.id_activo = s.id_activo
    LEFT JOIN usuario us ON us.id_usuario = s.id_usuario_solicita
    LEFT JOIN usuario uc ON uc.id_usuario = a.id_usuario_custodio
    LEFT JOIN usuario ur ON ur.id_usuario = s.id_usuario_resuelve
    WHERE s.estado_registro = true
      AND ${estadoCondicion}
      ${filtroAlcance}
    ORDER BY ${
      esHistorial
        ? "s.fecha_resolucion DESC NULLS LAST, s.fecha_solicitud DESC"
        : "s.fecha_solicitud ASC"
    }
  `;

  return query(sql, params);
}

export async function resolverBajaArea(
  idUsuario: number,
  idSolicitud: number,
  decision: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBAR", "RECHAZAR"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBAR o RECHAZAR.");
  }
  const estado = normalizada === "APROBAR" ? "APROBADA" : "RECHAZADA";
  const fila = await queryRow<any>(
    `UPDATE solicitud_baja_activo
     SET estado = $2, id_usuario_resuelve = $3, comentario_resolucion = $4, fecha_resolucion = now()
     WHERE id_solicitud = $1 AND estado = 'PENDIENTE'
     RETURNING id_solicitud, id_activo, estado`,
    [idSolicitud, estado, idUsuario, comentario ?? null]
  );
  if (!fila) throw new ErrorDominio("La solicitud no existe o ya fue resuelta.", 404);

  if (estado === "APROBADA") {
    await query(
      `UPDATE activo SET estado_activo = 'BAJA', fecha_modificacion = now(), usuario_modificacion = $2
       WHERE id_activo = $1 AND estado_registro = true`,
      [fila.id_activo, idUsuario]
    );
  }
  return { mensaje: `Solicitud ${estado.toLowerCase()}.`, solicitud: fila };
}
