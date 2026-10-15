import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarLicencia, crearLicencia, listarLicencias } from "@/modules/activos/services/licenciasService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.LICENCIAS_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar licencias de software" }, { status: 403 });
  }

  try {
    const rows = await listarLicencias();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener licencias:", error);
    return NextResponse.json({ error: "Error al consultar licencias de software" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para registrar licencias" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearLicencia(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar licencia:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al registrar licencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para modificar licencias" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await actualizarLicencia(body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar licencia:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al actualizar licencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
