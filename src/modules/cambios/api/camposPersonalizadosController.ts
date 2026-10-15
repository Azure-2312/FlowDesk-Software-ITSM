import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarCampoPersonalizadoCambio,
  crearCampoPersonalizadoCambio,
  eliminarCampoPersonalizadoCambio,
  listarCamposPersonalizadosCambio,
} from "@/modules/cambios/services/camposPersonalizadosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const data = await listarCamposPersonalizadosCambio();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener campos personalizados de cambio:", error);
    return NextResponse.json({ error: "Error al cargar campos personalizados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para crear campos personalizados" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearCampoPersonalizadoCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear campo personalizado de cambio:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al crear campo personalizado");
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
    const data = await actualizarCampoPersonalizadoCambio(sesion, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar campo personalizado:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar campo");
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
    const id_campo = searchParams.get("id_campo");
    const data = await eliminarCampoPersonalizadoCambio(id_campo as string);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar campo personalizado:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al eliminar el campo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
