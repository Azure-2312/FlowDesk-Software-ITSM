/**
 * Reglas únicas del incidente mayor (ITIL 4), para servicios, paneles y pantallas.
 *
 * - Estados: ABIERTO (servicio caído) → MITIGADO (servicio restablecido, aún en
 *   observación) → CERRADO (crisis terminada). Un incidente mayor cerrado ya no
 *   se modifica.
 * - Activo: ABIERTO o MITIGADO. Es lo que cuentan todos los paneles.
 * - Severidad: P1 (crítica) o P2 (alta).
 */
export const ESTADOS_INCIDENTE_MAYOR = ["ABIERTO", "MITIGADO", "CERRADO"] as const;
export type EstadoIncidenteMayor = (typeof ESTADOS_INCIDENTE_MAYOR)[number];

export const SEVERIDADES_INCIDENTE_MAYOR = ["P1", "P2"] as const;

/** Transiciones permitidas entre estados. */
export const TRANSICIONES_INCIDENTE_MAYOR: Record<EstadoIncidenteMayor, EstadoIncidenteMayor[]> = {
  ABIERTO: ["MITIGADO", "CERRADO"],
  MITIGADO: ["ABIERTO", "CERRADO"],
  CERRADO: [],
};

/** Condición SQL: incidente mayor activo (abierto o mitigado). */
export function sqlMayorActivo(alias = "im"): string {
  return `(${alias}.estado IN ('ABIERTO', 'MITIGADO'))`;
}

export function mayorActivo(estado: string | null | undefined): boolean {
  return estado === "ABIERTO" || estado === "MITIGADO";
}
