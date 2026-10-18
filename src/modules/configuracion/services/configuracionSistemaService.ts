import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface ContextoAuditoriaConfiguracion {
  idUsuario: number;
  nombres: string;
  ip: string;
}

export async function obtenerConfiguraciones(clave: string | null, categoria: string | null) {
  if (clave) {
    const row = await queryRow(
      `SELECT clave, categoria, descripcion, valor, fecha_modificacion
        FROM configuracion_sistema
        WHERE clave = $1`,
      [clave]
    );

    if (!row) {
      throw new ErrorDominio("Configuracion no encontrada", 404);
    }
    return { configuracion: row };
  }

  let sql = `SELECT clave, categoria, descripcion, valor, fecha_modificacion FROM configuracion_sistema`;
  const params: any[] = [];
  if (categoria) {
    sql += ` WHERE categoria = $1`;
    params.push(categoria);
  }
  sql += ` ORDER BY categoria, clave`;

  const configs = await query(sql, params);
  return { configuraciones: configs };
}

export async function guardarConfiguracion(body: any, contexto: ContextoAuditoriaConfiguracion) {
  const { clave, valor, descripcion } = body;

  if (!clave || valor === undefined) {
    throw new ErrorDominio("Clave y valor son requeridos");
  }

  // Obtener valor anterior para auditoria
  const actual = await queryRow<{ valor: any; categoria: string }>(
    `SELECT valor, categoria FROM configuracion_sistema WHERE clave = $1`,
    [clave]
  );

  const row = await queryRow(
    `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
      VALUES ($1, COALESCE($2, 'GENERAL'), $3, $4, $5, NOW())
      ON CONFLICT (clave) DO UPDATE SET
        valor = EXCLUDED.valor,
        descripcion = COALESCE(EXCLUDED.descripcion, configuracion_sistema.descripcion),
        usuario_modificacion = EXCLUDED.usuario_modificacion,
        fecha_modificacion = NOW()
      RETURNING clave, categoria, descripcion, valor, fecha_modificacion`,
    [clave, actual?.categoria || "GENERAL", descripcion || null, JSON.stringify(valor), contexto.idUsuario]
  );

  // Registrar en Audit Trail
  await query(
    `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
      VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      actual?.categoria || "CONFIGURACION",
      "MODIFICAR_CONFIGURACION",
      `El usuario ${contexto.nombres} actualizó la configuración de "${clave}"`,
      JSON.stringify({ anterior: actual?.valor || null, nuevo: valor }),
      contexto.ip,
    ]
  );

  return {
    mensaje: "Configuración actualizada y registrada en auditoría exitosamente.",
    configuracion: row,
  };
}
