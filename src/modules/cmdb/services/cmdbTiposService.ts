import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarTiposCi() {
  return query(`
    SELECT 
      id_tipo_ci,
      codigo,
      nombre,
      descripcion,
      categoria,
      icono,
      atributos_requeridos,
      reglas_impacto,
      estado_registro,
      fecha_creacion
    FROM tipo_ci
    ORDER BY id_tipo_ci ASC
  `);
}

export async function crearTipoCi(sesion: any, body: any, ip: string) {
  const { codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto } = body;

  if (!codigo || !nombre || !categoria) {
    throw new ErrorDominio("Código, nombre y categoría son requeridos.");
  }

  let row;
  try {
    row = await queryRow(
      `INSERT INTO tipo_ci (codigo, nombre, descripcion, categoria, icono, atributos_requeridos, reglas_impacto)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        codigo.trim().toUpperCase(),
        nombre.trim(),
        descripcion?.trim() || null,
        categoria.trim().toUpperCase(),
        icono || "server",
        JSON.stringify(atributos_requeridos || []),
        JSON.stringify(reglas_impacto || []),
      ]
    );
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ErrorDominio("Ya existe un tipo de CI con ese código.");
    }
    throw error;
  }

  // Registrar en auditoría
  await query(
    `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
     VALUES ($1, 'CMDB', 'CREAR_TIPO_CI', $2, $3, $4)`,
    [
      sesion.id_usuario,
      `El usuario ${sesion.nombres} modeló la nueva clase de CI "${nombre}"`,
      JSON.stringify(row),
      ip,
    ]
  );

  return { mensaje: "Tipo de CI modelado exitosamente.", tipo: row };
}
