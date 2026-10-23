import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface ContextoAuditoriaNotificacion {
  idUsuario: number;
  nombres: string;
  ip: string;
}

export async function listarReglasNotificacion() {
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

  return { reglas };
}

export async function actualizarReglaNotificacion(body: any, contexto: ContextoAuditoriaNotificacion) {
  const { id_regla, nombre, descripcion, canal, plantilla, destinatarios, activa } = body;

  if (!id_regla) {
    throw new ErrorDominio("ID de regla requerido.");
  }

  const destinatariosArr = Array.isArray(destinatarios) ? destinatarios : ["SOLICITANTE"];
  if (destinatariosArr.length === 0) {
    throw new ErrorDominio("Debe asignar al menos un grupo destinatario para la regla.");
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
      contexto.idUsuario,
      Number(id_regla),
    ]
  );

  if (!row) {
    throw new ErrorDominio("Regla no encontrada.", 404);
  }

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "NOTIFICACIONES",
      "ACTUALIZAR_REGLA_NOTIFICACION",
      `El usuario ${contexto.nombres} actualizó la regla de notificación [${(row as any).codigo_evento}] ${(row as any).nombre} (Canal: ${(row as any).canal}, Activa: ${(row as any).activa}).`,
      JSON.stringify({ id_regla: (row as any).id_regla, codigo_evento: (row as any).codigo_evento, canal: (row as any).canal, activa: (row as any).activa, destinatarios: destinatariosArr }),
      contexto.ip,
    ]
  );

  return { mensaje: "Regla de notificación actualizada exitosamente.", regla: row };
}

export async function crearReglaNotificacion(body: any, contexto: ContextoAuditoriaNotificacion) {
  const { codigo_evento, nombre, descripcion, canal, plantilla, destinatarios, activa } = body;

  if (!codigo_evento?.trim() || !nombre?.trim()) {
    throw new ErrorDominio("Código de evento y nombre son obligatorios.");
  }

  const destinatariosArr = Array.isArray(destinatarios) && destinatarios.length > 0 ? destinatarios : ["SOLICITANTE"];

  try {
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
        contexto.idUsuario,
      ]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        contexto.idUsuario,
        "NOTIFICACIONES",
        "CREAR_REGLA_NOTIFICACION",
        `El usuario ${contexto.nombres} creó la nueva regla de notificación [${codigo_evento.trim().toUpperCase()}] ${nombre.trim()} para el canal ${canal || "EMAIL"}.`,
        JSON.stringify({ codigo_evento: codigo_evento.trim().toUpperCase(), canal: canal || "EMAIL", destinatarios: destinatariosArr }),
        contexto.ip,
      ]
    );

    return {
      httpStatus: 201,
      payload: { mensaje: "Regla de notificación registrada exitosamente.", regla: row },
    };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe una regla para ese código de evento.");
    }
    throw error;
  }
}
