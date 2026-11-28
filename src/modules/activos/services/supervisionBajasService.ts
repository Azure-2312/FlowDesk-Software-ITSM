import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";
import { UMBRAL_MONTO_APROBACION as UMBRAL_MONTO } from "@/shared/lib/parametros";

/**
 * Bajas de activos: una sola regla para todo el ciclo.
 *
 * 1. Solicitar: quien gestiona activos registra la solicitud. El activo NO
 *    cambia de estado hasta que se apruebe.
 * 2. Decidir (aprobar o rechazar), nunca quien la solicitó:
 *    · valor de compra menor al umbral (UMBRAL_MONTO_APROBACION): el Gestor de
 *      Activos, el Gestor de Área del custodio o del solicitante, o el
 *      Supervisor del grupo dueño del activo;
 *    · valor igual o mayor al umbral: el Aprobador (queda en aprobacion_monto);
 *    · el Administrador puede decidir cualquiera.
 * 3. Aprobada: el activo pasa a BAJA, deja de tener custodio y sus actas
 *    pendientes se anulan. Luego el Gestor de Activos registra la disposición.
 */

const PERFIL = { ADMIN: 1, SUPERVISOR: 4, GESTOR_AREA: 5, APROBADOR: 7, GESTOR_ACTIVOS: 9 } as const;

export interface SesionBajas {
  id_usuario: number;
  id_perfil?: number;
}

export async function solicitarBaja(sesion: SesionBajas, idActivo: number, motivo: unknown) {
  if (!Number.isInteger(idActivo) || idActivo <= 0) throw new ErrorDominio("Debes indicar el activo.");
  const vMotivo = validarTexto(typeof motivo === "string" ? motivo : null, 10, 2000, "El motivo de la baja", true);
  if (!vMotivo.valido) throw new ErrorDominio(vMotivo.mensaje!);

  const activo = await queryRow<{ estado_activo: string; codigo_patrimonial: string }>(
    `SELECT estado_activo, codigo_patrimonial FROM activo WHERE id_activo = $1 AND estado_registro = true`,
    [idActivo]
  );
  if (!activo) throw new ErrorDominio("El activo no existe.", 404);
  if (activo.estado_activo === "BAJA") throw new ErrorDominio("El activo ya está dado de baja.", 409);

  const pendiente = await queryRow<{ id_solicitud: number }>(
    `SELECT id_solicitud FROM solicitud_baja_activo
      WHERE id_activo = $1 AND estado = 'PENDIENTE' AND estado_registro = true`,
    [idActivo]
  );
  if (pendiente) throw new ErrorDominio("El activo ya tiene una solicitud de baja pendiente.", 409);

  const fila = await queryRow<{ id_solicitud: number }>(
    `INSERT INTO solicitud_baja_activo (id_activo, motivo, estado, id_usuario_solicita)
     VALUES ($1, $2, 'PENDIENTE', $3)
     RETURNING id_solicitud`,
    [idActivo, String(motivo).trim(), sesion.id_usuario]
  );
  return {
    mensaje: `Solicitud de baja de ${activo.codigo_patrimonial} registrada. El activo sigue en su estado actual hasta que se apruebe.`,
    id_solicitud: fila?.id_solicitud,
  };
}

/** Alcance del perfil sobre las bajas, como condición SQL (alias s, a, us, uc). */
async function filtroPerfil(sesion: SesionBajas, params: unknown[]): Promise<string | null> {
  const perfil = sesion.id_perfil;
  if (perfil === PERFIL.ADMIN) return "";
  if (perfil === PERFIL.APROBADOR) {
    params.push(UMBRAL_MONTO);
    return `AND COALESCE(a.costo_compra, 0) >= $${params.length}`;
  }
  if (perfil === PERFIL.GESTOR_ACTIVOS) {
    params.push(UMBRAL_MONTO);
    return `AND COALESCE(a.costo_compra, 0) < $${params.length}`;
  }
  if (perfil === PERFIL.GESTOR_AREA) {
    const area = await queryRow<{ id_departamento_empresa: number | null }>(
      `SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1`,
      [sesion.id_usuario]
    );
    if (!area?.id_departamento_empresa) return null;
    params.push(area.id_departamento_empresa, UMBRAL_MONTO);
    return `AND (uc.id_departamento_empresa = $${params.length - 1} OR us.id_departamento_empresa = $${params.length - 1})
            AND COALESCE(a.costo_compra, 0) < $${params.length}`;
  }
  if (perfil === PERFIL.SUPERVISOR) {
    params.push(sesion.id_usuario, UMBRAL_MONTO);
    return `AND a.id_departamento IN (SELECT d.id_departamento FROM departamento_ti d
                                       WHERE d.id_supervisor = $${params.length - 1} AND d.estado_registro = true)
            AND COALESCE(a.costo_compra, 0) < $${params.length}`;
  }
  // Otros perfiles: solo lo que ellos solicitaron o tienen en custodia
  params.push(sesion.id_usuario);
  return `AND (s.id_usuario_solicita = $${params.length} OR a.id_usuario_custodio = $${params.length})`;
}

/**
 * Bandeja de bajas del perfil: "pendientes" muestra solo lo que ese perfil
 * puede decidir; "historial", lo ya resuelto dentro de su alcance.
 */
export async function listarBajasAprobaciones(sesion: SesionBajas, vista: string = "pendientes") {
  const esHistorial = vista === "historial";
  const params: unknown[] = [];
  const filtro = await filtroPerfil(sesion, params);
  if (filtro === null) return [];

  const filas = await query<any>(
    `SELECT s.id_solicitud, s.id_activo, s.motivo, s.estado, s.comentario_resolucion,
            s.fecha_solicitud, s.fecha_resolucion, s.destino_final, s.fecha_disposicion,
            a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            COALESCE(a.costo_compra, 0) AS costo_compra,
            (COALESCE(a.costo_compra, 0) >= ${Number(UMBRAL_MONTO)}) AS requiere_aprobador,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
            CONCAT(uc.nombres, ' ', uc.apellido_paterno) AS custodio_nombre,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS resolutor_nombre
       FROM solicitud_baja_activo s
       JOIN activo a ON a.id_activo = s.id_activo
       LEFT JOIN usuario us ON us.id_usuario = s.id_usuario_solicita
       LEFT JOIN usuario uc ON uc.id_usuario = a.id_usuario_custodio
       LEFT JOIN usuario ur ON ur.id_usuario = s.id_usuario_resuelve
      WHERE s.estado_registro = true
        AND ${esHistorial ? "s.estado IN ('APROBADA', 'RECHAZADA')" : "s.estado = 'PENDIENTE'"}
        ${filtro}
      ORDER BY ${esHistorial ? "s.fecha_resolucion DESC NULLS LAST, s.fecha_solicitud DESC" : "s.fecha_solicitud ASC"}`,
    params
  );
  // El Aprobador decide por monto y motivo; no necesita saber quién tiene el equipo
  if (sesion.id_perfil === PERFIL.APROBADOR) filas.forEach((f) => { f.custodio_nombre = null; });
  return filas;
}

function normalizarDecision(decision: unknown): "APROBADA" | "RECHAZADA" {
  const d = String(decision || "").toUpperCase();
  if (["APROBAR", "APROBADO", "APROBADA"].includes(d)) return "APROBADA";
  if (["RECHAZAR", "RECHAZADO", "RECHAZADA"].includes(d)) return "RECHAZADA";
  throw new ErrorDominio("La decisión debe ser APROBAR o RECHAZAR.");
}

export async function decidirBaja(sesion: SesionBajas, idSolicitud: number, decision: unknown, comentario?: unknown) {
  if (!Number.isInteger(idSolicitud) || idSolicitud <= 0) throw new ErrorDominio("Falta el identificador de la solicitud.");
  const estado = normalizarDecision(decision);
  const texto = typeof comentario === "string" ? comentario.trim() : "";
  if (estado === "RECHAZADA" && texto.length < 5) {
    throw new ErrorDominio("Indica el motivo del rechazo (mínimo 5 caracteres).");
  }

  const s = await queryRow<any>(
    `SELECT s.id_solicitud, s.id_activo, s.estado, s.id_usuario_solicita, s.motivo,
            COALESCE(a.costo_compra, 0) AS costo, a.estado_activo, a.id_usuario_custodio, a.id_departamento,
            uc.id_departamento_empresa AS area_custodio, us.id_departamento_empresa AS area_solicitante
       FROM solicitud_baja_activo s
       JOIN activo a ON a.id_activo = s.id_activo
       LEFT JOIN usuario uc ON uc.id_usuario = a.id_usuario_custodio
       LEFT JOIN usuario us ON us.id_usuario = s.id_usuario_solicita
      WHERE s.id_solicitud = $1 AND s.estado_registro = true`,
    [idSolicitud]
  );
  if (!s) throw new ErrorDominio("La solicitud de baja no existe.", 404);
  if (s.estado !== "PENDIENTE") throw new ErrorDominio("La solicitud ya fue resuelta.", 409);
  if (s.id_usuario_solicita === sesion.id_usuario) {
    throw new ErrorDominio("Segregación de funciones: quien solicita la baja no puede aprobarla ni rechazarla.", 403);
  }

  const perfil = sesion.id_perfil;
  const porMonto = Number(s.costo) >= UMBRAL_MONTO;
  if (perfil !== PERFIL.ADMIN) {
    if (porMonto && perfil !== PERFIL.APROBADOR) {
      throw new ErrorDominio(`El activo vale ${UMBRAL_MONTO} o más: la baja la decide el Aprobador.`, 403);
    }
    if (!porMonto) {
      let permitido = perfil === PERFIL.GESTOR_ACTIVOS;
      if (perfil === PERFIL.GESTOR_AREA) {
        const area = await queryRow<{ id_departamento_empresa: number | null }>(
          `SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1`,
          [sesion.id_usuario]
        );
        permitido = !!area?.id_departamento_empresa &&
          [s.area_custodio, s.area_solicitante].includes(area.id_departamento_empresa);
      }
      if (perfil === PERFIL.SUPERVISOR) {
        const sup = await queryRow<{ existe: boolean }>(
          `SELECT EXISTS (SELECT 1 FROM departamento_ti WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true) AS existe`,
          [s.id_departamento, sesion.id_usuario]
        );
        permitido = !!sup?.existe;
      }
      if (!permitido) {
        throw new ErrorDominio(
          perfil === PERFIL.APROBADOR
            ? `El activo vale menos de ${UMBRAL_MONTO}: la baja la decide el Gestor de Activos o el Gestor de Área.`
            : "Esta solicitud de baja no está dentro de tu alcance.",
          403
        );
      }
    }
  }

  const comentarioFinal = texto || (estado === "APROBADA" ? "Baja aprobada." : "Baja rechazada.");
  await transaccion(async (cli) => {
    const upd = await cli.query(
      `UPDATE solicitud_baja_activo
          SET estado = $2, id_usuario_resuelve = $3, comentario_resolucion = $4, fecha_resolucion = now()
        WHERE id_solicitud = $1 AND estado = 'PENDIENTE'`,
      [idSolicitud, estado, sesion.id_usuario, comentarioFinal]
    );
    if (upd.rowCount === 0) throw new ErrorDominio("La solicitud ya fue resuelta por otro usuario.", 409);

    if (porMonto) {
      await cli.query(
        `INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador)
         VALUES ('BAJA', $1, $2, $3, $4, $5)`,
        [idSolicitud, s.costo, estado === "APROBADA" ? "APROBADO" : "RECHAZADO", comentarioFinal, sesion.id_usuario]
      );
    }

    if (estado === "APROBADA") {
      await cli.query(
        `UPDATE activo
            SET estado_activo = 'BAJA', id_usuario_custodio = NULL,
                motivo_inactivacion = $2, fecha_inactivacion = now(), usuario_inactivacion = $3,
                fecha_modificacion = now(), usuario_modificacion = $3
          WHERE id_activo = $1`,
        [s.id_activo, String(s.motivo).slice(0, 500), sesion.id_usuario]
      );
      await cli.query(
        `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario)
         VALUES ($1, $2, 'BAJA', $3, NULL, $4, $5)`,
        [s.id_activo, s.estado_activo, s.id_usuario_custodio, `Baja aprobada: ${String(s.motivo).slice(0, 400)}`, sesion.id_usuario]
      );
      await cli.query(
        `UPDATE acta_entrega SET estado = 'ANULADA',
                observaciones = TRIM(CONCAT(COALESCE(observaciones, ''), ' [Anulada: el activo fue dado de baja]'))
          WHERE id_activo = $1 AND estado = 'PENDIENTE'`,
        [s.id_activo]
      );
    }
  });

  return { mensaje: `Solicitud ${estado === "APROBADA" ? "aprobada: el activo quedó dado de baja" : "rechazada"}.` };
}
