import { query, queryRow } from "@/shared/lib/db";
import { IncidenteRegistro, CrearIncidenteInput } from "./types";
import { sanitizarDatosIncidente } from "./incidentesValidaciones";

export async function listarIncidentes(filtros?: {
  idEstado?: number;
  idTecnico?: number;
  idSolicitante?: number;
}): Promise<IncidenteRegistro[]> {
  let sql = `
    SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.descripcion,
           t.id_servicio, s.nombre AS nombre_servicio,
           s.id_categoria, c.nombre AS nombre_categoria,
           t.id_prioridad, p.nombre AS nombre_prioridad,
           t.id_impacto, t.id_urgencia,
           t.id_estado, e.nombre AS nombre_estado,
           t.id_solicitante, u.nombres AS nombre_solicitante,
           t.id_tecnico_asignado, tec.nombres AS nombre_tecnico,
           t.fecha_creacion, t.fecha_limite_resolucion
    FROM tickets t
    INNER JOIN servicios s ON s.id_servicio = t.id_servicio
    LEFT JOIN categorias_servicios c ON c.id_categoria = s.id_categoria
    INNER JOIN prioridades p ON p.id_prioridad = t.id_prioridad
    INNER JOIN estados_ticket e ON e.id_estado = t.id_estado
    INNER JOIN usuarios u ON u.id_usuario = t.id_solicitante
    LEFT JOIN usuarios tec ON tec.id_usuario = t.id_tecnico_asignado
    WHERE t.id_tipo_ticket = 1
  `;
  const params: unknown[] = [];

  if (filtros?.idEstado) {
    params.push(filtros.idEstado);
    sql += ` AND t.id_estado = $${params.length}`;
  }
  if (filtros?.idTecnico) {
    params.push(filtros.idTecnico);
    sql += ` AND t.id_tecnico_asignado = $${params.length}`;
  }
  if (filtros?.idSolicitante) {
    params.push(filtros.idSolicitante);
    sql += ` AND t.id_solicitante = $${params.length}`;
  }

  sql += ` ORDER BY t.fecha_creacion DESC;`;
  return query<IncidenteRegistro>(sql, params);
}

export async function obtenerIncidentePorId(idTicket: number): Promise<IncidenteRegistro | null> {
  const sql = `
    SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.descripcion,
           t.id_servicio, s.nombre AS nombre_servicio,
           s.id_categoria, c.nombre AS nombre_categoria,
           t.id_prioridad, p.nombre AS nombre_prioridad,
           t.id_impacto, t.id_urgencia,
           t.id_estado, e.nombre AS nombre_estado,
           t.id_solicitante, u.nombres AS nombre_solicitante,
           t.id_tecnico_asignado, tec.nombres AS nombre_tecnico,
           t.fecha_creacion, t.fecha_limite_resolucion
    FROM tickets t
    INNER JOIN servicios s ON s.id_servicio = t.id_servicio
    LEFT JOIN categorias_servicios c ON c.id_categoria = s.id_categoria
    INNER JOIN prioridades p ON p.id_prioridad = t.id_prioridad
    INNER JOIN estados_ticket e ON e.id_estado = t.id_estado
    INNER JOIN usuarios u ON u.id_usuario = t.id_solicitante
    LEFT JOIN usuarios tec ON tec.id_usuario = t.id_tecnico_asignado
    WHERE t.id_ticket = $1 AND t.id_tipo_ticket = 1;
  `;
  const filas = await query<IncidenteRegistro>(sql, [idTicket]);
  return filas[0] ?? null;
}

export async function registrarIncidente(input: CrearIncidenteInput): Promise<{ id_ticket: number; codigo_ticket: string }> {
  const datos = sanitizarDatosIncidente({
    titulo: input.titulo,
    descripcion: input.descripcion,
  });

  const sql = `
    INSERT INTO tickets (
      id_tipo_ticket, titulo, descripcion, id_servicio,
      id_impacto, id_urgencia, id_prioridad, id_estado, id_solicitante
    )
    VALUES (1, $1, $2, $3, $4, $5, 2, 1, $6)
    RETURNING id_ticket, codigo_ticket;
  `;
  const filas = await query<{ id_ticket: number; codigo_ticket: string }>(sql, [
    datos.titulo,
    datos.descripcion,
    input.id_servicio,
    input.id_impacto,
    input.id_urgencia,
    input.id_solicitante,
  ]);
  return filas[0];
}

/**
 * Resuelve el identificador del tipo de ticket a partir de su codigo
 * (por ejemplo "INCIDENTE"). Devuelve undefined si el tipo no existe o
 * esta inactivo.
 */
export async function obtenerIdTipoTicketPorCodigo(codigo: string): Promise<number | undefined> {
  const tipo = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = $1 AND estado_registro = true",
    [codigo]
  );
  return tipo?.id_tipo_ticket;
}

/**
 * Comprueba que un ticket existe y pertenece al tipo de ticket indicado.
 * Se usa para que las rutas del modulo solo expongan incidentes.
 */
export async function validarTipoTicket(
  idTicket: string | number,
  codigo: string
): Promise<boolean> {
  const tipo = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = $1 AND estado_registro = true",
    [codigo]
  );
  const ticket = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM ticket WHERE id_ticket = $1 AND estado_registro = true",
    [idTicket]
  );
  if (!tipo || !ticket) return false;
  return Number(tipo.id_tipo_ticket) === Number(ticket.id_tipo_ticket);
}
