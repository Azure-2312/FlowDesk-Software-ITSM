import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Actas de entrega de activos vistas desde el autoservicio del custodio
 * (página /activos/mis-activos). Permite listar las actas pendientes y
 * aceptarlas digitalmente. No expone datos financieros del activo.
 */

export interface ActaPendiente {
  id_acta: number;
  id_activo: number;
  id_usuario: number;
  tipo: string;
  estado: string;
  observaciones: string | null;
  creado_en: string;
  aceptado_en: string | null;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  numero_serie: string | null;
}

export async function listarActasPendientes(idUsuario: number) {
  return query<ActaPendiente>(
    `SELECT
       ae.id_acta,
       ae.id_activo,
       ae.id_usuario,
       ae.tipo,
       ae.estado,
       ae.observaciones,
       ae.creado_en,
       ae.aceptado_en,
       a.codigo_patrimonial,
       a.tipo_activo,
       a.marca,
       a.modelo,
       a.numero_serie
     FROM acta_entrega ae
     JOIN activo a ON a.id_activo = ae.id_activo
     WHERE ae.id_usuario = $1
       AND ae.estado = 'PENDIENTE'
       AND a.estado_registro = true
     ORDER BY ae.creado_en DESC`,
    [idUsuario]
  );
}

export async function aceptarActa(idActivo: number, idUsuario: number, observaciones?: string | null) {
  if (!idActivo) throw new ErrorDominio("Debes indicar el activo del acta.");

  const activo = await queryRow<{
    id_activo: number;
    estado_activo: string;
    id_usuario_custodio: number | null;
  }>(
    `SELECT id_activo, estado_activo, id_usuario_custodio
       FROM activo
      WHERE id_activo = $1 AND estado_registro = true`,
    [idActivo]
  );

  if (!activo) throw new ErrorDominio("El activo no existe.", 404);
  if (activo.id_usuario_custodio !== idUsuario) {
    throw new ErrorDominio("No eres el custodio de este activo.", 403);
  }

  const acta = await queryRow<{ id_acta: number }>(
    `SELECT id_acta
       FROM acta_entrega
      WHERE id_activo = $1 AND id_usuario = $2 AND estado = 'PENDIENTE'
      ORDER BY creado_en DESC
      LIMIT 1`,
    [idActivo, idUsuario]
  );

  if (!acta) {
    throw new ErrorDominio("No hay un acta de entrega pendiente para este activo.", 404);
  }

  const observacion = observaciones?.trim() || null;

  const actualizada = await queryRow(
    `UPDATE acta_entrega
        SET estado = 'ACEPTADA',
            aceptado_en = now(),
            observaciones = COALESCE($2, observaciones)
      WHERE id_acta = $1
      RETURNING *`,
    [acta.id_acta, observacion]
  );

  await query(
    `INSERT INTO activo_historial
       (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario)
     VALUES ($1, $2, $3, $4, $4, $5, $4)`,
    [
      idActivo,
      activo.estado_activo,
      activo.estado_activo,
      idUsuario,
      `Acta de entrega aceptada digitalmente${observacion ? `: ${observacion}` : ""}`,
    ]
  );

  return { mensaje: "Acta de entrega aceptada correctamente.", acta: actualizada };
}
