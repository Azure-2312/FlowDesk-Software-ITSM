import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  descartarBorradorFormulario,
  obtenerConfiguracionFormulario,
  procesarAccionFormulario,
  publicarConfiguracionFormulario,
} from "@/modules/cambios/services/formularioConfiguracionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pantalla = searchParams.get("pantalla") || "1.3.3.1";
  const pestana = searchParams.get("pestana") || searchParams.get("ambito") || "campos";
  const idPerfil = sesion.perfilActivo?.id_perfil;

  // Permiso de lectura: Administrador (1), Gestor de Cambios (8), Supervisor (4), Auditor (6)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar la configuración de cambios." }, { status: 403 });
  }

  try {
    const data = await obtenerConfiguracionFormulario(sesion.id_usuario, pantalla, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener configuración de cambios:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al consultar configuración de cambios.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  // Solo Administrador (1) y Gestor de Cambios (8) pueden editar borradores
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para modificar la configuración de cambios." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await procesarAccionFormulario(sesion.id_usuario, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al guardar borrador de cambios:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al guardar el borrador.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  // Solo Administrador (1) y Gestor de Cambios (8) pueden publicar
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para publicar cambios de configuración." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await publicarConfiguracionFormulario(
      sesion.id_usuario,
      req.headers.get("x-forwarded-for") || "127.0.0.1",
      body,
    );
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al publicar configuración de cambios:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al publicar la configuración.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pantalla = searchParams.get("pantalla") || "1.3.3.1";
  const pestana = searchParams.get("pestana") || "campos";

  try {
    const data = await descartarBorradorFormulario(sesion.id_usuario, pantalla, pestana);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al descartar borrador de cambios:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al descartar el borrador.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
