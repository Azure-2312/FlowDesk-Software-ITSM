import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface FiltrosAsignacionesLicencia {
  idLicencia?: string | null;
  activas?: string | null;
}

export async function listarAsignacionesLicencia(filtros: FiltrosAsignacionesLicencia) {
  const { idLicencia, activas } = filtros;

  const condiciones: string[] = ["1=1"];
  const params: any[] = [];
  let pIdx = 1;

  if (idLicencia) {
    condiciones.push(`la.id_licencia = $${pIdx++}`);
    params.push(Number(idLicencia));
  }

  if (activas === "1") {
    condiciones.push("la.fecha_devolucion IS NULL");
  }

  return query(
    `SELECT 
      la.id_asignacion,
      la.id_licencia,
      ls.nombre_software,
      ls.fabricante,
      ls.tipo_licencia,
      la.id_usuario,
      CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
      u.correo_electronico AS usuario_correo,
      la.id_activo,
      a.codigo_patrimonial AS activo_codigo,
      a.modelo AS activo_modelo,
      la.fecha_asignacion,
      la.fecha_devolucion,
      la.motivo_devolucion,
      CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS usuario_registro_nombre
     FROM licencia_asignacion la
     JOIN licencia_software ls ON la.id_licencia = ls.id_licencia
     LEFT JOIN usuario u ON la.id_usuario = u.id_usuario
     LEFT JOIN activo a ON la.id_activo = a.id_activo
     LEFT JOIN usuario ur ON la.id_usuario_registro = ur.id_usuario
     WHERE ${condiciones.join(" AND ")}
     ORDER BY la.fecha_devolucion IS NULL DESC, la.fecha_asignacion DESC`,
    params
  );
}

export async function crearAsignacionLicencia(sesion: any, body: any) {
  const { id_licencia, id_usuario, id_activo, fecha_asignacion } = body;

  if (!id_licencia || (!id_usuario && !id_activo)) {
    throw new ErrorDominio("Debe indicar la licencia y al menos un usuario o activo destinatario.");
  }

  const lic = await queryRow<{ id_licencia: number; cantidad_adquirida: number; cantidad_en_uso: number }>(
    "SELECT id_licencia, cantidad_adquirida, cantidad_en_uso FROM licencia_software WHERE id_licencia = $1 AND estado_registro = true",
    [Number(id_licencia)]
  );

  if (!lic) {
    throw new ErrorDominio("Licencia no encontrada o inactiva.", 404);
  }

  if (lic.cantidad_en_uso >= lic.cantidad_adquirida) {
    throw new ErrorDominio("No hay cupos disponibles para esta licencia (capacidad agotada).");
  }

  let row;
  try {
    row = await queryRow(
      `INSERT INTO licencia_asignacion (
        id_licencia,
        id_usuario,
        id_activo,
        fecha_asignacion,
        id_usuario_registro
      ) VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5)
      RETURNING *`,
      [
        Number(id_licencia),
        id_usuario ? Number(id_usuario) : null,
        id_activo ? Number(id_activo) : null,
        fecha_asignacion || null,
        sesion.id_usuario,
      ]
    );
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe una asignación activa de esta licencia para el destinatario.");
    }
    throw error;
  }

  await query(
    "UPDATE licencia_software SET cantidad_en_uso = cantidad_en_uso + 1 WHERE id_licencia = $1",
    [Number(id_licencia)]
  );

  return { mensaje: "Licencia asignada exitosamente.", asignacion: row };
}

export async function revocarAsignacionLicencia(body: any) {
  const { id_asignacion, motivo_devolucion } = body;

  if (!id_asignacion) {
    throw new ErrorDominio("ID de asignación requerido.");
  }

  const actual = await queryRow<{ id_asignacion: number; id_licencia: number; fecha_devolucion: string | null }>(
    "SELECT id_asignacion, id_licencia, fecha_devolucion FROM licencia_asignacion WHERE id_asignacion = $1",
    [Number(id_asignacion)]
  );

  if (!actual) {
    throw new ErrorDominio("Asignación no encontrada.", 404);
  }

  if (actual.fecha_devolucion) {
    throw new ErrorDominio("Esta asignación ya fue devuelta/revocada anteriormente.");
  }

  const row = await queryRow(
    `UPDATE licencia_asignacion SET
      fecha_devolucion = CURRENT_DATE,
      motivo_devolucion = $1
     WHERE id_asignacion = $2
     RETURNING *`,
    [motivo_devolucion?.trim() || "Devolución regular de activo/licencia", Number(id_asignacion)]
  );

  await query(
    "UPDATE licencia_software SET cantidad_en_uso = GREATEST(cantidad_en_uso - 1, 0) WHERE id_licencia = $1",
    [actual.id_licencia]
  );

  return { mensaje: "Licencia revocada y reincorporada al inventario disponible.", asignacion: row };
}
