import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import type { SesionUsuario } from "@/types";
import {
  esPerfilSupervisor,
  exigirTecnicoActivo,
  exigirTecnicoDelSupervisor,
} from "./alcanceSupervisorService";

export const TURNOS_VALIDOS = ["MANANA", "TARDE", "NOCHE", "GUARDIA_24X7"] as const;
export type TurnoOperativo = (typeof TURNOS_VALIDOS)[number];

interface FiltrosTurnos {
  desde?: string | null;
  hasta?: string | null;
  idUsuario?: string | null;
}

type Sesion = Pick<SesionUsuario, "id_usuario" | "perfilActivo">;

function normalizarFechaTurno(valor: unknown): string {
  const texto = String(valor ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw new ErrorDominio("La fecha del turno no es válida.");
  }

  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    throw new ErrorDominio("La fecha del turno no es válida.");
  }

  return texto;
}

function normalizarTurno(valor: unknown): TurnoOperativo {
  const turno = String(valor ?? "").trim().toUpperCase() as TurnoOperativo;
  if (!TURNOS_VALIDOS.includes(turno)) {
    throw new ErrorDominio("El turno seleccionado no es válido.");
  }
  return turno;
}

export async function listarTurnos(
  sesion: Sesion,
  filtros: FiltrosTurnos = {}
) {
  const condiciones: string[] = ["t.estado_registro = true"];
  const params: any[] = [];

  if (filtros.desde) {
    params.push(normalizarFechaTurno(filtros.desde));
    condiciones.push(`t.fecha >= $${params.length}`);
  }

  if (filtros.hasta) {
    params.push(normalizarFechaTurno(filtros.hasta));
    condiciones.push(`t.fecha <= $${params.length}`);
  }

  if (filtros.idUsuario) {
    const idUsuario = Number(filtros.idUsuario);
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new ErrorDominio("El técnico seleccionado no es válido.");
    }
    params.push(idUsuario);
    condiciones.push(`t.id_usuario_tecnico = $${params.length}`);
  }

  if (esPerfilSupervisor(sesion)) {
    params.push(sesion.id_usuario);
    condiciones.push(`t.id_usuario_tecnico IN (
      SELECT td.id_usuario
      FROM tecnico_detalle td
      INNER JOIN departamento_ti d ON d.id_departamento = td.id_departamento
      WHERE d.id_supervisor = $${params.length}
        AND d.estado_registro = true
        AND td.estado_registro = true
    )`);
  }

  const turnos = await query<any>(
    `SELECT t.*,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_nombre
     FROM tecnico_turnos t
     INNER JOIN usuario u ON u.id_usuario = t.id_usuario_tecnico
     WHERE ${condiciones.join(" AND ")}
     ORDER BY t.fecha ASC,
              CASE t.turno
                WHEN 'MANANA' THEN 1
                WHEN 'TARDE' THEN 2
                WHEN 'NOCHE' THEN 3
                WHEN 'GUARDIA_24X7' THEN 4
                ELSE 5
              END ASC,
              u.nombres ASC`,
    params
  );

  return { ok: true, turnos };
}

export async function crearTurno(body: any, sesion: Sesion) {
  const { id_usuario_tecnico, fecha, turno, notas } = body;

  if (!id_usuario_tecnico || !fecha || !turno) {
    throw new ErrorDominio("Técnico, fecha y turno son obligatorios.");
  }

  const idTecnico = Number(id_usuario_tecnico);
  if (!Number.isInteger(idTecnico) || idTecnico <= 0) {
    throw new ErrorDominio("El técnico seleccionado no es válido.");
  }

  const fechaTurno = normalizarFechaTurno(fecha);
  const turnoNormalizado = normalizarTurno(turno);

  await exigirTecnicoActivo(idTecnico);
  await exigirTecnicoDelSupervisor(idTecnico, sesion);

  const ausencia = await queryRow<{ id_ausencia: number }>(
    `SELECT id_ausencia
     FROM tecnico_ausencias
     WHERE id_usuario_tecnico = $1
       AND COALESCE(estado_registro, true) = true
       AND $2::date BETWEEN fecha_desde::date AND fecha_hasta::date
     LIMIT 1`,
    [idTecnico, fechaTurno]
  );

  if (ausencia) {
    throw new ErrorDominio(
      "No se puede asignar el turno: el técnico tiene una ausencia registrada para esa fecha.",
      409
    );
  }

  const turnoGuardado = await queryRow<any>(
    `INSERT INTO tecnico_turnos (
        id_usuario_tecnico, fecha, turno, notas, registrado_por,
        fecha_registro, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, NOW(), true)
      ON CONFLICT (id_usuario_tecnico, fecha, turno)
      DO UPDATE SET
        notas = EXCLUDED.notas,
        registrado_por = EXCLUDED.registrado_por,
        fecha_registro = NOW(),
        estado_registro = true
      RETURNING *`,
    [
      idTecnico,
      fechaTurno,
      turnoNormalizado,
      notas ? String(notas).trim().slice(0, 255) : null,
      sesion.id_usuario,
    ]
  );

  return { ok: true, turno: turnoGuardado };
}

export async function eliminarTurno(id: string | null, sesion: Sesion) {
  if (!id) throw new ErrorDominio("ID requerido");

  const idTurno = Number(id);
  if (!Number.isInteger(idTurno) || idTurno <= 0) {
    throw new ErrorDominio("ID de turno inválido");
  }

  const actual = await queryRow<{ id_usuario_tecnico: number }>(
    `SELECT id_usuario_tecnico
     FROM tecnico_turnos
     WHERE id_turno = $1
       AND estado_registro = true`,
    [idTurno]
  );

  if (!actual) throw new ErrorDominio("Turno no encontrado", 404);
  await exigirTecnicoDelSupervisor(Number(actual.id_usuario_tecnico), sesion);

  const eliminado = await queryRow<{ id_turno: number }>(
    `UPDATE tecnico_turnos
        SET estado_registro = false
      WHERE id_turno = $1
      RETURNING id_turno`,
    [idTurno]
  );

  if (!eliminado) throw new ErrorDominio("Turno no encontrado", 404);

  return { ok: true, mensaje: "Turno eliminado" };
}
