import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  guardarConfiguracionProblemas,
  obtenerConfiguracionProblemas,
} from "@/modules/problemas/services/configuracionProblemasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pantalla = searchParams.get("pantalla") || "1.3.4.1";
  const pestana = searchParams.get("pestana") || searchParams.get("ambito") || "campos";

  // Permiso de lectura: Administrador (1), Gestor de Problemas (10), Supervisor (4), Auditor (6)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIG_VER)) {
    return NextResponse.json(
      { error: "No autorizado para consultar la configuración de problemas." },
      { status: 403 }
    );
  }

  try {
    const data = await obtenerConfiguracionProblemas({
      pantalla,
      pestana,
      idUsuario: sesion.id_usuario,
      puedeEditar: sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR),
      puedePublicar: sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIG_PUBLICAR),
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al consultar configuración de problemas:", error);
    return NextResponse.json({ error: "Error interno al consultar la configuración." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  // Solo Administrador (1) y Gestor de Problemas (10) pueden modificar configuración
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "No tiene permisos para modificar la configuración de problemas." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await guardarConfiguracionProblemas(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      puedePublicar: sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIG_PUBLICAR),
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar configuración de problemas:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al procesar la configuración.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
