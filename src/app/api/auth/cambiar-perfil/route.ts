import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, crearTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { query } from "@/lib/db";
import { SesionUsuario } from "@/types";

export async function POST(req: NextRequest) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesionActual = token ? verificarTokenSesion(token) : null;

  if (!sesionActual) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  const { id_perfil } = await req.json();
  if (!id_perfil) {
    return NextResponse.json({ error: "Falta indicar el perfil" }, { status: 400 });
  }

  // No confiamos solo en lo que ya venía en el token: volvemos a
  // consultar la base de datos, por si un administrador le quitó ese
  // perfil al usuario mientras la sesión seguía abierta.
  const filas = await query<{ id_perfil: number; nombre: string }>(
    `SELECT p.id_perfil, p.nombre
     FROM perfiles p
     INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     WHERE up.id_usuario = $1
       AND up.id_perfil = $2
       AND up.estado_registro = true
       AND p.estado_registro = true`,
    [sesionActual.id_usuario, id_perfil]
  );

  if (filas.length === 0) {
    return NextResponse.json({ error: "Ese perfil ya no está asignado a tu usuario" }, { status: 403 });
  }

  // Traer todos los perfiles activos del usuario para que el token siempre esté al día
  const todosLosPerfiles = await query<{ id_perfil: number; nombre: string }>(
    `SELECT p.id_perfil, p.nombre
     FROM perfiles p
     INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     WHERE up.id_usuario = $1
       AND up.estado_registro = true
       AND p.estado_registro = true
     ORDER BY p.id_perfil`,
    [sesionActual.id_usuario]
  );

  const nuevaSesion: SesionUsuario = {
    id_usuario: sesionActual.id_usuario,
    nombres: sesionActual.nombres,
    correo_electronico: sesionActual.correo_electronico,
    perfiles: todosLosPerfiles,
    perfilActivo: filas[0],
  };

  const nuevoToken = crearTokenSesion(nuevaSesion);
  const respuesta = NextResponse.json({ ok: true, sesion: nuevaSesion });

  respuesta.cookies.set(COOKIE_SESION, nuevoToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return respuesta;
}
