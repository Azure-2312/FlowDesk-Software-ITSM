import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Autorización del cierre de problemas mayores (aceptación del riesgo residual).
 *
 * Flujo: el Gestor de Problemas deja el problema en "Resuelto" (5) con su
 * solución definitiva. Si es mayor (impacto alto o prioridad crítica) aparece
 * aquí para el Aprobador:
 *   - APROBADO  → queda registrado el riesgo aceptado y el problema se cierra (6).
 *   - RECHAZADO → vuelve a "En investigación" (2) con el motivo; cuando se
 *                 resuelva de nuevo volverá a esta bandeja.
 */

const ES_MAYOR = `(COALESCE(it.nivel, 0) = 3 OR COALESCE(pt.nivel, 9) = 1)`;
const ESTADO_RESUELTO = 5;
const ESTADO_CERRADO = 6;
const ESTADO_EN_INVESTIGACION = 2;

export async function listarProblemasMayores() {
  const [pendientes, historial] = await Promise.all([
    query(
      `SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion, p.causa_raiz,
              p.workaround, p.solucion_definitiva, p.fecha_creacion, p.fecha_modificacion,
              it.nombre AS impacto_nombre, pt.nombre AS prioridad_nombre,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS asignado_nombre,
              (SELECT COUNT(*)::int FROM problema_cierre_aprobacion pc
                WHERE pc.id_problema = p.id_problema AND pc.decision = 'RECHAZADO') AS devoluciones
         FROM problema p
         LEFT JOIN impacto_ticket it ON it.id_impacto = p.id_impacto
         LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
         LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
        WHERE p.estado_registro = true
          AND p.id_estado = ${ESTADO_RESUELTO}
          AND ${ES_MAYOR}
          AND NOT EXISTS (SELECT 1 FROM problema_cierre_aprobacion pc
                           WHERE pc.id_problema = p.id_problema AND pc.decision = 'APROBADO')
        ORDER BY p.fecha_modificacion ASC NULLS FIRST`
    ),
    query(
      `SELECT pc.id_cierre, pc.decision, pc.riesgo_aceptado, pc.comentario, pc.fecha_decision,
              p.id_problema, p.codigo_problema, p.titulo,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprobador_nombre
         FROM problema_cierre_aprobacion pc
         JOIN problema p ON p.id_problema = pc.id_problema
         LEFT JOIN usuario u ON u.id_usuario = pc.id_aprobador
        ORDER BY pc.fecha_decision DESC
        LIMIT 30`
    ),
  ]);
  return { pendientes, historial };
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
  const riesgo = String(riesgoAceptado ?? "").trim();
  const motivo = String(comentario ?? "").trim();
  if (normalizada === "APROBADO" && riesgo.length < 10) {
    throw new ErrorDominio("Describe el riesgo residual que se acepta al cerrar (mínimo 10 caracteres).");
  }
  if (normalizada === "RECHAZADO" && motivo.length < 10) {
    throw new ErrorDominio("Indica qué falta para poder cerrar el problema (mínimo 10 caracteres).");
  }

  const problema = await queryRow<{ id_estado: number; es_mayor: boolean; autorizado: boolean; id_usuario_asignado: number | null }>(
    `SELECT p.id_estado, ${ES_MAYOR} AS es_mayor, p.id_usuario_asignado,
            EXISTS (SELECT 1 FROM problema_cierre_aprobacion pc
                     WHERE pc.id_problema = p.id_problema AND pc.decision = 'APROBADO') AS autorizado
       FROM problema p
       LEFT JOIN impacto_ticket it ON it.id_impacto = p.id_impacto
       LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
      WHERE p.id_problema = $1 AND p.estado_registro = true`,
    [idProblema]
  );
  if (!problema) throw new ErrorDominio("El problema no existe.", 404);
  if (!problema.es_mayor) throw new ErrorDominio("No es un problema mayor: su cierre lo decide el Gestor de Problemas.", 409);
  if (problema.autorizado) throw new ErrorDominio("El cierre de este problema ya fue autorizado.", 409);
  if (Number(problema.id_estado) !== ESTADO_RESUELTO) {
    throw new ErrorDominio("El problema debe estar en estado Resuelto para autorizar su cierre.", 409);
  }
  if (problema.id_usuario_asignado === idUsuario) {
    throw new ErrorDominio("Segregación de funciones: quien resolvió el problema no puede autorizar su cierre.", 403);
  }

  await query(
    `INSERT INTO problema_cierre_aprobacion (id_problema, decision, riesgo_aceptado, comentario, id_aprobador)
     VALUES ($1, $2, $3, $4, $5)`,
    [idProblema, normalizada, normalizada === "APROBADO" ? riesgo : null, motivo || null, idUsuario]
  );

  await query(
    `UPDATE problema SET id_estado = $1, usuario_modificacion = $2, fecha_modificacion = now() WHERE id_problema = $3`,
    [normalizada === "APROBADO" ? ESTADO_CERRADO : ESTADO_EN_INVESTIGACION, idUsuario, idProblema]
  );

  return {
    mensaje:
      normalizada === "APROBADO"
        ? "Cierre autorizado: el problema quedó cerrado con el riesgo residual registrado."
        : "Cierre devuelto: el problema vuelve a investigación con tu observación.",
  };
}
