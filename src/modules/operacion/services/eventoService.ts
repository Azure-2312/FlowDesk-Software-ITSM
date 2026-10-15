import { randomUUID } from "crypto";
import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export const SEVERIDADES_EVENTO = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const;
export const ESTADOS_EVENTO = ["RECONOCIDO", "VINCULADO", "CERRADO"] as const;

export interface DatosEvento {
  fuente?: unknown;
  titulo?: unknown;
  descripcion?: unknown;
  severidad?: unknown;
  id_ci?: unknown;
}

export interface DatosActualizacionEvento {
  estado?: unknown;
  id_ticket?: unknown;
}

export async function listarEventos(estado: string | null) {
  const where = estado ? "AND e.estado = $1" : "";
  const params = estado ? [estado] : [];
  return query(
    `
    SELECT e.id_evento,e.codigo_evento,e.fuente,e.titulo,e.descripcion,e.severidad,e.estado,e.detectado_en,
           e.id_ci,ci.codigo_ci,ci.nombre AS ci_nombre,e.id_ticket,t.codigo_ticket
    FROM evento_servicio e
    LEFT JOIN elemento_configuracion ci ON ci.id_ci=e.id_ci
    LEFT JOIN ticket t ON t.id_ticket=e.id_ticket
    WHERE e.estado_registro=true ${where}
    ORDER BY CASE e.severidad WHEN 'CRITICA' THEN 1 WHEN 'ALTA' THEN 2 WHEN 'MEDIA' THEN 3 ELSE 4 END,e.detectado_en DESC
  `,
    params
  );
}

export async function registrarEvento(datos: DatosEvento, idUsuario: number) {
  const fuente = String(datos.fuente || "").trim();
  const titulo = String(datos.titulo || "").trim();
  const descripcion = String(datos.descripcion || "").trim();
  const severidad = String(datos.severidad || "MEDIA").toUpperCase();
  const idCi = datos.id_ci ? Number(datos.id_ci) : null;

  if (!fuente || !titulo) throw new ErrorDominio("Fuente y título son obligatorios");
  if (!(SEVERIDADES_EVENTO as readonly string[]).includes(severidad)) {
    throw new ErrorDominio("Severidad no válida");
  }

  const codigo = `EVT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  return queryRow(
    `
    INSERT INTO evento_servicio (codigo_evento,fuente,titulo,descripcion,severidad,id_ci,usuario_creacion)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING id_evento,codigo_evento,fuente,titulo,descripcion,severidad,estado,detectado_en,id_ci,id_ticket
  `,
    [codigo, fuente, titulo, descripcion || null, severidad, idCi, idUsuario]
  );
}

export async function actualizarEvento(
  id: number,
  datos: DatosActualizacionEvento,
  idUsuario: number
) {
  const estado = String(datos.estado || "").toUpperCase();
  const idTicket = datos.id_ticket ? Number(datos.id_ticket) : null;

  if (!(ESTADOS_EVENTO as readonly string[]).includes(estado)) {
    throw new ErrorDominio("Transición no válida");
  }
  if (estado === "VINCULADO" && !idTicket) {
    throw new ErrorDominio("Vincular un incidente requiere id_ticket");
  }
  if (idTicket) {
    const incidente = await queryRow<{ id_ticket: number }>(
      "SELECT id_ticket FROM ticket WHERE id_ticket=$1 AND id_tipo_ticket=1 AND estado_registro=true",
      [idTicket]
    );
    if (!incidente) throw new ErrorDominio("Solo se puede vincular un incidente activo");
  }

  const row = await queryRow(
    `
    UPDATE evento_servicio SET estado=$2,id_ticket=COALESCE($3,id_ticket),
      reconocido_por=CASE WHEN $2='RECONOCIDO' AND reconocido_por IS NULL THEN $4 ELSE reconocido_por END,
      reconocido_en=CASE WHEN $2='RECONOCIDO' AND reconocido_en IS NULL THEN now() ELSE reconocido_en END,
      cerrado_por=CASE WHEN $2='CERRADO' THEN $4 ELSE cerrado_por END,
      cerrado_en=CASE WHEN $2='CERRADO' THEN now() ELSE cerrado_en END
    WHERE id_evento=$1 AND estado_registro=true
    RETURNING id_evento,codigo_evento,estado,id_ticket,reconocido_en,cerrado_en
  `,
    [id, estado, idTicket, idUsuario]
  );
  if (!row) throw new ErrorDominio("Evento no encontrado", 404);
  return row;
}
