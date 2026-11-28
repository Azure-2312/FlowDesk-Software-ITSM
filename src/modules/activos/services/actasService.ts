import { query } from "@/shared/lib/db";

/**
 * Actas de entrega de activos.
 * Cada vez que un activo pasa a un custodio (asignación o transferencia) se
 * genera un acta PENDIENTE que el custodio acepta desde "Mis activos". Si el
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

export async function registrarActaEntrega(idActivo: number, idCustodio: number, tipo: TipoActa, observaciones?: string | null) {
  await anularActasPendientes(idActivo, "el activo pasó a otro custodio");
  await query(
    `INSERT INTO acta_entrega (id_activo, id_usuario, tipo, estado, observaciones)
     VALUES ($1, $2, $3, 'PENDIENTE', $4)`,
    [idActivo, idCustodio, tipo, observaciones?.trim() || null]
  );
}
