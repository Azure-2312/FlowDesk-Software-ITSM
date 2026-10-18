import { query, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { OpcionMenuAdmin } from "@/types";

export async function listarOpcionesMenuAdmin() {
  const opciones = await query<Omit<OpcionMenuAdmin, "perfiles_ids">>(
    `SELECT om.id_opcion_menu, om.nombre, om.url_menu, om.descripcion,
            om.id_padre, om.nivel, om.orden, om.estado_registro,
            padre.nombre as nombre_padre
     FROM opciones_menu om
     LEFT JOIN opciones_menu padre ON padre.id_opcion_menu = om.id_padre
     ORDER BY om.nivel ASC, om.orden ASC, om.id_opcion_menu ASC`
  );

  const permisos = await query<{ id_opcion_menu: number; id_perfil: number }>(
    `SELECT id_opcion_menu, id_perfil
     FROM opciones_menu_perfiles
     WHERE estado_registro = true`
  );

  const resultado: OpcionMenuAdmin[] = opciones.map((op) => ({
    ...op,
    perfiles_ids: permisos
      .filter((p) => p.id_opcion_menu === op.id_opcion_menu)
      .map((p) => p.id_perfil),
  }));

  return { opciones: resultado };
}

export async function crearOpcionMenuAdmin(body: any) {
  const { nombre, url_menu, descripcion, id_padre, orden, perfiles_ids } = body;

  if (!nombre || !nombre.trim() || !url_menu || !url_menu.trim()) {
    throw new ErrorDominio("El nombre y la URL son obligatorios");
  }

  let nivelCalculado = 1;
  const padreId = id_padre ? Number(id_padre) : null;

  if (padreId) {
    const padre = await query<{ nivel: number }>(
      `SELECT nivel FROM opciones_menu WHERE id_opcion_menu = $1`,
      [padreId]
    );
    if (padre.length === 0) {
      throw new ErrorDominio("La opción padre seleccionada no existe");
    }
    if (padre[0].nivel >= 5) {
      throw new ErrorDominio("No se puede superar el límite de niveles permitido en el sistema.");
    }
    nivelCalculado = padre[0].nivel + 1;
  }

  const nuevoId = await transaccion(async (client) => {
    const insertado = await client.query<{ id_opcion_menu: number }>(
      `INSERT INTO opciones_menu
         (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id_opcion_menu`,
      [
        nombre.trim(),
        url_menu.trim(),
        descripcion ? descripcion.trim() : null,
        padreId,
        nivelCalculado,
        orden ? Number(orden) : 1,
      ]
    );

    const idOpcion = insertado.rows[0].id_opcion_menu;

    if (Array.isArray(perfiles_ids) && perfiles_ids.length > 0) {
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

    return idOpcion;
  });

  return { httpStatus: 201, payload: { ok: true, id_opcion_menu: nuevoId } };
}
