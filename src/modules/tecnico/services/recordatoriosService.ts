import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarRecordatorios(idUsuario: number) {
  return query<any>(
    `SELECT * FROM tecnico_recordatorios 
       WHERE id_usuario = $1 
       ORDER BY fecha_hora ASC`,
    [idUsuario]
  );
}

export interface DatosRecordatorio {
  titulo?: string;
  descripcion?: string;
  fecha_hora?: string;
  objeto_tipo?: string;
  objeto_id?: string | number;
}

export async function crearRecordatorio(datos: DatosRecordatorio, idUsuario: number) {
  const { titulo, descripcion, fecha_hora, objeto_tipo, objeto_id } = datos;

  if (!titulo || !titulo.trim()) {
    throw new ErrorDominio("El título es obligatorio");
  }

  return queryRow<any>(
    `INSERT INTO tecnico_recordatorios (id_usuario, titulo, descripcion, fecha_hora, objeto_tipo, objeto_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
    [
      idUsuario,
      titulo.trim(),
      descripcion ? descripcion.trim() : null,
      fecha_hora || new Date().toISOString(),
      objeto_tipo || null,
      objeto_id ? String(objeto_id) : null,
    ]
  );
}

export async function actualizarRecordatorio(
  idRecordatorio: number,
  completado: boolean,
  idUsuario: number
) {
  return queryRow<any>(
    `UPDATE tecnico_recordatorios 
       SET completado = $1 
       WHERE id_recordatorio = $2 AND id_usuario = $3
       RETURNING *`,
    [completado, idRecordatorio, idUsuario]
  );
}
