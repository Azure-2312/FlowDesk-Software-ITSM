import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Acciones del Supervisor (perfil 4) sobre cambios cuya lógica es de dominio y
 * no depende de su área: aprobación técnica y reprogramación de la ventana.
 * Movidas desde src/modules/perfiles/supervisor para que el rol solo conserve
 * su UI y su alcance (consultas filtradas por departamento).
 */

export async function resolverAprobacionTecnica(
  idUsuario: number,
  idCambio: number,
  decision: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBAR", "RECHAZAR"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBAR o RECHAZAR.");
  }
  const idEstado = normalizada === "APROBAR" ? 3 : 8;
  const fila = await queryRow<any>(
    `UPDATE cambio
     SET id_estado = $2,
         campos_adicionales = COALESCE(campos_adicionales, '{}'::jsonb) ||
           jsonb_build_object('aprobacion_tecnica', jsonb_build_object(
             'decision', $3, 'comentario', $4, 'fecha', now(), 'usuario', $5)),
         usuario_modificacion = $5, fecha_modificacion = now()
     WHERE id_cambio = $1 AND id_estado = 2
     RETURNING id_cambio, codigo_cambio, id_estado`,
    [idCambio, idEstado, normalizada, comentario ?? null, idUsuario]
  );
  if (!fila) throw new ErrorDominio("La RFC no existe o ya no está pendiente de aprobación técnica.", 404);
  return { mensaje: "Decisión registrada.", cambio: fila };
}

export async function reprogramarCambio(
  idUsuario: number,
  idCambio: number,
  ventanaInicio: string,
  ventanaFin: string
) {
  const inicio = new Date(ventanaInicio).getTime();
  const fin = new Date(ventanaFin).getTime();
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
    throw new ErrorDominio("La ventana debe tener fechas válidas y el fin posterior al inicio.");
  }
  const fila = await queryRow<any>(
    `UPDATE cambio
     SET ventana_inicio = $2, ventana_fin = $3,
         usuario_modificacion = $4, fecha_modificacion = now()
     WHERE id_cambio = $1 AND id_estado IN (3, 4)
     RETURNING id_cambio, codigo_cambio, ventana_inicio, ventana_fin`,
    [idCambio, ventanaInicio, ventanaFin, idUsuario]
  );
  if (!fila) throw new ErrorDominio("El cambio no existe o no admite reprogramación.", 404);
  return { mensaje: "Ventana de cambio actualizada.", cambio: fila };
}
