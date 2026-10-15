import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarOpcionMenuAdmin,
  alternarEstadoOpcionMenuAdmin,
} from "@/modules/administracion/services/menuAdminDetalleService";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

interface Contexto {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar el menú." }, { status: 403 });
  }

  const idOpcion = Number(params.id);

  try {
    const body = await req.json();
    const data = await actualizarOpcionMenuAdmin(idOpcion, body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar la opción de menú:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar la opción de menú");
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar opciones del menú." }, { status: 403 });
  }

  const idOpcion = Number(params.id);

  try {
    const data = await alternarEstadoOpcionMenuAdmin(idOpcion);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar la opción de menú:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar la opción de menú");
    return NextResponse.json({ error }, { status });
  }
}
