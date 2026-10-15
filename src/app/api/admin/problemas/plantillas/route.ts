import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const plantilla = await queryRow<any>(
        `SELECT p.*, c.nombre as categoria_nombre
         FROM plantilla_problema p
         LEFT JOIN problema_categoria c ON c.id_categoria = p.id_categoria
         WHERE p.id_plantilla = $1`,
        [id]
      );
      if (!plantilla) {
        return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, plantilla });
    }

    const plantillas = await query<any>(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM plantilla_problema p
       LEFT JOIN problema_categoria c ON c.id_categoria = p.id_categoria
       ORDER BY p.nombre ASC`
    );

    return NextResponse.json({ ok: true, plantillas });
  } catch (error: any) {
    console.error("Error al obtener plantillas de problema:", error);
    return NextResponse.json({ error: "Error en el servidor al cargar plantillas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      nombre,
      descripcion,
      activa = true,
      id_categoria,
      perfiles_visibles = [],
      valores_prellenados = {},
      campos_bloqueados = {},
      tareas_incluidas = [],
    } = body;

    if (!nombre || nombre.trim().length < 5 || nombre.trim().length > 100) {
      return NextResponse.json(
        { error: "El nombre de la plantilla es obligatorio (entre 5 y 100 caracteres)" },
        { status: 400 }
      );
    }

    // Comprobar unicidad de nombre
    const existente = await queryRow<{ id_plantilla: number }>(
      "SELECT id_plantilla FROM plantilla_problema WHERE LOWER(nombre) = LOWER($1)",
      [nombre.trim()]
    );
    if (existente) {
      return NextResponse.json({ error: "Ya existe una plantilla con este nombre" }, { status: 400 });
    }

    const res = await queryRow<any>(
      `INSERT INTO plantilla_problema (
        nombre, descripcion, activa, id_categoria, perfiles_visibles,
        valores_prellenados, campos_bloqueados, tareas_incluidas,
        usuario_creacion, fecha_creacion, fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        nombre.trim(),
        descripcion || null,
        activa,
        id_categoria || null,
        JSON.stringify(perfiles_visibles),
        JSON.stringify(valores_prellenados),
        JSON.stringify(campos_bloqueados),
        JSON.stringify(tareas_incluidas),
        sesion.id_usuario,
      ]
    );

    return NextResponse.json({ ok: true, plantilla: res });
  } catch (error: any) {
    console.error("Error al crear plantilla de problema:", error);
    return NextResponse.json({ error: "Error al registrar la plantilla" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id_plantilla,
      nombre,
      descripcion,
      activa,
      id_categoria,
      perfiles_visibles,
      valores_prellenados,
      campos_bloqueados,
      tareas_incluidas,
    } = body;

    if (!id_plantilla) {
      return NextResponse.json({ error: "ID de plantilla requerido" }, { status: 400 });
    }

    if (nombre && (nombre.trim().length < 5 || nombre.trim().length > 100)) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 5 y 100 caracteres" },
        { status: 400 }
      );
    }

    if (nombre) {
      const repetido = await queryRow<{ id_plantilla: number }>(
        "SELECT id_plantilla FROM plantilla_problema WHERE LOWER(nombre) = LOWER($1) AND id_plantilla != $2",
        [nombre.trim(), id_plantilla]
      );
      if (repetido) {
        return NextResponse.json({ error: "Ya existe otra plantilla con este nombre" }, { status: 400 });
      }
    }

    const res = await queryRow<any>(
      `UPDATE plantilla_problema
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           activa = COALESCE($3, activa),
           id_categoria = $4,
           perfiles_visibles = COALESCE($5, perfiles_visibles),
           valores_prellenados = COALESCE($6, valores_prellenados),
           campos_bloqueados = COALESCE($7, campos_bloqueados),
           tareas_incluidas = COALESCE($8, tareas_incluidas),
           fecha_modificacion = NOW()
       WHERE id_plantilla = $9
       RETURNING *`,
      [
        nombre ? nombre.trim() : null,
        descripcion !== undefined ? descripcion : null,
        activa !== undefined ? activa : null,
        id_categoria !== undefined ? id_categoria : null,
        perfiles_visibles ? JSON.stringify(perfiles_visibles) : null,
        valores_prellenados ? JSON.stringify(valores_prellenados) : null,
        campos_bloqueados ? JSON.stringify(campos_bloqueados) : null,
        tareas_incluidas ? JSON.stringify(tareas_incluidas) : null,
        id_plantilla,
      ]
    );

    return NextResponse.json({ ok: true, plantilla: res });
  } catch (error: any) {
    console.error("Error al actualizar plantilla:", error);
    return NextResponse.json({ error: "Error al actualizar plantilla" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const plantilla = await queryRow<{ veces_usada: number }>(
      "SELECT veces_usada FROM plantilla_problema WHERE id_plantilla = $1",
      [id]
    );

    if (!plantilla) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    if (plantilla.veces_usada > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar la plantilla porque ha sido usada en ${plantilla.veces_usada} problemas. Solo puede desactivarse.`,
        },
        { status: 400 }
      );
    }

    await query("DELETE FROM plantilla_problema WHERE id_plantilla = $1", [id]);

    return NextResponse.json({ ok: true, mensaje: "Plantilla eliminada exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar plantilla:", error);
    return NextResponse.json({ error: "Error al eliminar plantilla" }, { status: 500 });
  }
}
