import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarCamposPersonalizados(entidad: string) {
  const campos = await query<any>(
    `SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
     FROM campo_personalizado c
     LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
     WHERE c.entidad = $1
     ORDER BY c.orden, c.id_campo`,
    [entidad]
  );

  const limiteRow = await queryRow<{ valor: string }>(
    "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_problema'"
  );
  const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

  return {
    ok: true,
    campos,
    total: campos.length,
    limite,
  };
}

export async function crearCampoPersonalizado(body: any, idUsuario: number) {
  const {
    entidad = "problema",
    codigo,
    etiqueta,
    descripcion,
    tipo,
    propiedades = {},
    formularios_visibles = ["registro", "edicion"],
    pestana_vista = "detalle",
    seccion = "A. Identificación",
    obligatorio = "no",
    reglas_condicionales = [],
    orden = 1,
  } = body;

  if (!codigo || !etiqueta || !tipo) {
    throw new ErrorDominio("Código, etiqueta y tipo de control son obligatorios");
  }

  let codigoNormalizado = codigo.trim().toLowerCase();
  if (!codigoNormalizado.startsWith("cf_")) {
    codigoNormalizado = `cf_${codigoNormalizado}`;
  }

  const regexCodigo = /^cf_[a-z0-9_]{2,37}$/;
  if (!regexCodigo.test(codigoNormalizado)) {
    throw new ErrorDominio(
      "El código debe comenzar con 'cf_', usar letras minúsculas, números o guiones bajos, y tener entre 5 y 40 caracteres en total."
    );
  }

  const totalRow = await queryRow<{ total: number }>(
    "SELECT COUNT(*)::int as total FROM campo_personalizado WHERE entidad = $1",
    [entidad]
  );
  const limiteRow = await queryRow<{ valor: string }>(
    "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_problema'"
  );
  const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

  if ((totalRow?.total || 0) >= limite) {
    throw new ErrorDominio(
      `Se ha alcanzado el límite máximo de ${limite} campos personalizados para la entidad ${entidad}.`
    );
  }

  const existente = await queryRow<{ id_campo: number }>(
    "SELECT id_campo FROM campo_personalizado WHERE entidad = $1 AND codigo = $2",
    [entidad, codigoNormalizado]
  );
  if (existente) {
    throw new ErrorDominio(`Ya existe un campo con el código ${codigoNormalizado} para ${entidad}`);
  }

  const campoCreado = await queryRow<any>(
    `INSERT INTO campo_personalizado (
      entidad, codigo, etiqueta, descripcion, tipo, activo,
      propiedades, formularios_visibles, pestana_vista, seccion,
      obligatorio, reglas_condicionales, orden, usuario_creacion,
      fecha_creacion
    ) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    RETURNING *`,
    [
      entidad,
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
      idUsuario,
    ]
  );

  return { ok: true, campo: campoCreado };
}

export async function actualizarCampoPersonalizado(body: any) {
  // Actualización por lote
  if (Array.isArray(body.campos)) {
    for (const c of body.campos) {
      if (!c.id_campo) continue;
      await query(
        `UPDATE campo_personalizado
         SET activo = COALESCE($1, activo),
             obligatorio = COALESCE($2, obligatorio),
             propiedades = COALESCE($3, propiedades),
             orden = COALESCE($4, orden),
             descripcion = COALESCE($5, descripcion)
         WHERE id_campo = $6`,
        [
          c.activo !== undefined ? c.activo : null,
          c.obligatorio || null,
          c.propiedades ? JSON.stringify(c.propiedades) : null,
          c.orden !== undefined ? c.orden : null,
          c.descripcion !== undefined ? c.descripcion : null,
          c.id_campo,
        ]
      );
    }
    return { ok: true, mensaje: "Campos actualizados correctamente" };
  }

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
    throw new ErrorDominio("ID de campo requerido");
  }

  const campoActual = await queryRow<any>(
    "SELECT * FROM campo_personalizado WHERE id_campo = $1",
    [id_campo]
  );
  if (!campoActual) {
    throw new ErrorDominio("Campo no encontrado", 404);
  }

  const actualizado = await queryRow<any>(
    `UPDATE campo_personalizado
     SET etiqueta = COALESCE($1, etiqueta),
         descripcion = COALESCE($2, descripcion),
         activo = COALESCE($3, activo),
         propiedades = COALESCE($4, propiedades),
         formularios_visibles = COALESCE($5, formularios_visibles),
         pestana_vista = COALESCE($6, pestana_vista),
         seccion = COALESCE($7, seccion),
         obligatorio = COALESCE($8, obligatorio),
         reglas_condicionales = COALESCE($9, reglas_condicionales),
         orden = COALESCE($10, orden)
     WHERE id_campo = $11
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

  return { ok: true, campo: actualizado };
}

export async function eliminarCampoPersonalizado(id: string) {
  const campo = await queryRow<any>(
    "SELECT veces_usado, codigo, etiqueta FROM campo_personalizado WHERE id_campo = $1",
    [id]
  );

  if (!campo) throw new ErrorDominio("Campo no encontrado", 404);

  if (campo.veces_usado > 0) {
    throw new ErrorDominio(
      `No es posible eliminar el campo '${campo.etiqueta}' (${campo.codigo}) porque está siendo utilizado en ${campo.veces_usado} tickets. Solo puede desactivarlo.`
    );
  }

  await query("DELETE FROM campo_personalizado WHERE id_campo = $1", [id]);

  return { ok: true, mensaje: "Campo personalizado eliminado exitosamente" };
}
