import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { Perfil, PerfilConOpciones } from "@/types";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar perfiles y permisos." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const incluirTodos = searchParams.get("todos") === "true";

  if (!incluirTodos) {
    const perfiles = await query<Perfil>(
      `SELECT id_perfil, nombre, descripcion, estado_registro
       FROM perfiles
       WHERE estado_registro = true
       ORDER BY nombre`
    );
    return NextResponse.json({ perfiles });
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

  return NextResponse.json({ perfiles: resultado });
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede crear perfiles." }, { status: 403 });
  }

  const body = await req.json();
  const { nombre, descripcion, opciones_ids } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre del perfil es obligatorio" }, { status: 400 });
  }

  try {
    const nuevoId = await transaccion(async (client) => {
      const repetido = await client.query(
        `SELECT id_perfil FROM perfiles WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))`,
        [nombre]
      );
      if (repetido.rows.length > 0) {
        throw new Error("Ya existe un perfil con ese nombre");
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

    return NextResponse.json({ ok: true, id_perfil: nuevoId }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Ya existe un perfil con ese nombre") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear el perfil" }, { status: 500 });
  }
}
