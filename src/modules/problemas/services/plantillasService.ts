import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarPlantillas(id?: string | null) {
  if (id) {
    const plantilla = await queryRow<any>(
      `SELECT p.*, c.nombre as categoria_nombre
       FROM plantilla_problema p
       LEFT JOIN problema_categoria c ON c.id_categoria = p.id_categoria
       WHERE p.id_plantilla = $1`,
      [id]
    );
    if (!plantilla) throw new ErrorDominio("Plantilla no encontrada", 404);
    return { ok: true, plantilla };
  }

  const plantillas = await query<any>(
    `SELECT p.*, c.nombre as categoria_nombre
     FROM plantilla_problema p
     LEFT JOIN problema_categoria c ON c.id_categoria = p.id_categoria
     ORDER BY p.nombre ASC`
  );

  return { ok: true, plantillas };
}

export async function crearPlantilla(body: any, idUsuario: number) {
  const {
    nombre,
    descripcion,
    activa = true,
    id_categoria,
    perfiles_visibles = [],
    valores_prellenados = {},
    campos_bloqueados = {},
    tareas_incluidas = [],
  } = body;

  if (!nombre || nombre.trim().length < 5 || nombre.trim().length > 100) {
    throw new ErrorDominio("El nombre de la plantilla es obligatorio (entre 5 y 100 caracteres)");
  }

  const existente = await queryRow<{ id_plantilla: number }>(
    "SELECT id_plantilla FROM plantilla_problema WHERE LOWER(nombre) = LOWER($1)",
    [nombre.trim()]
  );
  if (existente) {
    throw new ErrorDominio("Ya existe una plantilla con este nombre");
  }

  const res = await queryRow<any>(
    `INSERT INTO plantilla_problema (
      nombre, descripcion, activa, id_categoria, perfiles_visibles,
      valores_prellenados, campos_bloqueados, tareas_incluidas,
      usuario_creacion, fecha_creacion, fecha_modificacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      nombre.trim(),
      descripcion || null,
      activa,
      id_categoria || null,
      JSON.stringify(perfiles_visibles),
      JSON.stringify(valores_prellenados),
      JSON.stringify(campos_bloqueados),
      JSON.stringify(tareas_incluidas),
      idUsuario,
    ]
  );

  return { ok: true, plantilla: res };
}

export async function actualizarPlantilla(body: any) {
  const {
    id_plantilla,
    nombre,
    descripcion,
    activa,
    id_categoria,
    perfiles_visibles,
    valores_prellenados,
    campos_bloqueados,
    tareas_incluidas,
  } = body;

  if (!id_plantilla) {
    throw new ErrorDominio("ID de plantilla requerido");
  }

  if (nombre && (nombre.trim().length < 5 || nombre.trim().length > 100)) {
    throw new ErrorDominio("El nombre debe tener entre 5 y 100 caracteres");
  }

  if (nombre) {
    const repetido = await queryRow<{ id_plantilla: number }>(
      "SELECT id_plantilla FROM plantilla_problema WHERE LOWER(nombre) = LOWER($1) AND id_plantilla != $2",
      [nombre.trim(), id_plantilla]
    );
    if (repetido) {
      throw new ErrorDominio("Ya existe otra plantilla con este nombre");
    }
  }

  const res = await queryRow<any>(
    `UPDATE plantilla_problema
     SET nombre = COALESCE($1, nombre),
         descripcion = COALESCE($2, descripcion),
         activa = COALESCE($3, activa),
         id_categoria = $4,
         perfiles_visibles = COALESCE($5, perfiles_visibles),
         valores_prellenados = COALESCE($6, valores_prellenados),
         campos_bloqueados = COALESCE($7, campos_bloqueados),
         tareas_incluidas = COALESCE($8, tareas_incluidas),
         fecha_modificacion = NOW()
     WHERE id_plantilla = $9
     RETURNING *`,
    [
      nombre ? nombre.trim() : null,
      descripcion !== undefined ? descripcion : null,
      activa !== undefined ? activa : null,
      id_categoria !== undefined ? id_categoria : null,
      perfiles_visibles ? JSON.stringify(perfiles_visibles) : null,
      valores_prellenados ? JSON.stringify(valores_prellenados) : null,
      campos_bloqueados ? JSON.stringify(campos_bloqueados) : null,
      tareas_incluidas ? JSON.stringify(tareas_incluidas) : null,
      id_plantilla,
    ]
  );

  return { ok: true, plantilla: res };
}

export async function eliminarPlantilla(id: string) {
  const plantilla = await queryRow<{ veces_usada: number }>(
    "SELECT veces_usada FROM plantilla_problema WHERE id_plantilla = $1",
    [id]
  );

  if (!plantilla) throw new ErrorDominio("Plantilla no encontrada", 404);

  if (plantilla.veces_usada > 0) {
    throw new ErrorDominio(
      `No se puede eliminar la plantilla porque ha sido usada en ${plantilla.veces_usada} problemas. Solo puede desactivarse.`
    );
  }

  await query("DELETE FROM plantilla_problema WHERE id_plantilla = $1", [id]);

  return { ok: true, mensaje: "Plantilla eliminada exitosamente" };
}
