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
    const tipos = await query(`
      SELECT 
        id_tipo_ci,
        codigo,
        nombre,
        descripcion,
        categoria,
        icono,
        atributos_requeridos,
        reglas_impacto,
        estado_registro,
        fecha_creacion
      FROM tipo_ci
      ORDER BY id_tipo_ci ASC
    `);

    return NextResponse.json({ tipos });
  } catch (error) {
    console.error("Error al obtener tipos de CI:", error);
    return NextResponse.json({ error: "Error al consultar tipos de CI" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden modelar tipos de CI." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto } = body;

    if (!codigo || !nombre || !categoria) {
      return NextResponse.json({ error: "Código, nombre y categoría son requeridos." }, { status: 400 });
    }

    const row = await queryRow(`
      INSERT INTO tipo_ci (codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      codigo.trim().toUpperCase(),
      nombre.trim(),
      descripcion?.trim() || null,
      categoria.trim().toUpperCase(),
      icono || 'server',
      JSON.stringify(atributos_requeridos || []),
      JSON.stringify(reglas_impacto || [])
    ]);

    // Registrar en auditoría
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await query(`
      INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
      VALUES ($1, 'CMDB', 'CREAR_TIPO_CI', $2, $3, $4)
    `, [
      sesion.id_usuario,
      `El usuario ${sesion.nombres} modeló la nueva clase de CI "${nombre}"`,
      JSON.stringify(row),
      ip
    ]);

    return NextResponse.json({ mensaje: "Tipo de CI modelado exitosamente.", tipo: row }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear tipo de CI:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ya existe un tipo de CI con ese código." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno al guardar tipo de CI." }, { status: 500 });
  }
}
