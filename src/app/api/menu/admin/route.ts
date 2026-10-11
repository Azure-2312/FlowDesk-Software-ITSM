import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { OpcionMenuAdmin } from "@/types";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar la configuración del menú." }, { status: 403 });
  }
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

  return NextResponse.json({ opciones: resultado });
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar el menú." }, { status: 403 });
  }

  const body = await req.json();
  const { nombre, url_menu, descripcion, id_padre, orden, perfiles_ids } = body;

  if (!nombre || !nombre.trim() || !url_menu || !url_menu.trim()) {
    return NextResponse.json({ error: "El nombre y la URL son obligatorios" }, { status: 400 });
  }

  let nivelCalculado = 1;
  const padreId = id_padre ? Number(id_padre) : null;

  if (padreId) {
    const padre = await query<{ nivel: number }>(
      `SELECT nivel FROM opciones_menu WHERE id_opcion_menu = $1`,
      [padreId]
    );
    if (padre.length === 0) {
      return NextResponse.json({ error: "La opción padre seleccionada no existe" }, { status: 400 });
    }
    if (padre[0].nivel >= 5) {
      return NextResponse.json(
        { error: "No se puede superar el límite de niveles permitido en el sistema." },
        { status: 400 }
      );
    }
    nivelCalculado = padre[0].nivel + 1;
  }

  try {
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

    return NextResponse.json({ ok: true, id_opcion_menu: nuevoId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear la opción de menú" }, { status: 500 });
  }
}
