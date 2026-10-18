import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerWidgetsDashboard,
  guardarWidgetsDashboard,
} from "@/modules/plataforma/services/reportesDisenadorService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.REPORTES_VER)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data = await obtenerWidgetsDashboard();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener configuración de widgets:", err);
    const { error, status } = respuestaError(err, "Error al consultar widgets");
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_REPORTES)) {
    return NextResponse.json({ error: "Solo Administración puede guardar la configuración del dashboard." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await guardarWidgetsDashboard(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al guardar widgets de dashboard:", err);
    const { error, status } = respuestaError(err, "Error al guardar configuración");
    return NextResponse.json({ error }, { status });
  }
}
