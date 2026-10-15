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
        c.nombre,
        c.descripcion,
        c.codigo_corto,
        c.estado_registro,
        COUNT(a.id_articulo) as total_articulos
      FROM categoria_ticket c
      LEFT JOIN articulo_conocimiento a ON a.id_categoria = c.id_categoria AND a.estado_registro = true
      GROUP BY c.id_categoria, c.nombre, c.descripcion, c.codigo_corto, c.estado_registro
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
  const { id_categoria, nombre, descripcion, estado_registro } = body;

  if (!id_categoria) {
    throw new ErrorDominio("ID de categoría requerido.");
  }

  const actualizada = await queryRow(
    `UPDATE categoria_ticket SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        estado_registro = COALESCE($3, estado_registro)
      WHERE id_categoria = $4
      RETURNING *`,
    [
      nombre?.trim() || null,
      descripcion?.trim() || null,
      estado_registro !== undefined ? Boolean(estado_registro) : null,
      Number(id_categoria),
    ]
  );

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "CONOCIMIENTO",
      "ACTUALIZAR_CATEGORIA_CONOCIMIENTO",
      `El usuario ${contexto.nombres} actualizó la categoría de conocimiento #${id_categoria} (${(actualizada as any)?.nombre}).`,
      JSON.stringify({ id_categoria, nombre, estado_registro }),
      contexto.ip,
    ]
  );

  return actualizada;
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

  return { articulo, historial };
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
    "SELECT id_perfil, nombre, codigo FROM perfiles WHERE estado_registro = true ORDER BY id_perfil ASC"
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
    `INSERT INTO configuracion_sistema (clave, valor, fecha_modificacion, usuario_modificacion)
       VALUES ($1, $2, now(), $3)
       ON CONFLICT (clave) DO UPDATE SET
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
