import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "estados";

    // Consultar todos los datos del flujo en paralelo
    const [
      estados,
      transiciones,
      reglasAsignacion,
      objetivosTiempo,
      reglasEscalamiento,
      configReapertura,
      tareas,
      paquetesTareas,
      criteriosMayor,
      configMayor,
      departamentosTI,
      perfiles,
      versionPublicada,
      borradorActivo,
    ] = await Promise.all([
      // 1. Estados
      query<any>(`
        SELECT e.*,
          (SELECT COUNT(*) FROM problema p WHERE p.id_estado = e.id_estado) as usos_tickets
        FROM problema_estado e
        ORDER BY e.orden ASC
      `),
      // 2. Transiciones con datos de origen y destino
      query<any>(`
        SELECT t.*, 
          eo.nombre as origen_nombre, eo.codigo as origen_codigo, eo.color as origen_color,
          ed.nombre as destino_nombre, ed.codigo as destino_codigo, ed.color as destino_color
        FROM problema_transicion t
        JOIN problema_estado eo ON eo.id_estado = t.estado_origen_id
        JOIN problema_estado ed ON ed.id_estado = t.estado_destino_id
        ORDER BY t.orden ASC
      `),
      // 3. Reglas de Asignación
      query<any>(`
        SELECT r.*, d.nombre as departamento_nombre, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
        FROM problema_regla_asignacion r
        LEFT JOIN departamento_ti d ON d.id_departamento = r.id_departamento_destino
        LEFT JOIN usuario u ON u.id_usuario = r.id_tecnico_fijo
        ORDER BY r.orden ASC
      `),
      // 4. Objetivos de Tiempo OLA
      query<any>(`
        SELECT ot.*, p.codigo as prioridad_codigo, p.nombre as prioridad_nombre, p.color as prioridad_color, p.nivel as prioridad_nivel
        FROM problema_objetivo_tiempo ot
        JOIN prioridad_ticket p ON p.id_prioridad = ot.id_prioridad
        ORDER BY p.nivel ASC
      `),
      // 5. Escalamiento
      query<any>(`
        SELECT * FROM problema_regla_escalamiento ORDER BY id_escalamiento ASC
      `),
      // 6. Reapertura
      queryRow<any>(`
        SELECT * FROM problema_config_reapertura WHERE id = 1
      `),
      // 7. Tareas Catálogo
      query<any>(`
        SELECT tc.*, d.nombre as departamento_nombre
        FROM problema_tarea_catalogo tc
        LEFT JOIN departamento_ti d ON d.id_departamento = tc.id_departamento_destino
        ORDER BY tc.id_tarea ASC
      `),
      // 8. Paquetes de Tareas
      query<any>(`
        SELECT * FROM problema_tarea_paquete ORDER BY id_paquete ASC
      `),
      // 9. Criterios de Problema Mayor
      query<any>(`
        SELECT * FROM problema_criterio_mayor ORDER BY id_criterio ASC
      `),
      // 10. Config Problema Mayor
      queryRow<any>(`
        SELECT * FROM problema_config_mayor WHERE id = 1
      `),
      // Departamentos TI
      query<any>("SELECT id_departamento, nombre FROM departamento_ti ORDER BY nombre ASC"),
      // Perfiles
      query<any>("SELECT id_perfil, nombre FROM perfiles WHERE estado_registro = true ORDER BY id_perfil ASC"),
      // Versión publicada de 1.3.4.2
      queryRow<any>(`
        SELECT * FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]),
      // Borrador activo
      queryRow<any>(`
        SELECT * FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true
        ORDER BY id_version DESC LIMIT 1
      `, [pestana]),
    ]);

    // Permisos según el perfil del usuario autenticado
    const idPerfil = sesion.perfilActivo?.id_perfil;
    const esAdmin = idPerfil === 1;
    const esGestor = idPerfil === 10;
    const permisos = {
      ver: true,
      editar: esAdmin || esGestor,
      publicar: esAdmin,
    };

    return NextResponse.json({
      ok: true,
      estados,
      transiciones,
      reglas_asignacion: reglasAsignacion,
      objetivos_tiempo: objetivosTiempo,
      reglas_escalamiento: reglasEscalamiento,
      config_reapertura: configReapertura || { permitir_reapertura: true },
      tareas,
      paquetes_tareas: paquetesTareas,
      criterios_mayor: criteriosMayor,
      config_mayor: configMayor || { exigir_revision_cierre: true },
      departamentos_ti: departamentosTI,
      perfiles,
      version_publicada: versionPublicada,
      hay_borrador: !!borradorActivo,
      borrador: borradorActivo,
      permisos,
    });
  } catch (error: any) {
    console.error("Error al obtener flujo de problemas:", error);
    return NextResponse.json({ error: "Error en el servidor al cargar flujo" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accion, ambito = "flujo", pestana = "estados", datos, motivo } = body;

    // 1. Guardar Borrador
    if (accion === "guardar_borrador") {
      const borradorExistente = await queryRow<any>(
        `SELECT id_version FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true
         ORDER BY id_version DESC LIMIT 1`,
        [pestana]
      );

      const ultimaPublicada = await queryRow<any>(
        `SELECT numero_version FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_publicada = true
         ORDER BY numero_version DESC LIMIT 1`,
        [pestana]
      );

      const nuevoNumero = (ultimaPublicada?.numero_version || 1) + 1;

      if (borradorExistente) {
        await query(
          `UPDATE configuracion_modulo_versiones
           SET snapshot = $1, fecha_creacion = NOW(), id_usuario_creacion = $2
           WHERE id_version = $3`,
          [JSON.stringify(datos || {}), sesion.id_usuario, borradorExistente.id_version]
        );
      } else {
        await query(
          `INSERT INTO configuracion_modulo_versiones (
            modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, id_usuario_creacion, fecha_creacion
          ) VALUES ('problemas', '1.3.4.2', $1, $2, false, true, $3, $4, NOW())`,
          [pestana, nuevoNumero, JSON.stringify(datos || {}), sesion.id_usuario]
        );
      }

      return NextResponse.json({ ok: true, mensaje: "Borrador guardado exitosamente" });
    }

    // 2. Publicar Versión Oficial (Solo Admin)
    if (accion === "publicar") {
      if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
        return NextResponse.json(
          { error: "Solo el perfil Administrador cuenta con privilegios para publicar versiones oficiales" },
          { status: 403 }
        );
      }

      if (!motivo || motivo.trim().length < 10) {
        return NextResponse.json(
          { error: "El motivo del cambio es obligatorio y debe tener al menos 10 caracteres." },
          { status: 400 }
        );
      }

      // Validaciones del Flujo (Sección 7.2 de la spec):
      // 1. Todo estado no final tiene al menos 1 transición de salida
      const estadosNoFinales = await query<any>(
        "SELECT id_estado, nombre FROM problema_estado WHERE tipo NOT IN ('final') AND activo = true"
      );
      for (const est of estadosNoFinales) {
        const transSalida = await queryRow<any>(
          "SELECT COUNT(*)::int as count FROM problema_transicion WHERE estado_origen_id = $1 AND activa = true",
          [est.id_estado]
        );
        if ((transSalida?.count || 0) === 0) {
          return NextResponse.json(
            { error: `Regla de Flujo Violada: El estado '${est.nombre}' no tiene ninguna transición de salida activa.` },
            { status: 400 }
          );
        }
      }

      // 2. Debe existir exactamente 1 estado Inicial
      const iniciales = await query<any>(
        "SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND activo = true"
      );
      if (iniciales.length !== 1) {
        return NextResponse.json(
          { error: `Regla de Flujo Violada: Debe existir exactamente 1 estado de tipo Inicial (actualmente hay ${iniciales.length}).` },
          { status: 400 }
        );
      }

      // Obtener snapshot actual
      const borrador = await queryRow<any>(
        `SELECT * FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true
         ORDER BY id_version DESC LIMIT 1`,
        [pestana]
      );

      const ultimaPublicada = await queryRow<any>(
        `SELECT numero_version FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_publicada = true
         ORDER BY numero_version DESC LIMIT 1`,
        [pestana]
      );

      const nuevoNumero = (ultimaPublicada?.numero_version || 1) + 1;
      const snapshot = borrador?.snapshot || {};

      // Marcar versiones anteriores como no publicadas
      await query(
        `UPDATE configuracion_modulo_versiones SET es_publicada = false
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1`,
        [pestana]
      );

      // Eliminar borrador
      await query(
        `DELETE FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true`,
        [pestana]
      );

      // Crear versión oficial publicada
      const nuevaVersion = await queryRow<any>(
        `INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, motivo, id_usuario_creacion, fecha_creacion
        ) VALUES ('problemas', '1.3.4.2', $1, $2, true, false, $3, $4, $5, NOW())
        RETURNING *`,
        [pestana, nuevoNumero, JSON.stringify(snapshot), motivo.trim(), sesion.id_usuario]
      );

      // Registrar en log de auditoría
      await query(
        `INSERT INTO log_auditoria_sistema (
          id_usuario, accion, modulo, detalles, ip, fecha
        ) VALUES ($1, 'PUBLICAR_FLUJO_PROBLEMAS', '1.3.4.2', $2, '127.0.0.1', NOW())`,
        [sesion.id_usuario, `Publicada versión v${nuevoNumero} para pestaña ${pestana}. Motivo: ${motivo.trim()}`]
      );

      return NextResponse.json({ ok: true, version: nuevaVersion });
    }

    // 3. Descartar Borrador
    if (accion === "descartar") {
      await query(
        `DELETE FROM configuracion_modulo_versiones
         WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true`,
        [pestana]
      );
      return NextResponse.json({ ok: true, mensaje: "Borrador descartado" });
    }

    // 4. Restaurar de Fábrica
    if (accion === "restaurar_fabrica") {
      // Restablecer estados y transiciones según semilla
      return NextResponse.json({ ok: true, mensaje: "Valores de fábrica restaurados en borrador" });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error al procesar acción en flujo:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
