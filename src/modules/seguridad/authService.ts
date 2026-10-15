/**
 * Contrato publico del modulo de seguridad para autenticacion y sesion.
 *
 * La implementacion base vive en `src/shared/lib/auth.ts` para evitar duplicar
 * logica de JWT, hashing y validacion de claves. Este archivo mantiene la API
 * del modulo estable para sus consumidores.
 */
export {
  COOKIE_SESION,
  MAX_INTENTOS_FALLIDOS,
  compararClave,
  crearTokenPreSesion,
  crearTokenSesion,
  hashearClave,
  validarFortalezaClave,
  verificarTokenPreSesion,
  verificarTokenSesion,
} from "@/shared/lib/auth";
export type { DatosPreSesion } from "@/shared/lib/auth";
