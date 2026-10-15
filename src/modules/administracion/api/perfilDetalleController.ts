import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarPerfil, alternarEstadoPerfil } from "@/modules/administracion/services/perfilDetalleService";

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
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_PERFILES)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar perfiles." }, { status: 403 });
  }

  const idPerfil = Number(params.id);

  try {
    const body = await req.json();
    const data = await actualizarPerfil(idPerfil, body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar perfil:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el perfil");
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_PERFILES)) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar perfiles." }, { status: 403 });
  }

  const idPerfil = Number(params.id);

  try {
    const data = await alternarEstadoPerfil(idPerfil);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar perfil:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el perfil");
    return NextResponse.json({ error }, { status });
  }
}
