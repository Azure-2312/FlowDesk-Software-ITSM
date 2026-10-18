import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarDepartamentosTi, crearDepartamentoTi } from "@/modules/organizacion/services/departamentoTiService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ORGANIZACION_VER)) {
    return NextResponse.json({ departamentos: [] });
  }

  try {
    const data = await listarDepartamentosTi(sesion);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener departamentos de TI:", err);
    const { error, status } = respuestaError(err, "Error interno al consultar departamentos");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // La estructura de grupos TI es dato maestro; el Supervisor coordina su
  // grupo, pero no crea la estructura organizacional.
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_ORGANIZACION)) {
    return NextResponse.json({ error: "No autorizado para crear departamentos de TI" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearDepartamentoTi(body);
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear departamento de TI:", err);
    const { error, status } = respuestaError(err, "Error al registrar el departamento");
    return NextResponse.json({ error }, { status });
  }
}
