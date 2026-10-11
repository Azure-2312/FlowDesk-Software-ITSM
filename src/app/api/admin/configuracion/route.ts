import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clave = searchParams.get("clave");
  const categoria = searchParams.get("categoria");

  try {
    if (clave) {
      const row = await queryRow(`
        SELECT clave, categoria, descripcion, valor, fecha_modificacion
        FROM configuracion_sistema
        WHERE clave = $1
      `, [clave]);

      if (!row) {
        return NextResponse.json({ error: "Configuracion no encontrada" }, { status: 404 });
      }
      return NextResponse.json({ configuracion: row });
    }

    let sql = `SELECT clave, categoria, descripcion, valor, fecha_modificacion FROM configuracion_sistema`;
    const params: any[] = [];
    if (categoria) {
      sql += ` WHERE categoria = $1`;
      params.push(categoria);
    }
    sql += ` ORDER BY categoria, clave`;

    const configs = await query(sql, params);
    return NextResponse.json({ configuraciones: configs });
  } catch (error) {
    console.error("Error al obtener configuraciones:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo Administrador del Sistema (id_perfil 1)
  if (sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden cambiar configuraciones del sistema." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { clave, valor, descripcion } = body;

    if (!clave || valor === undefined) {
      return NextResponse.json({ error: "Clave y valor son requeridos" }, { status: 400 });
    }

    // Obtener valor anterior para auditoria
    const actual = await queryRow<{ valor: any; categoria: string }>(`
      SELECT valor, categoria FROM configuracion_sistema WHERE clave = $1
    `, [clave]);

    const row = await queryRow(`
      INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
      VALUES ($1, COALESCE($2, 'GENERAL'), $3, $4, $5, NOW())
      ON CONFLICT (clave) DO UPDATE SET
        valor = EXCLUDED.valor,
        descripcion = COALESCE(EXCLUDED.descripcion, configuracion_sistema.descripcion),
        usuario_modificacion = EXCLUDED.usuario_modificacion,
        fecha_modificacion = NOW()
      RETURNING clave, categoria, descripcion, valor, fecha_modificacion
    `, [
      clave,
      actual?.categoria || 'GENERAL',
      descripcion || null,
      JSON.stringify(valor),
      sesion.id_usuario
    ]);

    // Registrar en Audit Trail
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await query(`
      INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      sesion.id_usuario,
      actual?.categoria || 'CONFIGURACION',
      'MODIFICAR_CONFIGURACION',
      `El usuario ${sesion.nombres} actualizó la configuración de "${clave}"`,
      JSON.stringify({ anterior: actual?.valor || null, nuevo: valor }),
      ip
    ]);

    return NextResponse.json({
      mensaje: "Configuración actualizada y registrada en auditoría exitosamente.",
      configuracion: row
    });
  } catch (error) {
    console.error("Error al guardar configuracion:", error);
    return NextResponse.json({ error: "Error interno al guardar configuracion" }, { status: 500 });
  }
}
