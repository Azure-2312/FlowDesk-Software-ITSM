import { query } from "@/shared/lib/db";

/** Registra que un usuario quedó enterado de un cambio (idempotente). */
export async function registrarEnteradoCambio(idCambio: number, idUsuario: number) {
  if (idCambio) {
    await query(
      `INSERT INTO cambio_enterado (id_cambio, id_usuario)
         VALUES ($1, $2)
         ON CONFLICT (id_cambio, id_usuario) DO NOTHING`,
      [idCambio, idUsuario]
    );
  }
  return { exito: true };
}
