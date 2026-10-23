import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { procesarMantenimientoDatos } from "@/modules/plataforma/services/mantenimientoDatosService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MANTENIMIENTO)) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden gestionar purga de datos." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await procesarMantenimientoDatos(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en mantenimiento de datos:", err);
    const { error, status } = respuestaError(err, "Error interno al procesar mantenimiento de datos.");
    return NextResponse.json({ error }, { status });
  }
}
