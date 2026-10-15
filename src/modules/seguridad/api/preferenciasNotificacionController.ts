import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerPreferencias,
  guardarPreferencias,
} from "@/modules/seguridad/preferenciasNotificacionService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    const preferencias = await obtenerPreferencias(sesion.id_usuario);
    return NextResponse.json({ preferencias });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener preferencias:", err);
    const { error, status } = respuestaError(err, "Error al consultar las preferencias");
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    const body = await req.json();
    const preferencias = await guardarPreferencias(sesion.id_usuario, body);
    return NextResponse.json({ preferencias });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al guardar preferencias:", err);
    const { error, status } = respuestaError(err, "Error al guardar las preferencias");
    return NextResponse.json({ error }, { status });
  }
}
