import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarTiposActivo() {
  return query(
    "SELECT * FROM tipo_activo_catalogo WHERE estado_registro = true ORDER BY clase ASC, nombre ASC"
  );
}

export async function crearTipoActivo(sesion: any, body: any) {
  const { codigo, nombre, clase, atributos } = body;

  if (!codigo?.trim() || !nombre?.trim() || !clase) {
    throw new ErrorDominio("Código, nombre y clase ('HARDWARE' o 'SOFTWARE') son requeridos.");
  }

  let row;
  try {
    row = await queryRow(
      `INSERT INTO tipo_activo_catalogo (codigo, nombre, clase, atributos, usuario_modificacion, fecha_modificacion)
       VALUES ($1, $2, $3, $4, $5, now())
       RETURNING *`,
      [
        codigo.trim().toUpperCase(),
        nombre.trim(),
        clase.trim().toUpperCase(),
        JSON.stringify(atributos || []),
        sesion.id_usuario,
      ]
    );
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe un tipo de activo con ese código.");
    }
    throw error;
  }

  return { mensaje: "Tipo de activo registrado exitosamente.", tipo: row };
}
