/**
 * Parámetros de negocio transversales del ITSM.
 * Viven en `shared` para que ningún módulo de dominio dependa de otro por una
 * constante (evita acoplamiento cruzado entre módulos).
 */

/** Monto (moneda del sistema) a partir del cual el Aprobador/CAB debe autorizar
 *  la baja de un activo o la renovación de una licencia. */
export const UMBRAL_MONTO_APROBACION = 2000;
