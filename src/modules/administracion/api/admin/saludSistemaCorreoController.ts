import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerColaCorreo,
  reintentarCorreo,
} from "@/modules/administracion/services/saludSistemaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json({ error: "No autorizado para consultar la cola de correo." }, { status: 403 });
  }

  try {
    const data = await obtenerColaCorreo();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar la cola de correo:", err);
    const { error, status } = respuestaError(err, "Error al consultar la cola de correo");
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
    return NextResponse.json({ error: "No autorizado para reintentar envíos de correo." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await reintentarCorreo(Number(body?.id_correo));
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al reintentar el correo:", err);
    const { error, status } = respuestaError(err, "Error al reintentar el correo");
    return NextResponse.json({ error }, { status });
  }
}
