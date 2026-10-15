import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarUsuario,
  alternarEstadoUsuario,
} from "@/modules/administracion/services/usuarioDetalleService";

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
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar usuarios." }, { status: 403 });
  }

  const idUsuario = Number(params.id);

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await actualizarUsuario(idUsuario, body, {
      idUsuarioSesion: sesion.id_usuario,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar usuario:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el usuario");
    return NextResponse.json({ error }, { status });
  }
}

/** Activa/desactiva al usuario (soft delete). Nunca borra la fila. */
export async function DELETE(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar usuarios." }, { status: 403 });
  }

  const idUsuario = Number(params.id);

  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await alternarEstadoUsuario(idUsuario, {
      idUsuarioSesion: sesion.id_usuario,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar usuario:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el usuario");
    return NextResponse.json({ error }, { status });
  }
}
