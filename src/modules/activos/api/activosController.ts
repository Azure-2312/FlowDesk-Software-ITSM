import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarActivo, crearActivo, listarActivos } from "@/modules/activos/services/activosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar el inventario de activos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const rows = await listarActivos(sesion.perfilActivo?.id_perfil || 0, {
      tipo: searchParams.get("tipo"),
      estado: searchParams.get("estado"),
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener activos:", error);
    return NextResponse.json({ error: "Error al consultar activos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // El Gestor de Activos mantiene los registros; Administración configura políticas.
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para registrar activos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearActivo(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear activo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al crear el activo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para modificar activos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await actualizarActivo(sesion, body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar activo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al actualizar el activo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
