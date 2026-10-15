import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      nombre,
      objetivo = "diagnostico",
      prioridades = ["P1", "P2", "P3", "P4"],
      tipo_umbral = "porcentaje",
      umbral_valor = 75,
      acciones = [],
      repetir_cada_horas = null,
      max_repeticiones = 1,
      activa = true,
    } = body;

    if (!nombre) return NextResponse.json({ error: "Nombre obligatorio" }, { status: 400 });

    const nueva = await queryRow<any>(
      `INSERT INTO problema_regla_escalamiento (
        nombre, objetivo, prioridades, tipo_umbral, umbral_valor,
        acciones, repetir_cada_horas, max_repeticiones, activa, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        nombre.trim(),
        objetivo,
        JSON.stringify(prioridades),
        tipo_umbral,
        umbral_valor,
        JSON.stringify(acciones),
        repetir_cada_horas || null,
        max_repeticiones || 1,
        activa,
      ]
    );

    return NextResponse.json({ ok: true, regla: nueva });
  } catch (error: any) {
    console.error("Error al crear regla de escalamiento:", error);
    return NextResponse.json({ error: error.message || "Error al crear" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id_escalamiento,
      nombre,
      objetivo,
      prioridades,
      tipo_umbral,
      umbral_valor,
      acciones,
      repetir_cada_horas,
      max_repeticiones,
      activa,
    } = body;

    if (!id_escalamiento) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const actualizada = await queryRow<any>(
      `UPDATE problema_regla_escalamiento
       SET nombre = COALESCE($1, nombre),
           objetivo = COALESCE($2, objetivo),
           prioridades = COALESCE($3, prioridades),
           tipo_umbral = COALESCE($4, tipo_umbral),
           umbral_valor = COALESCE($5, umbral_valor),
           acciones = COALESCE($6, acciones),
           repetir_cada_horas = $7,
           max_repeticiones = COALESCE($8, max_repeticiones),
           activa = COALESCE($9, activa)
       WHERE id_escalamiento = $10
       RETURNING *`,
      [
        nombre ? nombre.trim() : null,
        objetivo || null,
        prioridades ? JSON.stringify(prioridades) : null,
        tipo_umbral || null,
        umbral_valor !== undefined ? umbral_valor : null,
        acciones ? JSON.stringify(acciones) : null,
        repetir_cada_horas !== undefined ? repetir_cada_horas : null,
        max_repeticiones !== undefined ? max_repeticiones : null,
        activa !== undefined ? activa : null,
        id_escalamiento,
      ]
    );

    return NextResponse.json({ ok: true, regla: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar regla de escalamiento:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await query("DELETE FROM problema_regla_escalamiento WHERE id_escalamiento = $1", [id]);
    return NextResponse.json({ ok: true, mensaje: "Regla eliminada exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar regla de escalamiento:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar" }, { status: 500 });
  }
}
