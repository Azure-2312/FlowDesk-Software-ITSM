import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorLicenciasContratos,
  obtenerConfiguracionLicenciasContratos,
  procesarAccionLicenciasContratos,
  publicarConfiguracionLicenciasContratos,
} from "@/modules/activos/services/licenciasContratosConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "tipos_licencia_metricas";

    const data = await obtenerConfiguracionLicenciasContratos(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET /api/admin/activos-config/licencias-contratos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al obtener la configuración del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const { httpStatus, payload } = await procesarAccionLicenciasContratos(userId, body);
    return NextResponse.json(payload, { status: httpStatus });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/admin/activos-config/licencias-contratos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar la solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await publicarConfiguracionLicenciasContratos(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/admin/activos-config/licencias-contratos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar la versión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await descartarBorradorLicenciasContratos(searchParams.get("pestana") || "");
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/admin/activos-config/licencias-contratos/configuracion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar el borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
