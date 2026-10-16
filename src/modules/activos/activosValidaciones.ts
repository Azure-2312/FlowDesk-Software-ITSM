import { ResultadoValidacion } from "@/shared/lib/validaciones";

/**
 * Validaciones puras (sin acceso a base de datos) para la gestion de activos
 * de hardware. Centralizan reglas de integridad reutilizables por los
 * controladores y servicios del modulo de activos (ITAM / CMDB).
 */

/** Estados de ciclo de vida reconocidos para un activo. */
export const ESTADOS_ACTIVO_VALIDOS = [
  "EN_OPERACION",
  "EN_STOCK",
  "ASIGNADO",
  "EN_PRESTAMO",
  "EN_REPARACION",
  "EN_MANTENIMIENTO",
  "MANTENIMIENTO",
  "BAJA",
  "DADO_DE_BAJA",
] as const;

export type EstadoActivo = (typeof ESTADOS_ACTIVO_VALIDOS)[number];

/** Acciones de custodia admitidas por el endpoint de asignaciones. */
export const ACCIONES_ASIGNACION_VALIDAS = ["ASIGNAR", "TRANSFERIR", "DEVOLVER"] as const;

export type AccionAsignacion = (typeof ACCIONES_ASIGNACION_VALIDAS)[number];

/** Longitud maxima del numero de serie segun el esquema (`VARCHAR(100)`). */
const MAX_LONGITUD_NUMERO_SERIE = 100;

function normalizar(valor: unknown): string {
  return String(valor ?? "").trim();
}

function normalizarClave(valor: unknown): string {
  return normalizar(valor).toUpperCase();
}

/**
 * Valida el numero de serie de un activo: no vacio (si es obligatorio) y con
 * un formato alfanumerico razonable (letras, digitos, guiones, puntos y barras).
 */
export function validarNumeroSerie(
  numeroSerie: string | null | undefined,
  obligatorio = false
): ResultadoValidacion {
  const limpio = normalizar(numeroSerie);

  if (limpio.length === 0) {
    return obligatorio
      ? { valido: false, mensaje: "El número de serie del activo es obligatorio." }
      : { valido: true };
  }

  if (limpio.length > MAX_LONGITUD_NUMERO_SERIE) {
    return {
      valido: false,
      mensaje: `El número de serie no puede superar los ${MAX_LONGITUD_NUMERO_SERIE} caracteres.`,
    };
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(limpio)) {
    return {
      valido: false,
      mensaje:
        "El número de serie solo puede contener letras, números, guiones, puntos o barras, y debe iniciar con un carácter alfanumérico.",
    };
  }

  return { valido: true };
}

/**
 * Verifica que el numero de serie no colisione con los ya registrados en el
 * inventario. La comparacion ignora mayusculas y espacios exteriores.
 */
export function validarNumeroSerieUnico(
  numeroSerie: string | null | undefined,
  numerosSerieExistentes: Iterable<string | null | undefined>
): ResultadoValidacion {
  const clave = normalizarClave(numeroSerie);
  if (clave.length === 0) return { valido: true };

  for (const existente of numerosSerieExistentes) {
    if (normalizarClave(existente) === clave) {
      return {
        valido: false,
        mensaje: `Ya existe un activo registrado con el número de serie "${normalizar(numeroSerie)}".`,
      };
    }
  }

  return { valido: true };
}

export interface FechasActivo {
  fecha_adquisicion?: string | null;
  fecha_fin_garantia?: string | null;
}

/**
 * Valida la coherencia temporal del activo: las fechas deben tener formato
 * valido y la garantia no puede finalizar antes de la adquisicion.
 */
export function validarFechasActivo({ fecha_adquisicion, fecha_fin_garantia }: FechasActivo): ResultadoValidacion {
  const adquisicion = fecha_adquisicion ? new Date(fecha_adquisicion) : null;
  const garantia = fecha_fin_garantia ? new Date(fecha_fin_garantia) : null;

  if (adquisicion && Number.isNaN(adquisicion.getTime())) {
    return { valido: false, mensaje: "La fecha de adquisición no tiene un formato válido." };
  }
  if (garantia && Number.isNaN(garantia.getTime())) {
    return { valido: false, mensaje: "La fecha de fin de garantía no tiene un formato válido." };
  }

  if (adquisicion && garantia && garantia.getTime() < adquisicion.getTime()) {
    return {
      valido: false,
      mensaje: "La fecha de fin de garantía no puede ser anterior a la fecha de adquisición del activo.",
    };
  }

  return { valido: true };
}

/** Valida que el estado del activo pertenezca al ciclo de vida reconocido. */
export function validarEstadoActivo(estado: string | null | undefined): ResultadoValidacion {
  const limpio = normalizarClave(estado);
  if (limpio.length === 0) {
    return { valido: false, mensaje: "El estado del activo es obligatorio." };
  }
  if (!(ESTADOS_ACTIVO_VALIDOS as readonly string[]).includes(limpio)) {
    return {
      valido: false,
      mensaje: `Estado de activo no válido: "${normalizar(estado)}". Valores admitidos: ${ESTADOS_ACTIVO_VALIDOS.join(", ")}.`,
    };
  }
  return { valido: true };
}

export interface CoherenciaCustodia {
  accion: string | null | undefined;
  id_usuario_custodio?: unknown;
  estado_activo?: string | null;
}

/**
 * Valida la coherencia entre la accion de custodia y el custodio/estado:
 * - ASIGNAR/TRANSFERIR exigen un custodio.
 * - DEVOLVER no debe llevar custodio (el activo regresa a stock).
 * - Un activo dado de baja no puede quedar con custodio.
 */
export function validarCoherenciaCustodia({
  accion,
  id_usuario_custodio,
  estado_activo,
}: CoherenciaCustodia): ResultadoValidacion {
  const accionNorm = normalizarClave(accion);
  const tieneCustodio = id_usuario_custodio !== undefined && id_usuario_custodio !== null && id_usuario_custodio !== "";
  const estadoNorm = normalizarClave(estado_activo);

  if ((accionNorm === "ASIGNAR" || accionNorm === "TRANSFERIR") && !tieneCustodio) {
    return { valido: false, mensaje: "Debes indicar el custodio del activo para asignarlo o transferirlo." };
  }

  if (accionNorm === "DEVOLVER" && tieneCustodio) {
    return {
      valido: false,
      mensaje: "La devolución de custodia no debe incluir un custodio destino; el activo regresa a stock.",
    };
  }

  if ((estadoNorm === "BAJA" || estadoNorm === "DADO_DE_BAJA") && tieneCustodio) {
    return {
      valido: false,
      mensaje: "Un activo dado de baja no puede tener un custodio asignado.",
    };
  }

  return { valido: true };
}

/** Valida que la accion de custodia sea una de las admitidas. */
export function validarAccionAsignacion(accion: string | null | undefined): ResultadoValidacion {
  const limpio = normalizarClave(accion);
  if (limpio.length === 0) {
    return { valido: false, mensaje: "Debes indicar la acción de custodia." };
  }
  if (!(ACCIONES_ASIGNACION_VALIDAS as readonly string[]).includes(limpio)) {
    return {
      valido: false,
      mensaje: `Acción de custodia no válida: "${normalizar(accion)}". Usa ASIGNAR, TRANSFERIR o DEVOLVER.`,
    };
  }
  return { valido: true };
}
