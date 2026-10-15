import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorCiclosVidaTransiciones,
  obtenerConfiguracionCiclosVidaTransiciones,
  procesarAccionCiclosVidaTransiciones,
  publicarConfiguracionCiclosVidaTransiciones,
} from "@/modules/activos/services/ciclosVidaTransicionesConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "ciclos_estados";

    const data = await obtenerConfiguracionCiclosVidaTransiciones(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/admin/activos-config/ciclos-vida-transiciones/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al obtener la configuración del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const { httpStatus, payload } = await procesarAccionCiclosVidaTransiciones(userId, body);
    return NextResponse.json(payload, { status: httpStatus });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/admin/activos-config/ciclos-vida-transiciones/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar la solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await publicarConfiguracionCiclosVidaTransiciones(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/admin/activos-config/ciclos-vida-transiciones/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar la versión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await descartarBorradorCiclosVidaTransiciones(searchParams.get("pestana") || "");
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/admin/activos-config/ciclos-vida-transiciones/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar el borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
