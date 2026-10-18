import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Resolución de solicitudes de baja de activos por parte del Supervisor
 * (perfil 4). Lógica de dominio del activo movida desde
 * src/modules/perfiles/supervisor para que el rol solo conserve su UI.
 */
export async function resolverBajaArea(
  idUsuario: number,
  idSolicitud: number,
  decision: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBAR", "RECHAZAR"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBAR o RECHAZAR.");
  }
  const estado = normalizada === "APROBAR" ? "APROBADA" : "RECHAZADA";
  const fila = await queryRow<any>(
    `UPDATE solicitud_baja_activo
     SET estado = $2, id_usuario_resuelve = $3, comentario_resolucion = $4, fecha_resolucion = now()
     WHERE id_solicitud = $1 AND estado = 'PENDIENTE'
     RETURNING id_solicitud, id_activo, estado`,
    [idSolicitud, estado, idUsuario, comentario ?? null]
  );
  if (!fila) throw new ErrorDominio("La solicitud no existe o ya fue resuelta.", 404);

  if (estado === "APROBADA") {
    await query(
      `UPDATE activo SET estado_activo = 'BAJA', fecha_modificacion = now(), usuario_modificacion = $2
       WHERE id_activo = $1 AND estado_registro = true`,
      [fila.id_activo, idUsuario]
    );
  }
  return { mensaje: `Solicitud ${estado.toLowerCase()}.`, solicitud: fila };
}
