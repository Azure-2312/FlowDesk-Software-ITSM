import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarAusencias() {
  const ausencias = await query<any>(`
      SELECT a.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
      FROM tecnico_ausencias a
      JOIN usuario u ON u.id_usuario = a.id_usuario_tecnico
      ORDER BY a.fecha_desde DESC
    `);
  return { ok: true, ausencias };
}

export async function crearAusencia(body: any, idUsuarioSesion: number) {
  const { id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

  if (!id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const nueva = await queryRow<any>(
    `INSERT INTO tecnico_ausencias (
        id_usuario_tecnico, fecha_desde, fecha_hasta, motivo, registrado_por, fecha_registro
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
    [id_usuario_tecnico, fecha_desde, fecha_hasta, motivo.trim(), idUsuarioSesion]
  );

  return { ok: true, ausencia: nueva };
}

export async function actualizarAusencia(body: any) {
  const { id_ausencia, id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

  if (!id_ausencia || !id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
    throw new ErrorDominio("Todos los campos son obligatorios");
  }

  const actualizada = await queryRow<any>(
    `UPDATE tecnico_ausencias
       SET id_usuario_tecnico = $1, fecha_desde = $2, fecha_hasta = $3, motivo = $4
       WHERE id_ausencia = $5
       RETURNING *`,
    [id_usuario_tecnico, fecha_desde, fecha_hasta, motivo.trim(), id_ausencia]
  );

  return { ok: true, ausencia: actualizada };
}

export async function eliminarAusencia(id: string | null) {
  if (!id) throw new ErrorDominio("ID requerido");

  await query("DELETE FROM tecnico_ausencias WHERE id_ausencia = $1", [id]);
  return { ok: true, mensaje: "Ausencia eliminada" };
}
