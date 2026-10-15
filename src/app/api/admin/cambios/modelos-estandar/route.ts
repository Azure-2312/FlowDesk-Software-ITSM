import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { COOKIE_SESION } from "@/shared/lib/constants";

export const dynamic = "force-dynamic";

async function getUsuarioSesion(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_SESION);
    if (!cookie?.value) return null;
    const token = await verificarTokenSesion(cookie.value);
    if (!token?.id_usuario) return null;
    return token;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const estado = searchParams.get("estado");
    const categoriaId = searchParams.get("categoria_id");
    const busqueda = searchParams.get("busqueda");
    const soloAprobados = searchParams.get("solo_aprobados") === "true";

    if (id) {
      const modelo = await queryRow(`
        SELECT m.*, 
               c.nombre as categoria_nombre,
               u_prop.nombre_completo as propietario_nombre,
               u_crea.nombre_completo as creador_nombre
        FROM cambio_modelo_estandar m
        LEFT JOIN cambio_catalogo_item c ON m.categoria_id = c.id_item
        LEFT JOIN usuario u_prop ON m.propietario_id = u_prop.id_usuario
        LEFT JOIN usuario u_crea ON m.usuario_creacion = u_crea.id_usuario
        WHERE m.id_modelo = $1
      `, [id]);

      if (!modelo) {
        return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
      }

      const totalUsos = Number(modelo.veces_usado || 0);
      const exitosos = Number(modelo.veces_exitoso || 0);
      const tasaExito = totalUsos > 0 ? Math.round((exitosos / totalUsos) * 100) : 100;

      return NextResponse.json({
        modelo: {
          ...modelo,
          tasa_exito_pct: tasaExito
        }
      });
    }

    let sql = `
      SELECT m.*, 
             c.nombre as categoria_nombre,
             u_prop.nombre_completo as propietario_nombre,
             u_crea.nombre_completo as creador_nombre
      FROM cambio_modelo_estandar m
      LEFT JOIN cambio_catalogo_item c ON m.categoria_id = c.id_item
      LEFT JOIN usuario u_prop ON m.propietario_id = u_prop.id_usuario
      LEFT JOIN usuario u_crea ON m.usuario_creacion = u_crea.id_usuario
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (soloAprobados) {
      sql += ` AND m.estado = 'APROBADO' AND (m.vigencia_hasta IS NULL OR m.vigencia_hasta >= CURRENT_DATE)`;
    } else if (estado && estado !== "todos") {
      sql += ` AND m.estado = $${pIdx++}`;
      params.push(estado.toUpperCase());
    }

    if (categoriaId) {
      sql += ` AND m.categoria_id = $${pIdx++}`;
      params.push(Number(categoriaId));
    }

    if (busqueda && busqueda.trim()) {
      sql += ` AND (m.nombre ILIKE $${pIdx} OR m.codigo ILIKE $${pIdx} OR m.descripcion ILIKE $${pIdx})`;
      params.push(`%${busqueda.trim()}%`);
      pIdx++;
    }

    sql += ` ORDER BY m.id_modelo DESC`;

    const res = await query(sql, params);
    const modelos = (res || []).map((m: any) => {
      const totalUsos = Number(m.veces_usado || 0);
      const exitosos = Number(m.veces_exitoso || 0);
      const tasaExito = totalUsos > 0 ? Math.round((exitosos / totalUsos) * 100) : 100;
      return {
        ...m,
        tasa_exito_pct: tasaExito
      };
    });

    return NextResponse.json({ modelos });
  } catch (error: any) {
    console.error("Error en GET /api/admin/cambios/modelos-estandar:", error);
    return NextResponse.json({ error: error.message || "Error al listar modelos estándar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const {
      codigo,
      nombre,
      descripcion,
      categoria_id,
      propietario_id,
      vigencia_desde,
      vigencia_hasta,
      servicios_aplicables,
      clases_ci_aplicables,
      entornos_permitidos,
      riesgo_fijo,
      autorizacion_automatica,
      etapa_minima_id,
      lista_elegibilidad,
      contenido_prellenado,
      campos_bloqueados,
      ventanas_permitidas,
      anticipacion_horas,
      limite_frecuencia_ci,
      paquete_tareas,
      checklist_items,
      control_calidad_activo,
      umbral_tasa_fallo_pct,
      umbral_fallos_consecutivos,
      dias_observacion_calidad,
      revision_periodica_meses
    } = body;

    if (!codigo || !nombre) {
      return NextResponse.json({ error: "El código y el nombre son obligatorios" }, { status: 400 });
    }

    const codigoLimpio = codigo.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const codExistente = await queryRow(`SELECT id_modelo FROM cambio_modelo_estandar WHERE codigo = $1`, [codigoLimpio]);
    if (codExistente) {
      return NextResponse.json({ error: `Ya existe un modelo con el código '${codigoLimpio}'` }, { status: 400 });
    }

    const ins = await queryRow(`
      INSERT INTO cambio_modelo_estandar (
        codigo, nombre, descripcion, categoria_id, estado, version_modelo,
        propietario_id, vigencia_desde, vigencia_hasta, servicios_aplicables, clases_ci_aplicables,
        entornos_permitidos, riesgo_fijo, autorizacion_automatica, etapa_minima_id,
        lista_elegibilidad, contenido_prellenado, campos_bloqueados, ventanas_permitidas,
        anticipacion_horas, limite_frecuencia_ci, paquete_tareas, checklist_items,
        control_calidad_activo, umbral_tasa_fallo_pct, umbral_fallos_consecutivos,
        dias_observacion_calidad, revision_periodica_meses, usuario_creacion, usuario_modificacion
      ) VALUES (
        $1, $2, $3, $4, 'BORRADOR', 1,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24,
        $25, $26, $27, $28
      ) RETURNING id_modelo, codigo, nombre, estado
    `, [
      codigoLimpio,
      nombre.trim(),
      descripcion || "",
      categoria_id ? Number(categoria_id) : null,
      propietario_id ? Number(propietario_id) : userId,
      vigencia_desde || null,
      vigencia_hasta || null,
      JSON.stringify(servicios_aplicables || []),
      JSON.stringify(clases_ci_aplicables || []),
      JSON.stringify(entornos_permitidos || ["produccion", "preproduccion", "pruebas", "desarrollo"]),
      (riesgo_fijo || "bajo").toLowerCase(),
      autorizacion_automatica !== false,
      etapa_minima_id || null,
      JSON.stringify(lista_elegibilidad || []),
      JSON.stringify(contenido_prellenado || {}),
      JSON.stringify(campos_bloqueados || []),
      JSON.stringify(ventanas_permitidas || []),
      anticipacion_horas ? Number(anticipacion_horas) : 24,
      limite_frecuencia_ci ? Number(limite_frecuencia_ci) : 5,
      JSON.stringify(paquete_tareas || []),
      JSON.stringify(checklist_items || []),
      control_calidad_activo !== false,
      umbral_tasa_fallo_pct ? Number(umbral_tasa_fallo_pct) : 10.0,
      umbral_fallos_consecutivos ? Number(umbral_fallos_consecutivos) : 2,
      dias_observacion_calidad ? Number(dias_observacion_calidad) : 90,
      revision_periodica_meses ? Number(revision_periodica_meses) : 6,
      userId,
      userId
    ]);

    return NextResponse.json({
      ok: true,
      mensaje: "Modelo de cambio estándar creado exitosamente en estado Borrador",
      modelo: ins
    });
  } catch (error: any) {
    console.error("Error en POST /api/admin/cambios/modelos-estandar:", error);
    return NextResponse.json({ error: error.message || "Error al crear modelo estándar" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const {
      id_modelo,
      transicion_estado,
      nombre,
      descripcion,
      categoria_id,
      propietario_id,
      vigencia_desde,
      vigencia_hasta,
      servicios_aplicables,
      clases_ci_aplicables,
      entornos_permitidos,
      riesgo_fijo,
      autorizacion_automatica,
      etapa_minima_id,
      lista_elegibilidad,
      contenido_prellenado,
      campos_bloqueados,
      ventanas_permitidas,
      anticipacion_horas,
      limite_frecuencia_ci,
      paquete_tareas,
      checklist_items,
      control_calidad_activo,
      umbral_tasa_fallo_pct,
      umbral_fallos_consecutivos,
      dias_observacion_calidad,
      revision_periodica_meses
    } = body;

    if (!id_modelo) {
      return NextResponse.json({ error: "ID del modelo es obligatorio" }, { status: 400 });
    }

    const modeloActual = await queryRow(`SELECT * FROM cambio_modelo_estandar WHERE id_modelo = $1`, [id_modelo]);
    if (!modeloActual) {
      return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
    }

    // Manejo de transiciones formales de ciclo de vida del modelo
    if (transicion_estado) {
      let nuevoEstado = modeloActual.estado;

      if (transicion_estado === "enviar_revision") {
        if (modeloActual.estado !== "BORRADOR" && modeloActual.estado !== "SUSPENDIDO") {
          return NextResponse.json({ error: `No se puede enviar a revisión desde el estado ${modeloActual.estado}` }, { status: 400 });
        }
        nuevoEstado = "EN_REVISION";
      } else if (transicion_estado === "aprobar") {
        if (modeloActual.estado !== "EN_REVISION" && modeloActual.estado !== "BORRADOR") {
          return NextResponse.json({ error: `Solo modelos en borrador o en revisión pueden ser aprobados` }, { status: 400 });
        }

        // Validación ITIL: no aprobar sin rollback ni elegibilidad
        const elegibilidad = Array.isArray(modeloActual.lista_elegibilidad) ? modeloActual.lista_elegibilidad : [];
        if (elegibilidad.length === 0) {
          return NextResponse.json({ error: "El modelo estándar debe tener al menos una condición de elegibilidad antes de aprobarse." }, { status: 400 });
        }

        const prellenado = modeloActual.contenido_prellenado || {};
        if (!prellenado.plan_rollback || !prellenado.plan_rollback.trim()) {
          return NextResponse.json({ error: "El modelo estándar debe definir un Plan de Rollback obligatorio antes de ser aprobado." }, { status: 400 });
        }

        if (modeloActual.riesgo_fijo && modeloActual.riesgo_fijo.toLowerCase() !== "bajo") {
          return NextResponse.json({ error: "Un modelo estándar solo puede aprobarse con riesgo fijo Bajo conforme a la directriz ITIL 4." }, { status: 400 });
        }

        nuevoEstado = "APROBADO";
      } else if (transicion_estado === "suspender") {
        nuevoEstado = "SUSPENDIDO";
      } else if (transicion_estado === "retirar") {
        nuevoEstado = "RETIRADO";
      }

      await query(`
        UPDATE cambio_modelo_estandar
        SET estado = $1,
            fecha_ultima_revision = CASE WHEN $1 = 'APROBADO' THEN NOW() ELSE fecha_ultima_revision END,
            usuario_modificacion = $2,
            fecha_modificacion = NOW()
        WHERE id_modelo = $3
      `, [nuevoEstado, userId, id_modelo]);

      return NextResponse.json({
        ok: true,
        mensaje: `Estado del modelo actualizado a '${nuevoEstado}'`,
        estado: nuevoEstado
      });
    }

    // Edición regular de campos del modelo
    const nuevaVersion = modeloActual.estado === "APROBADO" ? Number(modeloActual.version_modelo || 1) + 1 : modeloActual.version_modelo;
    const nuevoEstado = modeloActual.estado === "APROBADO" ? "BORRADOR" : modeloActual.estado;

    await query(`
      UPDATE cambio_modelo_estandar SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        categoria_id = $3,
        propietario_id = COALESCE($4, propietario_id),
        vigencia_desde = $5,
        vigencia_hasta = $6,
        servicios_aplicables = COALESCE($7, servicios_aplicables),
        clases_ci_aplicables = COALESCE($8, clases_ci_aplicables),
        entornos_permitidos = COALESCE($9, entornos_permitidos),
        riesgo_fijo = COALESCE($10, riesgo_fijo),
        autorizacion_automatica = COALESCE($11, autorizacion_automatica),
        etapa_minima_id = $12,
        lista_elegibilidad = COALESCE($13, lista_elegibilidad),
        contenido_prellenado = COALESCE($14, contenido_prellenado),
        campos_bloqueados = COALESCE($15, campos_bloqueados),
        ventanas_permitidas = COALESCE($16, ventanas_permitidas),
        anticipacion_horas = COALESCE($17, anticipacion_horas),
        limite_frecuencia_ci = COALESCE($18, limite_frecuencia_ci),
        paquete_tareas = COALESCE($19, paquete_tareas),
        checklist_items = COALESCE($20, checklist_items),
        control_calidad_activo = COALESCE($21, control_calidad_activo),
        umbral_tasa_fallo_pct = COALESCE($22, umbral_tasa_fallo_pct),
        umbral_fallos_consecutivos = COALESCE($23, umbral_fallos_consecutivos),
        dias_observacion_calidad = COALESCE($24, dias_observacion_calidad),
        revision_periodica_meses = COALESCE($25, revision_periodica_meses),
        version_modelo = $26,
        estado = $27,
        usuario_modificacion = $28,
        fecha_modificacion = NOW()
      WHERE id_modelo = $29
    `, [
      nombre,
      descripcion,
      categoria_id ? Number(categoria_id) : null,
      propietario_id ? Number(propietario_id) : null,
      vigencia_desde || null,
      vigencia_hasta || null,
      servicios_aplicables ? JSON.stringify(servicios_aplicables) : null,
      clases_ci_aplicables ? JSON.stringify(clases_ci_aplicables) : null,
      entornos_permitidos ? JSON.stringify(entornos_permitidos) : null,
      riesgo_fijo,
      autorizacion_automatica,
      etapa_minima_id || null,
      lista_elegibilidad ? JSON.stringify(lista_elegibilidad) : null,
      contenido_prellenado ? JSON.stringify(contenido_prellenado) : null,
      campos_bloqueados ? JSON.stringify(campos_bloqueados) : null,
      ventanas_permitidas ? JSON.stringify(ventanas_permitidas) : null,
      anticipacion_horas ? Number(anticipacion_horas) : null,
      limite_frecuencia_ci ? Number(limite_frecuencia_ci) : null,
      paquete_tareas ? JSON.stringify(paquete_tareas) : null,
      checklist_items ? JSON.stringify(checklist_items) : null,
      control_calidad_activo,
      umbral_tasa_fallo_pct ? Number(umbral_tasa_fallo_pct) : null,
      umbral_fallos_consecutivos ? Number(umbral_fallos_consecutivos) : null,
      dias_observacion_calidad ? Number(dias_observacion_calidad) : null,
      revision_periodica_meses ? Number(revision_periodica_meses) : null,
      nuevaVersion,
      nuevoEstado,
      userId,
      id_modelo
    ]);

    return NextResponse.json({
      ok: true,
      mensaje: modeloActual.estado === "APROBADO" 
        ? "Modelo modificado. Se creó una nueva versión v" + nuevaVersion + " en estado Borrador que requerirá aprobación."
        : "Modelo actualizado exitosamente."
    });
  } catch (error: any) {
    console.error("Error en PUT /api/admin/cambios/modelos-estandar:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar modelo estándar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del modelo es obligatorio" }, { status: 400 });
    }

    const modelo = await queryRow(`SELECT id_modelo, veces_usado, codigo FROM cambio_modelo_estandar WHERE id_modelo = $1`, [id]);
    if (!modelo) {
      return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
    }

    if (Number(modelo.veces_usado || 0) > 0) {
      return NextResponse.json({ 
        error: `El modelo '${modelo.codigo}' ha sido utilizado en ${modelo.veces_usado} RFCs y no puede eliminarse. Debe marcarse como RETIRADO para mantener la trazabilidad e integridad histórica.` 
      }, { status: 400 });
    }

    await query(`DELETE FROM cambio_modelo_estandar WHERE id_modelo = $1`, [id]);

    return NextResponse.json({ ok: true, mensaje: "Modelo eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/cambios/modelos-estandar:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar modelo estándar" }, { status: 500 });
  }
}
