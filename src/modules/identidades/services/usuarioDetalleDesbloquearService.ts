import { query } from "@/shared/lib/db";

export async function desbloquearUsuario(idUsuario: number, idUsuarioSesion: number) {
  await query(
    `UPDATE usuario
     SET intentos_fallidos = 0,
         cuenta_bloqueada = false,
         bloqueado_hasta = NULL,
         usuario_modificacion = $1,
         fecha_modificacion = now()
     WHERE id_usuario = $2`,
    [idUsuarioSesion, idUsuario]
  );

  return {
    ok: true,
    mensaje: "Usuario desbloqueado exitosamente. Ya puede iniciar sesión.",
  };
}
