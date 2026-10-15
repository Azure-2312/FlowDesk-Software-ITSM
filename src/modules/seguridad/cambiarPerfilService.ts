import { query } from "@/shared/lib/db";
import { crearTokenSesion } from "./authService";
import { ErrorDominio } from "@/shared/lib/errores";
import { SesionUsuario } from "@/types";

export interface ResultadoCambiarPerfil {
  payload: Record<string, unknown>;
  tokenSesion: string;
}

export async function cambiarPerfil(
  sesionActual: SesionUsuario,
  idPerfil: number
): Promise<ResultadoCambiarPerfil> {
  if (!idPerfil) {
    throw new ErrorDominio("Falta indicar el perfil");
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
    [sesionActual.id_usuario, idPerfil]
  );

  if (filas.length === 0) {
    throw new ErrorDominio("Ese perfil ya no está asignado a tu usuario", 403);
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

  return { payload: { ok: true, sesion: nuevaSesion }, tokenSesion: nuevoToken };
}
