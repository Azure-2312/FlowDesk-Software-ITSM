import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

type Sesion = {
  id_usuario: number;
  perfilActivo?: { id_perfil?: number };
};

function esSupervisor(sesion: Sesion) {
  return sesion.perfilActivo?.id_perfil === 4;
}

async function tecnicoPerteneceAlSupervisor(
  idUsuarioTecnico: number,
  idSupervisor: number
): Promise<boolean> {
  const fila = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM tecnico_detalle td
       INNER JOIN departamento_ti d ON d.id_departamento = td.id_departamento
       WHERE td.id_usuario = $1
         AND td.estado_registro = true
         AND d.estado_registro = true
         AND d.id_supervisor = $2
     ) AS existe`,
    [idUsuarioTecnico, idSupervisor]
  );
  return Boolean(fila?.existe);
}

async function exigirTecnicoDelSupervisor(idUsuarioTecnico: number, sesion: Sesion) {
  if (!esSupervisor(sesion)) return;
  if (!(await tecnicoPerteneceAlSupervisor(idUsuarioTecnico, sesion.id_usuario))) {
    throw new ErrorDominio(
      "Solo puedes gestionar ausencias de técnicos de tus grupos.",
      403
    );
  }
}

function validarRangoFechas(fechaDesde: string, fechaHasta: string) {
  if (new Date(fechaHasta) < new Date(fechaDesde)) {
    throw new ErrorDominio("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }
}

export async function listarAusencias(sesion: Sesion) {
  const params: any[] = [];
  let condicion = "";

  if (esSupervisor(sesion)) {
    condicion = `WHERE a.id_usuario_tecnico IN (
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
    `SELECT a.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
     FROM tecnico_ausencias a
     JOIN usuario u ON u.id_usuario = a.id_usuario_tecnico
     ${condicion}
     ORDER BY a.fecha_desde DESC`,
    params
  );

  return { ok: true, ausencias };
}

export async function crearAusencia(body: any, sesion: Sesion) {
  const { id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

  if (!id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const idTecnico = Number(id_usuario_tecnico);
  validarRangoFechas(fecha_desde, fecha_hasta);
  await exigirTecnicoDelSupervisor(idTecnico, sesion);

  const nueva = await queryRow<any>(
    `INSERT INTO tecnico_ausencias (
        id_usuario_tecnico, fecha_desde, fecha_hasta, motivo, registrado_por, fecha_registro
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
    [idTecnico, fecha_desde, fecha_hasta, motivo.trim(), sesion.id_usuario]
  );

  return { ok: true, ausencia: nueva };
}

export async function actualizarAusencia(body: any, sesion: Sesion) {
  const { id_ausencia, id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

  if (!id_ausencia || !id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const idAusencia = Number(id_ausencia);
  const idTecnico = Number(id_usuario_tecnico);
  validarRangoFechas(fecha_desde, fecha_hasta);
  await exigirTecnicoDelSupervisor(idTecnico, sesion);

  if (esSupervisor(sesion)) {
    const actual = await queryRow<{ id_usuario_tecnico: number }>(
      `SELECT id_usuario_tecnico FROM tecnico_ausencias WHERE id_ausencia = $1`,
      [idAusencia]
    );
    if (!actual) throw new ErrorDominio("Ausencia no encontrada", 404);
    await exigirTecnicoDelSupervisor(Number(actual.id_usuario_tecnico), sesion);
  }

  const actualizada = await queryRow<any>(
    `UPDATE tecnico_ausencias
       SET id_usuario_tecnico = $1, fecha_desde = $2, fecha_hasta = $3, motivo = $4
       WHERE id_ausencia = $5
       RETURNING *`,
    [idTecnico, fecha_desde, fecha_hasta, motivo.trim(), idAusencia]
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

  if (esSupervisor(sesion)) {
    const actual = await queryRow<{ id_usuario_tecnico: number }>(
      `SELECT id_usuario_tecnico FROM tecnico_ausencias WHERE id_ausencia = $1`,
      [idAusencia]
    );
    if (!actual) throw new ErrorDominio("Ausencia no encontrada", 404);
    await exigirTecnicoDelSupervisor(Number(actual.id_usuario_tecnico), sesion);
  }

  const eliminada = await queryRow<{ id_ausencia: number }>(
    `DELETE FROM tecnico_ausencias WHERE id_ausencia = $1 RETURNING id_ausencia`,
    [idAusencia]
  );

  if (!eliminada) throw new ErrorDominio("Ausencia no encontrada", 404);

  return { ok: true, mensaje: "Ausencia eliminada" };
}
