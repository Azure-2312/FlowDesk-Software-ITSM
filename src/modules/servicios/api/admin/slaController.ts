import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarObjetivosSla,
  obtenerObjetivosSla,
} from "@/modules/servicios/services/slaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const data = await obtenerObjetivosSla();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener objetivos SLA:", error);
    return NextResponse.json({ error: "Error interno al obtener objetivos SLA" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "No autorizado. Solo Administradores del Sistema pueden configurar objetivos SLA." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await actualizarObjetivosSla(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar objetivos SLA:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al guardar objetivos SLA.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
