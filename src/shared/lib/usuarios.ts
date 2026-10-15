import { PoolClient } from "pg";

/**
 * Deja al usuario con EXACTAMENTE los perfiles indicados en idsPerfiles:
 *  - Desactiva (estado_registro = false) las asignaciones que ya no aplican.
 *  - Activa o crea las asignaciones nuevas, usando ON CONFLICT para no
 *    duplicar la fila si ya existía (por ejemplo, si antes se le quitó
 *    un perfil y ahora se le vuelve a asignar el mismo).
 *
 * Se ejecuta dentro de una transacción para que "crear/editar usuario" +
 * "asignar sus perfiles" sea una sola operación atómica.
 */
export async function asignarPerfilesAUsuario(
  client: PoolClient,
  idUsuario: number,
  idsPerfiles: number[]
): Promise<void> {
  // 1) Desactivar las asignaciones que ya no están en la lista nueva
  await client.query(
    `UPDATE usuario_perfiles
     SET estado_registro = false
     WHERE id_usuario = $1
       AND id_perfil <> ALL($2::int[])`,
    [idUsuario, idsPerfiles]
  );

  // 2) Activar (o crear) cada perfil de la lista nueva
  for (const idPerfil of idsPerfiles) {
    await client.query(
      `INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro)
       VALUES ($1, $2, true)
       ON CONFLICT (id_usuario, id_perfil)
       DO UPDATE SET estado_registro = true`,
      [idUsuario, idPerfil]
    );
  }
}

export { sanitizarTextoParaCorreo, generarCorreoCorporativo, generarClaveEstandar } from "./correo-util";

