import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarModelosActivo() {
  return query(
    `SELECT 
      m.id_modelo,
      m.id_tipo_activo,
      t.codigo AS tipo_codigo,
      t.nombre AS tipo_nombre,
      t.clase AS tipo_clase,
      m.fabricante,
      m.nombre_modelo,
      m.atributos,
      m.vida_util_meses,
      m.metodo_depreciacion,
      m.valor_residual_pct,
      m.estado_registro,
      m.fecha_modificacion
     FROM modelo_activo m
     JOIN tipo_activo_catalogo t ON m.id_tipo_activo = t.id_tipo_activo
     WHERE m.estado_registro = true
     ORDER BY t.nombre ASC, m.fabricante ASC, m.nombre_modelo ASC`
  );
}

export async function crearModeloActivo(sesion: any, body: any) {
  const {
    id_tipo_activo,
    fabricante,
    nombre_modelo,
    atributos,
    vida_util_meses,
    metodo_depreciacion,
    valor_residual_pct,
  } = body;

  if (!id_tipo_activo || !fabricante?.trim() || !nombre_modelo?.trim()) {
    throw new ErrorDominio("Tipo de activo, fabricante y nombre de modelo son requeridos.");
  }

  let row;
  try {
    row = await queryRow(
      `INSERT INTO modelo_activo (
        id_tipo_activo,
        fabricante,
        nombre_modelo,
        atributos,
        vida_util_meses,
        metodo_depreciacion,
        valor_residual_pct,
        usuario_modificacion,
        fecha_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
      RETURNING *`,
      [
        Number(id_tipo_activo),
        fabricante.trim(),
        nombre_modelo.trim(),
        JSON.stringify(atributos || []),
        vida_util_meses ? Number(vida_util_meses) : 36,
        metodo_depreciacion === "NINGUNA" ? "NINGUNA" : "LINEAL",
        valor_residual_pct ? Number(valor_residual_pct) : 0,
        sesion.id_usuario,
      ]
    );
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe un modelo registrado con ese fabricante y nombre.");
    }
    throw error;
  }

  return { mensaje: "Modelo registrado exitosamente.", modelo: row };
}
