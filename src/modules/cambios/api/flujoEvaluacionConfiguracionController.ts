import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorFlujoEvaluacion,
  obtenerConfiguracionFlujoEvaluacion,
  procesarAccionFlujoEvaluacion,
  publicarConfiguracionFlujoEvaluacion,
} from "@/modules/cambios/services/flujoEvaluacionConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "estados";

    const data = await obtenerConfiguracionFlujoEvaluacion(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/cambios/configuracion/flujo-evaluacion/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al cargar configuración");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const { httpStatus, payload } = await procesarAccionFlujoEvaluacion(userId, body);
    return NextResponse.json(payload, { status: httpStatus });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/cambios/configuracion/flujo-evaluacion/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar acción");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await publicarConfiguracionFlujoEvaluacion(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/cambios/configuracion/flujo-evaluacion/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar versión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana");

    const userId = usuario?.id_usuario || 1;
    const data = await descartarBorradorFlujoEvaluacion(userId, pestana || "");
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/cambios/configuracion/flujo-evaluacion/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
