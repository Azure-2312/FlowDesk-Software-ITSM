import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorTiposModelosAtributos,
  obtenerConfiguracionTiposModelosAtributos,
  procesarAccionTiposModelosAtributos,
  publicarConfiguracionTiposModelosAtributos,
} from "@/modules/activos/services/tiposModelosAtributosConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "clases_tipos";

    const data = await obtenerConfiguracionTiposModelosAtributos(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/activos/configuracion/tipos-modelos-atributos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al obtener la configuración del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const { httpStatus, payload } = await procesarAccionTiposModelosAtributos(userId, body);
    return NextResponse.json(payload, { status: httpStatus });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/activos/configuracion/tipos-modelos-atributos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar la solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await publicarConfiguracionTiposModelosAtributos(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/activos/configuracion/tipos-modelos-atributos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar configuración");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "";
    const userId = usuario?.id_usuario || 1;

    const data = await descartarBorradorTiposModelosAtributos(userId, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/activos/configuracion/tipos-modelos-atributos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
