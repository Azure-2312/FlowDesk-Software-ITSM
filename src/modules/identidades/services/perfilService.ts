import { query, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { Perfil, PerfilConOpciones } from "@/types";

export async function listarPerfiles(incluirTodos: boolean) {
  if (!incluirTodos) {
    const perfiles = await query<Perfil>(
      `SELECT id_perfil, nombre, descripcion, estado_registro
       FROM perfiles
       WHERE estado_registro = true
       ORDER BY nombre`
    );
    return { perfiles };
  }

  // Si pide "todos", traemos tanto activos como inactivos, con sus opciones de menú y conteo de usuarios
  const perfiles = await query<Perfil & { cantidad_usuarios: string }>(
    `SELECT p.id_perfil, p.nombre, p.descripcion, p.estado_registro,
            COUNT(DISTINCT up.id_usuario) FILTER (WHERE up.estado_registro = true) as cantidad_usuarios
     FROM perfiles p
     LEFT JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     GROUP BY p.id_perfil, p.nombre, p.descripcion, p.estado_registro
     ORDER BY p.id_perfil ASC`
  );

  const permisos = await query<{ id_perfil: number; id_opcion_menu: number }>(
    `SELECT id_perfil, id_opcion_menu
     FROM opciones_menu_perfiles
     WHERE estado_registro = true`
  );

  const resultado: PerfilConOpciones[] = perfiles.map((p) => ({
    id_perfil: p.id_perfil,
    nombre: p.nombre,
    descripcion: p.descripcion,
    estado_registro: p.estado_registro,
    cantidad_usuarios: Number(p.cantidad_usuarios || 0),
    opciones_ids: permisos
      .filter((perm) => perm.id_perfil === p.id_perfil)
      .map((perm) => perm.id_opcion_menu),
  }));

  return { perfiles: resultado };
}

export async function crearPerfil(body: any) {
  const { nombre, descripcion, opciones_ids } = body;

  if (!nombre || !nombre.trim()) {
    throw new ErrorDominio("El nombre del perfil es obligatorio");
  }

  const nuevoId = await transaccion(async (client) => {
    const repetido = await client.query(
      `SELECT id_perfil FROM perfiles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))`,
      [nombre]
    );
    if (repetido.rows.length > 0) {
      throw new ErrorDominio("Ya existe un perfil con ese nombre", 409);
    }

    const insertado = await client.query<{ id_perfil: number }>(
      `INSERT INTO perfiles (nombre, descripcion, estado_registro)
         VALUES ($1, $2, true)
         RETURNING id_perfil`,
      [nombre.trim(), descripcion ? descripcion.trim() : null]
    );

    const idPerfil = insertado.rows[0].id_perfil;

    if (Array.isArray(opciones_ids) && opciones_ids.length > 0) {
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

      for (const idOpcion of idsCompletos) {
        await client.query(
          `INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
             VALUES ($1, $2, 1, true)
             ON CONFLICT (id_opcion_menu, id_perfil)
             DO UPDATE SET estado_registro = true`,
          [idOpcion, idPerfil]
        );
      }
    }

    return idPerfil;
  });

  return { httpStatus: 201, payload: { ok: true, id_perfil: nuevoId } };
}
