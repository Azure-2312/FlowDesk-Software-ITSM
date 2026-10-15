import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarPlantillaCambio,
  crearPlantillaCambio,
  eliminarPlantillaCambio,
  listarPlantillasCambio,
} from "@/modules/cambios/services/plantillasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await listarPlantillasCambio();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener plantillas de cambio:", error);
    return NextResponse.json({ error: "Error al cargar plantillas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const data = await crearPlantillaCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear plantilla:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al crear plantilla");
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
    const data = await actualizarPlantillaCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar plantilla:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar plantilla");
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
    const id_plantilla = searchParams.get("id_plantilla");
    const data = await eliminarPlantillaCambio(id_plantilla as string);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar plantilla:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al eliminar plantilla");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
