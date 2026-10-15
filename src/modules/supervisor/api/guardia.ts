import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { Capacidad, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import type { SesionUsuario } from "@/types";

type Resultado = { sesion: SesionUsuario; error?: never } | { sesion?: never; error: NextResponse };

/** Valida sesión y capacidad para los controladores del módulo supervisor. */
export function sesionConCapacidad(capacidad: Capacidad): Resultado {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) {
    return { error: NextResponse.json({ error: "No hay sesión activa" }, { status: 401 }) };
  }
  if (!sesionTieneCapacidad(sesion, capacidad)) {
    return { error: NextResponse.json({ error: "No autorizado para esta operación." }, { status: 403 }) };
  }
  return { sesion };
}
