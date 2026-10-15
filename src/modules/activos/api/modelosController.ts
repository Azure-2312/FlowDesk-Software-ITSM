import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearModeloActivo, listarModelosActivo } from "@/modules/activos/services/modelosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar modelos de activos" }, { status: 403 });
  }

  try {
    const modelos = await listarModelosActivo();
    return NextResponse.json({ modelos });
  } catch (error) {
    console.error("Error al obtener modelos de activos:", error);
    return NextResponse.json({ error: "Error al consultar catálogo de modelos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_CONFIGURAR)) {
    return NextResponse.json({ error: "Solo Administración y Gestión de Activos pueden registrar modelos." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearModeloActivo(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar modelo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar modelo de activo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
