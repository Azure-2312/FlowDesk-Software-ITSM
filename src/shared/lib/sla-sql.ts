/**
 * Reglas SQL únicas para contar tickets "en atención" y "vencidos".
 * Todos los paneles e informes las usan, así cuentan lo mismo que las bandejas.
 *
 * Estados (estado_ticket): 1 Abierto · 2 Asignado · 3 En proceso · 4 En espera
 * · 5 Resuelto · 6 Cerrado · 7 Cancelado.
 *
 * - En atención: 1 a 4. Un ticket Resuelto ya fue entregado (solo espera la
 *   conformidad del usuario) y uno Cancelado no requiere trabajo.
 * - Límite efectivo: en "En espera" el reloj del SLA está detenido, así que el
 *   tiempo en pausa se suma al límite (igual que al reanudar el ticket).
 * - Una solicitud que espera la decisión del jefe todavía no es trabajo de TI:
 *   no cuenta como vencida ni como pendiente de asignar.
 *
 * `t` es el alias (o nombre) de la tabla ticket o de la vista vista_ticket.
 */
export function sqlEnAtencion(t = "t"): string {
  return `(${t}.id_estado IN (1, 2, 3, 4))`;
}

export function sqlLimiteEfectivo(t = "t"): string {
  return `(${t}.fecha_limite_sla + CASE WHEN ${t}.id_estado = 4 AND ${t}.fecha_ultima_pausa IS NOT NULL
     THEN now() - ${t}.fecha_ultima_pausa ELSE interval '0' END)`;
}

export function sqlEsperaAprobacion(t = "t"): string {
  return `EXISTS (SELECT 1 FROM ticket_solicitud ts_ap WHERE ts_ap.id_ticket = ${t}.id_ticket
     AND ts_ap.estado_aprobacion IN ('PENDIENTE_APROBACION', 'RECHAZADO'))`;
}

/** En atención, trabajo de TI y con el límite efectivo ya superado. */
export function sqlVencidoActivo(t = "t"): string {
  return `(${sqlEnAtencion(t)} AND NOT ${sqlEsperaAprobacion(t)} AND ${sqlLimiteEfectivo(t)} < now())`;
}

/** Vence dentro de las próximas `horas` (aún no vencido). */
export function sqlPorVencer(horas: number, t = "t"): string {
  return `(${sqlEnAtencion(t)} AND NOT ${sqlEsperaAprobacion(t)}
     AND ${sqlLimiteEfectivo(t)} BETWEEN now() AND now() + interval '${Math.trunc(horas)} hours')`;
}

/** Incumplimiento de SLA: se resolvió fuera de plazo o sigue en atención y ya venció. */
export function sqlIncumplido(t = "t"): string {
  return `(${t}.sla_cumplido = false OR ${sqlVencidoActivo(t)})`;
}
