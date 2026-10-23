import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorTiposRequisitos,
  obtenerConfiguracionTiposRequisitos,
  procesarAccionTiposRequisitos,
  publicarConfiguracionTiposRequisitos,
} from "@/modules/cambios/services/tiposRequisitosConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "tipos";

    const data = await obtenerConfiguracionTiposRequisitos(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/cambios/configuracion/tipos-requisitos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al cargar configuración");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const { httpStatus, payload } = await procesarAccionTiposRequisitos(userId, body);
    return NextResponse.json(payload, { status: httpStatus });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/cambios/configuracion/tipos-requisitos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await publicarConfiguracionTiposRequisitos(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/cambios/configuracion/tipos-requisitos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar configuración");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana");

    const userId = usuario?.id_usuario || 1;
    const data = await descartarBorradorTiposRequisitos(userId, pestana || "");
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/cambios/configuracion/tipos-requisitos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
