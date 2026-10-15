import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarLicencias() {
  return query(
    `SELECT 
      id_licencia,
      nombre_software,
      fabricante,
      tipo_licencia,
      cantidad_adquirida,
      cantidad_en_uso,
      (cantidad_adquirida - cantidad_en_uso) AS licencias_disponibles,
      ROUND((cantidad_en_uso::numeric / NULLIF(cantidad_adquirida, 0)) * 100, 1) AS porcentaje_uso,
      fecha_vencimiento,
      CASE 
        WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento < CURRENT_DATE THEN 'VENCIDA'
        WHEN fecha_vencimiento IS NOT NULL AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 'POR_VENCER'
        ELSE 'VIGENTE'
      END AS estado_cumplimiento,
      costo_anual,
      fecha_creacion,
      estado_registro
    FROM licencia_software
    WHERE estado_registro = true
    ORDER BY id_licencia ASC`
  );
}

export async function crearLicencia(sesion: any, body: any) {
  const {
    nombre_software,
    fabricante,
    clave_licencia,
    tipo_licencia,
    cantidad_adquirida,
    cantidad_en_uso,
    fecha_vencimiento,
    costo_anual,
  } = body;

  if (!nombre_software || !fabricante || !tipo_licencia || !cantidad_adquirida) {
    throw new ErrorDominio("Nombre, fabricante, tipo y cantidad adquirida son requeridos.");
  }

  const insertSql = `
    INSERT INTO licencia_software (
      nombre_software,
      fabricante,
      clave_licencia,
      tipo_licencia,
      cantidad_adquirida,
      cantidad_en_uso,
      fecha_vencimiento,
      costo_anual,
      usuario_creacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id_licencia, nombre_software
  `;

  const row = await queryRow(insertSql, [
    nombre_software.trim(),
    fabricante.trim(),
    clave_licencia?.trim() || null,
    tipo_licencia.toUpperCase(),
    Number(cantidad_adquirida),
    Number(cantidad_en_uso) || 0,
    fecha_vencimiento || null,
    costo_anual ? Number(costo_anual) : null,
    sesion.id_usuario,
  ]);

  return { mensaje: "Licencia de software registrada exitosamente.", licencia: row };
}

export async function actualizarLicencia(body: any) {
  const { id_licencia } = body;

  if (!id_licencia) {
    throw new ErrorDominio("ID de licencia requerido");
  }

  const actual = await queryRow<any>("SELECT * FROM licencia_software WHERE id_licencia = $1", [id_licencia]);
  if (!actual) {
    throw new ErrorDominio("Licencia no encontrada", 404);
  }

  const nombre_software = body.nombre_software !== undefined ? body.nombre_software.trim() : actual.nombre_software;
  const fabricante = body.fabricante !== undefined ? body.fabricante.trim() : actual.fabricante;
  const clave_licencia = body.clave_licencia !== undefined ? (body.clave_licencia.trim() || null) : actual.clave_licencia;
  const tipo_licencia = body.tipo_licencia !== undefined ? body.tipo_licencia.toUpperCase() : actual.tipo_licencia;
  const cantidad_adquirida = body.cantidad_adquirida !== undefined ? Number(body.cantidad_adquirida) : actual.cantidad_adquirida;
  const cantidad_en_uso = body.cantidad_en_uso !== undefined ? Number(body.cantidad_en_uso) : actual.cantidad_en_uso;
  const fecha_vencimiento = body.fecha_vencimiento !== undefined ? (body.fecha_vencimiento || null) : actual.fecha_vencimiento;
  const costo_anual = body.costo_anual !== undefined ? (body.costo_anual ? Number(body.costo_anual) : null) : actual.costo_anual;
  const estado_registro = body.estado_registro !== undefined ? Boolean(body.estado_registro) : actual.estado_registro;

  const row = await queryRow(
    `UPDATE licencia_software SET
      nombre_software = $1,
      fabricante = $2,
      clave_licencia = $3,
      tipo_licencia = $4,
      cantidad_adquirida = $5,
      cantidad_en_uso = $6,
      fecha_vencimiento = $7,
      costo_anual = $8,
      estado_registro = $9
    WHERE id_licencia = $10
    RETURNING *`,
    [
      nombre_software,
      fabricante,
      clave_licencia,
      tipo_licencia,
      cantidad_adquirida,
      cantidad_en_uso,
      fecha_vencimiento,
      costo_anual,
      estado_registro,
      id_licencia,
    ]
  );

  return { mensaje: "Licencia actualizada exitosamente.", licencia: row };
}
