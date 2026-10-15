import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarCatalogoCambio,
  crearCatalogoCambio,
  eliminarCatalogoCambio,
  listarCatalogosCambio,
} from "@/modules/cambios/services/catalogosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const catalogo = searchParams.get("catalogo");

  try {
    const data = await listarCatalogosCambio(catalogo);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener catálogos de cambios:", error);
    return NextResponse.json({ error: "Error al consultar catálogos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para modificar catálogos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearCatalogoCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar valor en catálogo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar en catálogo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await actualizarCatalogoCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar catálogo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar catálogo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id_item = searchParams.get("id_item");
    const data = await eliminarCatalogoCambio(id_item as string);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar elemento de catálogo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al eliminar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
