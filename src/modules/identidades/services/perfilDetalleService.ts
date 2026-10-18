import { query, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function actualizarPerfil(idPerfil: number, body: any) {
  const { nombre, descripcion, opciones_ids } = body;

  if (!nombre || !nombre.trim()) {
    throw new ErrorDominio("El nombre del perfil es obligatorio");
  }

  await transaccion(async (client) => {
    const repetido = await client.query(
      `SELECT id_perfil FROM perfiles
         WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) AND id_perfil <> $2`,
      [nombre, idPerfil]
    );
    if (repetido.rows.length > 0) {
      throw new ErrorDominio("Ya existe otro perfil con ese nombre", 409);
    }

    await client.query(
      `UPDATE perfiles
         SET nombre = $1, descripcion = $2
         WHERE id_perfil = $3`,
      [nombre.trim(), descripcion ? descripcion.trim() : null, idPerfil]
    );

    // Sincronizar opciones de menú
    if (Array.isArray(opciones_ids)) {
      // Asegurar que si hay hijos seleccionados, se incluyan sus ancestros automáticamente
      const todasOpciones = await client.query<{ id_opcion_menu: number; id_padre: number | null }>(
        `SELECT id_opcion_menu, id_padre FROM opciones_menu WHERE estado_registro = true`
      );
      const mapaPadres = new Map(todasOpciones.rows.map((o) => [o.id_opcion_menu, o.id_padre]));
      const idsCompletos = new Set<number>(opciones_ids);
      for (const id of opciones_ids) {
        let p = mapaPadres.get(id);
        while (p) {
          idsCompletos.add(p);
          p = mapaPadres.get(p);
        }
      }
      const listaFinal = Array.from(idsCompletos);

      // 1) Desactivar opciones que ya no están asignadas
      await client.query(
        `UPDATE opciones_menu_perfiles
           SET estado_registro = false
           WHERE id_perfil = $1
             AND id_opcion_menu <> ALL($2::int[])`,
        [idPerfil, listaFinal]
      );

      // 2) Activar / insertar las nuevas
      for (const idOpcion of listaFinal) {
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

export async function alternarEstadoPerfil(idPerfil: number) {
  if (idPerfil === 1) {
    throw new ErrorDominio("No se puede desactivar el perfil principal de Administrador");
  }

  const actuales = await query<{ estado_registro: boolean }>(
    `SELECT estado_registro FROM perfiles WHERE id_perfil = $1`,
    [idPerfil]
  );
  if (actuales.length === 0) {
    throw new ErrorDominio("Perfil no encontrado", 404);
  }

  const nuevoEstado = !actuales[0].estado_registro;

  await query(
    `UPDATE perfiles
     SET estado_registro = $1
     WHERE id_perfil = $2`,
    [nuevoEstado, idPerfil]
  );

  return { ok: true, estado_registro: nuevoEstado };
}
