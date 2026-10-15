import { NextRequest, NextResponse } from "next/server";
import type { SesionUsuario } from "@/types";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import {
  type Capacidad,
  sesionTieneAlgunaCapacidad,
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
