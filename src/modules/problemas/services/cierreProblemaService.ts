import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Autorización del cierre de problemas mayores (aprobación de riesgo residual).
 * Lógica de dominio movida desde el portal del Aprobador
 * (`src/modules/perfiles/aprobador`) para que el rol solo conserve su UI.
 */

export async function listarProblemasMayores() {
  return query(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion, p.causa_raiz,
            p.workaround, p.solucion_definitiva, p.fecha_creacion,
            it.nombre AS impacto_nombre, pt.nombre AS prioridad_nombre,
            pe.nombre AS estado_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS asignado_nombre
     FROM problema p
     LEFT JOIN impacto_ticket it ON it.id_impacto = p.id_impacto
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
     LEFT JOIN problema_estado pe ON pe.id_estado = p.id_estado
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true
       AND (it.nivel = 3 OR pt.nivel = 1)
       AND NOT EXISTS (SELECT 1 FROM problema_cierre_aprobacion pc WHERE pc.id_problema = p.id_problema)
     ORDER BY p.fecha_creacion DESC`
  );
}

export async function resolverProblema(
  idUsuario: number,
  idProblema: number,
  decision: string,
  riesgoAceptado?: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");
  if (normalizada === "APROBADO" && (!riesgoAceptado || String(riesgoAceptado).trim().length < 3)) {
    throw new ErrorDominio("Debes describir el riesgo aceptado al autorizar el cierre.");
  }

  const problema = await queryRow<{ id_problema: number }>(
    `SELECT id_problema FROM problema WHERE id_problema = $1 AND estado_registro = true`,
    [idProblema]
  );
  if (!problema) throw new ErrorDominio("El problema no existe.", 404);

  await query(
    `INSERT INTO problema_cierre_aprobacion (id_problema, decision, riesgo_aceptado, comentario, id_aprobador)
     VALUES ($1, $2, $3, $4, $5)`,
    [idProblema, normalizada, riesgoAceptado ?? null, comentario ?? null, idUsuario]
  );

  if (normalizada === "APROBADO") {
    const estado = await queryRow<{ id_estado: number }>(
      `SELECT id_estado FROM problema_estado
       WHERE activo = true AND tipo IN ('final', 'resuelto')
       ORDER BY (tipo = 'final') DESC, orden DESC LIMIT 1`
    );
    if (estado?.id_estado) {
      await query(`UPDATE problema SET id_estado = $1 WHERE id_problema = $2`, [estado.id_estado, idProblema]);
    }
  }

  return { mensaje: "Decisión registrada." };
}
