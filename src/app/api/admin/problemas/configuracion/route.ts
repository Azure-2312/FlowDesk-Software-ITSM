import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

// Valores de fábrica predeterminados para las pestañas de 1.3.4.1
const VALORES_FABRICA_PESTANAS: Record<string, any> = {
  campos: {
    formulario_activo: "registro",
    campos_bloqueados: ["titulo", "descripcion", "servicio_id", "impacto", "urgencia"],
    secciones: [
      {
        id: "sec_identificacion",
        titulo: "A. Identificación",
        color: "#2563eb",
        orden: 1,
        campos: [
          {
            codigo: "titulo",
            etiqueta: "Título del problema",
            tipo: "texto",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "completo",
            placeholder: "Resumen conciso y claro de la anomalía técnica...",
            ayuda: "Mínimo 10 y máximo 150 caracteres. El sistema sugiere problemas abiertos similares.",
            reglas: [],
          },
          {
            codigo: "descripcion",
            etiqueta: "Descripción / Síntomas observados",
            tipo: "area_enriquecida",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "completo",
            placeholder: "Frecuencia de la falla, pasos para reproducirla, hora y duración, mensaje de error y usuarios afectados...",
            ayuda: "Detalle técnico exhaustivo de los síntomas y comportamiento observado.",
            reglas: [],
          },
          {
            codigo: "origen",
            etiqueta: "Origen del problema",
            tipo: "lista_origen",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "1/2",
            ayuda: "Procedencia formal del caso. Dispara reglas condicionales automáticas.",
            reglas: [],
          },
          {
            codigo: "incidentes_vinculados",
            etiqueta: "Incidentes relacionados",
            tipo: "selector_incidentes",
            visible: true,
            obligatorio: "condicional",
            bloqueado: false,
            ancho: "1/2",
            ayuda: "Búsqueda y selección múltiple de incidentes en curso o cerrados.",
            reglas: [
              {
                campo: "origen",
                operador: "es_igual_a",
                valor: "incidente_recurrente",
                accion: "hacer_obligatorio",
              },
            ],
          },
        ],
      },
      {
        id: "sec_alcance",
        titulo: "B. Alcance del Problema",
        color: "#0891b2",
        orden: 2,
        campos: [
          {
            codigo: "servicio_id",
            etiqueta: "Servicio Afectado",
            tipo: "catalogo_servicio",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "1/2",
            ayuda: "Servicio corporativo del catálogo que experimenta la degradación o falla.",
            reglas: [],
          },
          {
            codigo: "categoria_id",
            etiqueta: "Categoría y Subcategoría",
            tipo: "categoria_cascada",
            visible: true,
            obligatorio: "si",
            bloqueado: false,
            ancho: "1/2",
            ayuda: "Clasificación taxonómica de 2 niveles.",
            reglas: [],
          },
          {
            codigo: "ci_afectados",
            etiqueta: "Elementos de Configuración (CI) / Activos",
            tipo: "selector_ci_cmdb",
            visible: true,
            obligatorio: "no",
            bloqueado: false,
            ancho: "completo",
            ayuda: "Todos los CI involucrados en la falla registrados en la CMDB.",
            reglas: [],
          },
        ],
      },
      {
        id: "sec_clasificacion",
        titulo: "C. Clasificación y Priorización",
        color: "#d97706",
        orden: 3,
        campos: [
          {
            codigo: "impacto",
            etiqueta: "Impacto en el Negocio",
            tipo: "lista_impacto",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "1/3",
            ayuda: "Alta, Media o Baja conforme a los acuerdos institucionales.",
            reglas: [],
          },
          {
            codigo: "urgencia",
            etiqueta: "Urgencia Operativa",
            tipo: "lista_urgencia",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            ancho: "1/3",
            ayuda: "Velocidad requerida para la contención o workaround.",
            reglas: [],
          },
          {
            codigo: "prioridad",
            etiqueta: "Prioridad Resultante",
            tipo: "prioridad_calculada",
            visible: true,
            obligatorio: "si",
            bloqueado: true,
            solo_lectura: true,
            ancho: "1/3",
            ayuda: "Calculada automáticamente por la matriz ITIL 4.",
            reglas: [],
          },
        ],
      },
      {
        id: "sec_asignacion",
        titulo: "D. Asignación Resolutora",
        color: "#4f46e5",
        orden: 4,
        campos: [
          {
            codigo: "grupo_id",
            etiqueta: "Grupo Resolutor de TI",
            tipo: "lista_grupo",
            visible: true,
            obligatorio: "si",
            bloqueado: false,
            ancho: "1/2",
            ayuda: "Unidad técnica responsable de la investigación.",
            reglas: [],
          },
          {
            codigo: "responsable_id",
            etiqueta: "Especialista Responsable",
            tipo: "lista_tecnico",
            visible: true,
            obligatorio: "no",
            bloqueado: false,
            ancho: "1/2",
            ayuda: "Técnico asignado; si queda vacío se deposita en la bandeja del grupo.",
            reglas: [],
          },
        ],
      },
      {
        id: "sec_mitigacion",
        titulo: "E. Mitigación y Workaround",
        color: "#059669",
        orden: 5,
        campos: [
          {
            codigo: "workaround",
            etiqueta: "Solución Temporal / Workaround Conocido",
            tipo: "area_enriquecida",
            visible: true,
            obligatorio: "no",
            bloqueado: false,
            ancho: "completo",
            placeholder: "Procedimiento paso a paso para eludir la falla mientras se determina la causa raíz...",
            ayuda: "Permite restablecer temporalmente la continuidad operativa.",
            reglas: [],
          },
        ],
      },
      {
        id: "sec_adjuntos",
        titulo: "F. Evidencias y Adjuntos",
        color: "#64748b",
        orden: 6,
        campos: [
          {
            codigo: "adjuntos",
            etiqueta: "Evidencias Técnicas (Logs, Capturas, Trazas)",
            tipo: "archivo_multiple",
            visible: true,
            obligatorio: "no",
            bloqueado: false,
            ancho: "completo",
            ayuda: "Límite: 25 MB por archivo. Prohibidos ejecutables por política ISO 27001.",
            reglas: [],
          },
        ],
      },
    ],
  },
  vista_ticket: {
    cabecera: [
      { id: "id_problema", nombre: "Código PRB", fijo: true, visible: true, orden: 1 },
      { id: "titulo", nombre: "Título Resumido", fijo: true, visible: true, orden: 2 },
      { id: "estado", nombre: "Insignia de Estado", fijo: true, visible: true, orden: 3 },
      { id: "prioridad", nombre: "Prioridad OLA", fijo: true, visible: true, orden: 4 },
      { id: "responsable", nombre: "Especialista Asignado", fijo: false, visible: true, orden: 5 },
      { id: "grupo", nombre: "Grupo Resolutor", fijo: false, visible: true, orden: 6 },
      { id: "reloj_diagnostico", nombre: "Medidor Diagnóstico (Horas)", fijo: false, visible: true, orden: 7 },
      { id: "reloj_resolucion", nombre: "Medidor Resolución (Horas)", fijo: false, visible: true, orden: 8 },
    ],
    pestanas: [
      { id: "detalle", nombre: "Detalle", visible: true, fijo: true, orden: 1 },
      { id: "incidentes", nombre: "Incidentes relacionados", visible: true, fijo: false, orden: 2 },
      { id: "investigacion", nombre: "Investigación y causa raíz", visible: true, fijo: false, orden: 3 },
      { id: "workaround", nombre: "Workaround", visible: true, fijo: false, orden: 4 },
      { id: "kedb", nombre: "Error conocido", visible: true, fijo: false, orden: 5 },
      { id: "solucion", nombre: "Solución permanente", visible: true, fijo: false, orden: 6 },
      { id: "ci_afectados", nombre: "Activos / CI afectados", visible: true, fijo: false, orden: 7 },
      { id: "tareas", nombre: "Tareas", visible: true, fijo: false, orden: 8 },
      { id: "bitacora", nombre: "Comentarios y bitácora", visible: true, fijo: true, orden: 9 },
      { id: "conocimiento", nombre: "Conocimiento", visible: true, fijo: false, orden: 10 },
      { id: "cierre", nombre: "Cierre", visible: true, fijo: false, orden: 11 },
      { id: "historial", nombre: "Historial / auditoría", visible: true, fijo: true, orden: 12 },
    ],
  },
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pantalla = searchParams.get("pantalla") || "1.3.4.1";
  const pestana = searchParams.get("pestana") || searchParams.get("ambito") || "campos";
  const idPerfil = sesion.perfilActivo?.id_perfil;

  // Permiso de lectura: Administrador (1), Gestor de Problemas (10), Supervisor (4), Auditor (6)
  if (![1, 10, 4, 6].includes(idPerfil)) {
    return NextResponse.json({ error: "No autorizado para consultar la configuración de problemas." }, { status: 403 });
  }

  try {
    const recurso = `problemas:${pantalla}:${pestana}`;

    // 1. Verificar bloqueo concurrente
    const bloqueoRow = await queryRow<{ id_usuario: number; nombres: string; fecha_bloqueo: string }>(`
      SELECT b.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombres, b.fecha_bloqueo
      FROM bloqueo_edicion_concurrente b
      JOIN usuario u ON u.id_usuario = b.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recurso]);

    let enEdicionPorOtro = false;
    let usuarioBloqueo = null;

    if (bloqueoRow) {
      if (bloqueoRow.id_usuario !== sesion.id_usuario) {
        enEdicionPorOtro = true;
        usuarioBloqueo = {
          id_usuario: bloqueoRow.id_usuario,
          nombre: bloqueoRow.nombres,
          hora: bloqueoRow.fecha_bloqueo,
        };
      } else {
        // Refrescar expiración a 15 minutos desde ahora
        await query(`
          UPDATE bloqueo_edicion_concurrente
          SET fecha_expiracion = NOW() + INTERVAL '15 minutes'
          WHERE recurso = $1 AND id_usuario = $2
        `, [recurso, sesion.id_usuario]);
      }
    } else if (idPerfil === 1 || idPerfil === 10) {
      // Tomar bloqueo para el usuario actual
      await query(`
        INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
        VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
        ON CONFLICT (recurso) DO UPDATE SET
          id_usuario = EXCLUDED.id_usuario,
          fecha_bloqueo = NOW(),
          fecha_expiracion = NOW() + INTERVAL '15 minutes'
      `, [recurso, sesion.id_usuario]);
    }

    // 2. Obtener última versión publicada
    const versionPublicada = await queryRow<any>(`
      SELECT id_version, numero_version, snapshot, motivo, impacto_resumen, id_usuario_creacion, fecha_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_publicada = true
      ORDER BY numero_version DESC
      LIMIT 1
    `, [pantalla, pestana]);

    // 3. Obtener borrador pendiente si existe
    const borradorPendiente = await queryRow<any>(`
      SELECT id_version, numero_version, snapshot, diff, motivo, id_usuario_creacion, fecha_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
      ORDER BY id_version DESC
      LIMIT 1
    `, [pantalla, pestana]);

    // 4. Snapshot efectivo
    const valorFabrica = VALORES_FABRICA_PESTANAS[pestana] || {};
    const snapshotPublicado = versionPublicada?.snapshot || valorFabrica;
    const snapshotBorrador = borradorPendiente?.snapshot || null;

    // 5. Historial de versiones recientes (hasta 10)
    const historial = await query<any>(`
      SELECT v.id_version, v.numero_version, v.es_publicada, v.motivo, v.impacto_resumen, v.fecha_creacion,
             CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
      FROM configuracion_modulo_versiones v
      LEFT JOIN usuario u ON u.id_usuario = v.id_usuario_creacion
      WHERE v.modulo = 'problemas' AND v.pantalla = $1 AND v.pestana = $2 AND v.es_publicada = true
      ORDER BY v.numero_version DESC
      LIMIT 10
    `, [pantalla, pestana]);

    const datosActivos = snapshotBorrador || snapshotPublicado;
    return NextResponse.json({
      ok: true,
      pantalla,
      pestana,
      numero_version_publicada: versionPublicada?.numero_version || 1,
      fecha_publicacion: versionPublicada?.fecha_creacion || new Date().toISOString(),
      tiene_borrador: Boolean(borradorPendiente),
      hay_borrador: Boolean(borradorPendiente),
      snapshot_activo: datosActivos,
      datos_activos: datosActivos,
      snapshot_publicado: snapshotPublicado,
      snapshot_borrador: snapshotBorrador,
      version_publicada: {
        numero_version: versionPublicada?.numero_version || 1,
        fecha_creacion: versionPublicada?.fecha_creacion || new Date().toISOString(),
        autor_nombre: "Administrador",
      },
      permisos: {
        ver: true,
        editar: [1, 10].includes(idPerfil),
        publicar: [1, 10].includes(idPerfil),
      },
      diff_borrador: borradorPendiente?.diff || null,
      bloqueo_concurrente: {
        bloqueado: enEdicionPorOtro,
        usuario: usuarioBloqueo,
      },
      historial,
    });
  } catch (error: any) {
    console.error("Error al consultar configuración de problemas:", error);
    return NextResponse.json({ error: "Error interno al consultar la configuración." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  // Solo Administrador (1) y Gestor de Problemas (10) pueden modificar configuración
  if (![1, 10].includes(idPerfil)) {
    return NextResponse.json({ error: "No tiene permisos para modificar la configuración de problemas." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { accion, pantalla = "1.3.4.1", pestana = "campos", snapshot, motivo, impacto_resumen, diff } = body;

    const recurso = `problemas:${pantalla}:${pestana}`;

    // Validar bloqueo concurrente
    const bloqueo = await queryRow<{ id_usuario: number }>(`
      SELECT id_usuario FROM bloqueo_edicion_concurrente
      WHERE recurso = $1 AND fecha_expiracion > NOW()
    `, [recurso]);

    if (bloqueo && bloqueo.id_usuario !== sesion.id_usuario && idPerfil !== 1) {
      return NextResponse.json({ error: "El recurso está bloqueado por otro usuario en edición activa." }, { status: 423 });
    }

    // ACCION 1: GUARDAR BORRADOR
    if (accion === "guardar_borrador") {
      if (!snapshot) {
        return NextResponse.json({ error: "El contenido del snapshot es requerido." }, { status: 400 });
      }

      // Eliminar borrador anterior si existe para dejar únicamente el más reciente
      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
      `, [pantalla, pestana]);

      // Insertar nuevo borrador
      const ultimoPublicado = await queryRow<{ numero_version: number }>(`
        SELECT numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pantalla, pestana]);

      const versionBase = ultimoPublicado?.numero_version || 1;

      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador,
          snapshot, diff, motivo, id_usuario_creacion, fecha_creacion
        ) VALUES ($1, $2, $3, $4, false, true, $5, $6, $7, $8, NOW())
      `, [
        "problemas",
        pantalla,
        pestana,
        versionBase,
        JSON.stringify(snapshot),
        JSON.stringify(diff || {}),
        motivo || "Borrador de cambios pendientes de publicación",
        sesion.id_usuario,
      ]);

      return NextResponse.json({ ok: true, mensaje: "Borrador guardado exitosamente." });
    }

    // ACCION 2: PUBLICAR CONFIGURACIÓN
    if (accion === "publicar") {
      // Solo perfil 1 (Administrador) puede publicar conforme a la matriz SoD
      if (idPerfil !== 1) {
        return NextResponse.json({ error: "Segregación de Funciones: Solo el Administrador puede publicar configuraciones en producción." }, { status: 403 });
      }

      if (!snapshot) {
        return NextResponse.json({ error: "El snapshot es requerido para publicar." }, { status: 400 });
      }

      if (!motivo || motivo.trim().length < 10) {
        return NextResponse.json({ error: "El motivo del cambio es obligatorio y debe tener al menos 10 caracteres." }, { status: 400 });
      }

      // Obtener siguiente número de versión
      const ultimo = await queryRow<{ numero_version: number }>(`
        SELECT numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pantalla, pestana]);

      const nuevaVersion = (ultimo?.numero_version || 0) + 1;

      // Quitar marca de borrador previo
      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
      `, [pantalla, pestana]);

      // Guardar nueva versión publicada
      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador,
          snapshot, diff, motivo, impacto_resumen, id_usuario_creacion, fecha_creacion
        ) VALUES ($1, $2, $3, $4, true, false, $5, $6, $7, $8, $9, NOW())
      `, [
        "problemas",
        pantalla,
        pestana,
        nuevaVersion,
        JSON.stringify(snapshot),
        JSON.stringify(diff || {}),
        motivo.trim(),
        impacto_resumen || "Publicación formal sin impacto en tickets cerrados.",
        sesion.id_usuario,
      ]);

      // Registrar en log de auditoría
      await query(`
        INSERT INTO log_auditoria_sistema (
          id_usuario, modulo, accion, descripcion, detalles, direccion_ip
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        sesion.id_usuario,
        "CONFIGURACION_PROBLEMAS",
        "PUBLICAR_VERSION",
        `Publicada versión v${nuevaVersion} de ${pantalla} (${pestana}) por ${sesion.nombres}. Motivo: ${motivo.trim()}`,
        JSON.stringify({ pantalla, pestana, version: nuevaVersion, diff }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]);

      return NextResponse.json({ ok: true, mensaje: `Configuración v${nuevaVersion} publicada exitosamente.`, nueva_version: nuevaVersion });
    }

    // ACCION 3: DESCARTAR CAMBIOS DE BORRADOR
    if (accion === "descartar") {
      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
      `, [pantalla, pestana]);

      return NextResponse.json({ ok: true, mensaje: "Cambios en borrador descartados." });
    }

    // ACCION 4: RESTAURAR VALORES DE FÁBRICA EN BORRADOR
    if (accion === "restaurar_fabrica") {
      if (body.confirmacion !== "RESTAURAR") {
        return NextResponse.json({ error: "Debe escribir exactamente la palabra 'RESTAURAR' para confirmar." }, { status: 400 });
      }

      const valorFabrica = VALORES_FABRICA_PESTANAS[pestana];
      if (!valorFabrica) {
        return NextResponse.json({ error: "No se encontraron valores de fábrica para esta pestaña." }, { status: 404 });
      }

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
      `, [pantalla, pestana]);

      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador,
          snapshot, motivo, id_usuario_creacion, fecha_creacion
        ) VALUES ($1, $2, $3, 1, false, true, $4, $5, $6, NOW())
      `, [
        "problemas",
        pantalla,
        pestana,
        JSON.stringify(valorFabrica),
        "Restauración de valores de fábrica cargada en borrador",
        sesion.id_usuario,
      ]);

      return NextResponse.json({ ok: true, mensaje: "Valores de fábrica cargados en borrador exitosamente.", snapshot: valorFabrica });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error: any) {
    console.error("Error al actualizar configuración de problemas:", error);
    return NextResponse.json({ error: "Error interno al procesar la configuración." }, { status: 500 });
  }
}
