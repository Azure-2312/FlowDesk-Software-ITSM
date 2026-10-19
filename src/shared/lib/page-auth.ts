import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SesionUsuario } from "@/types";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import {
  type Capacidad,
  sesionTieneAlgunaCapacidad,
} from "@/shared/lib/capacidades";
import { menuIncluyePrefijo, menuIncluyeUrl, obtenerMenuDelUsuario } from "@/shared/lib/menu";

/** Obtiene la sesion activa o redirige a /login si no existe. */
export function obtenerSesionPagina(): SesionUsuario {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) redirect("/login");
  return sesion;
}

/**
 * @deprecated Preferir `exigirCapacidadPagina`. Se mantiene por compatibilidad
 * mientras se migran las paginas restantes.
 */
export function exigirPerfilPagina(perfiles: number[]) {
  const sesion = obtenerSesionPagina();
  const idPerfil = sesion.perfilActivo?.id_perfil || 0;
  if (!perfiles.includes(idPerfil)) redirect("/403");
  return { idUsuario: sesion.id_usuario, idPerfil, sesion };
}

/**
 * Exige que el perfil activo tenga al menos una de las capacidades indicadas.
 * Redirige a /login si no hay sesion y a /403 si no esta autorizado.
 */
export function exigirCapacidadPagina(capacidades: Capacidad | readonly Capacidad[]) {
  const lista: readonly Capacidad[] = Array.isArray(capacidades)
    ? capacidades
    : [capacidades as Capacidad];
  const sesion = obtenerSesionPagina();
  if (!sesionTieneAlgunaCapacidad(sesion, lista)) redirect("/403");
  return {
    idUsuario: sesion.id_usuario,
    idPerfil: sesion.perfilActivo?.id_perfil || 0,
    sesion,
  };
}

/**
 * Exige que la pantalla figure en el menu del perfil activo. Es la guarda de
 * las paginas de los modulos Incidentes y Solicitudes, donde la visibilidad la
 * define el catalogo de menu. Con `prefijo` autoriza cualquier pantalla bajo la
 * ruta (util en las fichas de detalle, que no son una opcion del menu).
 */
export async function exigirMenuPagina(url: string, opciones?: { prefijo?: boolean }) {
  const sesion = obtenerSesionPagina();
  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);
  const permitido = opciones?.prefijo ? menuIncluyePrefijo(menu, url) : menuIncluyeUrl(menu, url);
  if (!permitido) redirect("/403");
  return {
    idUsuario: sesion.id_usuario,
    idPerfil: sesion.perfilActivo?.id_perfil || 0,
    sesion,
  };
}
