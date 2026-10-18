import { query } from "@/shared/lib/db";

/**
 * Sala de crisis del técnico: consulta de incidentes mayores declarados por el
 * Supervisor (línea de tiempo, tickets vinculados y comunicados) y registro de
 * nuevos comunicados.
 */

export async function listarIncidentesMayores() {
  const incidentes = await query<any>(
    `SELECT m.id_incidente_mayor, m.codigo, m.titulo, m.descripcion, m.severidad, m.estado,
            m.sala_virtual, m.comunicados, m.fecha_declaracion, m.fecha_cierre,
            m.id_problema, p.codigo_problema, p.titulo AS problema_titulo,
            m.id_ticket, t.codigo_ticket
     FROM incidente_mayor m
     LEFT JOIN problema p ON p.id_problema = m.id_problema
     LEFT JOIN ticket t ON t.id_ticket = m.id_ticket
     WHERE m.estado_registro = true
     ORDER BY (UPPER(COALESCE(m.estado,'')) <> 'CERRADO') DESC, m.fecha_declaracion DESC NULLS LAST
     LIMIT 50`
  );

  const idsProblema = incidentes
    .map((i) => i.id_problema)
    .filter((x): x is number => typeof x === "number");

  const ticketsPorProblema: Record<number, any[]> = {};
  if (idsProblema.length > 0) {
    const filas = await query<any>(
      `SELECT pi.id_problema, t.id_ticket, t.codigo_ticket, t.titulo, t.fecha_creacion
       FROM problema_incidente pi
       JOIN ticket t ON t.id_ticket = pi.id_ticket
       WHERE pi.id_problema = ANY($1::int[])
       ORDER BY t.fecha_creacion DESC`,
      [idsProblema]
    );
    for (const fila of filas) {
      (ticketsPorProblema[fila.id_problema] ??= []).push(fila);
    }
  }

  return {
    incidentes: incidentes.map((i) => ({
      ...i,
      tickets: i.id_problema ? ticketsPorProblema[i.id_problema] ?? [] : [],
    })),
  };
}

export async function agregarComunicado(_idUsuario: number, body: any) {
  const id = Number(body?.id_incidente_mayor);
  const texto = String(body?.comunicado ?? "").trim();
  if (!id) throw new Error("Debe indicar el incidente mayor.");
  if (!texto) throw new Error("El comunicado no puede estar vacío.");

  await query(
    `UPDATE incidente_mayor
     SET comunicados = COALESCE(comunicados, '[]'::jsonb) || to_jsonb($1::text)
     WHERE id_incidente_mayor = $2`,
    [texto, id]
  );
  return { ok: true };
}
