import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 6, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para consultar licencias de software" }, { status: 403 });
  }

  const sql = `
    SELECT 
      id_licencia,
      nombre_software,
      fabricante,
      tipo_licencia,
      cantidad_adquirida,
      cantidad_en_uso,
      (cantidad_adquirida - cantidad_en_uso) AS licencias_disponibles,
      ROUND((cantidad_en_uso::numeric / NULLIF(cantidad_adquirida, 0)) * 100, 1) AS porcentaje_uso,
      fecha_vencimiento,
      CASE 
        WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE THEN 'VENCIDA'
        WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 'POR_VENCER'
        ELSE 'VIGENTE'
      END AS estado_cumplimiento,
      costo_anual,
      fecha_creacion,
      estado_registro
    FROM licencia_software
    WHERE estado_registro = true
    ORDER BY id_licencia ASC
  `;

  try {
    const rows = await query(sql);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener licencias:", error);
    return NextResponse.json({ error: "Error al consultar licencias de software" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para registrar licencias" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      nombre_software,
      fabricante,
      clave_licencia,
      tipo_licencia,
      cantidad_adquirida,
      cantidad_en_uso,
      fecha_vencimiento,
      costo_anual
    } = body;

    if (!nombre_software || !fabricante || !tipo_licencia || !cantidad_adquirida) {
      return NextResponse.json({ error: "Nombre, fabricante, tipo y cantidad adquirida son requeridos." }, { status: 400 });
    }

    const insertSql = `
      INSERT INTO licencia_software (
        nombre_software,
        fabricante,
        clave_licencia,
        tipo_licencia,
        cantidad_adquirida,
        cantidad_en_uso,
        fecha_vencimiento,
        costo_anual,
        usuario_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id_licencia, nombre_software
    `;

    const row = await queryRow(insertSql, [
      nombre_software.trim(),
      fabricante.trim(),
      clave_licencia?.trim() || null,
      tipo_licencia.toUpperCase(),
      Number(cantidad_adquirida),
      Number(cantidad_en_uso) || 0,
      fecha_vencimiento || null,
      costo_anual ? Number(costo_anual) : null,
      sesion.id_usuario
    ]);

    return NextResponse.json({
      mensaje: "Licencia de software registrada exitosamente.",
      licencia: row
    }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar licencia:", error);
    return NextResponse.json({ error: "Error interno al registrar licencia" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 9) {
    return NextResponse.json({ error: "No autorizado para modificar licencias" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_licencia } = body;

    if (!id_licencia) {
      return NextResponse.json({ error: "ID de licencia requerido" }, { status: 400 });
    }

    const actual = await queryRow<any>("SELECT * FROM licencia_software WHERE id_licencia = $1", [id_licencia]);
    if (!actual) {
      return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
    }

    const nombre_software = body.nombre_software !== undefined ? body.nombre_software.trim() : actual.nombre_software;
    const fabricante = body.fabricante !== undefined ? body.fabricante.trim() : actual.fabricante;
    const clave_licencia = body.clave_licencia !== undefined ? (body.clave_licencia.trim() || null) : actual.clave_licencia;
    const tipo_licencia = body.tipo_licencia !== undefined ? body.tipo_licencia.toUpperCase() : actual.tipo_licencia;
    const cantidad_adquirida = body.cantidad_adquirida !== undefined ? Number(body.cantidad_adquirida) : actual.cantidad_adquirida;
    const cantidad_en_uso = body.cantidad_en_uso !== undefined ? Number(body.cantidad_en_uso) : actual.cantidad_en_uso;
    const fecha_vencimiento = body.fecha_vencimiento !== undefined ? (body.fecha_vencimiento || null) : actual.fecha_vencimiento;
    const costo_anual = body.costo_anual !== undefined ? (body.costo_anual ? Number(body.costo_anual) : null) : actual.costo_anual;
    const estado_registro = body.estado_registro !== undefined ? Boolean(body.estado_registro) : actual.estado_registro;

    const row = await queryRow(
      `UPDATE licencia_software SET
        nombre_software = $1,
        fabricante = $2,
        clave_licencia = $3,
        tipo_licencia = $4,
        cantidad_adquirida = $5,
        cantidad_en_uso = $6,
        fecha_vencimiento = $7,
        costo_anual = $8,
        estado_registro = $9
      WHERE id_licencia = $10
      RETURNING *`,
      [
        nombre_software,
        fabricante,
        clave_licencia,
        tipo_licencia,
        cantidad_adquirida,
        cantidad_en_uso,
        fecha_vencimiento,
        costo_anual,
        estado_registro,
        id_licencia
      ]
    );

    return NextResponse.json({
      mensaje: "Licencia actualizada exitosamente.",
      licencia: row
    });
  } catch (error) {
    console.error("Error al actualizar licencia:", error);
    return NextResponse.json({ error: "Error interno al actualizar licencia" }, { status: 500 });
  }
}
