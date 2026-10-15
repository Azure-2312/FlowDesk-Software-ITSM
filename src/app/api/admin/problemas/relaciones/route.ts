import { NextRequest, NextResponse } from "next/server";
import { query, queryRow, transaccion } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const [
      reglasUmbral,
      configIncidentes,
      configKedb,
      configRfc,
      configConocimiento,
      configCmdb,
      versiones,
      servicios,
      categorias,
      elementosConfig
    ] = await Promise.all([
      // 1. Reglas de Umbral
      query<any>(`
        SELECT r.*,
          (SELECT COUNT(*) FROM problema_regla_umbral_ejecucion e WHERE e.id_regla = r.id_regla) as total_ejecuciones
        FROM problema_regla_umbral r
        ORDER BY r.orden ASC, r.id_regla ASC
      `),
      // 2. Incidentes Vinculados
      queryRow<any>(`
        SELECT * FROM problema_config_incidentes_vinculados WHERE id_config = 1
      `),
      // 3. KEDB
      queryRow<any>(`
        SELECT * FROM problema_config_kedb WHERE id_config = 1
      `),
      // 4. RFC
      queryRow<any>(`
        SELECT * FROM problema_config_rfc WHERE id_config = 1
      `),
      // 5. Conocimiento
      queryRow<any>(`
        SELECT * FROM problema_config_conocimiento WHERE id_config = 1
      `),
      // 6. CMDB
      queryRow<any>(`
        SELECT * FROM problema_config_cmdb WHERE id_config = 1
      `),
      // 7. Versiones
      query<any>(`
        SELECT v.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
        FROM problema_relaciones_version v
        LEFT JOIN usuario u ON u.id_usuario = v.creado_por
        ORDER BY v.id_version DESC
        LIMIT 20
      `),
      // Auxiliares: Servicios
      query<any>(`
        SELECT id_servicio, nombre, codigo, es_activo
        FROM servicio
        ORDER BY nombre ASC
      `).catch(() => []),
      // Auxiliares: Categorías
      query<any>(`
        SELECT id_categoria, nombre FROM categoria_ticket ORDER BY nombre ASC
      `).catch(() => []),
      // Auxiliares: Clases de CI / Activos
      query<any>(`
        SELECT DISTINCT tipo_activo as clase FROM activo WHERE tipo_activo IS NOT NULL ORDER BY tipo_activo ASC
      `).catch(() => [])
    ]);

    // Última versión publicada
    const versionPublicada = versiones.find((v) => v.estado === "publicado") || {
      numero_version: 1,
      fecha_publicacion: new Date().toISOString(),
      autor_nombre: "Sistema Base"
    };

    return NextResponse.json({
      ok: true,
      datos: {
        reglasUmbral,
        configIncidentes: configIncidentes || {},
        configKedb: configKedb || {},
        configRfc: configRfc || {},
        configConocimiento: configConocimiento || {},
        configCmdb: configCmdb || {},
        versionPublicada,
        versiones,
        catalogosAuxiliares: {
          servicios,
          categorias,
          clasesCI: elementosConfig.map((c: any) => c.clase)
        }
      }
    });
  } catch (error: any) {
    console.error("Error al obtener relaciones de problemas:", error);
    return NextResponse.json({ error: error.message || "Error al cargar configuración" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const esAdminOGestor = idPerfil === 1 || idPerfil === 10;

  try {
    const body = await req.json();
    const { accion, motivo, datos, confirmacion } = body;

    // 1. GUARDAR BORRADOR
    if (accion === "guardar_borrador") {
      await transaccion(async (client) => {
        if (datos.configIncidentes) {
          await client.query(
            `UPDATE problema_config_incidentes_vinculados
             SET tipos_vinculo = $1, estados_incidente_permitidos = $2, max_incidentes_por_problema = $3,
                 permitir_vinculo_multiple_abierto = $4, heredar_servicio = $5, heredar_ci = $6, heredar_categoria = $7,
                 perfiles_desvincular = $8, motivo_desvincular_obligatorio = $9, mostrar_banner_incidente = $10,
                 mostrar_workaround_incidente = $11, audiencia_workaround_mesa = $12, audiencia_workaround_tecnicos = $13,
                 audiencia_workaround_solicitante = $14, sugerir_problema_registro_incidente = $15,
                 accion_error_conocido = $16, politica_cierre = $17, codigo_resolucion_masiva = $18,
                 plantilla_nota_masiva = $19, notificar_solicitantes_masiva = $20, exigir_sin_incidentes_abiertos = $21,
                 fecha_actualizacion = NOW()
             WHERE id_config = 1`,
            [
              JSON.stringify(datos.configIncidentes.tipos_vinculo || []),
              JSON.stringify(datos.configIncidentes.estados_incidente_permitidos || []),
              datos.configIncidentes.max_incidentes_por_problema || 500,
              datos.configIncidentes.permitir_vinculo_multiple_abierto ?? false,
              datos.configIncidentes.heredar_servicio ?? true,
              datos.configIncidentes.heredar_ci ?? true,
              datos.configIncidentes.heredar_categoria ?? true,
              JSON.stringify(datos.configIncidentes.perfiles_desvincular || [1, 10]),
              datos.configIncidentes.motivo_desvincular_obligatorio ?? true,
              datos.configIncidentes.mostrar_banner_incidente ?? true,
              datos.configIncidentes.mostrar_workaround_incidente ?? true,
              datos.configIncidentes.audiencia_workaround_mesa ?? true,
              datos.configIncidentes.audiencia_workaround_tecnicos ?? true,
              datos.configIncidentes.audiencia_workaround_solicitante ?? false,
              datos.configIncidentes.sugerir_problema_registro_incidente ?? true,
              datos.configIncidentes.accion_error_conocido || "agregar_nota_workaround",
              datos.configIncidentes.politica_cierre || "C_resolucion_asistida",
              datos.configIncidentes.codigo_resolucion_masiva || "Solventado por resolución de problema",
              datos.configIncidentes.plantilla_nota_masiva || "",
              datos.configIncidentes.notificar_solicitantes_masiva ?? true,
              datos.configIncidentes.exigir_sin_incidentes_abiertos ?? true
            ]
          );
        }

        if (datos.configKedb) {
          await client.query(
            `UPDATE problema_config_kedb
             SET req_workaround = $1, req_sintomas = $2, req_servicio_ci = $3, req_causa_raiz = $4,
                 req_instrucciones_paso_paso = $5, req_aprobacion_gestor = $6, perfil_aprobador = $7,
                 estados_ciclo = $8, publicacion_directa_perfiles = $9, revision_periodica_meses = $10,
                 recordatorio_dias_antes = $11, pasar_a_revision_si_vence = $12, retiro_automatico_solucion_permanente = $13,
                 audiencia_mesa_servicio = $14, audiencia_tecnicos_todos = $15, audiencia_tecnicos_grupo = $16,
                 audiencia_autoservicio_portal = $17, sugerir_ke_en_incidente = $18, peso_servicio = $19,
                 peso_categoria = $20, peso_ci = $21, peso_clase_ci = $22, peso_palabras_titulo = $23,
                 peso_palabras_descripcion = $24, umbral_minimo_coincidencia = $25, maximo_sugerencias = $26,
                 campos_ke = $27, fecha_actualizacion = NOW()
             WHERE id_config = 1`,
            [
              datos.configKedb.req_workaround ?? true,
              datos.configKedb.req_sintomas ?? true,
              datos.configKedb.req_servicio_ci ?? true,
              datos.configKedb.req_causa_raiz ?? false,
              datos.configKedb.req_instrucciones_paso_paso ?? true,
              datos.configKedb.req_aprobacion_gestor ?? true,
              datos.configKedb.perfil_aprobador || 10,
              JSON.stringify(datos.configKedb.estados_ciclo || []),
              JSON.stringify(datos.configKedb.publicacion_directa_perfiles || [1, 10]),
              datos.configKedb.revision_periodica_meses || 6,
              datos.configKedb.recordatorio_dias_antes || 15,
              datos.configKedb.pasar_a_revision_si_vence ?? true,
              datos.configKedb.retiro_automatico_solucion_permanente ?? true,
              datos.configKedb.audiencia_mesa_servicio ?? true,
              datos.configKedb.audiencia_tecnicos_todos ?? true,
              datos.configKedb.audiencia_tecnicos_grupo ?? true,
              datos.configKedb.audiencia_autoservicio_portal ?? false,
              datos.configKedb.sugerir_ke_en_incidente ?? true,
              datos.configKedb.peso_servicio ?? 4,
              datos.configKedb.peso_categoria ?? 3,
              datos.configKedb.peso_ci ?? 5,
              datos.configKedb.peso_clase_ci ?? 2,
              datos.configKedb.peso_palabras_titulo ?? 4,
              datos.configKedb.peso_palabras_descripcion ?? 3,
              datos.configKedb.umbral_minimo_coincidencia ?? 60,
              datos.configKedb.maximo_sugerencias ?? 5,
              JSON.stringify(datos.configKedb.campos_ke || [])
            ]
          );
        }

        if (datos.configRfc) {
          await client.query(
            `UPDATE problema_config_rfc
             SET exigir_rfc_para_pendiente_cambio = $1, permitir_varias_rfc = $2, maximo_rfc = $3,
                 tipo_cambio_sugerido = $4, regla_p1_riesgo_recurrencia = $5, mapeo_campos = $6,
                 exigir_todas_rfc_implementadas_exito = $7, accion_rfc_fallida = $8,
                 crear_tarea_rfc_fallida = $9, plantilla_tarea_rfc_fallida = $10,
                 notificar_roles_rfc_fallida = $11, pasar_automatico_a_resuelto = $12,
                 verificacion_post_cambio_dias = $13, sincronizacion_tiempo_real = $14,
                 fecha_actualizacion = NOW()
             WHERE id_config = 1`,
            [
              datos.configRfc.exigir_rfc_para_pendiente_cambio ?? true,
              datos.configRfc.permitir_varias_rfc ?? true,
              datos.configRfc.maximo_rfc || 5,
              datos.configRfc.tipo_cambio_sugerido || "Normal",
              datos.configRfc.regla_p1_riesgo_recurrencia ?? true,
              JSON.stringify(datos.configRfc.mapeo_campos || []),
              datos.configRfc.exigir_todas_rfc_implementadas_exito ?? true,
              datos.configRfc.accion_rfc_fallida || "volver_causa_raiz",
              datos.configRfc.crear_tarea_rfc_fallida ?? true,
              datos.configRfc.plantilla_tarea_rfc_fallida || "",
              JSON.stringify(datos.configRfc.notificar_roles_rfc_fallida || []),
              datos.configRfc.pasar_automatico_a_resuelto ?? true,
              datos.configRfc.verificacion_post_cambio_dias || 7,
              datos.configRfc.sincronizacion_tiempo_real ?? true
            ]
          );
        }

        if (datos.configConocimiento) {
          await client.query(
            `UPDATE problema_config_conocimiento
             SET generar_al_publicar_ke = $1, generar_al_resolver = $2, generar_al_cerrar = $3,
                 solo_manual = $4, tipo_articulo_por_evento = $5, plantilla_mapeo = $6,
                 audiencia_defecto = $7, id_categoria_defecto = $8, responsable_revision = $9,
                 articulo_obligatorio_para_cerrar = $10, excepciones_codigos_cierre = $11,
                 estado_inicial_borrador = $12, fecha_actualizacion = NOW()
             WHERE id_config = 1`,
            [
              datos.configConocimiento.generar_al_publicar_ke ?? true,
              datos.configConocimiento.generar_al_resolver ?? true,
              datos.configConocimiento.generar_al_cerrar ?? false,
              datos.configConocimiento.solo_manual ?? false,
              JSON.stringify(datos.configConocimiento.tipo_articulo_por_evento || {}),
              JSON.stringify(datos.configConocimiento.plantilla_mapeo || {}),
              datos.configConocimiento.audiencia_defecto || "segun_error_conocido",
              datos.configConocimiento.id_categoria_defecto || 1,
              datos.configConocimiento.responsable_revision || "responsable_categoria",
              datos.configConocimiento.articulo_obligatorio_para_cerrar ?? false,
              JSON.stringify(datos.configConocimiento.excepciones_codigos_cierre || []),
              datos.configConocimiento.estado_inicial_borrador || "Borrador"
            ]
          );
        }

        if (datos.configCmdb) {
          await client.query(
            `UPDATE problema_config_cmdb
             SET herencia_ci_desde_incidentes = $1, validar_relacion_ci_servicio = $2,
                 clases_ci_permitidas = $3, maximo_ci_por_problema = $4,
                 mostrar_marca_problema_abierto = $5, mostrar_marca_ke_vigente = $6,
                 sugerir_impacto_alto_si_criticidad_mayor = $7, servicio_critico_activa_problema_mayor = $8,
                 accion_baja_ci_con_problemas = $9, fecha_actualizacion = NOW()
             WHERE id_config = 1`,
            [
              datos.configCmdb.herencia_ci_desde_incidentes ?? true,
              datos.configCmdb.validar_relacion_ci_servicio || "avisar",
              JSON.stringify(datos.configCmdb.clases_ci_permitidas || []),
              datos.configCmdb.maximo_ci_por_problema || 100,
              datos.configCmdb.mostrar_marca_problema_abierto ?? true,
              datos.configCmdb.mostrar_marca_ke_vigente ?? true,
              datos.configCmdb.sugerir_impacto_alto_si_criticidad_mayor || "CRITICO",
              datos.configCmdb.servicio_critico_activa_problema_mayor ?? true,
              datos.configCmdb.accion_baja_ci_con_problemas || "avisar_responsable"
            ]
          );
        }
      });

      return NextResponse.json({ ok: true, mensaje: "Borrador guardado exitosamente" });
    }

    // 2. PUBLICAR CONFIGURACIÓN
    if (accion === "publicar") {
      if (!esAdminOGestor) {
        return NextResponse.json({ error: "No tiene permisos para publicar cambios normativos" }, { status: 403 });
      }

      if (!motivo || motivo.trim().length < 10) {
        return NextResponse.json({ error: "El motivo del cambio debe tener al menos 10 caracteres." }, { status: 400 });
      }

      // Obtener el número de versión anterior
      const ultima = await queryRow<any>(
        "SELECT MAX(numero_version) as max_v FROM problema_relaciones_version"
      );
      const nuevaVersionNum = (ultima?.max_v || 0) + 1;

      // Crear snapshot de la configuración publicada
      const snapshot = await transaccion(async (client) => {
        const u = await client.query("SELECT * FROM problema_regla_umbral ORDER BY orden");
        const inc = await client.query("SELECT * FROM problema_config_incidentes_vinculados WHERE id_config = 1");
        const kedb = await client.query("SELECT * FROM problema_config_kedb WHERE id_config = 1");
        const rfc = await client.query("SELECT * FROM problema_config_rfc WHERE id_config = 1");
        const con = await client.query("SELECT * FROM problema_config_conocimiento WHERE id_config = 1");
        const cmdb = await client.query("SELECT * FROM problema_config_cmdb WHERE id_config = 1");

        const dataSnapshot = {
          reglasUmbral: u.rows,
          configIncidentes: inc.rows[0],
          configKedb: kedb.rows[0],
          configRfc: rfc.rows[0],
          configConocimiento: con.rows[0],
          configCmdb: cmdb.rows[0]
        };

        const resV = await client.query(
          `INSERT INTO problema_relaciones_version (
            numero_version, estado, datos, motivo_cambio, creado_por, publicado_por, fecha_publicacion
          ) VALUES ($1, 'publicado', $2, $3, $4, $4, NOW())
          RETURNING *`,
          [nuevaVersionNum, JSON.stringify(dataSnapshot), motivo.trim(), sesion.id_usuario]
        );

        return resV.rows[0];
      });

      return NextResponse.json({
        ok: true,
        mensaje: `Configuración publicada exitosamente como v${nuevaVersionNum}`,
        version: snapshot
      });
    }

    // 3. DESCARTAR CAMBIOS (volver a la versión publicada)
    if (accion === "descartar") {
      const ultimaPub = await queryRow<any>(
        "SELECT datos FROM problema_relaciones_version WHERE estado = 'publicado' ORDER BY id_version DESC LIMIT 1"
      );

      if (!ultimaPub || !ultimaPub.datos) {
        return NextResponse.json({ error: "No hay una versión previa publicada para restaurar" }, { status: 400 });
      }

      const snap = ultimaPub.datos;
      await transaccion(async (client) => {
        if (snap.configIncidentes) {
          await client.query("UPDATE problema_config_incidentes_vinculados SET tipos_vinculo = $1, politica_cierre = $2 WHERE id_config = 1", [
            JSON.stringify(snap.configIncidentes.tipos_vinculo),
            snap.configIncidentes.politica_cierre
          ]);
        }
      });

      return NextResponse.json({ ok: true, mensaje: "Cambios descartados exitosamente" });
    }

    // 4. RESTAURAR VALORES DE FÁBRICA
    if (accion === "restaurar_fabrica") {
      if (confirmacion !== "RESTAURAR") {
        return NextResponse.json({ error: "Debe escribir RESTAURAR para confirmar la restauración de fábrica" }, { status: 400 });
      }

      await transaccion(async (client) => {
        // Restaurar reglas de umbral
        await client.query("DELETE FROM problema_regla_umbral");
        await client.query(`
          INSERT INTO problema_regla_umbral (
              nombre, descripcion, orden, activa, estados_incluidos, prioridad_minima,
              agrupar_por, umbral_incidentes, ventana_horas, accion, prioridad_problema,
              evitar_duplicados, enfriamiento_horas
          ) VALUES
            ('5 incidentes de la misma categoría y CI en 7 días', 'Detección proactiva de fallas recurrentes por componente de infraestructura.', 1, false, '["ABIERTO", "EN_PROCESO", "RESUELTO"]', 'P4', 'ci', 5, 168, 'crear_automatico', 'maxima_incidentes', true, 48),
            ('3 incidentes del mismo servicio en 24 horas', 'Alerta temprana por degradación operativa de un servicio de TI.', 2, false, '["ABIERTO", "EN_PROCESO"]', 'P3', 'servicio', 3, 24, 'sugerir', 'maxima_incidentes', true, 24),
            ('Incidente mayor registrado (P1)', 'Generación obligatoria de problema ante incidentes críticos de alto impacto.', 3, false, '["ABIERTO", "EN_PROCESO"]', 'P1', 'servicio', 1, 24, 'crear_automatico', 'fija_p1', true, 12)
        `);

        // Restaurar configuraciones
        await client.query(`
          UPDATE problema_config_incidentes_vinculados
          SET tipos_vinculo = '["Causado por el problema", "Relacionado", "Posible causa"]',
              max_incidentes_por_problema = 500, politica_cierre = 'C_resolucion_asistida',
              mostrar_banner_incidente = true, mostrar_workaround_incidente = true,
              accion_error_conocido = 'agregar_nota_workaround'
          WHERE id_config = 1
        `);

        await client.query(`
          UPDATE problema_config_kedb
          SET req_workaround = true, req_sintomas = true, req_servicio_ci = true,
              req_causa_raiz = false, revision_periodica_meses = 6, umbral_minimo_coincidencia = 60
          WHERE id_config = 1
        `);

        await client.query(`
          UPDATE problema_config_rfc
          SET exigir_rfc_para_pendiente_cambio = true, maximo_rfc = 5, tipo_cambio_sugerido = 'Normal'
          WHERE id_config = 1
        `);

        await client.query(`
          UPDATE problema_config_cmdb
          SET herencia_ci_desde_incidentes = true, validar_relacion_ci_servicio = 'avisar', maximo_ci_por_problema = 100
          WHERE id_config = 1
        `);
      });

      return NextResponse.json({ ok: true, mensaje: "Valores de fábrica restaurados en borrador." });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error al procesar acción de relaciones:", error);
    return NextResponse.json({ error: error.message || "Error al procesar solicitud" }, { status: 500 });
  }
}
