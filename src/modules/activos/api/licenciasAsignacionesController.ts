import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  crearAsignacionLicencia,
  listarAsignacionesLicencia,
  revocarAsignacionLicencia,
} from "@/modules/activos/services/licenciasAsignacionesService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_ASIGNACIONES_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar asignaciones de licencias" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const asignaciones = await listarAsignacionesLicencia({
      idLicencia: searchParams.get("id_licencia"),
      activas: searchParams.get("activas"),
    });
    return NextResponse.json({ asignaciones });
  } catch (error) {
    console.error("Error al obtener asignaciones de licencias:", error);
    return NextResponse.json({ error: "Error al consultar asignaciones de licencias" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_GESTIONAR)) {
    return NextResponse.json({ error: "Solo Gestión de Activos puede asignar licencias de software." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearAsignacionLicencia(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al asignar licencia:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar asignación de licencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_GESTIONAR)) {
    return NextResponse.json({ error: "Solo Gestión de Activos puede revocar asignaciones." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await revocarAsignacionLicencia(body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al revocar licencia:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al revocar asignación de licencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
