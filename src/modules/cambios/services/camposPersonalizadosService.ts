import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarCamposPersonalizadosCambio() {
  const campos = await query<any>(
    `SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
     FROM campo_personalizado c
     LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
     WHERE c.entidad = 'cambio'
     ORDER BY c.orden, c.id_campo`
  );

  const limiteRow = await queryRow<{ valor: string }>(
    "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_cambio'"
  );
  const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

  return {
    ok: true,
    campos,
    total: campos.length,
    limite,
  };
}

export async function crearCampoPersonalizadoCambio(sesion: any, body: any) {
  const {
    codigo,
    etiqueta,
    descripcion,
    tipo,
    propiedades = {},
    formularios_visibles = ["solicitud", "edicion"],
    pestana_vista = "solicitud",
    seccion = "Sección A — Identificación",
    obligatorio = "no",
    reglas_condicionales = [],
    orden = 1,
  } = body;

  if (!codigo || !etiqueta || !tipo) {
    throw new ErrorDominio("Código, etiqueta y tipo de dato son obligatorios");
  }

  // Normalizar código con prefijo cf_
  let codigoNormalizado = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (!codigoNormalizado.startsWith("cf_")) {
    codigoNormalizado = `cf_${codigoNormalizado}`;
  }

  // Validar unicidad
  const existe = await queryRow<{ id_campo: number }>(
    "SELECT id_campo FROM campo_personalizado WHERE entidad = 'cambio' AND codigo = $1",
    [codigoNormalizado]
  );

  if (existe) {
    throw new ErrorDominio(`Ya existe un campo personalizado con el código '${codigoNormalizado}'`);
  }

  const nuevoCampo = await queryRow<any>(
    `INSERT INTO campo_personalizado (
      entidad, codigo, etiqueta, descripcion, tipo, activo, propiedades,
      formularios_visibles, pestana_vista, seccion, obligatorio,
      reglas_condicionales, orden, veces_usado, usuario_creacion
    ) VALUES (
      'cambio', $1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11, 0, $12
    ) RETURNING *`,
    [
      codigoNormalizado,
      etiqueta.trim(),
      descripcion || null,
      tipo,
      JSON.stringify(propiedades),
      JSON.stringify(formularios_visibles),
      pestana_vista,
      seccion,
      obligatorio,
      JSON.stringify(reglas_condicionales),
      orden,
      sesion.id_usuario,
    ]
  );

  return {
    ok: true,
    mensaje: "Campo personalizado creado exitosamente",
    campo: nuevoCampo,
  };
}

export async function actualizarCampoPersonalizadoCambio(sesion: any, body: any) {
  const {
    id_campo,
    etiqueta,
    descripcion,
    activo,
    propiedades,
    formularios_visibles,
    pestana_vista,
    seccion,
    obligatorio,
    reglas_condicionales,
    orden,
  } = body;

  if (!id_campo) {
    throw new ErrorDominio("id_campo es obligatorio");
  }

  const campoActualizado = await queryRow<any>(
    `UPDATE campo_personalizado SET
      etiqueta = COALESCE($1, etiqueta),
      descripcion = COALESCE($2, descripcion),
      activo = COALESCE($3, activo),
      propiedades = COALESCE($4, propiedades),
      formularios_visibles = COALESCE($5, formularios_visibles),
      pestana_vista = COALESCE($6, pestana_vista),
      seccion = COALESCE($7, seccion),
      obligatorio = COALESCE($8, obligatorio),
      reglas_condicionales = COALESCE($9, reglas_condicionales),
      orden = COALESCE($10, orden)
     WHERE id_campo = $11 AND entidad = 'cambio'
     RETURNING *`,
    [
      etiqueta ? etiqueta.trim() : null,
      descripcion !== undefined ? descripcion : null,
      activo !== undefined ? activo : null,
      propiedades ? JSON.stringify(propiedades) : null,
      formularios_visibles ? JSON.stringify(formularios_visibles) : null,
      pestana_vista || null,
      seccion || null,
      obligatorio || null,
      reglas_condicionales ? JSON.stringify(reglas_condicionales) : null,
      orden !== undefined ? orden : null,
      id_campo,
    ]
  );

  return {
    ok: true,
    mensaje: "Campo personalizado actualizado",
    campo: campoActualizado,
  };
}

export async function eliminarCampoPersonalizadoCambio(idCampo: string) {
  if (!idCampo) {
    throw new ErrorDominio("id_campo es requerido");
  }

  const campo = await queryRow<{ id_campo: number; veces_usado: number }>(
    "SELECT id_campo, veces_usado FROM campo_personalizado WHERE id_campo = $1 AND entidad = 'cambio'",
    [idCampo]
  );

  if (!campo) {
    throw new ErrorDominio("Campo no encontrado", 404);
  }

  if (campo.veces_usado > 0) {
    // Si está en uso, solo se desactiva
    await query(
      "UPDATE campo_personalizado SET activo = false WHERE id_campo = $1",
      [idCampo]
    );
    return {
      ok: true,
      mensaje: "El campo tiene datos en RFCs existentes; se ha desactivado en lugar de eliminarse para proteger la integridad.",
      desactivado: true,
    };
  }

  await query("DELETE FROM campo_personalizado WHERE id_campo = $1", [idCampo]);

  return {
    ok: true,
    mensaje: "Campo personalizado eliminado exitosamente.",
    eliminado: true,
  };
}
