import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion } from "@/lib/auth";
import { COOKIE_SESION } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const catalogo = searchParams.get("catalogo");

  try {
    if (catalogo) {
      const items = await query<any>(`
        SELECT c.*, p.nombre as padre_nombre,
               CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
        FROM cambio_catalogo_item c
        LEFT JOIN cambio_catalogo_item p ON p.id_item = c.id_padre
        LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
        WHERE c.catalogo = $1
        ORDER BY c.orden, c.id_item
      `, [catalogo]);
      return NextResponse.json({ ok: true, catalogo, items });
    }

    // Traer todos los catálogos agrupados
    const items = await query<any>(`
      SELECT c.*, p.nombre as padre_nombre
      FROM cambio_catalogo_item c
      LEFT JOIN cambio_catalogo_item p ON p.id_item = c.id_padre
      ORDER BY c.catalogo, c.orden, c.id_item
    `);

    const agrupados: Record<string, any[]> = {};
    for (const item of items) {
      if (!agrupados[item.catalogo]) agrupados[item.catalogo] = [];
      agrupados[item.catalogo].push(item);
    }

    return NextResponse.json({ ok: true, catalogos: agrupados });
  } catch (error: any) {
    console.error("Error al obtener catálogos de cambios:", error);
    return NextResponse.json({ error: "Error al consultar catálogos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (![1, 8].includes(idPerfil)) {
    return NextResponse.json({ error: "No autorizado para modificar catálogos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { accion } = body;

    // Fusión de elementos de catálogo
    if (accion === "fusionar") {
      const { id_origen, id_destino, catalogo } = body;
      if (!id_origen || !id_destino) {
        return NextResponse.json({ error: "id_origen e id_destino son requeridos para la fusión." }, { status: 400 });
      }

      const origen = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_origen]);
      const destino = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_destino]);

      if (!origen || !destino) {
        return NextResponse.json({ error: "Elementos no encontrados" }, { status: 404 });
      }

      if (origen.es_sistema) {
        return NextResponse.json({ error: "No se puede fusionar un valor protegido del sistema." }, { status: 400 });
      }

      // Reasignar subcategorías hijas si existen
      await query("UPDATE cambio_catalogo_item SET id_padre = $1 WHERE id_padre = $2", [id_destino, id_origen]);

      // Sumar usos
      await query(`
        UPDATE cambio_catalogo_item
        SET usos_count = usos_count + $1
        WHERE id_item = $2
      `, [origen.usos_count, id_destino]);

      // Desactivar el origen
      await query(`
        UPDATE cambio_catalogo_item
        SET activo = false, descripcion = COALESCE(descripcion, '') || ' [Fusionado en ' || $1 || ']'
        WHERE id_item = $2
      `, [destino.nombre, id_origen]);

      return NextResponse.json({
        ok: true,
        mensaje: `Elemento '${origen.nombre}' fusionado exitosamente en '${destino.nombre}'.`
      });
    }

    // Crear nuevo elemento
    const { catalogo, codigo, nombre, descripcion, color = "#475569", orden = 1, id_padre = null, atributos = {} } = body;

    if (!catalogo || !codigo || !nombre) {
      return NextResponse.json({ error: "Catálogo, código y nombre son obligatorios" }, { status: 400 });
    }

    const codigoNormalizado = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const existe = await queryRow<any>(
      "SELECT id_item FROM cambio_catalogo_item WHERE catalogo = $1 AND codigo = $2",
      [catalogo, codigoNormalizado]
    );

    if (existe) {
      return NextResponse.json({ error: `El código '${codigoNormalizado}' ya existe en el catálogo '${catalogo}'.` }, { status: 400 });
    }

    const nuevo = await queryRow<any>(`
      INSERT INTO cambio_catalogo_item (
        catalogo, id_padre, codigo, nombre, descripcion, color, orden, activo, es_sistema, atributos, usuario_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, true, false, $8, $9
      ) RETURNING *
    `, [
      catalogo,
      id_padre || null,
      codigoNormalizado,
      nombre.trim(),
      descripcion || null,
      color,
      orden,
      JSON.stringify(atributos),
      sesion.id_usuario,
    ]);

    return NextResponse.json({ ok: true, mensaje: "Valor agregado exitosamente", item: nuevo });
  } catch (error: any) {
    console.error("Error al registrar valor en catálogo:", error);
    return NextResponse.json({ error: "Error al registrar en catálogo" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (![1, 8].includes(idPerfil)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_item, nombre, descripcion, color, orden, activo, atributos, id_padre } = body;

    if (!id_item) {
      return NextResponse.json({ error: "id_item es obligatorio" }, { status: 400 });
    }

    const actual = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_item]);
    if (!actual) {
      return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
    }

    if (actual.es_sistema && activo === false) {
      return NextResponse.json({ error: "No es posible desactivar un elemento bloqueado del sistema." }, { status: 400 });
    }

    const itemActualizado = await queryRow<any>(`
      UPDATE cambio_catalogo_item SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        color = COALESCE($3, color),
        orden = COALESCE($4, orden),
        activo = COALESCE($5, activo),
        atributos = COALESCE($6, atributos),
        id_padre = CASE WHEN $7::integer IS NOT NULL THEN $7 ELSE id_padre END,
        usuario_modificacion = $8,
        fecha_modificacion = NOW()
      WHERE id_item = $9
      RETURNING *
    `, [
      nombre ? nombre.trim() : null,
      descripcion !== undefined ? descripcion : null,
      color || null,
      orden !== undefined ? orden : null,
      activo !== undefined ? activo : null,
      atributos ? JSON.stringify(atributos) : null,
      id_padre !== undefined ? id_padre : null,
      sesion.id_usuario,
      id_item,
    ]);

    return NextResponse.json({ ok: true, mensaje: "Catálogo actualizado", item: itemActualizado });
  } catch (error: any) {
    console.error("Error al actualizar catálogo:", error);
    return NextResponse.json({ error: "Error al actualizar catálogo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (![1, 8].includes(idPerfil)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id_item = searchParams.get("id_item");

    if (!id_item) {
      return NextResponse.json({ error: "id_item es requerido" }, { status: 400 });
    }

    const item = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_item]);
    if (!item) {
      return NextResponse.json({ error: "Elemento no encontrado" }, { status: 404 });
    }

    if (item.es_sistema) {
      return NextResponse.json({ error: "Los elementos del sistema están bloqueados y no pueden eliminarse." }, { status: 400 });
    }

    if (item.usos_count > 0) {
      await query("UPDATE cambio_catalogo_item SET activo = false WHERE id_item = $1", [id_item]);
      return NextResponse.json({
        ok: true,
        mensaje: "El elemento está en uso en registros históricos; se ha desactivado para proteger la trazabilidad.",
        desactivado: true,
      });
    }

    // Verificar si tiene subcategorías hijas
    const tieneHijos = await queryRow<any>("SELECT id_item FROM cambio_catalogo_item WHERE id_padre = $1 LIMIT 1", [id_item]);
    if (tieneHijos) {
      return NextResponse.json({ error: "No se puede eliminar una categoría que contiene subcategorías. Elimine o reasigne primero las subcategorías." }, { status: 400 });
    }

    await query("DELETE FROM cambio_catalogo_item WHERE id_item = $1", [id_item]);

    return NextResponse.json({ ok: true, mensaje: "Elemento eliminado exitosamente." });
  } catch (error: any) {
    console.error("Error al eliminar elemento de catálogo:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
