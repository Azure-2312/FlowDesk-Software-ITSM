import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearCambio, listarCambios } from "@/modules/cambios/services/cambiosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede consultar solicitudes de cambio." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const estado = searchParams.get("estado");
  const vista = searchParams.get("vista");

  try {
    const rows = await listarCambios(sesion, { tipo, estado, vista });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener cambios:", error);
    return NextResponse.json({ error: "Error al consultar cambios RFC" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = await crearCambio(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear cambio RFC:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al crear el cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
