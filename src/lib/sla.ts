/**
 * Motor de Cálculo de Acuerdos de Nivel de Servicio (SLA) en Horas Hábiles
 * Cumplimiento ITIL v4 e ISO/IEC 20000.
 *
 * Parámetros del Calendario Corporativo:
 * - Jornada laboral: Lunes a Viernes de 08:00 a 18:00 (10 horas hábiles por día).
 * - Días no laborables: Sábados y Domingos.
 */

export const HORA_INICIO_JORNADA = 8; // 08:00 AM
export const HORA_FIN_JORNADA = 18;    // 06:00 PM
export const HORAS_POR_JORNADA = HORA_FIN_JORNADA - HORA_INICIO_JORNADA; // 10 horas

/**
 * Determina si una fecha cae en día hábil (Lunes a Viernes).
 */
export function esDiaHabil(fecha: Date): boolean {
  const diaSemana = fecha.getDay(); // 0 = Domingo, 6 = Sábado
  return diaSemana !== 0 && diaSemana !== 6;
}

/**
 * Avanza la fecha al siguiente instante hábil de atención.
 * Si cae en fin de semana o fuera de horario laboral, se traslada al inicio del siguiente día hábil a las 08:00.
 */
export function ajustarAInicioHabil(fecha: Date): Date {
  const cur = new Date(fecha.getTime());

  while (true) {
    const dia = cur.getDay();

    // Si es Sábado (6), avanzar al Lunes
    if (dia === 6) {
      cur.setDate(cur.getDate() + 2);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // Si es Domingo (0), avanzar al Lunes
    if (dia === 0) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // Día de Lunes a Viernes:
    const hora = cur.getHours();
    const minutos = cur.getMinutes();

    // Si es antes de las 08:00 AM, mover a las 08:00 AM de hoy
    if (hora < HORA_INICIO_JORNADA) {
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      return cur;
    }

    // Si es a las 18:00 o después, mover a las 08:00 AM del siguiente día
    if (hora >= HORA_FIN_JORNADA) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // Dentro del horario hábil
    return cur;
  }
}

/**
 * Calcula la fecha límite exacta de SLA sumando horas hábiles laborables.
 * Descuenta fines de semana y horarios nocturnos.
 *
 * @param horasResolucion Cantidad de horas hábiles de SLA comprometidas
 * @param fechaInicio Fecha inicial de inicio del cronómetro (por defecto ahora)
 */
export function calcularFechaLimiteHorasHabiles(
  horasResolucion: number,
  fechaInicio: Date = new Date()
): Date {
  if (horasResolucion <= 0) return new Date(fechaInicio.getTime());

  let actual = ajustarAInicioHabil(fechaInicio);
  let minutosRestantes = Math.round(horasResolucion * 60);

  while (minutosRestantes > 0) {
    actual = ajustarAInicioHabil(actual);

    // Calcular cuántos minutos laborables quedan en el día de hoy hasta las 18:00
    const horaActual = actual.getHours();
    const minutoActual = actual.getMinutes();
    const segundoActual = actual.getSeconds();

    const minutosHastaCierreHoy =
      (HORA_FIN_JORNADA - horaActual) * 60 - minutoActual - Math.ceil(segundoActual / 60);

    if (minutosRestantes <= minutosHastaCierreHoy) {
      // El SLA vence hoy mismo dentro de la jornada
      actual.setMinutes(actual.getMinutes() + minutosRestantes);
      return actual;
    } else {
      // Agota el día actual y avanza al inicio del siguiente día hábil
      minutosRestantes -= minutosHastaCierreHoy;
      actual.setDate(actual.getDate() + 1);
      actual.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
    }
  }

  return actual;
}
