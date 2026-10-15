import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarEventos, registrarEvento } from "@/modules/operacion/services/eventoService";

function obtenerSesion(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = obtenerSesion(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_EVENTOS)) {
    return NextResponse.json({ error: "No autorizado para consultar eventos" }, { status: 403 });
  }

  try {
    const estado = new URL(req.url).searchParams.get("estado");
    const rows = await listarEventos(estado);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al consultar eventos de servicio:", error);
    return NextResponse.json({ error: "No se pudieron consultar los eventos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesion(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo el Supervisor registra y clasifica eventos manuales" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const row = await registrarEvento(body, sesion.id_usuario);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar evento:", error);
    const { error: mensaje, status } = respuestaError(error, "No se pudo registrar el evento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
