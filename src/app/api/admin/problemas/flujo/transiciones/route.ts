import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      codigo,
      nombre,
      estado_origen_id,
      estado_destino_id,
      perfiles_autorizados = [],
      roles_contextuales = { responsable: true, grupo: true, supervisor: true },
      condiciones_previas = [],
      campos_requeridos = [],
      politica_comentario = "opcional",
      requiere_confirmacion = false,
      mensaje_confirmacion = "",
      requiere_aprobacion = false,
      aprobador_tipo = "supervisor_grupo",
      color_boton = "#2563eb",
      automatizaciones = [],
      orden = 1,
    } = body;

    if (!nombre || !estado_origen_id || !estado_destino_id) {
      return NextResponse.json({ error: "Nombre, estado origen y estado destino son obligatorios" }, { status: 400 });
    }

    const codigoGenerado = codigo || `trn_${Date.now()}`;

    const nueva = await queryRow<any>(
      `INSERT INTO problema_transicion (
        codigo, nombre, estado_origen_id, estado_destino_id, perfiles_autorizados,
        roles_contextuales, condiciones_previas, campos_requeridos, politica_comentario,
        requiere_confirmacion, mensaje_confirmacion, requiere_aprobacion, aprobador_tipo,
        color_boton, automatizaciones, activa, orden, es_sistema
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, false)
      RETURNING *`,
      [
        codigoGenerado,
        nombre.trim(),
        estado_origen_id,
        estado_destino_id,
        JSON.stringify(perfiles_autorizados),
        JSON.stringify(roles_contextuales),
        JSON.stringify(condiciones_previas),
        JSON.stringify(campos_requeridos),
        politica_comentario,
        requiere_confirmacion,
        mensaje_confirmacion || null,
        requiere_aprobacion,
        aprobador_tipo,
        color_boton,
        JSON.stringify(automatizaciones),
        orden,
      ]
    );

    return NextResponse.json({ ok: true, transicion: nueva });
  } catch (error: any) {
    console.error("Error al crear transicion:", error);
    return NextResponse.json({ error: error.message || "Error al crear transición" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      id_transicion,
      nombre,
      estado_origen_id,
      estado_destino_id,
      perfiles_autorizados,
      roles_contextuales,
      condiciones_previas,
      campos_requeridos,
      politica_comentario,
      requiere_confirmacion,
      mensaje_confirmacion,
      requiere_aprobacion,
      aprobador_tipo,
      color_boton,
      automatizaciones,
      activa,
      orden,
    } = body;

    if (!id_transicion) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const actualizada = await queryRow<any>(
      `UPDATE problema_transicion
       SET nombre = COALESCE($1, nombre),
           estado_origen_id = COALESCE($2, estado_origen_id),
           estado_destino_id = COALESCE($3, estado_destino_id),
           perfiles_autorizados = COALESCE($4, perfiles_autorizados),
           roles_contextuales = COALESCE($5, roles_contextuales),
           condiciones_previas = COALESCE($6, condiciones_previas),
           campos_requeridos = COALESCE($7, campos_requeridos),
           politica_comentario = COALESCE($8, politica_comentario),
           requiere_confirmacion = COALESCE($9, requiere_confirmacion),
           mensaje_confirmacion = COALESCE($10, mensaje_confirmacion),
           requiere_aprobacion = COALESCE($11, requiere_aprobacion),
           aprobador_tipo = COALESCE($12, aprobador_tipo),
           color_boton = COALESCE($13, color_boton),
           automatizaciones = COALESCE($14, automatizaciones),
           activa = COALESCE($15, activa),
           orden = COALESCE($16, orden)
       WHERE id_transicion = $17
       RETURNING *`,
      [
        nombre ? nombre.trim() : null,
        estado_origen_id || null,
        estado_destino_id || null,
        perfiles_autorizados ? JSON.stringify(perfiles_autorizados) : null,
        roles_contextuales ? JSON.stringify(roles_contextuales) : null,
        condiciones_previas ? JSON.stringify(condiciones_previas) : null,
        campos_requeridos ? JSON.stringify(campos_requeridos) : null,
        politica_comentario || null,
        requiere_confirmacion !== undefined ? requiere_confirmacion : null,
        mensaje_confirmacion !== undefined ? mensaje_confirmacion : null,
        requiere_aprobacion !== undefined ? requiere_aprobacion : null,
        aprobador_tipo || null,
        color_boton || null,
        automatizaciones ? JSON.stringify(automatizaciones) : null,
        activa !== undefined ? activa : null,
        orden !== undefined ? orden : null,
        id_transicion,
      ]
    );

    return NextResponse.json({ ok: true, transicion: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar transicion:", error);
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

    const actual = await queryRow<any>("SELECT es_sistema FROM problema_transicion WHERE id_transicion = $1", [id]);
    if (!actual) return NextResponse.json({ error: "Transición no encontrada" }, { status: 404 });

    if (actual.es_sistema) {
      return NextResponse.json({ error: "Las transiciones institucionales no pueden eliminarse (desactívelas si es necesario)" }, { status: 400 });
    }

    await query("DELETE FROM problema_transicion WHERE id_transicion = $1", [id]);
    return NextResponse.json({ ok: true, mensaje: "Transición eliminada exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar transicion:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar" }, { status: 500 });
  }
}
