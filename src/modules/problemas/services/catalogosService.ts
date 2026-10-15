import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export async function listarCatalogosProblemas(catalogo?: string | null) {
  if (catalogo === "categorias" || !catalogo) {
    const categorias = await query<any>(`
      SELECT c.*, p.nombre as padre_nombre, dep.nombre as departamento_nombre,
             s.nombre as servicio_nombre,
             (SELECT COUNT(*) FROM problema prob WHERE prob.id_categoria = c.id_categoria) as usos_tickets
      FROM problema_categoria c
      LEFT JOIN problema_categoria p ON p.id_categoria = c.id_padre
      LEFT JOIN departamento_ti dep ON dep.id_departamento = c.id_departamento_defecto
      LEFT JOIN servicio_catalogo s ON s.id_servicio = c.id_servicio_defecto
      ORDER BY c.orden, c.id_categoria
    `);
    if (catalogo === "categorias") return { ok: true, categorias };
  }

  if (catalogo === "origenes" || !catalogo) {
    const origenes = await query<any>(`
      SELECT o.*,
             (SELECT COUNT(*) FROM problema prob WHERE prob.origen = o.codigo) as usos_tickets
      FROM problema_origen o
      ORDER BY o.orden, o.id_origen
    `);
    if (catalogo === "origenes") return { ok: true, origenes };
  }

  if (catalogo === "causas_raiz" || !catalogo) {
    const causas_raiz = await query<any>(`
      SELECT cr.*,
             (SELECT COUNT(*) FROM problema prob WHERE prob.metodo_analisis = cr.codigo) as usos_tickets
      FROM problema_causa_raiz_categoria cr
      ORDER BY cr.orden, cr.id_causa_categoria
    `);
    if (catalogo === "causas_raiz") return { ok: true, causas_raiz };
  }

  if (catalogo === "codigos_cierre" || !catalogo) {
    const codigos_cierre = await query<any>(`
      SELECT cc.*,
             (SELECT COUNT(*) FROM problema prob WHERE prob.codigo_problema = cc.codigo) as usos_tickets
      FROM problema_codigo_cierre cc
      ORDER BY cc.orden, cc.id_codigo_cierre
    `);
    if (catalogo === "codigos_cierre") return { ok: true, codigos_cierre };
  }

  if (catalogo === "metodos_analisis" || !catalogo) {
    const metodos_analisis = await query<any>(`
      SELECT ma.*,
             (SELECT COUNT(*) FROM problema prob WHERE prob.metodo_analisis = ma.codigo) as usos_tickets
      FROM problema_metodo_analisis ma
      ORDER BY ma.orden, ma.id_metodo
    `);
    if (catalogo === "metodos_analisis") return { ok: true, metodos_analisis };
  }

  if (catalogo === "motivos_espera" || !catalogo) {
    const motivos_espera = await query<any>(`
      SELECT me.*, 0 as usos_tickets
      FROM problema_motivo_espera me
      ORDER BY me.orden, me.id_motivo_espera
    `);
    if (catalogo === "motivos_espera") return { ok: true, motivos_espera };
  }

  if (catalogo === "motivos_cancelacion" || !catalogo) {
    const motivos_cancelacion = await query<any>(`
      SELECT mc.*, 0 as usos_tickets
      FROM problema_motivo_cancelacion mc
      ORDER BY mc.orden, mc.id_motivo_cancelacion
    `);
    if (catalogo === "motivos_cancelacion") return { ok: true, motivos_cancelacion };
  }

  const [
    categorias,
    origenes,
    causas_raiz,
    codigos_cierre,
    metodos_analisis,
    motivos_espera,
    motivos_cancelacion,
    departamentos,
    servicios,
  ] = await Promise.all([
    query<any>(`
      SELECT c.*, p.nombre as padre_nombre, dep.nombre as departamento_nombre,
             s.nombre as servicio_nombre,
             (SELECT COUNT(*) FROM problema prob WHERE prob.id_categoria = c.id_categoria) as usos_tickets
      FROM problema_categoria c
      LEFT JOIN problema_categoria p ON p.id_categoria = c.id_padre
      LEFT JOIN departamento_ti dep ON dep.id_departamento = c.id_departamento_defecto
      LEFT JOIN servicio_catalogo s ON s.id_servicio = c.id_servicio_defecto
      ORDER BY c.orden, c.id_categoria
    `),
    query<any>(`
      SELECT o.*,
             (SELECT COUNT(*) FROM problema prob WHERE prob.origen = o.codigo) as usos_tickets
      FROM problema_origen o
      ORDER BY o.orden, o.id_origen
    `),
    query<any>(`
      SELECT cr.*, 0 as usos_tickets
      FROM problema_causa_raiz_categoria cr
      ORDER BY cr.orden, cr.id_causa_categoria
    `),
    query<any>(`
      SELECT cc.*, 0 as usos_tickets
      FROM problema_codigo_cierre cc
      ORDER BY cc.orden, cc.id_codigo_cierre
    `),
    query<any>(`
      SELECT ma.*, 0 as usos_tickets
      FROM problema_metodo_analisis ma
      ORDER BY ma.orden, ma.id_metodo
    `),
    query<any>(`
      SELECT me.*, 0 as usos_tickets
      FROM problema_motivo_espera me
      ORDER BY me.orden, me.id_motivo_espera
    `),
    query<any>(`
      SELECT mc.*, 0 as usos_tickets
      FROM problema_motivo_cancelacion mc
      ORDER BY mc.orden, mc.id_motivo_cancelacion
    `),
    query<any>(
      `SELECT id_departamento, codigo, nombre FROM departamento_ti WHERE estado_registro = true ORDER BY nombre`
    ),
    query<any>(
      `SELECT id_servicio, codigo_servicio, nombre FROM servicio_catalogo WHERE estado_registro = true ORDER BY nombre`
    ),
  ]);

  return {
    ok: true,
    catalogos: {
      categorias,
      origenes,
      causas_raiz,
      codigos_cierre,
      metodos_analisis,
      motivos_espera,
      motivos_cancelacion,
    },
    referencias: {
      departamentos,
      servicios,
    },
  };
}

export async function fusionarValorCatalogo(body: any) {
  const { catalogo, id_origen, id_destino } = body;

  if (!id_origen || !id_destino || id_origen === id_destino) {
    throw new ErrorDominio("Debe seleccionar un valor de origen y uno de destino distintos.");
  }

  if (catalogo === "categorias") {
    await query(`UPDATE problema SET id_categoria = $1 WHERE id_categoria = $2`, [id_destino, id_origen]);
    await query(`UPDATE problema_categoria SET activo = false WHERE id_categoria = $1`, [id_origen]);
    return { ok: true, mensaje: "Categorías fusionadas exitosamente." };
  }

  throw new ErrorDominio("Fusión no soportada para este catálogo.");
}

export async function crearValorCatalogo(body: any) {
  const { catalogo, item } = body;

  if (catalogo === "categorias") {
    const { id_padre, codigo, nombre, descripcion, color, id_departamento_defecto, id_servicio_defecto } = item;
    if (!codigo || !nombre) throw new ErrorDominio("Código y Nombre son obligatorios.");

    const res = await queryRow<any>(
      `INSERT INTO problema_categoria (id_padre, codigo, nombre, descripcion, color, id_departamento_defecto, id_servicio_defecto, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, false)
      RETURNING *`,
      [id_padre || null, codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#2563eb", id_departamento_defecto || null, id_servicio_defecto || null]
    );

    return { ok: true, mensaje: "Categoría agregada exitosamente.", item: res };
  }

  if (catalogo === "origenes") {
    const { codigo, nombre, descripcion, color, requiere_incidentes, es_proactivo } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_origen (codigo, nombre, descripcion, color, requiere_incidentes, es_proactivo, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, $6, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#475569", Boolean(requiere_incidentes), Boolean(es_proactivo)]
    );

    return { ok: true, mensaje: "Origen agregado exitosamente.", item: res };
  }

  if (catalogo === "causas_raiz") {
    const { codigo, nombre, descripcion, color, sugiere_rfc, descripcion_ejemplo } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_causa_raiz_categoria (codigo, nombre, descripcion, color, sugiere_rfc, descripcion_ejemplo, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, $6, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#d97706", Boolean(sugiere_rfc), descripcion_ejemplo || null]
    );

    return { ok: true, mensaje: "Categoría de causa raíz agregada.", item: res };
  }

  if (catalogo === "codigos_cierre") {
    const { codigo, nombre, descripcion, color, requiere_solucion_permanente, requiere_rfc_cerrada, requiere_error_conocido, cuenta_como_exito, requiere_aprobacion_supervisor } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_codigo_cierre (codigo, nombre, descripcion, color, requiere_solucion_permanente, requiere_rfc_cerrada, requiere_error_conocido, cuenta_como_exito, requiere_aprobacion_supervisor, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#059669", Boolean(requiere_solucion_permanente), Boolean(requiere_rfc_cerrada), Boolean(requiere_error_conocido), Boolean(cuenta_como_exito), Boolean(requiere_aprobacion_supervisor)]
    );

    return { ok: true, mensaje: "Código de cierre agregado.", item: res };
  }

  if (catalogo === "metodos_analisis") {
    const { codigo, nombre, descripcion, color, plantilla_ayuda } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_metodo_analisis (codigo, nombre, descripcion, color, plantilla_ayuda, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#6366f1", plantilla_ayuda || null]
    );

    return { ok: true, mensaje: "Método de análisis agregado.", item: res };
  }

  if (catalogo === "motivos_espera") {
    const { codigo, nombre, descripcion, color, pausa_reloj_resolucion, requiere_fecha_reanudacion } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_motivo_espera (codigo, nombre, descripcion, color, pausa_reloj_resolucion, requiere_fecha_reanudacion, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, $6, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#f97316", Boolean(pausa_reloj_resolucion), Boolean(requiere_fecha_reanudacion)]
    );

    return { ok: true, mensaje: "Motivo de espera agregado.", item: res };
  }

  if (catalogo === "motivos_cancelacion") {
    const { codigo, nombre, descripcion, color, requiere_aprobacion } = item;
    const res = await queryRow<any>(
      `INSERT INTO problema_motivo_cancelacion (codigo, nombre, descripcion, color, requiere_aprobacion, activo, es_sistema)
      VALUES ($1, $2, $3, $4, $5, true, false)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), descripcion || null, color || "#dc2626", Boolean(requiere_aprobacion)]
    );

    return { ok: true, mensaje: "Motivo de cancelación agregado.", item: res };
  }

  throw new ErrorDominio("Catálogo no reconocido.");
}

export async function actualizarValorCatalogo(body: any) {
  const { catalogo, item } = body;

  if (catalogo === "categorias") {
    await query(
      `UPDATE problema_categoria SET
        nombre = $1, descripcion = $2, color = $3,
        id_departamento_defecto = $4, id_servicio_defecto = $5,
        activo = $6, orden = $7
      WHERE id_categoria = $8`,
      [item.nombre, item.descripcion, item.color, item.id_departamento_defecto || null, item.id_servicio_defecto || null, item.activo, item.orden || 1, item.id_categoria]
    );
    return { ok: true, mensaje: "Categoría actualizada." };
  }

  if (catalogo === "origenes") {
    await query(
      `UPDATE problema_origen SET
        nombre = $1, descripcion = $2, color = $3,
        requiere_incidentes = $4, es_proactivo = $5, activo = $6, orden = $7
      WHERE id_origen = $8`,
      [item.nombre, item.descripcion, item.color, item.requiere_incidentes, item.es_proactivo, item.activo, item.orden || 1, item.id_origen]
    );
    return { ok: true, mensaje: "Origen actualizado." };
  }

  if (catalogo === "causas_raiz") {
    await query(
      `UPDATE problema_causa_raiz_categoria SET
        nombre = $1, descripcion = $2, color = $3,
        sugiere_rfc = $4, descripcion_ejemplo = $5, activo = $6, orden = $7
      WHERE id_causa_categoria = $8`,
      [item.nombre, item.descripcion, item.color, item.sugiere_rfc, item.descripcion_ejemplo, item.activo, item.orden || 1, item.id_causa_categoria]
    );
    return { ok: true, mensaje: "Causa raíz actualizada." };
  }

  if (catalogo === "codigos_cierre") {
    await query(
      `UPDATE problema_codigo_cierre SET
        nombre = $1, descripcion = $2, color = $3,
        requiere_solucion_permanente = $4, requiere_rfc_cerrada = $5,
        requiere_error_conocido = $6, cuenta_como_exito = $7,
        requiere_aprobacion_supervisor = $8, activo = $9, orden = $10
      WHERE id_codigo_cierre = $11`,
      [item.nombre, item.descripcion, item.color, item.requiere_solucion_permanente, item.requiere_rfc_cerrada, item.requiere_error_conocido, item.cuenta_como_exito, item.requiere_aprobacion_supervisor, item.activo, item.orden || 1, item.id_codigo_cierre]
    );
    return { ok: true, mensaje: "Código de cierre actualizado." };
  }

  if (catalogo === "metodos_analisis") {
    await query(
      `UPDATE problema_metodo_analisis SET
        nombre = $1, descripcion = $2, color = $3,
        plantilla_ayuda = $4, activo = $5, orden = $6
      WHERE id_metodo = $7`,
      [item.nombre, item.descripcion, item.color, item.plantilla_ayuda, item.activo, item.orden || 1, item.id_metodo]
    );
    return { ok: true, mensaje: "Método de análisis actualizado." };
  }

  if (catalogo === "motivos_espera") {
    await query(
      `UPDATE problema_motivo_espera SET
        nombre = $1, descripcion = $2, color = $3,
        pausa_reloj_resolucion = $4, requiere_fecha_reanudacion = $5, activo = $6, orden = $7
      WHERE id_motivo_espera = $8`,
      [item.nombre, item.descripcion, item.color, item.pausa_reloj_resolucion, item.requiere_fecha_reanudacion, item.activo, item.orden || 1, item.id_motivo_espera]
    );
    return { ok: true, mensaje: "Motivo de espera actualizado." };
  }

  if (catalogo === "motivos_cancelacion") {
    await query(
      `UPDATE problema_motivo_cancelacion SET
        nombre = $1, descripcion = $2, color = $3,
        requiere_aprobacion = $4, activo = $5, orden = $6
      WHERE id_motivo_cancelacion = $7`,
      [item.nombre, item.descripcion, item.color, item.requiere_aprobacion, item.activo, item.orden || 1, item.id_motivo_cancelacion]
    );
    return { ok: true, mensaje: "Motivo de cancelación actualizado." };
  }

  throw new ErrorDominio("Catálogo no reconocido.");
}

export async function eliminarValorCatalogo(catalogo: string, id: string) {
  if (catalogo === "categorias") {
    const item = await queryRow<any>("SELECT * FROM problema_categoria WHERE id_categoria = $1", [id]);
    if (item?.es_sistema) throw new ErrorDominio("Los elementos protegidos del sistema no pueden eliminarse. Desactívelo en su lugar.");
    const subs = await queryRow<any>("SELECT COUNT(*) as count FROM problema_categoria WHERE id_padre = $1", [id]);
    if (Number(subs?.count) > 0) throw new ErrorDominio("No puede eliminar una categoría que contiene subcategorías.");
    const usos = await queryRow<any>("SELECT COUNT(*) as count FROM problema WHERE id_categoria = $1", [id]);
    if (Number(usos?.count) > 0) throw new ErrorDominio("La categoría está en uso por tickets existentes. Debe desactivarla o fusionarla.");

    await query("DELETE FROM problema_categoria WHERE id_categoria = $1", [id]);
    return { ok: true, mensaje: "Categoría eliminada." };
  }

  if (catalogo === "origenes") {
    const item = await queryRow<any>("SELECT * FROM problema_origen WHERE id_origen = $1", [id]);
    if (item?.es_sistema) throw new ErrorDominio("El origen es protegido del sistema y no puede eliminarse.");
    await query("DELETE FROM problema_origen WHERE id_origen = $1", [id]);
    return { ok: true, mensaje: "Origen eliminado." };
  }

  if (catalogo === "causas_raiz") {
    const item = await queryRow<any>("SELECT * FROM problema_causa_raiz_categoria WHERE id_causa_categoria = $1", [id]);
    if (item?.es_sistema) throw new ErrorDominio("Causa protegida del sistema.");
    await query("DELETE FROM problema_causa_raiz_categoria WHERE id_causa_categoria = $1", [id]);
    return { ok: true, mensaje: "Causa raíz eliminada." };
  }

  if (catalogo === "codigos_cierre") {
    const item = await queryRow<any>("SELECT * FROM problema_codigo_cierre WHERE id_codigo_cierre = $1", [id]);
    if (item?.es_sistema) throw new ErrorDominio("Código protegido del sistema.");
    await query("DELETE FROM problema_codigo_cierre WHERE id_codigo_cierre = $1", [id]);
    return { ok: true, mensaje: "Código de cierre eliminado." };
  }

  if (catalogo === "metodos_analisis") {
    await query("DELETE FROM problema_metodo_analisis WHERE id_metodo = $1", [id]);
    return { ok: true, mensaje: "Método de análisis eliminado." };
  }

  if (catalogo === "motivos_espera") {
    await query("DELETE FROM problema_motivo_espera WHERE id_motivo_espera = $1", [id]);
    return { ok: true, mensaje: "Motivo de espera eliminado." };
  }

  if (catalogo === "motivos_cancelacion") {
    await query("DELETE FROM problema_motivo_cancelacion WHERE id_motivo_cancelacion = $1", [id]);
    return { ok: true, mensaje: "Motivo de cancelación eliminado." };
  }

  throw new ErrorDominio("Catálogo no reconocido.");
}
