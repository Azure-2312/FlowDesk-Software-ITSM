import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  listarOpcionesMenuAdmin,
  crearOpcionMenuAdmin,
} from "@/modules/administracion/services/menuAdminService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar la configuración del menú." }, { status: 403 });
  }

  try {
    const data = await listarOpcionesMenuAdmin();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar configuración del menú:", err);
    const { error, status } = respuestaError(err, "Error al consultar la configuración del menú");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar el menú." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearOpcionMenuAdmin(body);
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear la opción de menú:", err);
    const { error, status } = respuestaError(err, "No se pudo crear la opción de menú");
    return NextResponse.json({ error }, { status });
  }
}
