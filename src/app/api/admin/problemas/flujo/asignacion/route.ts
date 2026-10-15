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
      orden = 1,
      activa = true,
      evento_evaluacion = "al_registrar",
      condiciones = [],
      id_departamento_destino,
      estrategia = "sin_responsable",
      id_tecnico_fijo,
      considerar_disponibilidad = true,
      notificar_asignacion = true,
    } = body;

    if (!nombre) {
      return NextResponse.json({ error: "El nombre de la regla es obligatorio" }, { status: 400 });
    }

    const nueva = await queryRow<any>(
      `INSERT INTO problema_regla_asignacion (
        nombre, orden, activa, evento_evaluacion, condiciones,
        id_departamento_destino, estrategia, id_tecnico_fijo,
        considerar_disponibilidad, notificar_asignacion, veces_aplicada, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, NOW())
      RETURNING *`,
      [
        nombre.trim(),
        orden,
        activa,
        evento_evaluacion,
        JSON.stringify(condiciones),
        id_departamento_destino || null,
        estrategia,
        id_tecnico_fijo || null,
        considerar_disponibilidad,
        notificar_asignacion,
      ]
    );

    return NextResponse.json({ ok: true, regla: nueva });
  } catch (error: any) {
    console.error("Error al crear regla de asignación:", error);
    return NextResponse.json({ error: error.message || "Error al crear regla" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id_regla,
      nombre,
      orden,
      activa,
      evento_evaluacion,
      condiciones,
      id_departamento_destino,
      estrategia,
      id_tecnico_fijo,
      considerar_disponibilidad,
      notificar_asignacion,
    } = body;

    if (!id_regla) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const actualizada = await queryRow<any>(
      `UPDATE problema_regla_asignacion
       SET nombre = COALESCE($1, nombre),
           orden = COALESCE($2, orden),
           activa = COALESCE($3, activa),
           evento_evaluacion = COALESCE($4, evento_evaluacion),
           condiciones = COALESCE($5, condiciones),
           id_departamento_destino = $6,
           estrategia = COALESCE($7, estrategia),
           id_tecnico_fijo = $8,
           considerar_disponibilidad = COALESCE($9, considerar_disponibilidad),
           notificar_asignacion = COALESCE($10, notificar_asignacion)
       WHERE id_regla = $11
       RETURNING *`,
      [
        nombre ? nombre.trim() : null,
        orden !== undefined ? orden : null,
        activa !== undefined ? activa : null,
        evento_evaluacion || null,
        condiciones ? JSON.stringify(condiciones) : null,
        id_departamento_destino !== undefined ? id_departamento_destino : null,
        estrategia || null,
        id_tecnico_fijo !== undefined ? id_tecnico_fijo : null,
        considerar_disponibilidad !== undefined ? considerar_disponibilidad : null,
        notificar_asignacion !== undefined ? notificar_asignacion : null,
        id_regla,
      ]
    );

    return NextResponse.json({ ok: true, regla: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar regla:", error);
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

    await query("DELETE FROM problema_regla_asignacion WHERE id_regla = $1", [id]);
    return NextResponse.json({ ok: true, mensaje: "Regla eliminada exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar regla:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar" }, { status: 500 });
  }
}
