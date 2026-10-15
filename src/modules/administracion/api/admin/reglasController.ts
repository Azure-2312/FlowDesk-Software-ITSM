import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede consultar reglas de notificación." }, { status: 403 });
  }

  try {
    const reglas = await query(
      `SELECT 
        id_regla,
        codigo_evento,
        nombre,
        descripcion,
        canal,
        plantilla,
        destinatarios,
        activa,
        fecha_modificacion
       FROM regla_notificacion
       ORDER BY id_regla ASC`
    );

    return NextResponse.json({ reglas });
  } catch (error) {
    console.error("Error al obtener reglas de notificación:", error);
    return NextResponse.json({ error: "Error al consultar reglas de notificación" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede configurar reglas de notificación." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_regla, nombre, descripcion, canal, plantilla, destinatarios, activa } = body;

    if (!id_regla) {
      return NextResponse.json({ error: "ID de regla requerido." }, { status: 400 });
    }

    const destinatariosArr = Array.isArray(destinatarios) ? destinatarios : ["SOLICITANTE"];
    if (destinatariosArr.length === 0) {
      return NextResponse.json({ error: "Debe asignar al menos un grupo destinatario para la regla." }, { status: 400 });
    }

    const row = await queryRow(
      `UPDATE regla_notificacion SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        canal = COALESCE($3, canal),
        plantilla = COALESCE($4, plantilla),
        destinatarios = $5,
        activa = COALESCE($6, activa),
        usuario_modificacion = $7,
        fecha_modificacion = now()
       WHERE id_regla = $8
       RETURNING *`,
      [
        nombre?.trim() || null,
        descripcion?.trim() || null,
        canal || null,
        plantilla ? JSON.stringify(plantilla) : null,
        destinatariosArr,
        activa !== undefined ? Boolean(activa) : null,
        sesion.id_usuario,
        Number(id_regla)
      ]
    );

    if (!row) {
      return NextResponse.json({ error: "Regla no encontrada." }, { status: 404 });
    }

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "NOTIFICACIONES",
        "ACTUALIZAR_REGLA_NOTIFICACION",
        `El usuario ${sesion.nombres} actualizó la regla de notificación [${row.codigo_evento}] ${row.nombre} (Canal: ${row.canal}, Activa: ${row.activa}).`,
        JSON.stringify({ id_regla: row.id_regla, codigo_evento: row.codigo_evento, canal: row.canal, activa: row.activa, destinatarios: destinatariosArr }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ mensaje: "Regla de notificación actualizada exitosamente.", regla: row });
  } catch (error) {
    console.error("Error al actualizar regla de notificación:", error);
    return NextResponse.json({ error: "Error al actualizar regla de notificación" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede registrar nuevas reglas de notificación." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { codigo_evento, nombre, descripcion, canal, plantilla, destinatarios, activa } = body;

    if (!codigo_evento?.trim() || !nombre?.trim()) {
      return NextResponse.json({ error: "Código de evento y nombre son obligatorios." }, { status: 400 });
    }

    const destinatariosArr = Array.isArray(destinatarios) && destinatarios.length > 0 ? destinatarios : ["SOLICITANTE"];

    const row = await queryRow(
      `INSERT INTO regla_notificacion (
        codigo_evento,
        nombre,
        descripcion,
        canal,
        plantilla,
        destinatarios,
        activa,
        usuario_modificacion,
        fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
      RETURNING *`,
      [
        codigo_evento.trim().toUpperCase(),
        nombre.trim(),
        descripcion?.trim() || null,
        canal || "EMAIL",
        JSON.stringify(plantilla || { asunto: "", cuerpo: "" }),
        destinatariosArr,
        activa !== false,
        sesion.id_usuario
      ]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "NOTIFICACIONES",
        "CREAR_REGLA_NOTIFICACION",
        `El usuario ${sesion.nombres} creó la nueva regla de notificación [${codigo_evento.trim().toUpperCase()}] ${nombre.trim()} para el canal ${canal || "EMAIL"}.`,
        JSON.stringify({ codigo_evento: codigo_evento.trim().toUpperCase(), canal: canal || "EMAIL", destinatarios: destinatariosArr }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ mensaje: "Regla de notificación registrada exitosamente.", regla: row }, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear regla de notificación:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe una regla para ese código de evento." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al registrar regla de notificación" }, { status: 500 });
  }
}
