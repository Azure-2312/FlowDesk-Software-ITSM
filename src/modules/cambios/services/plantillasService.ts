import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarPlantillasCambio() {
  const plantillas = await query<any>(`
    SELECT p.*, c.nombre as categoria_nombre
    FROM cambio_plantilla p
    LEFT JOIN cambio_catalogo_item c ON c.id_item = p.id_categoria
    ORDER BY p.activo DESC, p.id_plantilla
  `);

  return { ok: true, plantillas };
}

export async function crearPlantillaCambio(sesion: any, body: any) {
  const {
    codigo,
    nombre,
    descripcion,
    tipo_cambio = "NORMAL",
    id_categoria = null,
    perfiles_permitidos = [],
    campos_prellenados = {},
    campos_bloqueados = [],
    pasos_implementacion = [],
    tareas_paquete = [],
  } = body;

  if (!codigo || !nombre) {
    throw new ErrorDominio("Código y nombre son obligatorios");
  }

  const codigoNorm = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

  const existe = await queryRow<any>("SELECT id_plantilla FROM cambio_plantilla WHERE codigo = $1", [codigoNorm]);
  if (existe) {
    throw new ErrorDominio(`El código de plantilla '${codigoNorm}' ya existe.`);
  }

  const nueva = await queryRow<any>(`
    INSERT INTO cambio_plantilla (
      codigo, nombre, descripcion, tipo_cambio, id_categoria, perfiles_permitidos,
      campos_prellenados, campos_bloqueados, pasos_implementacion, tareas_paquete,
      activo, usuario_creacion
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11
    ) RETURNING *
  `, [
    codigoNorm,
    nombre.trim(),
    descripcion || null,
    tipo_cambio,
    id_categoria || null,
    JSON.stringify(perfiles_permitidos),
    JSON.stringify(campos_prellenados),
    JSON.stringify(campos_bloqueados),
    JSON.stringify(pasos_implementacion),
    JSON.stringify(tareas_paquete),
    sesion.id_usuario,
  ]);

  return { ok: true, mensaje: "Plantilla creada exitosamente", plantilla: nueva };
}

export async function actualizarPlantillaCambio(sesion: any, body: any) {
  const {
    id_plantilla,
    nombre,
    descripcion,
    tipo_cambio,
    id_categoria,
    perfiles_permitidos,
    campos_prellenados,
    campos_bloqueados,
    pasos_implementacion,
    tareas_paquete,
    activo,
  } = body;

  if (!id_plantilla) {
    throw new ErrorDominio("id_plantilla es obligatorio");
  }

  const actualizada = await queryRow<any>(`
    UPDATE cambio_plantilla SET
      nombre = COALESCE($1, nombre),
      descripcion = COALESCE($2, descripcion),
      tipo_cambio = COALESCE($3, tipo_cambio),
      id_categoria = CASE WHEN $4::integer IS NOT NULL THEN $4 ELSE id_categoria END,
      perfiles_permitidos = COALESCE($5, perfiles_permitidos),
      campos_prellenados = COALESCE($6, campos_prellenados),
      campos_bloqueados = COALESCE($7, campos_bloqueados),
      pasos_implementacion = COALESCE($8, pasos_implementacion),
      tareas_paquete = COALESCE($9, tareas_paquete),
      activo = COALESCE($10, activo),
      usuario_modificacion = $11,
      fecha_modificacion = NOW()
    WHERE id_plantilla = $12
    RETURNING *
  `, [
    nombre ? nombre.trim() : null,
    descripcion !== undefined ? descripcion : null,
    tipo_cambio || null,
    id_categoria !== undefined ? id_categoria : null,
    perfiles_permitidos ? JSON.stringify(perfiles_permitidos) : null,
    campos_prellenados ? JSON.stringify(campos_prellenados) : null,
    campos_bloqueados ? JSON.stringify(campos_bloqueados) : null,
    pasos_implementacion ? JSON.stringify(pasos_implementacion) : null,
    tareas_paquete ? JSON.stringify(tareas_paquete) : null,
    activo !== undefined ? activo : null,
    sesion.id_usuario,
    id_plantilla,
  ]);

  return { ok: true, mensaje: "Plantilla actualizada", plantilla: actualizada };
}

export async function eliminarPlantillaCambio(idPlantilla: string) {
  if (!idPlantilla) {
    throw new ErrorDominio("id_plantilla es requerido");
  }

  const plt = await queryRow<any>("SELECT id_plantilla, veces_usada FROM cambio_plantilla WHERE id_plantilla = $1", [idPlantilla]);
  if (!plt) {
    throw new ErrorDominio("Plantilla no encontrada", 404);
  }

  if (plt.veces_usada > 0) {
    await query("UPDATE cambio_plantilla SET activo = false WHERE id_plantilla = $1", [idPlantilla]);
    return {
      ok: true,
      mensaje: "La plantilla ha sido usada en RFCs históricas; se ha desactivado para preservar la integridad.",
      desactivado: true,
    };
  }

  await query("DELETE FROM cambio_plantilla WHERE id_plantilla = $1", [idPlantilla]);
  return { ok: true, mensaje: "Plantilla eliminada correctamente." };
}
