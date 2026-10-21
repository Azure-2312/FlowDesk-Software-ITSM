import { query } from "@/shared/lib/db";

/**
 * Motor de Cálculo de Acuerdos de Nivel de Servicio (SLA) en Horas Hábiles (RN-10)
 * Cumplimiento estricto ITIL v4, ISO/IEC 20000-1 e ISO/IEC 27001.
 *
 * Parámetros del Calendario Corporativo Institucional:
 * - Jornada laboral hábil: Lunes a Viernes de 08:00 a 18:00 (10 horas hábiles netas por día).
 * - Días no laborables: Sábados y Domingos.
 * - Feriados oficiales e institucionales: descontados en su totalidad del cómputo de SLA.
 */

export const HORA_INICIO_JORNADA = 8;  // 08:00 AM
export const HORA_FIN_JORNADA = 18;    // 06:00 PM
export const HORAS_POR_JORNADA = HORA_FIN_JORNADA - HORA_INICIO_JORNADA; // 10 horas

/**
 * Calendario canónico de feriados nacionales e institucionales recurrentes (formato MM-DD).
 */
export const FERIADOS_INSTITUCIONALES_RECURRENTES: readonly string[] = [
  "01-01", // Año Nuevo
  "05-01", // Día del Trabajo
  "06-07", // Batalla de Arica y Día de la Bandera
  "06-29", // San Pedro y San Pablo
  "07-23", // Día de la Fuerza Aérea
  "07-28", // Fiestas Patrias (Independencia)
  "07-29", // Fiestas Patrias (Gran Parada)
  "08-06", // Batalla de Junín
  "08-30", // Santa Rosa de Lima
  "10-08", // Combate de Angamos
  "11-01", // Día de Todos los Santos
  "12-08", // Inmaculada Concepción
  "12-09", // Batalla de Ayacucho
  "12-25", // Navidad
];

// Caché en memoria para feriados de base de datos
interface FeriadoCache {
  cargadoEn: number;
  feriados: { fecha_inicio: string; fecha_fin: string; recurrente_anual: boolean }[];
}
let cacheFeriadosDb: FeriadoCache | null = null;
const TTL_CACHE_FERIADOS_MS = 10 * 60 * 1000; // 10 minutos

/**
 * Carga de forma segura los feriados activos desde la tabla `calendario_feriados`
 */
export async function cargarFeriadosDesdeBaseDeDatos(): Promise<string[]> {
  try {
    const ahora = Date.now();
    if (cacheFeriadosDb && ahora - cacheFeriadosDb.cargadoEn < TTL_CACHE_FERIADOS_MS) {
      return normalizarFeriados(cacheFeriadosDb.feriados);
    }

    const filas = await query<{ fecha_inicio: string; fecha_fin: string; recurrente_anual: boolean }>(
      `SELECT fecha_inicio::text, fecha_fin::text, recurrente_anual
       FROM calendario_feriados
       WHERE activo = true`
    );

    cacheFeriadosDb = {
      cargadoEn: ahora,
      feriados: filas || [],
    };

    return normalizarFeriados(cacheFeriadosDb.feriados);
  } catch {
    // Si la base no está disponible en este ciclo, continúa con feriados canónicos en memoria
    return [];
  }
}

function normalizarFeriados(filas: { fecha_inicio: string; fecha_fin: string; recurrente_anual: boolean }[]): string[] {
  const lista: string[] = [];
  for (const f of filas) {
    if (f.fecha_inicio) {
      const ini = f.fecha_inicio.substring(0, 10);
      lista.push(ini);
      if (f.fecha_fin && f.fecha_fin !== f.fecha_inicio) {
        lista.push(f.fecha_fin.substring(0, 10));
      }
    }
  }
  return lista;
}

/**
 * Formatea una fecha a string "YYYY-MM-DD" local
 */
export function formatoFechaIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/**
 * Formatea una fecha a "MM-DD" para comprobación de feriados recurrentes anuales
 */
export function formatoMesDia(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${mes}-${dia}`;
}

/**
 * Determina si una fecha corresponde a un feriado oficial o institucional (RN-10).
 */
export function esFeriado(fecha: Date, feriadosAdicionales: string[] = []): boolean {
  const mmDd = formatoMesDia(fecha);
  if (FERIADOS_INSTITUCIONALES_RECURRENTES.includes(mmDd)) {
    return true;
  }

  const yyyyMmDd = formatoFechaIso(fecha);
  if (feriadosAdicionales.includes(yyyyMmDd) || feriadosAdicionales.includes(mmDd)) {
    return true;
  }

  return false;
}

/**
 * Determina si una fecha cae en día hábil (Lunes a Viernes y NO feriado institucional).
 */
export function esDiaHabil(fecha: Date, feriadosAdicionales: string[] = []): boolean {
  const diaSemana = fecha.getDay(); // 0 = Domingo, 6 = Sábado
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }
  return !esFeriado(fecha, feriadosAdicionales);
}

/**
 * Avanza la fecha al siguiente instante hábil de atención.
 * Si cae en fin de semana, en feriado institucional o fuera de horario laboral,
 * se traslada automáticamente al inicio del siguiente día hábil a las 08:00 AM.
 */
export function ajustarAInicioHabil(fecha: Date, feriadosAdicionales: string[] = []): Date {
  const cur = new Date(fecha.getTime());

  // Límite de seguridad de 365 iteraciones para prevenir ciclos infinitos
  let intentos = 0;
  while (intentos++ < 365) {
    const dia = cur.getDay();

    // 1. Si es Sábado (6), avanzar al Lunes
    if (dia === 6) {
      cur.setDate(cur.getDate() + 2);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // 2. Si es Domingo (0), avanzar al Lunes
    if (dia === 0) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // 3. Si es Feriado Institucional, avanzar al día siguiente a las 08:00 AM
    if (esFeriado(cur, feriadosAdicionales)) {
      cur.setDate(cur.getDate() + 1);
      cur.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
      continue;
    }

    // 4. Día de Lunes a Viernes no feriado:
    const hora = cur.getHours();

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

    // Dentro del horario hábil de atención
    return cur;
  }

  return cur;
}

/**
 * Calcula la fecha límite exacta de SLA sumando horas hábiles laborables (RN-10).
 * Descuenta fines de semana, feriados institucionales y horarios no laborables nocturnos.
 *
 * @param horasResolucion Cantidad de horas hábiles de SLA comprometidas
 * @param fechaInicio Fecha inicial de inicio del cronómetro (por defecto ahora)
 * @param feriadosAdicionales Lista opcional de feriados en formato YYYY-MM-DD o MM-DD
 */
export function calcularFechaLimiteHorasHabiles(
  horasResolucion: number,
  fechaInicio: Date = new Date(),
  feriadosAdicionales: string[] = []
): Date {
  if (horasResolucion <= 0) return new Date(fechaInicio.getTime());

  let actual = ajustarAInicioHabil(fechaInicio, feriadosAdicionales);
  let minutosRestantes = Math.round(horasResolucion * 60);

  let iteraciones = 0;
  while (minutosRestantes > 0 && iteraciones++ < 1000) {
    actual = ajustarAInicioHabil(actual, feriadosAdicionales);

    // Minutos laborables que restan en el día hábil actual hasta las 18:00
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
      // Consume el día hábil actual y avanza al inicio de la siguiente jornada
      minutosRestantes -= minutosHastaCierreHoy;
      actual.setDate(actual.getDate() + 1);
      actual.setHours(HORA_INICIO_JORNADA, 0, 0, 0);
    }
  }

  return actual;
}

/**
 * Versión asíncrona que sincroniza automáticamente con los feriados activos de la BD
 */
export async function calcularFechaLimiteHorasHabilesAsync(
  horasResolucion: number,
  fechaInicio: Date = new Date()
): Promise<Date> {
  const feriados = await cargarFeriadosDesdeBaseDeDatos();
  return calcularFechaLimiteHorasHabiles(horasResolucion, fechaInicio, feriados);
}
