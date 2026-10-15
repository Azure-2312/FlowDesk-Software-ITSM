import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { getUsuarioSesionConfig } from "@/shared/lib/configuracionModulo";
import {
  descartarBorradorCmdbRelaciones,
  obtenerConfiguracionCmdbRelaciones,
  procesarAccionCmdbRelaciones,
  publicarConfiguracionCmdbRelaciones,
} from "@/modules/activos/services/cmdbRelacionesConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "clases_ci";

    const data = await obtenerConfiguracionCmdbRelaciones(usuario?.id_usuario, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en GET configuracion 1.5.4:", error);
    return NextResponse.json({ error: error.message || "Error al obtener configuración" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    if (!usuario?.id_usuario) {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const body = await req.json();
    const data = await procesarAccionCmdbRelaciones(usuario.id_usuario, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST configuracion 1.5.4:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al procesar solicitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    if (!usuario?.id_usuario) {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const body = await req.json();
    const data = await publicarConfiguracionCmdbRelaciones(usuario.id_usuario, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT configuracion 1.5.4:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al publicar versión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesionConfig(req);
    if (!usuario?.id_usuario) {
      return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana");

    const data = await descartarBorradorCmdbRelaciones(usuario.id_usuario, pestana || "");
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE configuracion 1.5.4:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al descartar borrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
