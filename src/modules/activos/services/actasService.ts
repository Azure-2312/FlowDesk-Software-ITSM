import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Actas de entrega de activos.
 * Cada vez que un activo pasa a un custodio (asignación o transferencia) se
 * genera un acta PENDIENTE; el custodio la firma en físico y el Gestor de
 * Activos la registra como firmada (registrarActaFirmada). Si el
 * activo cambia de manos o vuelve al stock antes de que la acepte, el acta
 * pendiente anterior queda ANULADA.
 */
export type TipoActa = "ENTREGA" | "TRANSFERENCIA";

export async function anularActasPendientes(idActivo: number, motivo: string) {
  await query(
    `UPDATE acta_entrega
        SET estado = 'ANULADA',
            observaciones = TRIM(CONCAT(COALESCE(observaciones, ''), ' ', $2::text))
      WHERE id_activo = $1 AND estado = 'PENDIENTE'`,
    [idActivo, `[Anulada: ${motivo}]`]
  );
}

/**
 * El custodio firma el acta en físico al recibir el equipo y el Gestor de
 * Activos registra la firma (los usuarios no consultan los equipos en el sistema).
 */
export async function registrarActaFirmada(idActivo: number, idUsuarioGestor: number) {
  const acta = await queryRow<{ id_acta: number; id_usuario: number; estado_activo: string }>(
    `SELECT ae.id_acta, ae.id_usuario, a.estado_activo
       FROM acta_entrega ae JOIN activo a ON a.id_activo = ae.id_activo
      WHERE ae.id_activo = $1 AND ae.estado = 'PENDIENTE' AND ae.id_usuario = a.id_usuario_custodio
      ORDER BY ae.creado_en DESC LIMIT 1`,
    [idActivo]
  );
  if (!acta) throw new ErrorDominio("El activo no tiene un acta de entrega pendiente.", 404);
  await query(
    `UPDATE acta_entrega SET estado = 'ACEPTADA', aceptado_en = now(),
            observaciones = TRIM(CONCAT(COALESCE(observaciones, ''), ' [Acta firmada por el custodio; firma registrada en FlowDesk]'))
      WHERE id_acta = $1`,
    [acta.id_acta]
  );
  await query(
    `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario)
     VALUES ($1, $2, $2, $3, $3, 'Acta de entrega firmada por el custodio', $4)`,
    [idActivo, acta.estado_activo, acta.id_usuario, idUsuarioGestor]
  );
  return { mensaje: "Acta de entrega registrada como firmada." };
}

export async function registrarActaEntrega(idActivo: number, idCustodio: number, tipo: TipoActa, observaciones?: string | null) {
  await anularActasPendientes(idActivo, "el activo pasó a otro custodio");
  await query(
    `INSERT INTO acta_entrega (id_activo, id_usuario, tipo, estado, observaciones)
     VALUES ($1, $2, $3, 'PENDIENTE', $4)`,
    [idActivo, idCustodio, tipo, observaciones?.trim() || null]
  );
}
