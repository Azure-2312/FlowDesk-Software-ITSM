import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Servicio del portal del Gestor de Activos y Configuración (perfil 9): panel,
 * importación masiva, recepción, asignaciones, mantenimiento, bajas, inventario
 * físico (campañas) y reportes de activos.
 */

/** Días de anticipación con que se alerta el vencimiento de garantías. */
export const DIAS_AVISO_GARANTIA = 30;

export async function obtenerPanelActivos() {
  const [garantias, sobreuso, inexactitudes, campanas, actas, totalActivos] = await Promise.all([
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM activo
       WHERE estado_registro = true AND fecha_fin_garantia IS NOT NULL
         AND fecha_fin_garantia BETWEEN CURRENT_DATE AND CURRENT_DATE + ($1 || ' days')::interval`,
      [DIAS_AVISO_GARANTIA]
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM licencia_software
       WHERE estado_registro = true AND cantidad_en_uso > cantidad_adquirida`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cmdb_inexactitud WHERE estado_registro = true AND estado <> 'RESUELTA'`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM campana_inventario WHERE estado_registro = true AND estado = 'ABIERTA'`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM solicitud_baja_activo WHERE estado_registro = true AND estado = 'APROBADA' AND acta IS NULL`
    ),
    queryRow<{ c: number }>(`SELECT COUNT(*)::int AS c FROM activo WHERE estado_registro = true`),
  ]);

  const garantiasPorVencer = await query(
    `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.fecha_fin_garantia,
            (a.fecha_fin_garantia - CURRENT_DATE) AS dias_restantes
     FROM activo a
     WHERE a.estado_registro = true AND a.fecha_fin_garantia IS NOT NULL
       AND a.fecha_fin_garantia <= CURRENT_DATE + ($1 || ' days')::interval
     ORDER BY a.fecha_fin_garantia ASC LIMIT 10`,
    [DIAS_AVISO_GARANTIA]
  );

  const campanasActivas = await query(
    `SELECT c.id_campana, c.codigo, c.nombre, c.alcance, c.fecha_fin, c.estado,
            (SELECT COUNT(*)::int FROM campana_inventario_item i WHERE i.id_campana = c.id_campana AND i.estado_registro = true) AS items,
            (SELECT COUNT(*)::int FROM campana_inventario_item i WHERE i.id_campana = c.id_campana AND i.estado_registro = true AND i.estado_verificacion <> 'PENDIENTE') AS verificados
     FROM campana_inventario c
     WHERE c.estado_registro = true AND c.estado = 'ABIERTA'
     ORDER BY c.fecha_fin ASC`
  );

  return {
    kpis: {
      total_activos: totalActivos?.c ?? 0,
      garantias_por_vencer: garantias?.c ?? 0,
      sobreuso_licencias: sobreuso?.c ?? 0,
      inexactitudes_abiertas: inexactitudes?.c ?? 0,
      campanas_activas: campanas?.c ?? 0,
      actas_pendientes: actas?.c ?? 0,
    },
    garantiasPorVencer,
    campanasActivas,
  };
}

// ---------------------------------------------------------------------------
// Importación masiva
// ---------------------------------------------------------------------------

export async function listarImportaciones() {
  return query(
    `SELECT i.id_importacion, i.nombre_archivo, i.total_filas, i.filas_validas, i.filas_invalidas,
            i.estado, i.fecha_creacion, i.fecha_aplicacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM importacion_activos i
     LEFT JOIN usuario u ON u.id_usuario = i.id_usuario
     WHERE i.estado_registro = true
     ORDER BY i.fecha_creacion DESC`
  );
}

export async function validarImportacion(idUsuario: number, body: any) {
  const filas = Array.isArray(body.filas) ? body.filas : [];
  if (filas.length === 0) throw new ErrorDominio("Debes enviar al menos una fila para validar.");
  if (filas.length > 2000) throw new ErrorDominio("El lote supera el máximo de 2000 filas.");

  const validas: any[] = [];
  const invalidas: { fila: number; motivo: string }[] = [];

  for (let i = 0; i < filas.length; i++) {
    const f = filas[i] ?? {};
    const errores: string[] = [];
    const codigo = String(f.codigo_patrimonial ?? "").trim();
    if (!codigo) errores.push("codigo_patrimonial vacío");
    if (!String(f.tipo_activo ?? "").trim()) errores.push("tipo_activo vacío");
    if (!String(f.marca ?? "").trim()) errores.push("marca vacía");
    if (!String(f.modelo ?? "").trim()) errores.push("modelo vacío");
    if (errores.length) {
      invalidas.push({ fila: i + 1, motivo: errores.join(", ") });
      continue;
    }
    validas.push({
      codigo_patrimonial: codigo,
      numero_serie: f.numero_serie ?? null,
      tipo_activo: String(f.tipo_activo).trim().toUpperCase(),
      marca: String(f.marca).trim(),
      modelo: String(f.modelo).trim(),
      id_departamento: f.id_departamento ? Number(f.id_departamento) : null,
      fecha_adquisicion: f.fecha_adquisicion ?? null,
      fecha_fin_garantia: f.fecha_fin_garantia ?? null,
      costo_compra: f.costo_compra !== undefined && f.costo_compra !== "" ? Number(f.costo_compra) : null,
    });
  }

  const fila = await queryRow<any>(
    `INSERT INTO importacion_activos (nombre_archivo, total_filas, filas_validas, filas_invalidas, estado, detalle, id_usuario)
     VALUES ($1, $2, $3, $4, 'VALIDADO', $5, $6)
     RETURNING id_importacion, estado`,
    [
      body.nombre_archivo ?? "lote.csv",
      filas.length,
      validas.length,
      invalidas.length,
      JSON.stringify({ validas, invalidas }),
      idUsuario,
    ]
  );
  return {
    mensaje: `Validación en seco completada: ${validas.length} válidas y ${invalidas.length} con error.`,
    importacion: fila,
    validas: validas.length,
    invalidas,
  };
}

export async function aplicarImportacion(idUsuario: number, idImportacion: number) {
  const imp = await queryRow<{ estado: string; detalle: any }>(
    `SELECT estado, detalle FROM importacion_activos WHERE id_importacion = $1 AND estado_registro = true`,
    [idImportacion]
  );
  if (!imp) throw new ErrorDominio("La importación no existe.", 404);
  if (imp.estado !== "VALIDADO") throw new ErrorDominio("Solo se aplican importaciones validadas.", 409);

  const validas: any[] = Array.isArray(imp.detalle?.validas) ? imp.detalle.validas : [];
  const insertados: number[] = [];
  for (const v of validas) {
    const fila = await queryRow<{ id_activo: number }>(
      `INSERT INTO activo (codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_departamento,
                           estado_activo, fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, 'EN_STOCK', $7, $8, $9, $10)
       ON CONFLICT (codigo_patrimonial) DO NOTHING
       RETURNING id_activo`,
      [v.codigo_patrimonial, v.numero_serie, v.tipo_activo, v.marca, v.modelo, v.id_departamento,
       v.fecha_adquisicion, v.fecha_fin_garantia, v.costo_compra, idUsuario]
    );
    if (fila) insertados.push(fila.id_activo);
  }

  await query(
    `UPDATE importacion_activos
     SET estado = 'APLICADO', fecha_aplicacion = now(),
         detalle = jsonb_set(COALESCE(detalle, '{}'::jsonb), '{insertados}', $1::jsonb)
     WHERE id_importacion = $2`,
    [JSON.stringify(insertados), idImportacion]
  );
  return { mensaje: `Importación aplicada: ${insertados.length} activos creados.`, insertados: insertados.length };
}

export async function revertirImportacion(idUsuario: number, idImportacion: number) {
  const imp = await queryRow<{ estado: string; detalle: any }>(
    `SELECT estado, detalle FROM importacion_activos WHERE id_importacion = $1 AND estado_registro = true`,
    [idImportacion]
  );
  if (!imp) throw new ErrorDominio("La importación no existe.", 404);
  if (imp.estado !== "APLICADO") throw new ErrorDominio("Solo se revierten importaciones aplicadas.", 409);

  const insertados: number[] = Array.isArray(imp.detalle?.insertados) ? imp.detalle.insertados : [];
  if (insertados.length > 0) {
    await query(
      `UPDATE activo SET estado_registro = false, usuario_modificacion = $1, fecha_modificacion = now()
       WHERE id_activo = ANY($2::int[])`,
      [idUsuario, insertados]
    );
  }
  await query(`UPDATE importacion_activos SET estado = 'REVERTIDO' WHERE id_importacion = $1`, [idImportacion]);
  return { mensaje: `Importación revertida: ${insertados.length} activos desactivados.` };
}

// ---------------------------------------------------------------------------
// Recepción de adquisiciones
// ---------------------------------------------------------------------------

export async function listarRecepciones() {
  const [recepciones, proveedores] = await Promise.all([
    query(
      `SELECT r.id_recepcion, r.codigo, r.documento, r.fecha_recepcion, r.total_items, r.estado,
              p.nombre AS proveedor_nombre,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
       FROM recepcion_activo r
       LEFT JOIN proveedor_ti p ON p.id_proveedor = r.id_proveedor
       LEFT JOIN usuario u ON u.id_usuario = r.id_usuario
       WHERE r.estado_registro = true
       ORDER BY r.fecha_creacion DESC`
    ),
    query(`SELECT id_proveedor, nombre FROM proveedor_ti WHERE estado_registro = true ORDER BY nombre`),
  ]);
  return { recepciones, proveedores };
}

export async function crearRecepcion(idUsuario: number, body: any) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) throw new ErrorDominio("Debes registrar al menos un equipo recibido.");

  const codigo = `REC-${Date.now()}`;
  let total = 0;
  for (const it of items) {
    if (!it.tipo_activo || !it.marca || !it.modelo) continue;
    await query(
      `INSERT INTO activo (codigo_patrimonial, numero_serie, tipo_activo, marca, modelo, id_departamento,
                           estado_activo, fecha_adquisicion, fecha_fin_garantia, costo_compra, usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, 'EN_STOCK', CURRENT_DATE, $7, $8, $9)`,
      [
        String(it.codigo_patrimonial ?? `REC-${Date.now()}-${total + 1}`),
        it.numero_serie ?? null,
        String(it.tipo_activo).toUpperCase(),
        it.marca,
        it.modelo,
        it.id_departamento ? Number(it.id_departamento) : null,
        it.fecha_fin_garantia ?? null,
        it.costo_compra ? Number(it.costo_compra) : null,
        idUsuario,
      ]
    );
    total++;
  }
  if (total === 0) throw new ErrorDominio("Ningún ítem tenía tipo, marca y modelo completos.");

  const fila = await queryRow<any>(
    `INSERT INTO recepcion_activo (codigo, id_proveedor, documento, id_solicitud_origen, fecha_recepcion, total_items, id_usuario, detalle)
     VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7)
     RETURNING id_recepcion, codigo, total_items, estado`,
    [
      codigo,
      body.id_proveedor ? Number(body.id_proveedor) : null,
      body.documento ?? null,
      body.id_solicitud_origen ? Number(body.id_solicitud_origen) : null,
      total,
      idUsuario,
      JSON.stringify({ items }),
    ]
  );
  return { mensaje: `Recepción registrada con ${total} activos en stock.`, recepcion: fila };
}

// ---------------------------------------------------------------------------
// Asignación, custodia y actas
// ---------------------------------------------------------------------------

export async function listarAsignaciones() {
  const [activos, usuarios, departamentos] = await Promise.all([
    query(
      `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.estado_activo,
              a.id_departamento,
              d.nombre AS departamento_nombre,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS custodio_nombre
       FROM activo a
       LEFT JOIN departamento_ti d ON d.id_departamento = a.id_departamento
       LEFT JOIN usuario u ON u.id_usuario = a.id_usuario_custodio
       WHERE a.estado_registro = true
       ORDER BY a.codigo_patrimonial`
    ),
    query(
      `SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre
       FROM usuario u WHERE u.estado_registro = true ORDER BY u.apellido_paterno, u.nombres`
    ),
    query(`SELECT id_departamento, nombre FROM departamento_ti WHERE estado_registro = true ORDER BY nombre`),
  ]);
  return { activos, usuarios, departamentos };
}

export async function registrarMovimientoActivo(idUsuario: number, body: any) {
  const idActivo = Number(body.id_activo);
  const accion = String(body.accion || "ASIGNAR").toUpperCase();
  if (!idActivo) throw new ErrorDominio("Debes indicar el activo.");
  if (!["ASIGNAR", "TRANSFERIR", "DEVOLVER"].includes(accion)) {
    throw new ErrorDominio("Acción no válida. Usa ASIGNAR, TRANSFERIR o DEVOLVER.");
  }

  const activo = await queryRow<any>(
    `SELECT id_activo, estado_activo, id_usuario_custodio FROM activo WHERE id_activo = $1 AND estado_registro = true`,
    [idActivo]
  );
  if (!activo) throw new ErrorDominio("El activo no existe.", 404);

  if (accion === "DEVOLVER") {
    await query(
      `UPDATE activo SET id_usuario_custodio = NULL, estado_activo = 'EN_STOCK', fecha_modificacion = now(), usuario_modificacion = $2
       WHERE id_activo = $1`,
      [idActivo, idUsuario]
    );
    await query(
      `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario)
       VALUES ($1, $2, 'EN_STOCK', $3, NULL, $4, $5)`,
      [idActivo, activo.estado_activo, activo.id_usuario_custodio, body.motivo ?? "Devolución de custodia", idUsuario]
    );
    return { mensaje: "Activo devuelto a stock." };
  }

  const idCustodio = Number(body.id_usuario_custodio);
  if (!idCustodio) throw new ErrorDominio("Debes indicar el custodio.");
  const vMotivo = validarTexto(body.motivo, 5, 2000, "El motivo del acta", true);
  if (!vMotivo.valido) throw new ErrorDominio(vMotivo.mensaje!);

  await query(
    `UPDATE activo
     SET id_usuario_custodio = $1, id_departamento = COALESCE($2, id_departamento), estado_activo = 'EN_OPERACION',
         fecha_modificacion = now(), usuario_modificacion = $3
     WHERE id_activo = $4`,
    [idCustodio, body.id_departamento ? Number(body.id_departamento) : null, idUsuario, idActivo]
  );
  await query(
    `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario)
     VALUES ($1, $2, 'EN_OPERACION', $3, $4, $5, $6)`,
    [idActivo, activo.estado_activo, activo.id_usuario_custodio, idCustodio, String(body.motivo).trim(), idUsuario]
  );
  return { mensaje: accion === "TRANSFERIR" ? "Custodia transferida." : "Activo asignado con acta registrada." };
}

// ---------------------------------------------------------------------------
// Mantenimiento y garantías
// ---------------------------------------------------------------------------

export async function listarMantenimiento() {
  const [mantenimientos, activos, garantias] = await Promise.all([
    query(
      `SELECT m.id_mantenimiento, m.tipo, m.descripcion, m.proveedor, m.fecha_programada, m.fecha_ejecucion,
              m.costo, m.estado, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable_nombre
       FROM mantenimiento_activo m
       JOIN activo a ON a.id_activo = m.id_activo
       LEFT JOIN usuario u ON u.id_usuario = m.id_usuario_responsable
       WHERE m.estado_registro = true
       ORDER BY (m.estado = 'PROGRAMADO') DESC, m.fecha_programada ASC NULLS LAST`
    ),
    query(`SELECT id_activo, codigo_patrimonial, tipo_activo, marca, modelo FROM activo WHERE estado_registro = true ORDER BY codigo_patrimonial`),
    query(
      `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.fecha_fin_garantia,
              (a.fecha_fin_garantia - CURRENT_DATE) AS dias_restantes
       FROM activo a
       WHERE a.estado_registro = true AND a.fecha_fin_garantia IS NOT NULL
         AND a.fecha_fin_garantia <= CURRENT_DATE + ($1 || ' days')::interval
       ORDER BY a.fecha_fin_garantia ASC`,
      [DIAS_AVISO_GARANTIA]
    ),
  ]);
  return { mantenimientos, activos, garantias };
}

export async function crearMantenimiento(idUsuario: number, body: any) {
  const idActivo = Number(body.id_activo);
  if (!idActivo) throw new ErrorDominio("Debes indicar el activo.");
  const tipo = String(body.tipo || "PREVENTIVO").toUpperCase();
  if (!["PREVENTIVO", "CORRECTIVO"].includes(tipo)) throw new ErrorDominio("Tipo de mantenimiento no válido.");
  const vDesc = validarTexto(body.descripcion, 5, 2000, "La descripción del mantenimiento", true);
  if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);

  const activo = await queryRow<{ id_activo: number }>(
    `SELECT id_activo FROM activo WHERE id_activo = $1 AND estado_registro = true`,
    [idActivo]
  );
  if (!activo) throw new ErrorDominio("El activo no existe.", 404);

  const fila = await queryRow<any>(
    `INSERT INTO mantenimiento_activo (id_activo, tipo, descripcion, proveedor, fecha_programada, costo, id_usuario_responsable, usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING id_mantenimiento, estado`,
    [
      idActivo, tipo, String(body.descripcion).trim(), body.proveedor ?? null,
      body.fecha_programada ?? null, body.costo ? Number(body.costo) : null,
      body.id_usuario_responsable ? Number(body.id_usuario_responsable) : idUsuario,
    ]
  );
  return { mensaje: "Mantenimiento programado.", mantenimiento: fila };
}

export async function actualizarMantenimiento(idUsuario: number, body: any) {
  const idMantenimiento = Number(body.id_mantenimiento);
  if (!idMantenimiento) throw new ErrorDominio("Falta el identificador del mantenimiento.");
  const estado = body.estado ? String(body.estado).toUpperCase() : null;
  if (estado && !["PROGRAMADO", "EN_PROCESO", "COMPLETADO", "CANCELADO"].includes(estado)) {
    throw new ErrorDominio("Estado de mantenimiento no válido.");
  }

  const fila = await queryRow<any>(
    `UPDATE mantenimiento_activo
     SET estado = COALESCE($1, estado),
         fecha_ejecucion = COALESCE($2, fecha_ejecucion),
         costo = COALESCE($3, costo)
     WHERE id_mantenimiento = $4 AND estado_registro = true
     RETURNING id_mantenimiento, estado`,
    [estado, body.fecha_ejecucion ?? null, body.costo !== undefined && body.costo !== "" ? Number(body.costo) : null, idMantenimiento]
  );
  if (!fila) throw new ErrorDominio("El mantenimiento no existe.", 404);
  return { mensaje: "Mantenimiento actualizado.", mantenimiento: fila };
}

// ---------------------------------------------------------------------------
// Bajas y disposición
// ---------------------------------------------------------------------------

export async function listarBajas() {
  return query(
    `SELECT s.id_solicitud, s.motivo, s.estado, s.fecha_solicitud, s.comentario_resolucion,
            s.destino_final, s.borrado_seguro, s.acta, s.fecha_disposicion,
            a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM solicitud_baja_activo s
     JOIN activo a ON a.id_activo = s.id_activo
     LEFT JOIN usuario u ON u.id_usuario = s.id_usuario_solicita
     WHERE s.estado_registro = true
     ORDER BY (s.estado = 'PENDIENTE') DESC, s.fecha_solicitud DESC`
  );
}

export async function resolverBaja(idUsuario: number, idSolicitud: number, decision: string, comentario?: string) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBAR", "RECHAZAR"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBAR o RECHAZAR.");
  const estado = normalizada === "APROBAR" ? "APROBADA" : "RECHAZADA";
  const fila = await queryRow<any>(
    `UPDATE solicitud_baja_activo
     SET estado = $2, id_usuario_resuelve = $3, comentario_resolucion = $4, fecha_resolucion = now()
     WHERE id_solicitud = $1 AND estado = 'PENDIENTE'
     RETURNING id_solicitud, id_activo, estado`,
    [idSolicitud, estado, idUsuario, comentario ?? null]
  );
  if (!fila) throw new ErrorDominio("La solicitud no existe o ya fue resuelta.", 404);

  if (estado === "APROBADA") {
    await query(
      `UPDATE activo SET estado_activo = 'BAJA', fecha_modificacion = now(), usuario_modificacion = $2
       WHERE id_activo = $1 AND estado_registro = true`,
      [fila.id_activo, idUsuario]
    );
  }
  return { mensaje: `Solicitud ${estado.toLowerCase()}.`, solicitud: fila };
}

export async function registrarDisposicion(idUsuario: number, body: any) {
  const idSolicitud = Number(body.id_solicitud);
  if (!idSolicitud) throw new ErrorDominio("Falta el identificador de la solicitud.");
  const destino = String(body.destino_final || "").toUpperCase();
  if (!["REVENTA", "DONACION", "RECICLAJE", "DESTRUCCION"].includes(destino)) {
    throw new ErrorDominio("El destino final debe ser REVENTA, DONACION, RECICLAJE o DESTRUCCION.");
  }
  const vActa = validarTexto(body.acta, 5, 4000, "El acta de disposición", true);
  if (!vActa.valido) throw new ErrorDominio(vActa.mensaje!);

  const fila = await queryRow<any>(
    `UPDATE solicitud_baja_activo
     SET destino_final = $1, borrado_seguro = $2, acta = $3, fecha_disposicion = now()
     WHERE id_solicitud = $4 AND estado = 'APROBADA' AND estado_registro = true
     RETURNING id_solicitud, destino_final, borrado_seguro`,
    [destino, Boolean(body.borrado_seguro), String(body.acta).trim(), idSolicitud]
  );
  if (!fila) throw new ErrorDominio("La solicitud debe estar aprobada para registrar la disposición.", 409);
  return { mensaje: "Disposición final registrada con acta.", solicitud: fila };
}

// ---------------------------------------------------------------------------
// Inventario físico (campañas)
// ---------------------------------------------------------------------------

export async function listarCampanas() {
  const [campanas, activos, usuarios] = await Promise.all([
    query(
      `SELECT c.id_campana, c.codigo, c.nombre, c.descripcion, c.alcance, c.fecha_inicio, c.fecha_fin, c.estado,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable_nombre,
              (SELECT COUNT(*)::int FROM campana_inventario_item i WHERE i.id_campana = c.id_campana AND i.estado_registro = true) AS items,
              (SELECT COUNT(*)::int FROM campana_inventario_item i WHERE i.id_campana = c.id_campana AND i.estado_registro = true AND i.estado_verificacion = 'PENDIENTE') AS pendientes,
              (SELECT COUNT(*)::int FROM campana_inventario_item i WHERE i.id_campana = c.id_campana AND i.estado_registro = true AND i.estado_verificacion = 'DISCREPANCIA') AS discrepancias
       FROM campana_inventario c
       LEFT JOIN usuario u ON u.id_usuario = c.id_responsable
       WHERE c.estado_registro = true
       ORDER BY (c.estado = 'ABIERTA') DESC, c.fecha_creacion DESC`
    ),
    query(
      `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
              d.nombre AS departamento_nombre
       FROM activo a LEFT JOIN departamento_ti d ON d.id_departamento = a.id_departamento
       WHERE a.estado_registro = true ORDER BY a.codigo_patrimonial`
    ),
    query(`SELECT id_usuario, CONCAT(nombres, ' ', apellido_paterno) AS nombre FROM usuario WHERE estado_registro = true ORDER BY apellido_paterno`),
  ]);
  return { campanas, activos, usuarios };
}

export async function crearCampana(idUsuario: number, body: any) {
  const vNombre = validarTexto(body.nombre, 5, 200, "El nombre de la campaña", true);
  if (!vNombre.valido) throw new ErrorDominio(vNombre.mensaje!);
  const idActivos = Array.isArray(body.activos) ? body.activos.map(Number).filter(Boolean) : [];
  if (idActivos.length === 0) throw new ErrorDominio("Selecciona al menos un activo para la campaña.");

  const codigo = `INV-${Date.now()}`;
  const campana = await queryRow<any>(
    `INSERT INTO campana_inventario (codigo, nombre, descripcion, alcance, fecha_inicio, fecha_fin, id_responsable, usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
     RETURNING id_campana, codigo, nombre, estado`,
    [
      codigo, String(body.nombre).trim(), body.descripcion ?? null, body.alcance ?? null,
      body.fecha_inicio ?? null, body.fecha_fin ?? null,
      body.id_responsable ? Number(body.id_responsable) : idUsuario,
    ]
  );
  for (const idActivo of idActivos) {
    await query(
      `INSERT INTO campana_inventario_item (id_campana, id_activo) VALUES ($1, $2)`,
      [campana.id_campana, idActivo]
    );
  }
  return { mensaje: `Campaña creada con ${idActivos.length} activos.`, campana };
}

export async function detalleCampana(idCampana: number) {
  const campana = await queryRow<any>(
    `SELECT id_campana, codigo, nombre, estado FROM campana_inventario WHERE id_campana = $1 AND estado_registro = true`,
    [idCampana]
  );
  if (!campana) throw new ErrorDominio("La campaña no existe.", 404);
  const items = await query(
    `SELECT i.id_item, i.estado_verificacion, i.fecha_verificacion, i.observacion,
            a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            d.nombre AS departamento_nombre
     FROM campana_inventario_item i
     JOIN activo a ON a.id_activo = i.id_activo
     LEFT JOIN departamento_ti d ON d.id_departamento = a.id_departamento
     WHERE i.id_campana = $1 AND i.estado_registro = true
     ORDER BY i.estado_verificacion, a.codigo_patrimonial`,
    [idCampana]
  );
  return { campana, items };
}

export async function cerrarCampana(idUsuario: number, idCampana: number) {
  const fila = await queryRow<any>(
    `UPDATE campana_inventario SET estado = 'CERRADA' WHERE id_campana = $1 AND estado = 'ABIERTA' AND estado_registro = true
     RETURNING id_campana, codigo, estado`,
    [idCampana]
  );
  if (!fila) throw new ErrorDominio("La campaña no existe o ya está cerrada.", 409);
  return { mensaje: "Campaña cerrada con acta.", campana: fila };
}

// ---------------------------------------------------------------------------
// Reportes de activos
// ---------------------------------------------------------------------------

export async function obtenerReportesActivos() {
  const resumen = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE estado_activo = 'EN_OPERACION')::int AS en_operacion,
       COUNT(*) FILTER (WHERE estado_activo = 'EN_STOCK')::int AS en_stock,
       COUNT(*) FILTER (WHERE estado_activo = 'EN_REPARACION')::int AS en_reparacion,
       COUNT(*) FILTER (WHERE estado_activo = 'BAJA')::int AS en_baja,
       COALESCE(SUM(costo_compra), 0)::numeric AS costo_total
     FROM activo WHERE estado_registro = true`
  );

  const porTipo = await query(
    `SELECT tipo_activo, COUNT(*)::int AS total, COALESCE(SUM(costo_compra), 0)::numeric AS costo
     FROM activo WHERE estado_registro = true GROUP BY tipo_activo ORDER BY total DESC`
  );

  const antiguedad = await query(
    `SELECT CASE
              WHEN fecha_adquisicion IS NULL THEN 'Sin dato'
              WHEN fecha_adquisicion > CURRENT_DATE - INTERVAL '1 year' THEN 'Menos de 1 año'
              WHEN fecha_adquisicion > CURRENT_DATE - INTERVAL '3 years' THEN '1 a 3 años'
              WHEN fecha_adquisicion > CURRENT_DATE - INTERVAL '5 years' THEN '3 a 5 años'
              ELSE 'Más de 5 años'
            END AS rango,
            COUNT(*)::int AS total
     FROM activo WHERE estado_registro = true GROUP BY 1 ORDER BY 1`
  );

  const garantias = await queryRow<any>(
    `SELECT
       COUNT(*) FILTER (WHERE fecha_fin_garantia IS NOT NULL AND fecha_fin_garantia >= CURRENT_DATE)::int AS vigentes,
       COUNT(*) FILTER (WHERE fecha_fin_garantia IS NOT NULL AND fecha_fin_garantia < CURRENT_DATE)::int AS vencidas,
       COUNT(*) FILTER (WHERE fecha_fin_garantia IS NULL)::int AS sin_dato
     FROM activo WHERE estado_registro = true`
  );

  const exactitud = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total_ci,
       COUNT(*) FILTER (WHERE ip_principal IS NULL OR version_software IS NULL)::int AS incompletos,
       (SELECT COUNT(*)::int FROM elemento_configuracion c
        WHERE c.estado_registro = true
          AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = c.id_ci OR r.id_ci_hijo = c.id_ci))::int AS sin_relaciones,
       (SELECT COUNT(*)::int FROM cmdb_inexactitud i WHERE i.estado_registro = true AND i.estado <> 'RESUELTA')::int AS inexactitudes
     FROM elemento_configuracion WHERE estado_registro = true`
  );

  const totalCi = exactitud?.total_ci ?? 0;
  const incompletos = exactitud?.incompletos ?? 0;

  return {
    resumen: {
      total: resumen?.total ?? 0,
      en_operacion: resumen?.en_operacion ?? 0,
      en_stock: resumen?.en_stock ?? 0,
      en_reparacion: resumen?.en_reparacion ?? 0,
      en_baja: resumen?.en_baja ?? 0,
      costo_total: Number(resumen?.costo_total ?? 0),
    },
    porTipo,
    antiguedad,
    garantias: {
      vigentes: garantias?.vigentes ?? 0,
      vencidas: garantias?.vencidas ?? 0,
      sin_dato: garantias?.sin_dato ?? 0,
    },
    exactitud: {
      total_ci: totalCi,
      incompletos,
      sin_relaciones: exactitud?.sin_relaciones ?? 0,
      inexactitudes: exactitud?.inexactitudes ?? 0,
      cumplimiento: totalCi > 0 ? Math.round(((totalCi - incompletos) / totalCi) * 100) : null,
    },
  };
}
