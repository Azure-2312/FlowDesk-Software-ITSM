import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { SesionUsuario } from "@/types";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import {
  type Capacidad,
  sesionTieneAlgunaCapacidad,
  sesionTieneCapacidad,
  perfilPuedeAccion,
} from "@/shared/lib/capacidades";

/** Lee la sesion desde la cookie del request (o null si no hay/no es valida). */
export function obtenerSesionDeRequest(req: NextRequest): SesionUsuario | null {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export type AutorizacionApi =
  | { autorizado: true; sesion: SesionUsuario }
  | { autorizado: false; respuesta: NextResponse };

interface MensajesAutorizacion {
  noAutenticado?: string;
  noAutorizado?: string;
}

/**
 * Autoriza un endpoint de API por capacidades. Devuelve la sesion o una
 * respuesta lista para retornar (401 sin sesion, 403 sin capacidad).
 *
 * Uso:
 *   const auth = autorizarApi(req, CAPACIDADES.ACTIVOS_VER);
 *   if (!auth.autorizado) return auth.respuesta;
 */
export function autorizarApi(
  req: NextRequest,
  capacidades: Capacidad | readonly Capacidad[],
  mensajes?: MensajesAutorizacion
): AutorizacionApi {
  const lista: readonly Capacidad[] = Array.isArray(capacidades)
    ? capacidades
    : [capacidades as Capacidad];

  const sesion = obtenerSesionDeRequest(req);
  if (!sesion) {
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        { error: mensajes?.noAutenticado ?? "No autenticado" },
        { status: 401 }
      ),
    };
  }

  if (!sesionTieneAlgunaCapacidad(sesion, lista)) {
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        { error: mensajes?.noAutorizado ?? "No autorizado" },
        { status: 403 }
      ),
    };
  }

  return { autorizado: true, sesion };
}

export type ResultadoGuardia =
  | { sesion: SesionUsuario; error?: never }
  | { sesion?: never; error: NextResponse };

/**
 * Guard de APIs basado en cookies (uso en Route Handlers).
 * Valida la sesion y una capacidad; devuelve la sesion o una respuesta
 * lista para retornar (401 sin sesion, 403 sin capacidad).
 *
 * Uso:
 *   const { sesion, error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
 *   if (error) return error;
 *
 * Este guard es transversal: vive en shared para que ningun modulo dependa
 * del guard de otro modulo.
 */
export function sesionConCapacidad(capacidad: Capacidad): ResultadoGuardia {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return {
      error: NextResponse.json({ error: "No hay sesión activa" }, { status: 401 }),
    };
  }

  if (!sesionTieneCapacidad(sesion, capacidad)) {
    return {
      error: NextResponse.json(
        { error: "No autorizado para esta operación." },
        { status: 403 }
      ),
    };
  }

  return { sesion };
}

/**
 * Acciones que decide un rol concreto (aprobar, programar, cerrar…): además de
 * la capacidad de lectura del módulo, el perfil activo debe estar en la lista.
 * El Administrador (perfil 1) siempre puede. Devuelve la respuesta 403 o null.
 */
export function perfilPermitido(sesion: SesionUsuario, perfiles: number[]): NextResponse | null {
  const perfil = Number(sesion.perfilActivo?.id_perfil);
  if (perfil === 1 || perfiles.includes(perfil)) return null;
  return NextResponse.json({ error: "Tu perfil no puede realizar esta acción." }, { status: 403 });
}

/**
 * Guardia para escrituras que solo hacen ciertos perfiles (p. ej. publicar la
 * configuración de un módulo). Lee la sesión de la cookie y devuelve la
 * respuesta 401/403 lista para retornar, o null si puede continuar.
 *
 *   const negado = exigirPerfil([9]);
 *   if (negado) return negado;
 */
export function exigirPerfil(perfiles: number[]): NextResponse | null {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  return perfilPermitido(sesion, perfiles);
}

/**
 * Guardia por acción de la tabla ACCIONES (la misma que usan las pantallas).
 * Devuelve la respuesta 403 o null.
 */
export function accionPermitida(sesion: SesionUsuario, accion: readonly number[]): NextResponse | null {
  if (perfilPuedeAccion(sesion.perfilActivo?.id_perfil, accion)) return null;
  return NextResponse.json({ error: "Tu perfil no puede realizar esta acción." }, { status: 403 });
}
