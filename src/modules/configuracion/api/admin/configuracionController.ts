import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerConfiguraciones,
  guardarConfiguracion,
} from "@/modules/configuracion/services/configuracionSistemaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clave = searchParams.get("clave");
  const categoria = searchParams.get("categoria");

  try {
    const data = await obtenerConfiguraciones(clave, categoria);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener configuraciones:", err);
    const { error, status } = respuestaError(err, "Error interno del servidor");
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo Administrador del Sistema (id_perfil 1)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden cambiar configuraciones del sistema." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await guardarConfiguracion(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al guardar configuracion:", err);
    const { error, status } = respuestaError(err, "Error interno al guardar configuracion");
    return NextResponse.json({ error }, { status });
  }
}
