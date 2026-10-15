import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const categorias = await query(`
      SELECT 
        c.id_categoria,
        c.nombre,
        c.descripcion,
        c.codigo_corto,
        c.estado_registro,
        COUNT(a.id_articulo) as total_articulos
      FROM categoria_ticket c
      LEFT JOIN articulo_conocimiento a ON a.id_categoria = c.id_categoria AND a.estado_registro = true
      GROUP BY c.id_categoria, c.nombre, c.descripcion, c.codigo_corto, c.estado_registro
      ORDER BY c.nombre ASC
    `);

    return NextResponse.json({ categorias });
  } catch (error) {
    console.error("Error al obtener categorías de conocimiento:", error);
    return NextResponse.json({ error: "Error al consultar categorías" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_CONFIGURAR)) {
    return NextResponse.json({ error: "Solo Administración puede crear categorías de conocimiento." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nombre, descripcion, codigo_corto } = body;

    if (!nombre || !nombre.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es obligatorio." }, { status: 400 });
    }

    const codigo = codigo_corto?.trim().toUpperCase() || nombre.trim().slice(0, 4).toUpperCase();

    const nueva = await queryRow(
      `INSERT INTO categoria_ticket (
        id_tipo_ticket, nombre, descripcion, codigo_corto, estado_registro, sla_default_respuesta, sla_default_resolucion
      ) VALUES (1, $1, $2, $3, true, 4, 24)
      RETURNING *`,
      [nombre.trim(), descripcion?.trim() || null, codigo]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "CONOCIMIENTO",
        "CREAR_CATEGORIA_CONOCIMIENTO",
        `El usuario ${sesion.nombres} creó la categoría de ayuda [${codigo}] ${nombre.trim()} para la Base de Conocimiento KCS.`,
        JSON.stringify({ id_categoria: nueva?.id_categoria, nombre: nombre.trim(), codigo_corto: codigo }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ categoria: nueva }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear categoría de conocimiento:", error);
    return NextResponse.json({ error: "Error al registrar categoría de conocimiento" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_CONFIGURAR)) {
    return NextResponse.json({ error: "Solo Administración puede actualizar categorías." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_categoria, nombre, descripcion, estado_registro } = body;

    if (!id_categoria) {
      return NextResponse.json({ error: "ID de categoría requerido." }, { status: 400 });
    }

    const actualizada = await queryRow(
      `UPDATE categoria_ticket SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        estado_registro = COALESCE($3, estado_registro)
      WHERE id_categoria = $4
      RETURNING *`,
      [
        nombre?.trim() || null,
        descripcion?.trim() || null,
        estado_registro !== undefined ? Boolean(estado_registro) : null,
        Number(id_categoria)
      ]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "CONOCIMIENTO",
        "ACTUALIZAR_CATEGORIA_CONOCIMIENTO",
        `El usuario ${sesion.nombres} actualizó la categoría de conocimiento #${id_categoria} (${actualizada?.nombre}).`,
        JSON.stringify({ id_categoria, nombre, estado_registro }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ categoria: actualizada });
  } catch (error) {
    console.error("Error al actualizar categoría de conocimiento:", error);
    return NextResponse.json({ error: "Error al actualizar categoría" }, { status: 500 });
  }
}
