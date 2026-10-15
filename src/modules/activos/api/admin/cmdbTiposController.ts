import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearTipoCi, listarTiposCi } from "@/modules/activos/services/cmdbTiposService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const tipos = await listarTiposCi();
    return NextResponse.json({ tipos });
  } catch (error) {
    console.error("Error al obtener tipos de CI:", error);
    return NextResponse.json({ error: "Error al consultar tipos de CI" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden modelar tipos de CI." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await crearTipoCi(sesion, body, ip);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear tipo de CI:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al guardar tipo de CI.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
