import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerTareasProgramadas,
  ejecutarTareaProgramada,
} from "@/modules/plataforma/services/saludSistemaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json({ error: "No autorizado para consultar las tareas programadas." }, { status: 403 });
  }

  try {
    const data = await obtenerTareasProgramadas();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar las tareas programadas:", err);
    const { error, status } = respuestaError(err, "Error al consultar las tareas programadas");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json({ error: "No autorizado para ejecutar tareas programadas." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await ejecutarTareaProgramada(Number(body?.id_tarea));
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al ejecutar la tarea programada:", err);
    const { error, status } = respuestaError(err, "Error al ejecutar la tarea programada");
    return NextResponse.json({ error }, { status });
  }
}
