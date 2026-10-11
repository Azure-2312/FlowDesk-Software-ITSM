import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion } from "@/lib/auth";
import { COOKIE_SESION } from "@/lib/constants";

export const dynamic = "force-dynamic";

const VALORES_FABRICA_153: Record<string, any> = {
  tipos_licencia_metricas: {
    tipos_licencia: [
      { id: "perpetua_dev", codigo: "PERP_DEV", nombre: "Perpetua por dispositivo", metrica: "dispositivo", vence: false, requiere_clave: true, reasignable: true, requiere_contrato: false, activo: true },
      { id: "perpetua_usr", codigo: "PERP_USR", nombre: "Perpetua por usuario", metrica: "usuario_nominal", vence: false, requiere_clave: true, reasignable: true, requiere_contrato: false, activo: true },
      { id: "susc_anual_usr", codigo: "SUSC_ANUAL_USR", nombre: "Suscripción anual por usuario", metrica: "usuario_nominal", vence: true, requiere_clave: false, reasignable: true, requiere_contrato: true, activo: true },
      { id: "susc_mens_usr", codigo: "SUSC_MENS_USR", nombre: "Suscripción mensual por usuario", metrica: "usuario_nominal", vence: true, requiere_clave: false, reasignable: true, requiere_contrato: true, activo: true },
      { id: "concurrente", codigo: "CONCURRENTE", nombre: "Concurrente por puesto", metrica: "usuario_concurrente", vence: true, requiere_clave: true, reasignable: false, requiere_contrato: true, activo: true },
      { id: "por_nucleo", codigo: "POR_NUCLEO", nombre: "Por núcleo de procesador (Core)", metrica: "nucleo_procesador", vence: true, requiere_clave: true, reasignable: true, requiere_contrato: true, activo: true },
      { id: "por_servidor", codigo: "POR_SERVIDOR", nombre: "Por servidor / instancia", metrica: "servidor_instancia", vence: false, requiere_clave: true, reasignable: true, requiere_contrato: false, activo: true },
      { id: "sitio_corp", codigo: "SITIO_CORP", nombre: "Corporativa o de sitio (Enterprise)", metrica: "sitio_corporativa", vence: true, requiere_clave: true, reasignable: false, requiere_contrato: true, activo: true },
      { id: "codigo_abierto", codigo: "OPEN_SOURCE", nombre: "Código abierto / Libre", metrica: "sin_limite", vence: false, requiere_clave: false, reasignable: true, requiere_contrato: false, activo: true },
      { id: "oem", codigo: "OEM", nombre: "Licencia OEM ligada a hardware", metrica: "dispositivo", vence: false, requiere_clave: true, reasignable: false, requiere_contrato: false, activo: true }
    ],
    catalogo_software: [
      { id: 1, producto: "Microsoft Windows 11 Enterprise", editor: "Microsoft Corporation", categoria: "Sistema Operativo", condicion: "autorizado" },
      { id: 2, producto: "Microsoft 365 E5", editor: "Microsoft Corporation", categoria: "Ofimática y Productividad", condicion: "autorizado" },
      { id: 3, producto: "Adobe Creative Cloud", editor: "Adobe Systems", categoria: "Diseño y Audiovisual", condicion: "restringido" },
      { id: 4, producto: "Oracle Database Enterprise Edition", editor: "Oracle Corporation", categoria: "Base de Datos", condicion: "restringido" },
      { id: 5, producto: "uTorrent / BitTorrent Client", editor: "BitTorrent Inc.", categoria: "P2P y Descargas", condicion: "prohibido" }
    ]
  },
  tipos_contrato_proveedores: {
    tipos_contrato: [
      { id: "mantenimiento", nombre: "Mantenimiento preventivo y correctivo", recurrente: true, renovacion_automatica: true, exige_sla: true, preaviso_dias: 60, activo: true },
      { id: "soporte", nombre: "Soporte técnico y actualización de software", recurrente: true, renovacion_automatica: true, exige_sla: true, preaviso_dias: 60, activo: true },
      { id: "arrendamiento", nombre: "Arrendamiento operativo (Leasing)", recurrente: true, renovacion_automatica: false, exige_sla: false, preaviso_dias: 90, activo: true },
      { id: "licenciamiento", nombre: "Licenciamiento por volumen (Enterprise Agreement)", recurrente: true, renovacion_automatica: false, exige_sla: false, preaviso_dias: 90, activo: true },
      { id: "servicios_gestionados", nombre: "Servicios gestionados y outsourcing TI", recurrente: true, renovacion_automatica: true, exige_sla: true, preaviso_dias: 90, activo: true },
      { id: "telecomunicaciones", nombre: "Telecomunicaciones y enlaces dedicados", recurrente: true, renovacion_automatica: true, exige_sla: true, preaviso_dias: 60, activo: true },
      { id: "garantia_extendida", nombre: "Póliza de garantía extendida", recurrente: false, renovacion_automatica: false, exige_sla: true, preaviso_dias: 30, activo: true },
      { id: "sla_proveedor", nombre: "Acuerdo de nivel de servicio (SLA proveedor)", recurrente: false, renovacion_automatica: true, exige_sla: true, preaviso_dias: 30, activo: true },
      { id: "otro", nombre: "Otro contrato de servicios TI", recurrente: false, renovacion_automatica: false, exige_sla: false, preaviso_dias: 30, activo: true }
    ],
    categorias_proveedor: ["Fabricante", "Distribuidor Autorizado", "Servicios TI", "Telecomunicaciones", "Consultoría"],
    estados_proveedor: [
      { id: "activo", nombre: "Activo", permite_nuevos_contratos: true },
      { id: "evaluacion", nombre: "En evaluación", permite_nuevos_contratos: true },
      { id: "suspendido", nombre: "Suspendido temporalmente", permite_nuevos_contratos: false },
      { id: "bloqueado", nombre: "Bloqueado por incumplimiento", permite_nuevos_contratos: false }
    ]
  },
  formulario_licencia_contrato: {
    campos_licencia: [
      { id: "codigo_licencia", etiqueta: "Código de licencia", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "nombre_producto", etiqueta: "Nombre del producto", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "fabricante", etiqueta: "Fabricante / Editor", seccion: "identificacion", obligatorio: true, bloqueado: false },
      { id: "tipo_licencia_id", etiqueta: "Tipo de licencia", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "metrica_id", etiqueta: "Métrica de licenciamiento", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "cantidad_adquirida", etiqueta: "Cantidad adquirida", seccion: "derechos", obligatorio: true, bloqueado: true },
      { id: "clave_serial", etiqueta: "Clave de activación (Sensible)", seccion: "derechos", obligatorio: false, bloqueado: false },
      { id: "fecha_adquisicion", etiqueta: "Fecha de adquisición", seccion: "vigencia", obligatorio: false, bloqueado: false },
      { id: "fecha_vencimiento", etiqueta: "Fecha de vencimiento", seccion: "vigencia", obligatorio: false, bloqueado: false },
      { id: "contrato_id", etiqueta: "Contrato asociado (Módulo 8)", seccion: "finanzas", obligatorio: false, bloqueado: false },
      { id: "responsable_id", etiqueta: "Responsable de la licencia", seccion: "responsabilidad", obligatorio: true, bloqueado: false }
    ],
    campos_contrato: [
      { id: "numero_contrato", etiqueta: "Número de contrato", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "titulo", etiqueta: "Título del contrato", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "tipo_contrato_id", etiqueta: "Tipo de contrato", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "proveedor_id", etiqueta: "Proveedor adjudicado", seccion: "identificacion", obligatorio: true, bloqueado: true },
      { id: "fecha_inicio", etiqueta: "Fecha de inicio", seccion: "vigencia", obligatorio: true, bloqueado: true },
      { id: "fecha_fin", etiqueta: "Fecha de fin de vigencia", seccion: "vigencia", obligatorio: true, bloqueado: true },
      { id: "monto_total", etiqueta: "Monto económico", seccion: "economico", obligatorio: false, bloqueado: false },
      { id: "moneda", etiqueta: "Moneda de facturación", seccion: "economico", obligatorio: true, bloqueado: false },
      { id: "responsable_id", etiqueta: "Responsable del contrato", seccion: "responsabilidad", obligatorio: true, bloqueado: false }
    ]
  },
  cumplimiento_sobreuso: {
    umbral_riesgo_porcentaje: 90,
    accion_sobreasignacion: "bloquear",
    alertas_sobreuso_activas: true,
    reclamacion_automatica_activo_baja: true,
    reclamacion_automatica_usuario_desactivado: true,
    alerta_software_no_autorizado: true,
    dias_inactividad_reporte_licencias_libres: 60
  },
  alertas_vencimiento_garantia: {
    alertas: [
      {
        id: "licencia_vencimiento",
        entidad: "Licencia de software",
        fecha_base: "Fecha de vencimiento",
        anticipaciones_dias: [90, 60, 30, 15, 7, 0],
        destinatarios: ["Responsable de la licencia", "Gestor de Activos y Configuración"],
        activo: true
      },
      {
        id: "licencia_soporte",
        entidad: "Soporte de licencia",
        fecha_base: "Fin de soporte técnico",
        anticipaciones_dias: [60, 30, 7],
        destinatarios: ["Responsable de la licencia", "Gestor de Activos y Configuración"],
        activo: true
      },
      {
        id: "contrato_fin",
        entidad: "Contrato con proveedor",
        fecha_base: "Fecha de fin y límite de no renovación",
        anticipaciones_dias: [120, 90, 60, 30, 15, 0],
        destinatarios: ["Responsable del contrato", "Gestor de Activos y Configuración", "Gestor de Área"],
        activo: true
      },
      {
        id: "garantia_activo",
        entidad: "Garantía de hardware",
        fecha_base: "Fin de garantía de fábrica",
        anticipaciones_dias: [60, 30, 7],
        destinatarios: ["Gestor de Activos y Configuración", "Custodio del activo"],
        activo: true
      },
      {
        id: "eol_eos_modelo",
        entidad: "Fin de vida del modelo (EOL/EOS)",
        fecha_base: "Fecha EOL/EOS homologada",
        anticipaciones_dias: [180, 90],
        destinatarios: ["Gestor de Activos y Configuración"],
        activo: true
      },
      {
        id: "fin_vida_activo",
        entidad: "Fin de vida útil del activo",
        fecha_base: "Fecha de fin de vida calculada",
        anticipaciones_dias: [180, 90, 30],
        destinatarios: ["Gestor de Activos y Configuración"],
        activo: true
      },
      {
        id: "prestamo_activo",
        entidad: "Préstamo temporal de equipo",
        fecha_base: "Fecha prevista de devolución",
        anticipaciones_dias: [3, 1, 0, -1, -7],
        destinatarios: ["Custodio", "Supervisor"],
        activo: true
      },
      {
        id: "revision_cmdb",
        entidad: "Auditoría periódica de CMDB",
        fecha_base: "Fecha programada de campaña",
        anticipaciones_dias: [14, 3],
        destinatarios: ["Responsable de la campaña"],
        activo: true
      }
    ]
  },
  renovacion: {
    estados_renovacion: ["Pendiente", "En gestión", "Renovado", "No renovar", "Vencido sin renovar"],
    anticipacion_crear_solicitud_dias: 60,
    servicio_solicitud_renovacion_id: 110,
    bloquear_nuevas_asignaciones_si_vencida: true,
    aprobacion_por_montos: [
      { desde: 0, hasta: 5000, perfil_aprobador: "Supervisor", orden: 1 },
      { desde: 5001, hasta: 50000, perfil_aprobador: "Aprobador", orden: 2 },
      { desde: 50001, hasta: 999999, perfil_aprobador: "Administrador", orden: 3 }
    ],
    motivos_no_renovacion: [
      { id: "migracion_alternativa", nombre: "Migración a plataforma o solución alternativa", activo: true },
      { id: "desuso_obsolescencia", nombre: "Pérdida de necesidad operativa / Desuso", activo: true },
      { id: "reduccion_presupuesto", nombre: "Optimización o reducción presupuestal", activo: true },
      { id: "cambio_proveedor", nombre: "Reemplazo por proveedor homologado más competitivo", activo: true }
    ]
  }
};

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

function calcularDiff(original: any, modificado: any): { cambios: string[]; total: number } {
  const cambios: string[] = [];
  if (!original && modificado) {
    cambios.push("Configuración inicial establecida");
    return { cambios, total: 1 };
  }
  const strOriginal = JSON.stringify(original || {});
  const strMod = JSON.stringify(modificado || {});
  if (strOriginal === strMod) {
    return { cambios: ["Sin modificaciones"], total: 0 };
  }

  if (typeof original === "object" && typeof modificado === "object" && original && modificado) {
    const keys = Array.from(new Set([...Object.keys(original), ...Object.keys(modificado)]));
    for (const k of keys) {
      if (JSON.stringify(original[k]) !== JSON.stringify(modificado[k])) {
        cambios.push(`Modificación en sección '${k}'`);
      }
    }
  } else {
    cambios.push("Estructura de configuración actualizada");
  }
  return { cambios, total: cambios.length };
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "tipos_licencia_metricas";

    // 1. Versión publicada activa
    const versionPublicada = await queryRow(`
      SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    // 2. Borrador activo
    const borradorActual = await queryRow(`
      SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    // 3. Bloqueo concurrente
    const recursoLock = `activos:1.5.3:${pestana}`;
    const bloqueoActual = await queryRow(`
      SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
             CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
      FROM bloqueo_edicion_concurrente b
      LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recursoLock]);

    const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_153[pestana] || {};
    const snapshotActivo = borradorActual?.snapshot || snapshotBase;
    const diff = calcularDiff(snapshotBase, snapshotActivo);

    // Contar contratos y licencias registradas
    const totalActivos = await queryRow(`
      SELECT COUNT(*) as total FROM activo WHERE estado_registro = true
    `);

    // Historial de versiones
    const historialVersiones = await query(`
      SELECT cmv.id_version, cmv.numero_version, cmv.es_publicada, cmv.es_borrador, cmv.fecha_creacion, cmv.motivo, cmv.impacto_resumen, cmv.id_usuario_creacion,
             CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
      FROM configuracion_modulo_versiones cmv
      LEFT JOIN usuario u ON u.id_usuario = cmv.id_usuario_creacion
      WHERE cmv.modulo = 'activos_y_cmdb' AND cmv.pantalla = '1.5.3' AND cmv.pestana = $1
      ORDER BY cmv.id_version DESC LIMIT 20
    `, [pestana]);

    return NextResponse.json({
      pestana,
      version_publicada: versionPublicada ? {
        ...versionPublicada,
        snapshot: versionPublicada.snapshot || VALORES_FABRICA_153[pestana]
      } : {
        numero_version: 1,
        snapshot: VALORES_FABRICA_153[pestana]
      },
      borrador: borradorActual ? {
        ...borradorActual,
        snapshot: borradorActual.snapshot
      } : null,
      tiene_borrador: !!borradorActual,
      bloqueo: bloqueoActual ? {
        bloqueado_por_mi: usuario?.id_usuario === bloqueoActual.id_usuario,
        usuario_nombre: bloqueoActual.nombre_completo || "Otro usuario",
        expira_en: bloqueoActual.fecha_expiracion
      } : null,
      diff_preview: diff,
      total_activos: parseInt(totalActivos?.total || "0", 10),
      historial_versiones: historialVersiones || []
    });
  } catch (error: any) {
    console.error("Error en GET /api/admin/activos-config/licencias-contratos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al obtener la configuración del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const { pestana, snapshot, motivo, version_id_origen } = body;
    const accion = body.accion || "guardar_borrador";

    if (!pestana) {
      return NextResponse.json({ error: "La pestaña es obligatoria" }, { status: 400 });
    }

    const userId = usuario?.id_usuario || 1;
    const recursoLock = `activos:1.5.3:${pestana}`;

    if (accion === "adquirir_bloqueo" || accion === "solicitar_control") {
      await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND fecha_expiracion <= NOW()`, [recursoLock]);
      const existente = await queryRow(`
        SELECT id_bloqueo, id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente WHERE recurso = $1
      `, [recursoLock]);

      if (accion !== "solicitar_control" && existente && existente.id_usuario !== userId && new Date(existente.fecha_expiracion) > new Date()) {
        return NextResponse.json({ 
          bloqueado: true, 
          mensaje: "La pestaña está siendo editada por otro usuario" 
        }, { status: 423 });
      }

      await query(`
        INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
        VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
        ON CONFLICT (recurso) DO UPDATE SET 
          id_usuario = EXCLUDED.id_usuario,
          fecha_bloqueo = NOW(),
          fecha_expiracion = NOW() + INTERVAL '15 minutes'
      `, [recursoLock, userId]);

      return NextResponse.json({ ok: true, mensaje: "Bloqueo adquirido" });
    }

    if (accion === "liberar_bloqueo") {
      await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, userId]);
      return NextResponse.json({ ok: true, mensaje: "Bloqueo liberado" });
    }

    if (accion === "guardar_borrador") {
      const versionPub = await queryRow(`
        SELECT snapshot, numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot || VALORES_FABRICA_153[pestana], snapshot);

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      const nuevoBorrador = await queryRow(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'activos_y_cmdb', '1.5.3', $1, $2, false, true, $3, $4, $5, $6
        ) RETURNING id_version, fecha_creacion
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(snapshot), JSON.stringify(diff), motivo || "Borrador de trabajo", userId]);

      await query(`
        INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
        VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
        ON CONFLICT (recurso) DO UPDATE SET fecha_expiracion = NOW() + INTERVAL '15 minutes'
      `, [recursoLock, userId]);

      return NextResponse.json({ 
        ok: true, 
        mensaje: "Borrador guardado exitosamente",
        borrador: {
          id_version: nuevoBorrador?.id_version,
          snapshot,
          diff,
          fecha_creacion: nuevoBorrador?.fecha_creacion
        }
      });
    }

    if (accion === "restaurar_fabrica") {
      const fabrica = VALORES_FABRICA_153[pestana];
      if (!fabrica) {
        return NextResponse.json({ error: "No existen valores de fábrica para esta pestaña" }, { status: 404 });
      }

      const versionPub = await queryRow(`
        SELECT numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot, fabrica);

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      const borradorRestaurado = await queryRow(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'activos_y_cmdb', '1.5.3', $1, $2, false, true, $3, $4, 'Restauración de valores de fábrica en borrador', $5
        ) RETURNING id_version, fecha_creacion
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(fabrica), JSON.stringify(diff), userId]);

      return NextResponse.json({
        ok: true,
        mensaje: "Valores de fábrica cargados en borrador",
        borrador: {
          id_version: borradorRestaurado?.id_version,
          snapshot: fabrica,
          diff,
          fecha_creacion: borradorRestaurado?.fecha_creacion
        }
      });
    }

    if (accion === "restaurar_version") {
      if (!version_id_origen) {
        return NextResponse.json({ error: "ID de versión requerido" }, { status: 400 });
      }

      const versionOrigen = await queryRow(`
        SELECT snapshot FROM configuracion_modulo_versiones
        WHERE id_version = $1
      `, [version_id_origen]);

      if (!versionOrigen?.snapshot) {
        return NextResponse.json({ error: "Versión no encontrada" }, { status: 404 });
      }

      const versionPub = await queryRow(`
        SELECT numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot, versionOrigen.snapshot);

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      const borradorRestaurado = await queryRow(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'activos_y_cmdb', '1.5.3', $1, $2, false, true, $3, $4, $5, $6
        ) RETURNING id_version, fecha_creacion
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(versionOrigen.snapshot), JSON.stringify(diff), motivo || `Restaurado desde versión previa #${version_id_origen}`, userId]);

      return NextResponse.json({
        ok: true,
        mensaje: "Versión histórica cargada en borrador",
        borrador: {
          id_version: borradorRestaurado?.id_version,
          snapshot: versionOrigen.snapshot,
          diff,
          fecha_creacion: borradorRestaurado?.fecha_creacion
        }
      });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en POST /api/admin/activos-config/licencias-contratos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al procesar la solicitud" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const { pestana, snapshot, motivo, diff } = body;

    if (!pestana) {
      return NextResponse.json({ error: "Pestaña requerida" }, { status: 400 });
    }

    if (!motivo || motivo.trim().length < 10) {
      return NextResponse.json({ error: "El motivo de publicación debe tener al menos 10 caracteres" }, { status: 400 });
    }

    const userId = usuario?.id_usuario || 1;

    const borrador = await queryRow(`
      SELECT id_version, snapshot, diff FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    if (!borrador && !snapshot) {
      return NextResponse.json({ error: "No hay un borrador pendiente de publicación" }, { status: 400 });
    }

    const snapshotFinal = snapshot || borrador.snapshot;

    const ultimaPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const nuevoNumeroVersion = (ultimaPub?.numero_version || 0) + 1;

    await query(`
      UPDATE configuracion_modulo_versiones 
      SET es_publicada = false 
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1
    `, [pestana]);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const nuevaPublicacion = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.3', $1, $2, true, false, $3, $4, $5, $6
      ) RETURNING id_version, fecha_creacion
    `, [
      pestana,
      nuevoNumeroVersion,
      JSON.stringify(snapshotFinal),
      JSON.stringify(diff || borrador?.diff || { cambios: ["Publicación formal"] }),
      motivo.trim(),
      userId
    ]);

    const recursoLock = `activos:1.5.3:${pestana}`;
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

    return NextResponse.json({
      ok: true,
      mensaje: `Versión v${nuevoNumeroVersion} publicada exitosamente`,
      id_version: nuevaPublicacion?.id_version,
      numero_version: nuevoNumeroVersion,
      fecha_creacion: nuevaPublicacion?.fecha_creacion
    });
  } catch (error: any) {
    console.error("Error en PUT /api/admin/activos-config/licencias-contratos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al publicar la versión" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana");

    if (!pestana) {
      return NextResponse.json({ error: "Pestaña requerida" }, { status: 400 });
    }

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.3' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const recursoLock = `activos:1.5.3:${pestana}`;
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

    return NextResponse.json({ ok: true, mensaje: "Borrador descartado correctamente" });
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/activos-config/licencias-contratos/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al descartar el borrador" }, { status: 500 });
  }
}
