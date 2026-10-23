import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Límite máximo de tickets activos simultáneos por técnico según regla de negocio RN-16.
 */
export const MAXIMO_TICKETS_ACTIVOS_POR_TECNICO = 5;

/**
 * Valida el control de saturación de capacidad del especialista técnico (RN-16).
 * Bloquea la asignación o toma de ticket si el técnico ya cuenta con 5 o más tickets activos
 * (en estados no terminales: Abierto, Asignado, En Proceso, En Espera).
 *
 * @param idTecnico ID del usuario técnico
 * @param idTicketExcluir ID del ticket actual si es una reasignación o actualización
 */
export async function validarCargaTecnico(
  idTecnico: number,
  idTicketExcluir?: number
): Promise<{ cargaActual: number; disponible: boolean }> {
  if (!idTecnico || isNaN(idTecnico)) {
    return { cargaActual: 0, disponible: true };
  }

  const idExcluirNum = Number(idTicketExcluir);
  const params: any[] = [idTecnico];
  let filtroExcluir = "";

  if (idTicketExcluir && !isNaN(idExcluirNum)) {
    filtroExcluir = "AND t.id_ticket != $2";
    params.push(idExcluirNum);
  }

  const res = await queryRow<{ total: string }>(
    `SELECT COUNT(t.id_ticket) AS total
     FROM ticket t
     INNER JOIN estado_ticket et ON et.id_estado = t.id_estado
     WHERE t.id_usuario_asignado = $1
       AND t.estado_registro = true
       AND et.es_terminal = false
       ${filtroExcluir}`,
    params
  );

  const cargaActual = parseInt(res?.total || "0", 10);
  if (cargaActual >= MAXIMO_TICKETS_ACTIVOS_POR_TECNICO) {
    throw new ErrorDominio(
      `Control de Saturación de Capacidad (RN-16): El especialista técnico ya cuenta con ${cargaActual} tickets activos asignados (límite máximo permitido: ${MAXIMO_TICKETS_ACTIVOS_POR_TECNICO}). Debe resolver, cerrar o liberar casos antes de asumir nuevas asignaciones.`,
      422
    );
  }

  return { cargaActual, disponible: true };
}
