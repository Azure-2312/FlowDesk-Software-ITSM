import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

interface Contexto {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar perfiles." }, { status: 403 });
  }

  const idPerfil = Number(params.id);
  const body = await req.json();
  const { nombre, descripcion, opciones_ids } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre del perfil es obligatorio" }, { status: 400 });
  }

  try {
    await transaccion(async (client) => {
      const repetido = await client.query(
        `SELECT id_perfil FROM perfiles
         WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1)) AND id_perfil <> $2`,
        [nombre, idPerfil]
      );
      if (repetido.rows.length > 0) {
        throw new Error("Ya existe otro perfil con ese nombre");
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

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "Ya existe otro perfil con ese nombre") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar perfiles." }, { status: 403 });
  }

  const idPerfil = Number(params.id);

  if (idPerfil === 1) {
    return NextResponse.json(
      { error: "No se puede desactivar el perfil principal de Administrador" },
      { status: 400 }
    );
  }

  const actuales = await query<{ estado_registro: boolean }>(
    `SELECT estado_registro FROM perfiles WHERE id_perfil = $1`,
    [idPerfil]
  );
  if (actuales.length === 0) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const nuevoEstado = !actuales[0].estado_registro;

  await query(
    `UPDATE perfiles
     SET estado_registro = $1
     WHERE id_perfil = $2`,
    [nuevoEstado, idPerfil]
  );

  return NextResponse.json({ ok: true, estado_registro: nuevoEstado });
}
