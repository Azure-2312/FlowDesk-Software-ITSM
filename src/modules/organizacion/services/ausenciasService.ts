import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import type { SesionUsuario } from "@/types";
import {
  esPerfilSupervisor,
  exigirTecnicoActivo,
  exigirTecnicoDelSupervisor,
} from "./alcanceSupervisorService";

type Sesion = Pick<SesionUsuario, "id_usuario" | "perfilActivo">;

function validarRangoFechas(fechaDesde: string, fechaHasta: string) {
  const desde = new Date(fechaDesde);
  const hasta = new Date(fechaHasta);

  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    throw new ErrorDominio("Las fechas de la ausencia no son válidas.");
  }

  if (hasta < desde) {
    throw new ErrorDominio("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }
}

async function validarSolapamiento(
  idTecnico: number,
  fechaDesde: string,
  fechaHasta: string,
  idAusenciaExcluir?: number
) {
  const params: any[] = [idTecnico, fechaDesde, fechaHasta];
  let filtroExcluir = "";

  if (idAusenciaExcluir) {
    filtroExcluir = "AND id_ausencia <> $4";
    params.push(idAusenciaExcluir);
  }

  const existente = await queryRow<{ id_ausencia: number }>(
    `SELECT id_ausencia
     FROM tecnico_ausencias
     WHERE id_usuario_tecnico = $1
       AND COALESCE(estado_registro, true) = true
       AND fecha_desde::date <= $3::date
       AND fecha_hasta::date >= $2::date
       ${filtroExcluir}
     LIMIT 1`,
    params
  );

  if (existente) {
    throw new ErrorDominio(
      "El técnico ya tiene una ausencia que se cruza con ese rango de fechas.",
      409
    );
  }
}

async function validarReemplazo(
  idTecnico: number,
  valorReemplazo: unknown,
  sesion: Sesion
): Promise<number | null> {
  if (valorReemplazo === undefined || valorReemplazo === null || valorReemplazo === "") {
    return null;
  }

  const idReemplazo = Number(valorReemplazo);
  if (!Number.isInteger(idReemplazo) || idReemplazo <= 0) {
    throw new ErrorDominio("El técnico de reemplazo no es válido.");
  }

  if (idReemplazo === idTecnico) {
    throw new ErrorDominio(
      "El técnico de reemplazo debe ser distinto al técnico ausente."
    );
  }

  await exigirTecnicoActivo(idReemplazo);
  await exigirTecnicoDelSupervisor(idReemplazo, sesion);

  return idReemplazo;
}

async function validarReemplazoDisponible(
  idReemplazo: number | null,
  fechaDesde: string,
  fechaHasta: string
) {
  if (!idReemplazo) return;

  const ausencia = await queryRow<{ id_ausencia: number; motivo: string }>(
    `SELECT id_ausencia, motivo
     FROM tecnico_ausencias
     WHERE id_usuario_tecnico = $1
       AND COALESCE(estado_registro, true) = true
       AND fecha_desde::date <= $3::date
       AND fecha_hasta::date >= $2::date
     LIMIT 1`,
    [idReemplazo, fechaDesde, fechaHasta]
  );

  if (ausencia) {
    throw new ErrorDominio(
      "El técnico de reemplazo también tiene una ausencia en ese rango de fechas.",
      409
    );
  }
}

async function validarTurnosEnRango(
  idTecnico: number,
  fechaDesde: string,
  fechaHasta: string
) {
  const turno = await queryRow<{ id_turno: number; fecha: string; turno: string }>(
    `SELECT id_turno, fecha::text, turno
     FROM tecnico_turnos
     WHERE id_usuario_tecnico = $1
       AND estado_registro = true
       AND fecha BETWEEN $2::date AND $3::date
     ORDER BY fecha ASC
     LIMIT 1`,
    [idTecnico, fechaDesde, fechaHasta]
  );

  if (turno) {
    throw new ErrorDominio(
      `El técnico tiene turnos asignados en ese rango (${turno.fecha} · ${turno.turno}). Elimina o reasigna los turnos antes de registrar la ausencia.`,
      409
    );
  }
}

export async function listarAusencias(sesion: Sesion) {
  const params: any[] = [];
  let condicion = "WHERE COALESCE(a.estado_registro, true) = true";

  if (esPerfilSupervisor(sesion)) {
    condicion += ` AND a.id_usuario_tecnico IN (
      SELECT td.id_usuario
      FROM tecnico_detalle td
      INNER JOIN departamento_ti d ON d.id_departamento = td.id_departamento
      WHERE d.id_supervisor = $1
        AND d.estado_registro = true
        AND td.estado_registro = true
    )`;
    params.push(sesion.id_usuario);
  }

  const ausencias = await query<any>(
    `SELECT a.*,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_nombre,
            CASE
              WHEN ur.id_usuario IS NULL THEN NULL
              ELSE CONCAT(ur.nombres, ' ', ur.apellido_paterno)
            END AS reemplazo_nombre
     FROM tecnico_ausencias a
     JOIN usuario u ON u.id_usuario = a.id_usuario_tecnico
     LEFT JOIN usuario ur ON ur.id_usuario = a.id_usuario_reemplazo
     ${condicion}
     ORDER BY a.fecha_desde DESC`,
    params
  );

  return { ok: true, ausencias };
}

export async function crearAusencia(body: any, sesion: Sesion) {
  const { id_usuario_tecnico, id_usuario_reemplazo, fecha_desde, fecha_hasta, motivo } = body;

  if (!id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const idTecnico = Number(id_usuario_tecnico);
  if (!Number.isInteger(idTecnico) || idTecnico <= 0) {
    throw new ErrorDominio("El técnico seleccionado no es válido.");
  }

  validarRangoFechas(fecha_desde, fecha_hasta);
  await exigirTecnicoActivo(idTecnico);
  await exigirTecnicoDelSupervisor(idTecnico, sesion);
  await validarSolapamiento(idTecnico, fecha_desde, fecha_hasta);
  await validarTurnosEnRango(idTecnico, fecha_desde, fecha_hasta);
  const idReemplazo = await validarReemplazo(
    idTecnico,
    id_usuario_reemplazo,
    sesion
  );
  await validarReemplazoDisponible(idReemplazo, fecha_desde, fecha_hasta);

  const nueva = await queryRow<any>(
    `INSERT INTO tecnico_ausencias (
        id_usuario_tecnico, id_usuario_reemplazo, fecha_desde, fecha_hasta,
        motivo, registrado_por, fecha_registro, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
      RETURNING *`,
    [
      idTecnico,
      idReemplazo,
      fecha_desde,
      fecha_hasta,
      motivo.trim(),
      sesion.id_usuario,
    ]
  );

  return { ok: true, ausencia: nueva };
}

export async function actualizarAusencia(body: any, sesion: Sesion) {
  const {
    id_ausencia,
    id_usuario_tecnico,
    id_usuario_reemplazo,
    fecha_desde,
    fecha_hasta,
    motivo,
  } = body;

  if (!id_ausencia || !id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const idAusencia = Number(id_ausencia);
  const idTecnico = Number(id_usuario_tecnico);

  if (!Number.isInteger(idAusencia) || idAusencia <= 0) {
    throw new ErrorDominio("El identificador de la ausencia no es válido.");
  }
  if (!Number.isInteger(idTecnico) || idTecnico <= 0) {
    throw new ErrorDominio("El técnico seleccionado no es válido.");
  }

  const actual = await queryRow<{
    id_usuario_tecnico: number;
    id_usuario_reemplazo: number | null;
  }>(
    `SELECT id_usuario_tecnico, id_usuario_reemplazo
     FROM tecnico_ausencias
     WHERE id_ausencia = $1
       AND COALESCE(estado_registro, true) = true`,
    [idAusencia]
  );

  if (!actual) throw new ErrorDominio("Ausencia no encontrada", 404);

  await exigirTecnicoDelSupervisor(Number(actual.id_usuario_tecnico), sesion);
  await exigirTecnicoDelSupervisor(idTecnico, sesion);
  await exigirTecnicoActivo(idTecnico);
  validarRangoFechas(fecha_desde, fecha_hasta);
  await validarSolapamiento(idTecnico, fecha_desde, fecha_hasta, idAusencia);
  await validarTurnosEnRango(idTecnico, fecha_desde, fecha_hasta);

  const idReemplazo =
    id_usuario_reemplazo === undefined
      ? actual.id_usuario_reemplazo
      : await validarReemplazo(idTecnico, id_usuario_reemplazo, sesion);

  if (idReemplazo === idTecnico) {
    throw new ErrorDominio(
      "El técnico de reemplazo debe ser distinto al técnico ausente."
    );
  }
  await validarReemplazoDisponible(idReemplazo, fecha_desde, fecha_hasta);

  const actualizada = await queryRow<any>(
    `UPDATE tecnico_ausencias
       SET id_usuario_tecnico = $1,
           id_usuario_reemplazo = $2,
           fecha_desde = $3,
           fecha_hasta = $4,
           motivo = $5
     WHERE id_ausencia = $6
       AND COALESCE(estado_registro, true) = true
     RETURNING *`,
    [idTecnico, idReemplazo, fecha_desde, fecha_hasta, motivo.trim(), idAusencia]
  );

  if (!actualizada) throw new ErrorDominio("Ausencia no encontrada", 404);

  return { ok: true, ausencia: actualizada };
}

export async function eliminarAusencia(id: string | null, sesion: Sesion) {
  if (!id) throw new ErrorDominio("ID requerido");

  const idAusencia = Number(id);
  if (!Number.isInteger(idAusencia) || idAusencia <= 0) {
    throw new ErrorDominio("ID de ausencia inválido");
  }

  const actual = await queryRow<{ id_usuario_tecnico: number }>(
    `SELECT id_usuario_tecnico
     FROM tecnico_ausencias
     WHERE id_ausencia = $1
       AND COALESCE(estado_registro, true) = true`,
    [idAusencia]
  );

  if (!actual) throw new ErrorDominio("Ausencia no encontrada", 404);
  await exigirTecnicoDelSupervisor(Number(actual.id_usuario_tecnico), sesion);

  const eliminada = await queryRow<{ id_ausencia: number }>(
    `UPDATE tecnico_ausencias
        SET estado_registro = false
      WHERE id_ausencia = $1
      RETURNING id_ausencia`,
    [idAusencia]
  );

  if (!eliminada) throw new ErrorDominio("Ausencia no encontrada", 404);

  return { ok: true, mensaje: "Ausencia eliminada" };
}
