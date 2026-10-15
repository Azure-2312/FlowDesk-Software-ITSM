import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  guardarResiliencia,
  listarResiliencia,
} from "@/modules/operacion/services/resilienciaService";

function sesionDe(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_RESILIENCIA)) {
    return NextResponse.json(
      { error: "No autorizado para consultar resiliencia de servicios" },
      { status: 403 }
    );
  }

  try {
    const data = await listarResiliencia();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al consultar resiliencia:", error);
    return NextResponse.json(
      { error: "No se pudieron consultar los datos de resiliencia" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo el Supervisor mantiene el registro operativo de resiliencia" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const row = await guardarResiliencia(body, sesion.id_usuario);
    return NextResponse.json(row, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al guardar resiliencia:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      "No se pudo guardar el registro de resiliencia"
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}
