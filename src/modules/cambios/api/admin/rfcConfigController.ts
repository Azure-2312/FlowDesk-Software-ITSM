import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { guardarConfiguracionRfc, obtenerConfiguracionRfc } from "@/modules/cambios/services/rfcConfigService";

function admin(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  return sesion && sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_CONFIGURAR) ? sesion : null;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_CONFIG_VER)) return NextResponse.json({ error: "No autorizado para consultar la configuración de RFC" }, { status: 403 });
  try {
    const row = await obtenerConfiguracionRfc();
    return NextResponse.json(row);
  } catch (e) {
    console.error("Error al consultar configuración RFC:", e);
    return NextResponse.json({ error: "No se pudo consultar la configuración RFC" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const sesion = admin(req);
  if (!sesion) return NextResponse.json({ error: "Solo Administración puede modificar el esquema RFC" }, { status: 403 });
  try {
    const b = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const row = await guardarConfiguracionRfc(sesion, b, ip);
    return NextResponse.json(row);
  } catch (e) {
    if (!(e instanceof ErrorDominio)) console.error("Error al guardar configuración RFC:", e);
    const { error, status } = respuestaError(e, "No se pudo guardar la configuración RFC");
    return NextResponse.json({ error }, { status });
  }
}
