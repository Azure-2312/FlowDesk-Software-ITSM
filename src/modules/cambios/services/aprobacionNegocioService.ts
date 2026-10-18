import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Aprobación de negocio de un cambio: la decide el Gestor de Área (perfil 5)
 * cuando el cambio afecta a su área empresarial. La lógica de cambio (registro
 * de la decisión y transición de estado) vive aquí; el rol resuelve su alcance
 * (su área) y delega. Movida desde src/modules/perfiles/gestor-area.
 */

/** Condición reutilizable: el cambio $1 afecta al área empresarial $2. */
const CAMBIOS_DEL_AREA = `(
  c.id_usuario_solicitante IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = $2)
  OR c.id_incidente_origen IN (SELECT id_ticket FROM ticket WHERE id_departamento_empresa = $2)
)`;

export async function resolverAprobacionNegocio(
  idUsuario: number,
  idCambio: number,
  idDepartamentoEmpresa: number,
  decision: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO", "OBSERVADO"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBADO, RECHAZADO u OBSERVADO.");
  }
  if (!comentario || String(comentario).trim().length < 3) {
    throw new ErrorDominio("El comentario de la decisión es obligatorio.");
  }

  const alcance = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM cambio c
       WHERE c.id_cambio = $1 AND c.estado_registro = true AND ${CAMBIOS_DEL_AREA}
     ) AS existe`,
    [idCambio, idDepartamentoEmpresa]
  );
  if (!alcance?.existe) throw new ErrorDominio("El cambio no afecta a tu área.", 404);

  const aprobacion = await queryRow<any>(
    `INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cambio_aprobacion, id_cambio, decision, fecha_decision`,
    [idCambio, idUsuario, normalizada, String(comentario).trim()]
  );

  if (normalizada === "APROBADO") {
    await query(`UPDATE cambio SET id_estado = 3 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  } else if (normalizada === "RECHAZADO") {
    await query(`UPDATE cambio SET id_estado = 8 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  }

  return { mensaje: "Decisión registrada.", aprobacion };
}
