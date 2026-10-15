import { NextRequest } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

/**
 * Resuelve la sesión de un request para los controladores de configuración de
 * módulo. A diferencia de los endpoints operativos, estos no fuerzan 401: si no
 * hay sesión devuelven null y el controlador aplica su valor por defecto.
 */
export async function getUsuarioSesionConfig(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_SESION);
    if (!cookie?.value) return null;
    const token = await verificarTokenSesion(cookie.value);
    if (!token?.id_usuario) return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Diff superficial entre dos snapshots de configuración. Reporta las secciones
 * de primer nivel que cambiaron.
 */
export function calcularDiffConfig(
  original: any,
  modificado: any,
  opciones: {
    mensajeInicial?: string;
    etiquetaCambio?: string;
    mensajeEstructura?: string;
  } = {}
): { cambios: string[]; total: number } {
  const {
    mensajeInicial = "Configuración inicial establecida",
    etiquetaCambio = "sección",
    mensajeEstructura = "Estructura de configuración actualizada",
  } = opciones;
  const cambios: string[] = [];
  if (!original && modificado) {
    cambios.push(mensajeInicial);
    return { cambios, total: 1 };
  }
  const strOriginal = JSON.stringify(original || {});
  const strMod = JSON.stringify(modificado || {});
  if (strOriginal === strMod) {
    return { cambios: ["Sin modificaciones"], total: 0 };
  }

  if (typeof original === "object" && typeof modificado === "object" && original && modificado) {
    const keys = Array.from(new Set([...Object.keys(original), ...Object.keys(modificado)]));
    for (const k of keys) {
      if (JSON.stringify(original[k]) !== JSON.stringify(modificado[k])) {
        cambios.push(`Modificación en ${etiquetaCambio} '${k}'`);
      }
    }
  } else {
    cambios.push(mensajeEstructura);
  }
  return { cambios, total: cambios.length };
}

/**
 * Diff detallado entre dos snapshots de configuración. Reporta altas, bajas y
 * modificaciones por sección.
 */
export function calcularDiffDetalladoConfig(
  base: any,
  nuevo: any
): { agregados: string[]; modificados: string[]; eliminados: string[] } {
  const agregados: string[] = [];
  const modificados: string[] = [];
  const eliminados: string[] = [];

  const baseObj = base || {};
  const nuevoObj = nuevo || {};

  const claves = new Set([...Object.keys(baseObj), ...Object.keys(nuevoObj)]);
  for (const clave of claves) {
    if (!(clave in baseObj)) agregados.push(clave);
    else if (!(clave in nuevoObj)) eliminados.push(clave);
    else if (JSON.stringify(baseObj[clave]) !== JSON.stringify(nuevoObj[clave])) modificados.push(clave);
  }

  return { agregados, modificados, eliminados };
}
