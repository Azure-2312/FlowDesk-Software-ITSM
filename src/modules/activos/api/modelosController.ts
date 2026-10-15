import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 2, 4, 6, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para consultar modelos de activos" }, { status: 403 });
  }

  try {
    const modelos = await query(
      `SELECT 
        m.id_modelo,
        m.id_tipo_activo,
        t.codigo AS tipo_codigo,
        t.nombre AS tipo_nombre,
        t.clase AS tipo_clase,
        m.fabricante,
        m.nombre_modelo,
        m.atributos,
        m.vida_util_meses,
        m.metodo_depreciacion,
        m.valor_residual_pct,
        m.estado_registro,
        m.fecha_modificacion
       FROM modelo_activo m
       JOIN tipo_activo_catalogo t ON m.id_tipo_activo = t.id_tipo_activo
       WHERE m.estado_registro = true
       ORDER BY t.nombre ASC, m.fabricante ASC, m.nombre_modelo ASC`
    );

    return NextResponse.json({ modelos });
  } catch (error) {
    console.error("Error al obtener modelos de activos:", error);
    return NextResponse.json({ error: "Error al consultar catálogo de modelos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Solo Administración y Gestión de Activos pueden registrar modelos." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id_tipo_activo,
      fabricante,
      nombre_modelo,
      atributos,
      vida_util_meses,
      metodo_depreciacion,
      valor_residual_pct
    } = body;

    if (!id_tipo_activo || !fabricante?.trim() || !nombre_modelo?.trim()) {
      return NextResponse.json({ error: "Tipo de activo, fabricante y nombre de modelo son requeridos." }, { status: 400 });
    }

    const row = await queryRow(
      `INSERT INTO modelo_activo (
        id_tipo_activo,
        fabricante,
        nombre_modelo,
        atributos,
        vida_util_meses,
        metodo_depreciacion,
        valor_residual_pct,
        usuario_modificacion,
        fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
      RETURNING *`,
      [
        Number(id_tipo_activo),
        fabricante.trim(),
        nombre_modelo.trim(),
        JSON.stringify(atributos || []),
        vida_util_meses ? Number(vida_util_meses) : 36,
        metodo_depreciacion === "NINGUNA" ? "NINGUNA" : "LINEAL",
        valor_residual_pct ? Number(valor_residual_pct) : 0,
        sesion.id_usuario
      ]
    );

    return NextResponse.json({ mensaje: "Modelo registrado exitosamente.", modelo: row }, { status: 201 });
  } catch (error: any) {
    console.error("Error al registrar modelo:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe un modelo registrado con ese fabricante y nombre." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar modelo de activo" }, { status: 500 });
  }
}
