import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface ContextoConocimiento {
  idUsuario: number;
  nombres: string;
  idPerfil: number;
  ip: string;
}

/* ------------------------------------------------------------------ */
/* Articulos (vista operativa)                                         */
/* ------------------------------------------------------------------ */

export interface FiltrosArticulos {
  buscar?: string | null;
  idCategoria?: string | null;
  vista?: string | null;
}

export async function listarArticulos(filtros: FiltrosArticulos, sesion: { idUsuario: number; idPerfil: number }) {
  const condiciones: string[] = ["a.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (filtros.vista === "mis_articulos") {
    condiciones.push(`a.id_autor = $${paramIdx++}`);
    params.push(sesion.idUsuario);
  } else if (filtros.vista === "revisiones") {
    condiciones.push(`a.estado_editorial = 'EN_REVISION'`);
  } else {
    condiciones.push(`a.estado_editorial = 'PUBLICADO'`);
    condiciones.push(`($${paramIdx++} = 1 OR $${paramIdx - 1} = ANY(a.audiencia_perfiles))`);
    params.push(sesion.idPerfil || 0);
  }

  if (filtros.idCategoria) {
    condiciones.push(`a.id_categoria = $${paramIdx++}`);
    params.push(parseInt(filtros.idCategoria, 10));
  }

  if (filtros.buscar) {
    condiciones.push(`(a.titulo ILIKE $${paramIdx} OR a.contenido_markdown ILIKE $${paramIdx})`);
    params.push(`%${filtros.buscar}%`);
    paramIdx++;
  }

  const sql = `
    SELECT 
      a.id_articulo,
      a.codigo_articulo,
      a.titulo,
      a.contenido_markdown,
      a.id_categoria,
      cat.nombre AS categoria_nombre,
      a.id_problema_origen,
      a.estado_editorial,
      a.id_autor,
      CONCAT(u.nombres, ' ', u.apellido_paterno) AS autor_nombre,
      a.visitas,
      a.utilidad_positiva,
      a.utilidad_negativa,
      a.fecha_publicacion,
      a.fecha_creacion
    FROM articulo_conocimiento a
    LEFT JOIN categoria_ticket cat ON a.id_categoria = cat.id_categoria
    LEFT JOIN usuario u ON a.id_autor = u.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY a.utilidad_positiva DESC, a.visitas DESC
  `;

  return query(sql, params);
}

export async function crearArticuloOperativo(body: any, contexto: ContextoConocimiento) {
  const { titulo, contenido_markdown, id_categoria, id_problema_origen, audiencia_perfiles } = body;

  if (!titulo || !contenido_markdown) {
    throw new ErrorDominio("Título y contenido son obligatorios.");
  }

  const countRow = await queryRow<{ c: string }>("SELECT COUNT(*) as c FROM articulo_conocimiento");
  const correlativo = String(parseInt(countRow?.c || "0", 10) + 1).padStart(3, "0");
  const codigo_articulo = `ART-${new Date().getFullYear()}-${correlativo}`;

  const audiencia =
    Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0
      ? audiencia_perfiles.map(Number)
      : [2, 3, 4, 5, 6, 7, 8, 9];

  const esTecnico = contexto.idPerfil === 2;
  const estadoInicial = esTecnico ? "EN_REVISION" : "PUBLICADO";

  const row = await queryRow<{ id_articulo: number; codigo_articulo: string; estado_editorial: string }>(
    `
      INSERT INTO articulo_conocimiento (
        codigo_articulo,
        titulo,
        contenido_markdown,
        id_categoria,
        id_problema_origen,
        estado_editorial,
        audiencia_perfiles,
        id_autor,
        id_revisor,
        usuario_creacion,
        fecha_publicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id_articulo, codigo_articulo, estado_editorial
    `,
    [
      codigo_articulo,
      titulo,
      contenido_markdown,
      id_categoria || null,
      id_problema_origen || null,
      estadoInicial,
      audiencia,
      contexto.idUsuario,
      esTecnico ? null : contexto.idUsuario,
      contexto.idUsuario,
      esTecnico ? null : new Date(),
    ]
  );

  if (row?.id_articulo) {
    await query(
      `INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
         VALUES ($1, null, $2, $3, $4, now())`,
      [
        row.id_articulo,
        estadoInicial,
        esTecnico ? "Envío inicial a revisión editorial" : "Publicación directa",
        contexto.idUsuario,
      ]
    );
  }

  return {
    mensaje: esTecnico ? "Artículo enviado a revisión editorial." : "Artículo publicado exitosamente.",
    articulo: row,
  };
}

export async function obtenerArticulo(idArticulo: number) {
  // Incrementar conteo de visitas
  await query("UPDATE articulo_conocimiento SET visitas = visitas + 1 WHERE id_articulo = $1", [idArticulo]);

  const row = await queryRow(
    `
      SELECT 
        a.id_articulo,
        a.codigo_articulo,
        a.titulo,
        a.contenido_markdown,
        a.id_categoria,
        cat.nombre AS categoria_nombre,
        a.id_problema_origen,
        a.estado_editorial,
        a.id_autor,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS autor_nombre,
        a.visitas,
        a.utilidad_positiva,
        a.utilidad_negativa,
        a.fecha_publicacion,
        a.fecha_creacion
      FROM articulo_conocimiento a
      LEFT JOIN categoria_ticket cat ON a.id_categoria = cat.id_categoria
      LEFT JOIN usuario u ON a.id_autor = u.id_usuario
      WHERE a.id_articulo = $1 AND a.estado_registro = true
    `,
    [idArticulo]
  );

  if (!row) throw new ErrorDominio("Artículo no encontrado", 404);
  return row;
}

export async function calificarArticulo(idArticulo: number, votoUtilidad: string) {
  if (votoUtilidad === "POSITIVO") {
    await query(
      "UPDATE articulo_conocimiento SET utilidad_positiva = utilidad_positiva + 1 WHERE id_articulo = $1",
      [idArticulo]
    );
  } else if (votoUtilidad === "NEGATIVO") {
    await query(
      "UPDATE articulo_conocimiento SET utilidad_negativa = utilidad_negativa + 1 WHERE id_articulo = $1",
      [idArticulo]
    );
  }
  return { mensaje: "Voto registrado exitosamente." };
}

/* ------------------------------------------------------------------ */
/* Categorias (administracion)                                         */
/* ------------------------------------------------------------------ */

export async function listarCategoriasConocimiento() {
  return query(`
      SELECT 
        c.id_categoria,
        c.id_tipo_ticket,
        tt.nombre as tipo_nombre,
        tt.codigo as tipo_codigo,
        c.nombre,
        c.descripcion,
        c.codigo_corto,
        c.sla_default_respuesta,
        c.sla_default_resolucion,
        c.estado_registro,
        c.id_padre,
        COUNT(DISTINCT s.id_servicio)::int as total_servicios,
        COUNT(DISTINCT s.id_servicio) FILTER (WHERE s.estado_registro = true)::int as servicios_activos,
        COUNT(DISTINCT a.id_articulo) FILTER (WHERE a.estado_registro = true)::int as total_articulos
      FROM categoria_ticket c
      LEFT JOIN tipo_ticket tt ON tt.id_tipo_ticket = c.id_tipo_ticket
      LEFT JOIN servicio_catalogo s ON s.id_categoria = c.id_categoria
      LEFT JOIN articulo_conocimiento a ON a.id_categoria = c.id_categoria AND a.estado_registro = true
      GROUP BY 
        c.id_categoria,
        c.id_tipo_ticket,
        tt.nombre,
        tt.codigo,
        c.nombre,
        c.descripcion,
        c.codigo_corto,
        c.sla_default_respuesta,
        c.sla_default_resolucion,
        c.estado_registro,
        c.id_padre
      ORDER BY c.nombre ASC
    `);
}

export async function crearCategoriaConocimiento(body: any, contexto: ContextoConocimiento) {
  const { nombre, descripcion, codigo_corto } = body;

  if (!nombre || !nombre.trim()) {
    throw new ErrorDominio("El nombre de la categoría es obligatorio.");
  }

  const codigo = codigo_corto?.trim().toUpperCase() || nombre.trim().slice(0, 4).toUpperCase();

  const nueva = await queryRow(
    `INSERT INTO categoria_ticket (
        id_tipo_ticket, nombre, descripcion, codigo_corto, estado_registro, sla_default_respuesta, sla_default_resolucion
      ) VALUES (1, $1, $2, $3, true, 4, 24)
      RETURNING *`,
    [nombre.trim(), descripcion?.trim() || null, codigo]
  );

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "CONOCIMIENTO",
      "CREAR_CATEGORIA_CONOCIMIENTO",
      `El usuario ${contexto.nombres} creó la categoría de ayuda [${codigo}] ${nombre.trim()} para la Base de Conocimiento KCS.`,
      JSON.stringify({ id_categoria: (nueva as any)?.id_categoria, nombre: nombre.trim(), codigo_corto: codigo }),
      contexto.ip,
    ]
  );

  return nueva;
}

export async function actualizarCategoriaConocimiento(body: any, contexto: ContextoConocimiento) {
  const { id_categoria, nombre, descripcion, codigo_corto, estado_registro } = body;

  if (!id_categoria) {
    throw new ErrorDominio("ID de categoría requerido.");
  }

  const actualizada = await queryRow(
    `UPDATE categoria_ticket SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        codigo_corto = COALESCE($3, codigo_corto),
        estado_registro = COALESCE($4, estado_registro)
      WHERE id_categoria = $5
      RETURNING *`,
    [
      nombre?.trim() || null,
      descripcion?.trim() || null,
      codigo_corto?.trim() ? codigo_corto.trim().toUpperCase() : null,
      estado_registro !== undefined ? Boolean(estado_registro) : null,
      Number(id_categoria),
    ]
  );

  if (!actualizada) {
    throw new ErrorDominio("Categoría no encontrada para actualizar.", 404);
  }

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "CONOCIMIENTO",
      "ACTUALIZAR_CATEGORIA_CONOCIMIENTO",
      `El usuario ${contexto.nombres} actualizó la categoría de conocimiento #${id_categoria} (${(actualizada as any)?.nombre}).`,
      JSON.stringify({ id_categoria, nombre, codigo_corto, estado_registro }),
      contexto.ip,
    ]
  );

  return actualizada;
}

export async function eliminarCategoriaConocimiento(idCategoria: number, contexto: ContextoConocimiento) {
  if (!idCategoria) throw new ErrorDominio("ID de categoría requerido.");

  // Validar si tiene artículos asociados
  const artCount = await queryRow<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM articulo_conocimiento WHERE id_categoria = $1 AND estado_registro = true",
    [idCategoria]
  );
  if (artCount && artCount.total > 0) {
    throw new ErrorDominio(
      `No se puede eliminar la categoría porque contiene ${artCount.total} artículo(s) de conocimiento activo(s). Puede desactivarla en su lugar.`
    );
  }

  // Validar si tiene tickets asociados
  const ticketCount = await queryRow<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM ticket WHERE id_categoria = $1",
    [idCategoria]
  );
  if (ticketCount && ticketCount.total > 0) {
    throw new ErrorDominio(
      `No se puede eliminar la categoría porque está asociada a ${ticketCount.total} ticket(s) en el sistema. Puede desactivarla en su lugar.`
    );
  }

  const eliminada = await queryRow(
    "DELETE FROM categoria_ticket WHERE id_categoria = $1 RETURNING *",
    [idCategoria]
  );

  if (!eliminada) throw new ErrorDominio("Categoría no encontrada o ya eliminada.", 404);

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "CONOCIMIENTO",
      "ELIMINAR_CATEGORIA_CONOCIMIENTO",
      `El usuario ${contexto.nombres} eliminó definitivamente la categoría de conocimiento #${idCategoria} (${(eliminada as any)?.nombre}).`,
      JSON.stringify(eliminada),
      contexto.ip,
    ]
  );

  return eliminada;
}

/* ------------------------------------------------------------------ */
/* Articulos (administracion editorial)                                */
/* ------------------------------------------------------------------ */

export async function listarArticulosAdmin() {
  return query(`
      SELECT 
        a.id_articulo,
        a.codigo_articulo,
        a.titulo,
        a.contenido_markdown,
        a.estado_editorial,
        a.version,
        a.visitas,
        a.utilidad_positiva,
        a.utilidad_negativa,
        a.fecha_creacion,
        a.fecha_publicacion,
        a.audiencia_perfiles,
        a.id_categoria,
        cat.nombre AS categoria,
        CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS autor
      FROM articulo_conocimiento a
      LEFT JOIN categoria_ticket cat ON cat.id_categoria = a.id_categoria
      LEFT JOIN usuario ua ON ua.id_usuario = a.id_autor
      WHERE a.estado_registro = true
      ORDER BY 
        CASE a.estado_editorial
          WHEN 'EN_REVISION' THEN 0
          WHEN 'BORRADOR' THEN 1
          WHEN 'PUBLICADO' THEN 2
          ELSE 3
        END,
        a.fecha_creacion DESC
    `);
}

export async function crearArticuloAdmin(body: any, contexto: ContextoConocimiento) {
  const { titulo, contenido_markdown, id_categoria, audiencia_perfiles, estado_editorial } = body;

  if (!titulo || !titulo.trim()) {
    throw new ErrorDominio("El título del artículo es obligatorio.");
  }
  if (!contenido_markdown || !contenido_markdown.trim()) {
    throw new ErrorDominio("El contenido explicativo es obligatorio.");
  }

  const correlativo = await queryRow<{ siguiente: number }>(
    "SELECT COALESCE(MAX(id_articulo), 0) + 1 AS siguiente FROM articulo_conocimiento"
  );
  const codigoArticulo = `KCS-${String(correlativo?.siguiente || 1).padStart(4, "0")}`;

  const estadoFinal =
    estado_editorial && ["BORRADOR", "EN_REVISION", "PUBLICADO"].includes(estado_editorial)
      ? estado_editorial
      : "BORRADOR";

  const audiencia =
    Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0
      ? audiencia_perfiles.map(Number)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const nuevo = await queryRow(
    `INSERT INTO articulo_conocimiento (
        codigo_articulo,
        titulo,
        contenido_markdown,
        id_categoria,
        id_autor,
        id_revisor,
        estado_editorial,
        version,
        audiencia_perfiles,
        estado_registro,
        fecha_creacion,
        fecha_publicacion,
        usuario_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, true, now(), $9, $5)
      RETURNING *`,
    [
      codigoArticulo,
      titulo.trim(),
      contenido_markdown.trim(),
      id_categoria ? Number(id_categoria) : 1,
      contexto.idUsuario,
      estadoFinal === "PUBLICADO" ? contexto.idUsuario : null,
      estadoFinal,
      audiencia,
      estadoFinal === "PUBLICADO" ? new Date() : null,
    ]
  );

  // Registrar en historial editorial
  if (nuevo) {
    await query(
      `INSERT INTO articulo_conocimiento_historial (
          id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha
        ) VALUES ($1, NULL, $2, $3, $4, now())`,
      [(nuevo as any).id_articulo, estadoFinal, "Creación inicial del artículo", contexto.idUsuario]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
          id_usuario, modulo, accion, descripcion, detalles, direccion_ip
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        contexto.idUsuario,
        "CONOCIMIENTO",
        "CREAR_ARTICULO_CONOCIMIENTO",
        `El usuario ${contexto.nombres} redactó el artículo [${codigoArticulo}] ${titulo.trim()} en estado ${estadoFinal}.`,
        JSON.stringify({
          id_articulo: (nuevo as any).id_articulo,
          codigo_articulo: codigoArticulo,
          estado_editorial: estadoFinal,
        }),
        contexto.ip,
      ]
    );
  }

  return nuevo;
}

export async function obtenerArticuloAdmin(id: number) {
  const articulo = await queryRow(
    `SELECT 
        a.*,
        cat.nombre AS categoria_nombre,
        CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS autor_nombre,
        CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS revisor_nombre
       FROM articulo_conocimiento a
       LEFT JOIN categoria_ticket cat ON cat.id_categoria = a.id_categoria
       LEFT JOIN usuario ua ON ua.id_usuario = a.id_autor
       LEFT JOIN usuario ur ON ur.id_usuario = a.id_revisor
       WHERE a.id_articulo = $1 AND a.estado_registro = true`,
    [id]
  );

  if (!articulo) throw new ErrorDominio("Artículo no encontrado", 404);

  const historial = await query(
    `SELECT 
        h.id_historial,
        h.estado_anterior,
        h.estado_nuevo,
        h.comentario,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
        h.fecha
       FROM articulo_conocimiento_historial h
       LEFT JOIN usuario u ON h.id_usuario = u.id_usuario
       WHERE h.id_articulo = $1
       ORDER BY h.fecha DESC`,
    [id]
  );

  const versiones = await query(
    `SELECT v.id_version, v.numero_version, v.titulo, v.contenido_markdown, v.motivo_cambio, 
            CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre, v.fecha_creacion
     FROM articulo_conocimiento_version v
     LEFT JOIN usuario u ON v.id_autor = u.id_usuario
     WHERE v.id_articulo = $1
     ORDER BY v.id_version DESC`,
    [id]
  );

  const feedbacks = await query(
    `SELECT f.id_feedback, f.es_positivo, f.motivo_negativo, f.comentario, f.ip, f.fecha,
            CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre
     FROM articulo_conocimiento_feedback f
     LEFT JOIN usuario u ON f.id_usuario = u.id_usuario
     WHERE f.id_articulo = $1
     ORDER BY f.fecha DESC`,
    [id]
  );

  const vinculosTickets = await query(
    `SELECT v.id_vinculo, v.id_ticket, t.codigo_ticket, t.titulo as ticket_titulo,
            v.resolvio_ticket, v.fecha_vinculo,
            CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
     FROM articulo_conocimiento_vinculo_ticket v
     JOIN ticket t ON v.id_ticket = t.id_ticket
     JOIN usuario u ON v.id_tecnico = u.id_usuario
     WHERE v.id_articulo = $1
     ORDER BY v.fecha_vinculo DESC`,
    [id]
  );

  return { articulo, historial, versiones, feedbacks, vinculosTickets };
}

export async function actualizarArticuloAdmin(id: number, body: any, contexto: ContextoConocimiento) {
  const { titulo, contenido_markdown, id_categoria, tipo_plantilla, clasificacion_seguridad, estado_editorial } = body;
  if (!titulo || !contenido_markdown) {
    throw new ErrorDominio("Título y contenido son obligatorios.");
  }

  const anterior = await queryRow<any>(
    "SELECT * FROM articulo_conocimiento WHERE id_articulo = $1 AND estado_registro = true",
    [id]
  );
  if (!anterior) throw new ErrorDominio("Artículo no encontrado.", 404);

  const nuevaVersion = `1.${anterior.version || 1}`;

  await query(
    `INSERT INTO articulo_conocimiento_version (id_articulo, numero_version, titulo, contenido_markdown, motivo_cambio, id_autor)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, nuevaVersion, anterior.titulo, anterior.contenido_markdown, "Modificación administrativa", contexto.idUsuario]
  );

  const actualizado = await queryRow<any>(
    `UPDATE articulo_conocimiento SET
        titulo = $1,
        contenido_markdown = $2,
        id_categoria = $3,
        tipo_plantilla = COALESCE($4, tipo_plantilla),
        clasificacion_seguridad = COALESCE($5, clasificacion_seguridad),
        estado_editorial = COALESCE($6, estado_editorial),
        version = version + 1,
        fecha_revision = CURRENT_DATE
     WHERE id_articulo = $7
     RETURNING *`,
    [
      titulo.trim(),
      contenido_markdown.trim(),
      id_categoria || anterior.id_categoria,
      tipo_plantilla || null,
      clasificacion_seguridad || null,
      estado_editorial || null,
      id,
    ]
  );

  await query(
    `INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
     VALUES ($1, $2, $3, $4, $5, now())`,
    [id, anterior.estado_editorial, actualizado?.estado_editorial, "Edición y actualización de contenido", contexto.idUsuario]
  );

  return actualizado;
}


export async function actualizarEstadoEditorial(id: number, body: any, contexto: ContextoConocimiento) {
  const { accion, motivo_retiro, comentario, audiencia_perfiles } = body;

  const estados: Record<string, string> = {
    PUBLICAR: "PUBLICADO",
    ARCHIVAR: "ARCHIVADO",
    DEVOLVER: "EN_REVISION",
    RETIRAR: "RETIRADO",
  };

  if (!estados[accion]) {
    throw new ErrorDominio("Acción editorial inválida.");
  }

  const nuevoEstado = estados[accion];

  const actual = await queryRow<{ id_articulo: number; estado_editorial: string }>(
    "SELECT id_articulo, estado_editorial FROM articulo_conocimiento WHERE id_articulo = $1 AND estado_registro = true",
    [id]
  );

  if (!actual) throw new ErrorDominio("Artículo no encontrado.", 404);

  if (nuevoEstado === "RETIRADO" && (!motivo_retiro || String(motivo_retiro).trim().length < 5)) {
    throw new ErrorDominio("Debe indicar un motivo de retiro de al menos 5 caracteres.");
  }

  const actualizado = await queryRow(
    `UPDATE articulo_conocimiento SET
        estado_editorial = $1,
        id_revisor = $2,
        fecha_publicacion = CASE WHEN $1 = 'PUBLICADO' THEN now() ELSE fecha_publicacion END,
        fecha_revision = CASE WHEN $1 IN ('PUBLICADO', 'RETIRADO') THEN CURRENT_DATE ELSE fecha_revision END,
        motivo_retiro = CASE WHEN $1 = 'RETIRADO' THEN $3 ELSE motivo_retiro END,
        audiencia_perfiles = COALESCE($4, audiencia_perfiles),
        version = version + 1
       WHERE id_articulo = $5 AND estado_registro = true
       RETURNING *`,
    [
      nuevoEstado,
      contexto.idUsuario,
      motivo_retiro?.trim() || null,
      Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0
        ? audiencia_perfiles.map(Number)
        : null,
      id,
    ]
  );

  await query(
    `INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
       VALUES ($1, $2, $3, $4, $5, now())`,
    [
      id,
      actual.estado_editorial,
      nuevoEstado,
      comentario?.trim() || (nuevoEstado === "RETIRADO" ? `Retiro: ${motivo_retiro}` : `Acción editorial: ${accion}`),
      contexto.idUsuario,
    ]
  );

  return {
    mensaje: `Artículo actualizado al estado ${nuevoEstado}.`,
    articulo: actualizado,
  };
}

/* ------------------------------------------------------------------ */
/* Politicas de gobierno KCS                                           */
/* ------------------------------------------------------------------ */

const CLAVE_KCS = "kcs_gobierno_config";

const POLITICAS_KCS_DEFECTO = {
  perfiles_redaccion: [1, 2, 4, 8],
  perfiles_aprobacion: [1, 4],
  requiere_aprobacion_previa: true,
  frecuencia_revision_dias: 90,
  permitir_calificacion_csat: true,
};

export async function obtenerPoliticasKcs() {
  const fila = await queryRow<{ valor: any }>("SELECT valor FROM configuracion_sistema WHERE clave = $1", [
    CLAVE_KCS,
  ]);

  const politicas = fila?.valor || POLITICAS_KCS_DEFECTO;

  const perfiles = await query(
    "SELECT id_perfil, nombre, descripcion, LOWER(REPLACE(nombre, ' ', '_')) AS codigo FROM perfiles WHERE estado_registro = true ORDER BY id_perfil ASC"
  );

  return { politicas, perfiles };
}

export async function guardarPoliticasKcs(body: any, contexto: ContextoConocimiento) {
  const {
    perfiles_redaccion,
    perfiles_aprobacion,
    requiere_aprobacion_previa,
    frecuencia_revision_dias,
    permitir_calificacion_csat,
  } = body;

  const redaccion =
    Array.isArray(perfiles_redaccion) && perfiles_redaccion.length > 0 ? perfiles_redaccion : [1, 2];
  const aprobacion =
    Array.isArray(perfiles_aprobacion) && perfiles_aprobacion.length > 0 ? perfiles_aprobacion : [1];

  const nuevasPoliticas = {
    perfiles_redaccion: redaccion,
    perfiles_aprobacion: aprobacion,
    requiere_aprobacion_previa: Boolean(requiere_aprobacion_previa),
    frecuencia_revision_dias: Number(frecuencia_revision_dias) || 90,
    permitir_calificacion_csat: Boolean(permitir_calificacion_csat),
  };

  await query(
    `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, fecha_modificacion, usuario_modificacion)
       VALUES ($1, 'CONOCIMIENTO', 'Políticas de gobierno editorial KCS', $2, now(), $3)
       ON CONFLICT (clave) DO UPDATE SET
         categoria = EXCLUDED.categoria,
         descripcion = EXCLUDED.descripcion,
         valor = EXCLUDED.valor,
         fecha_modificacion = now(),
         usuario_modificacion = EXCLUDED.usuario_modificacion`,
    [CLAVE_KCS, JSON.stringify(nuevasPoliticas), contexto.idUsuario]
  );

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "CONOCIMIENTO",
      "ACTUALIZAR_POLITICAS_KCS",
      `El usuario ${contexto.nombres} actualizó las políticas de gobierno editorial KCS (Aprobación previa: ${nuevasPoliticas.requiere_aprobacion_previa}, Revisión cada ${nuevasPoliticas.frecuencia_revision_dias} días).`,
      JSON.stringify(nuevasPoliticas),
      contexto.ip,
    ]
  );

  return { mensaje: "Políticas de gobierno KCS actualizadas y auditadas.", politicas: nuevasPoliticas };
}


/* ------------------------------------------------------------------ */
/* Extensiones KCS v6: Versionado, Feedback, Vinculacion y Metricas   */
/* ------------------------------------------------------------------ */

export async function listarVersionesArticulo(idArticulo: number) {
  return query(
    `SELECT v.id_version, v.numero_version, v.titulo, v.contenido_markdown, v.motivo_cambio, 
            v.id_autor, CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre, v.fecha_creacion
     FROM articulo_conocimiento_version v
     LEFT JOIN usuario u ON v.id_autor = u.id_usuario
     WHERE v.id_articulo = $1
     ORDER BY v.id_version DESC`,
    [idArticulo]
  );
}

export async function crearVersionArticulo(
  idArticulo: number,
  numeroVersion: string,
  titulo: string,
  contenido: string,
  motivo: string,
  idUsuario: number
) {
  return query(
    `INSERT INTO articulo_conocimiento_version (id_articulo, numero_version, titulo, contenido_markdown, motivo_cambio, id_autor)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [idArticulo, numeroVersion, titulo, contenido, motivo || "Actualización de contenido", idUsuario]
  );
}

export async function registrarFeedbackArticulo(
  idArticulo: number,
  esPositivo: boolean,
  motivoNegativo: string | null,
  comentario: string | null,
  contexto: ContextoConocimiento
) {
  if (esPositivo) {
    await query(
      "UPDATE articulo_conocimiento SET utilidad_positiva = utilidad_positiva + 1 WHERE id_articulo = $1",
      [idArticulo]
    );
  } else {
    await query(
      "UPDATE articulo_conocimiento SET utilidad_negativa = utilidad_negativa + 1 WHERE id_articulo = $1",
      [idArticulo]
    );
  }

  const feedback = await queryRow(
    `INSERT INTO articulo_conocimiento_feedback (id_articulo, id_usuario, es_positivo, motivo_negativo, comentario, ip)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [idArticulo, contexto.idUsuario || null, esPositivo, motivoNegativo || null, comentario || null, contexto.ip || "127.0.0.1"]
  );

  return { mensaje: "Calificación registrada exitosamente.", feedback };
}

export async function vincularArticuloTicket(
  idArticulo: number,
  idTicket: number,
  resolvioTicket: boolean,
  contexto: ContextoConocimiento
) {
  const row = await queryRow(
    `INSERT INTO articulo_conocimiento_vinculo_ticket (id_articulo, id_ticket, id_tecnico, resolvio_ticket)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_articulo, id_ticket) DO UPDATE SET
       resolvio_ticket = EXCLUDED.resolvio_ticket,
       id_tecnico = EXCLUDED.id_tecnico,
       fecha_vinculo = now()
     RETURNING *`,
    [idArticulo, idTicket, contexto.idUsuario, resolvioTicket]
  );

  await query(
    "UPDATE articulo_conocimiento SET veces_utilizado_en_tickets = veces_utilizado_en_tickets + 1 WHERE id_articulo = $1",
    [idArticulo]
  );

  return { mensaje: "Artículo vinculado al ticket en sesión de soporte (Solve Loop).", vinculo: row };
}

export async function listarArticulosVinculadosTicket(idTicket: number) {
  return query(
    `SELECT v.id_vinculo, v.id_articulo, a.codigo_articulo, a.titulo, a.tipo_plantilla, 
            v.resolvio_ticket, v.fecha_vinculo, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
     FROM articulo_conocimiento_vinculo_ticket v
     JOIN articulo_conocimiento a ON v.id_articulo = a.id_articulo
     JOIN usuario u ON v.id_tecnico = u.id_usuario
     WHERE v.id_ticket = $1
     ORDER BY v.fecha_vinculo DESC`,
    [idTicket]
  );
}

export async function registrarBusquedaLog(
  termino: string,
  resultados: number,
  idArticuloClicado: number | null,
  deflexion: boolean,
  contexto: ContextoConocimiento,
  origen: string = "PORTAL"
) {
  return queryRow(
    `INSERT INTO busqueda_conocimiento_log (termino_busqueda, resultados_encontrados, id_articulo_clicado, deflexion_exitosa, id_usuario, id_perfil, origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [termino.trim(), resultados, idArticuloClicado || null, deflexion, contexto.idUsuario || null, contexto.idPerfil || null, origen]
  );
}

export async function marcarDeflexionExitosa(idLog: number, idArticulo: number, contexto: ContextoConocimiento) {
  return query(
    `UPDATE busqueda_conocimiento_log 
     SET deflexion_exitosa = true, id_articulo_clicado = $1 
     WHERE id_log = $2`,
    [idArticulo, idLog]
  );
}

export async function listarPlantillasKcs() {
  return query(
    "SELECT id_plantilla, codigo, nombre, descripcion, icono, estructura_markdown, campos_obligatorios, activo FROM articulo_plantilla WHERE activo = true ORDER BY id_plantilla ASC"
  );
}

export async function obtenerMetricasKcsDashboard() {
  const totalArticulosRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM articulo_conocimiento WHERE estado_registro = true AND estado_editorial = 'PUBLICADO'"
  );
  const totalRevisionesRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM articulo_conocimiento WHERE estado_registro = true AND estado_editorial = 'EN_REVISION'"
  );
  const totalBusquedasRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM busqueda_conocimiento_log"
  );
  const totalDeflexionesRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM busqueda_conocimiento_log WHERE deflexion_exitosa = true"
  );
  const totalReusosRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM articulo_conocimiento_vinculo_ticket"
  );

  const totalBusquedas = parseInt(totalBusquedasRow?.c || "0", 10);
  const totalDeflexiones = parseInt(totalDeflexionesRow?.c || "0", 10);
  const tasaDeflexion = totalBusquedas > 0 ? Math.round((totalDeflexiones / totalBusquedas) * 100) : 0;

  const topArticulos = await query(
    `SELECT id_articulo, codigo_articulo, titulo, visitas, utilidad_positiva, utilidad_negativa, veces_utilizado_en_tickets
     FROM articulo_conocimiento 
     WHERE estado_registro = true AND estado_editorial = 'PUBLICADO'
     ORDER BY veces_utilizado_en_tickets DESC, utilidad_positiva DESC 
     LIMIT 5`
  );

  const gapsBusqueda = await query(
    `SELECT termino_busqueda, COUNT(*) as repeticiones, MAX(fecha) as ultima_fecha
     FROM busqueda_conocimiento_log
     WHERE resultados_encontrados = 0
     GROUP BY termino_busqueda
     ORDER BY repeticiones DESC
     LIMIT 5`
  );

  return {
    totalArticulos: parseInt(totalArticulosRow?.c || "0", 10),
    articulosEnRevision: parseInt(totalRevisionesRow?.c || "0", 10),
    totalBusquedas,
    totalDeflexiones,
    tasaDeflexionPct: tasaDeflexion,
    totalReusoTickets: parseInt(totalReusosRow?.c || "0", 10),
    topArticulos,
    gapsBusqueda,
  };
}
