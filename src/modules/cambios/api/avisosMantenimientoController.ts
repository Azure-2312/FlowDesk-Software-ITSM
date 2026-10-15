import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarAvisosMantenimiento } from "@/modules/cambios/services/cambiosService";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  try {
    const avisos = await listarAvisosMantenimiento();
    return NextResponse.json(avisos);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar avisos de mantenimiento:", err);
    const { error, status } = respuestaError(err, "Error al consultar los avisos de mantenimiento");
    return NextResponse.json({ error }, { status });
  }
}
