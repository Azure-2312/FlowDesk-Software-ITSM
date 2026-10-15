import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarCatalogosCambio(catalogo: string | null) {
  if (catalogo) {
    const items = await query<any>(`
      SELECT c.*, p.nombre as padre_nombre,
             CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
      FROM cambio_catalogo_item c
      LEFT JOIN cambio_catalogo_item p ON p.id_item = c.id_padre
      LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
      WHERE c.catalogo = $1
      ORDER BY c.orden, c.id_item
    `, [catalogo]);
    return { ok: true, catalogo, items };
  }

  // Traer todos los catálogos agrupados
  const items = await query<any>(`
    SELECT c.*, p.nombre as padre_nombre
    FROM cambio_catalogo_item c
    LEFT JOIN cambio_catalogo_item p ON p.id_item = c.id_padre
    ORDER BY c.catalogo, c.orden, c.id_item
  `);

  const agrupados: Record<string, any[]> = {};
  for (const item of items) {
    if (!agrupados[item.catalogo]) agrupados[item.catalogo] = [];
    agrupados[item.catalogo].push(item);
  }

  return { ok: true, catalogos: agrupados };
}

export async function crearCatalogoCambio(sesion: any, body: any) {
  const { accion } = body;

  // Fusión de elementos de catálogo
  if (accion === "fusionar") {
    const { id_origen, id_destino } = body;
    if (!id_origen || !id_destino) {
      throw new ErrorDominio("id_origen e id_destino son requeridos para la fusión.");
    }

    const origen = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_origen]);
    const destino = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_destino]);

    if (!origen || !destino) {
      throw new ErrorDominio("Elementos no encontrados", 404);
    }

    if (origen.es_sistema) {
      throw new ErrorDominio("No se puede fusionar un valor protegido del sistema.");
    }

    // Reasignar subcategorías hijas si existen
    await query("UPDATE cambio_catalogo_item SET id_padre = $1 WHERE id_padre = $2", [id_destino, id_origen]);

    // Sumar usos
    await query(`
      UPDATE cambio_catalogo_item
      SET usos_count = usos_count + $1
      WHERE id_item = $2
    `, [origen.usos_count, id_destino]);

    // Desactivar el origen
    await query(`
      UPDATE cambio_catalogo_item
      SET activo = false, descripcion = COALESCE(descripcion, '') || ' [Fusionado en ' || $1 || ']'
      WHERE id_item = $2
    `, [destino.nombre, id_origen]);

    return {
      ok: true,
      mensaje: `Elemento '${origen.nombre}' fusionado exitosamente en '${destino.nombre}'.`,
    };
  }

  // Crear nuevo elemento
  const { catalogo, codigo, nombre, descripcion, color = "#475569", orden = 1, id_padre = null, atributos = {} } = body;

  if (!catalogo || !codigo || !nombre) {
    throw new ErrorDominio("Catálogo, código y nombre son obligatorios");
  }

  const codigoNormalizado = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

  const existe = await queryRow<any>(
    "SELECT id_item FROM cambio_catalogo_item WHERE catalogo = $1 AND codigo = $2",
    [catalogo, codigoNormalizado]
  );

  if (existe) {
    throw new ErrorDominio(`El código '${codigoNormalizado}' ya existe en el catálogo '${catalogo}'.`);
  }

  const nuevo = await queryRow<any>(`
    INSERT INTO cambio_catalogo_item (
      catalogo, id_padre, codigo, nombre, descripcion, color, orden, activo, es_sistema, atributos, usuario_creacion
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, true, false, $8, $9
    ) RETURNING *
  `, [
    catalogo,
    id_padre || null,
    codigoNormalizado,
    nombre.trim(),
    descripcion || null,
    color,
    orden,
    JSON.stringify(atributos),
    sesion.id_usuario,
  ]);

  return { ok: true, mensaje: "Valor agregado exitosamente", item: nuevo };
}

export async function actualizarCatalogoCambio(sesion: any, body: any) {
  const { id_item, nombre, descripcion, color, orden, activo, atributos, id_padre } = body;

  if (!id_item) {
    throw new ErrorDominio("id_item es obligatorio");
  }

  const actual = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [id_item]);
  if (!actual) {
    throw new ErrorDominio("Elemento no encontrado", 404);
  }

  if (actual.es_sistema && activo === false) {
    throw new ErrorDominio("No es posible desactivar un elemento bloqueado del sistema.");
  }

  const itemActualizado = await queryRow<any>(`
    UPDATE cambio_catalogo_item SET
      nombre = COALESCE($1, nombre),
      descripcion = COALESCE($2, descripcion),
      color = COALESCE($3, color),
      orden = COALESCE($4, orden),
      activo = COALESCE($5, activo),
      atributos = COALESCE($6, atributos),
      id_padre = CASE WHEN $7::integer IS NOT NULL THEN $7 ELSE id_padre END,
      usuario_modificacion = $8,
      fecha_modificacion = NOW()
    WHERE id_item = $9
    RETURNING *
  `, [
    nombre ? nombre.trim() : null,
    descripcion !== undefined ? descripcion : null,
    color || null,
    orden !== undefined ? orden : null,
    activo !== undefined ? activo : null,
    atributos ? JSON.stringify(atributos) : null,
    id_padre !== undefined ? id_padre : null,
    sesion.id_usuario,
    id_item,
  ]);

  return { ok: true, mensaje: "Catálogo actualizado", item: itemActualizado };
}

export async function eliminarCatalogoCambio(idItem: string) {
  if (!idItem) {
    throw new ErrorDominio("id_item es requerido");
  }

  const item = await queryRow<any>("SELECT * FROM cambio_catalogo_item WHERE id_item = $1", [idItem]);
  if (!item) {
    throw new ErrorDominio("Elemento no encontrado", 404);
  }

  if (item.es_sistema) {
    throw new ErrorDominio("Los elementos del sistema están bloqueados y no pueden eliminarse.");
  }

  if (item.usos_count > 0) {
    await query("UPDATE cambio_catalogo_item SET activo = false WHERE id_item = $1", [idItem]);
    return {
      ok: true,
      mensaje: "El elemento está en uso en registros históricos; se ha desactivado para proteger la trazabilidad.",
      desactivado: true,
    };
  }

  // Verificar si tiene subcategorías hijas
  const tieneHijos = await queryRow<any>("SELECT id_item FROM cambio_catalogo_item WHERE id_padre = $1 LIMIT 1", [idItem]);
  if (tieneHijos) {
    throw new ErrorDominio("No se puede eliminar una categoría que contiene subcategorías. Elimine o reasigne primero las subcategorías.");
  }

  await query("DELETE FROM cambio_catalogo_item WHERE id_item = $1", [idItem]);

  return { ok: true, mensaje: "Elemento eliminado exitosamente." };
}
