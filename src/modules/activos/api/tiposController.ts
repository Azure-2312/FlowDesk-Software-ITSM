import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearTipoActivo, listarTiposActivo } from "@/modules/activos/services/tiposActivoService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const tipos = await listarTiposActivo();
    return NextResponse.json({ tipos });
  } catch (error) {
    console.error("Error al obtener tipos de activo:", error);
    return NextResponse.json({ error: "Error al consultar tipos de activo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para registrar tipos de activo." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearTipoActivo(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar tipo de activo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar tipo de activo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
