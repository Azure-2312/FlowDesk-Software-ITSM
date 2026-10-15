import { query, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function actualizarOpcionMenuAdmin(idOpcion: number, body: any) {
  const { nombre, url_menu, descripcion, id_padre, orden, perfiles_ids } = body;

  if (!nombre || !nombre.trim() || !url_menu || !url_menu.trim()) {
    throw new ErrorDominio("El nombre y la URL son obligatorios");
  }

  const padreId = id_padre ? Number(id_padre) : null;

  if (padreId === idOpcion) {
    throw new ErrorDominio("Una opción no puede ser su propio padre");
  }

  let nivelCalculado = 1;
  if (padreId) {
    const padre = await query<{ nivel: number }>(
      `SELECT nivel FROM opciones_menu WHERE id_opcion_menu = $1`,
      [padreId]
    );
    if (padre.length === 0) {
      throw new ErrorDominio("La opción padre no existe");
    }
    if (padre[0].nivel >= 5) {
      throw new ErrorDominio("No se permite superar el límite de niveles de anidación en el menú");
    }
    nivelCalculado = padre[0].nivel + 1;
  }

  await transaccion(async (client) => {
    await client.query(
      `UPDATE opciones_menu
         SET nombre = $1, url_menu = $2, descripcion = $3,
             id_padre = $4, nivel = $5, orden = $6
         WHERE id_opcion_menu = $7`,
      [
        nombre.trim(),
        url_menu.trim(),
        descripcion ? descripcion.trim() : null,
        padreId,
        nivelCalculado,
        orden ? Number(orden) : 1,
        idOpcion,
      ]
    );

    if (Array.isArray(perfiles_ids)) {
      // Desactivar las que ya no aplican
      await client.query(
        `UPDATE opciones_menu_perfiles
           SET estado_registro = false
           WHERE id_opcion_menu = $1
             AND id_perfil <> ALL($2::int[])`,
        [idOpcion, perfiles_ids]
      );

      // Activar o insertar las nuevas
      for (const idPerfil of perfiles_ids) {
        await client.query(
          `INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
             VALUES ($1, $2, 1, true)
             ON CONFLICT (id_opcion_menu, id_perfil)
             DO UPDATE SET estado_registro = true`,
          [idOpcion, idPerfil]
        );
      }
    }
  });

  return { ok: true };
}

export async function alternarEstadoOpcionMenuAdmin(idOpcion: number) {
  const actuales = await query<{ estado_registro: boolean }>(
    `SELECT estado_registro FROM opciones_menu WHERE id_opcion_menu = $1`,
    [idOpcion]
  );
  if (actuales.length === 0) {
    throw new ErrorDominio("Opción de menú no encontrada", 404);
  }

  const nuevoEstado = !actuales[0].estado_registro;

  await query(
    `UPDATE opciones_menu
     SET estado_registro = $1
     WHERE id_opcion_menu = $2`,
    [nuevoEstado, idOpcion]
  );

  return { ok: true, estado_registro: nuevoEstado };
}
