import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

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
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar el menú." }, { status: 403 });
  }

  const idOpcion = Number(params.id);
  const body = await req.json();
  const { nombre, url_menu, descripcion, id_padre, orden, perfiles_ids } = body;

  if (!nombre || !nombre.trim() || !url_menu || !url_menu.trim()) {
    return NextResponse.json({ error: "El nombre y la URL son obligatorios" }, { status: 400 });
  }

  const padreId = id_padre ? Number(id_padre) : null;

  if (padreId === idOpcion) {
    return NextResponse.json({ error: "Una opción no puede ser su propio padre" }, { status: 400 });
  }

  let nivelCalculado = 1;
  if (padreId) {
    const padre = await query<{ nivel: number }>(
      `SELECT nivel FROM opciones_menu WHERE id_opcion_menu = $1`,
      [padreId]
    );
    if (padre.length === 0) {
      return NextResponse.json({ error: "La opción padre no existe" }, { status: 400 });
    }
    if (padre[0].nivel >= 5) {
      return NextResponse.json(
        { error: "No se permite superar el límite de niveles de anidación en el menú" },
        { status: 400 }
      );
    }
    nivelCalculado = padre[0].nivel + 1;
  }

  try {
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar la opción de menú" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MENU)) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar opciones del menú." }, { status: 403 });
  }

  const idOpcion = Number(params.id);

  const actuales = await query<{ estado_registro: boolean }>(
    `SELECT estado_registro FROM opciones_menu WHERE id_opcion_menu = $1`,
    [idOpcion]
  );
  if (actuales.length === 0) {
    return NextResponse.json({ error: "Opción de menú no encontrada" }, { status: 404 });
  }

  const nuevoEstado = !actuales[0].estado_registro;

  await query(
    `UPDATE opciones_menu
     SET estado_registro = $1
     WHERE id_opcion_menu = $2`,
    [nuevoEstado, idOpcion]
  );

  return NextResponse.json({ ok: true, estado_registro: nuevoEstado });
}
