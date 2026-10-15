import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { calcularDiffConfig as calcularDiffBase } from "@/shared/lib/configuracionModulo";

const calcularDiff = (original: any, modificado: any) =>
  calcularDiffBase(original, modificado, { mensajeInicial: "Configuración inicial de CMDB establecida" });

export const VALORES_FABRICA_154: Record<string, any> = {
  clases_ci: {
    clases: [
      {
        id: "hardware",
        nombre: "Hardware físico",
        es_ci: true,
        inventariable: true,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico", "ubicacion"],
        relaciones_minimas: ["Alimentado por", "Conectado a"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "trimestral",
        activa: true
      },
      {
        id: "red",
        nombre: "Equipos de red y telecomunicaciones",
        es_ci: true,
        inventariable: true,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico", "ubicacion"],
        relaciones_minimas: ["Alimentado por", "Conectado a"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "trimestral",
        activa: true
      },
      {
        id: "infraestructura_fisica",
        nombre: "Infraestructura física y gabinetes",
        es_ci: true,
        inventariable: true,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico", "ubicacion"],
        relaciones_minimas: ["Contiene"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: false,
        mostrar_problemas: false,
        mostrar_cambios: true,
        frecuencia_auditoria: "semestral",
        activa: true
      },
      {
        id: "software_sistema",
        nombre: "Software y sistemas operativos",
        es_ci: true,
        inventariable: false,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico"],
        relaciones_minimas: ["Instalado en"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "trimestral",
        activa: true
      },
      {
        id: "base_datos",
        nombre: "Instancias y motores de base de datos",
        es_ci: true,
        inventariable: false,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico", "servicios_soporta"],
        relaciones_minimas: ["Se ejecuta en", "Soporta a"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "mensual",
        activa: true
      },
      {
        id: "infraestructura_virtual",
        nombre: "Máquinas virtuales y clústeres",
        es_ci: true,
        inventariable: false,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico"],
        relaciones_minimas: ["Se ejecuta en"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "mensual",
        activa: true
      },
      {
        id: "servicios_ti",
        nombre: "Servicios de TI y de negocio",
        es_ci: true,
        inventariable: false,
        atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico", "responsable_negocio"],
        relaciones_minimas: ["Depende de"],
        participa_impacto: true,
        mostrar_mapa: true,
        mostrar_incidentes: true,
        mostrar_problemas: true,
        mostrar_cambios: true,
        frecuencia_auditoria: "mensual",
        activa: true
      }
    ]
  },
  tipos_relacion: {
    tipos: [
      {
        id: "depende_de",
        codigo: "DEPENDE_DE",
        nombre_directo: "Depende de",
        nombre_inverso: "Es requerido por",
        direccion_impacto: "destino_a_origen",
        propaga_criticidad: true,
        cardinalidad: "1:N",
        permite_ciclos: false,
        color: "#4f46e5",
        estilo: "solida",
        bloqueado: true,
        activo: true
      },
      {
        id: "ejecuta_en",
        codigo: "SE_EJECUTA_EN",
        nombre_directo: "Se ejecuta en",
        nombre_inverso: "Hospeda a",
        direccion_impacto: "destino_a_origen",
        propaga_criticidad: true,
        cardinalidad: "N:1",
        permite_ciclos: false,
        color: "#0284c7",
        estilo: "solida",
        bloqueado: true,
        activo: true
      },
      {
        id: "instalado_en",
        codigo: "INSTALADO_EN",
        nombre_directo: "Instalado en",
        nombre_inverso: "Contiene software",
        direccion_impacto: "destino_a_origen",
        propaga_criticidad: true,
        cardinalidad: "N:1",
        permite_ciclos: false,
        color: "#0d9488",
        estilo: "punteada",
        bloqueado: true,
        activo: true
      },
      {
        id: "conectado_a",
        codigo: "CONECTADO_A",
        nombre_directo: "Conectado a",
        nombre_inverso: "Conectado a",
        direccion_impacto: "bidireccional",
        propaga_criticidad: false,
        cardinalidad: "N:N",
        permite_ciclos: true,
        color: "#16a34a",
        estilo: "solida",
        bloqueado: true,
        activo: true
      },
      {
        id: "parte_de",
        codigo: "PARTE_DE",
        nombre_directo: "Es parte de",
        nombre_inverso: "Se compone de",
        direccion_impacto: "origen_a_destino",
        propaga_criticidad: true,
        cardinalidad: "N:1",
        permite_ciclos: false,
        color: "#d97706",
        estilo: "discontinua",
        bloqueado: true,
        activo: true
      },
      {
        id: "usa",
        codigo: "USA",
        nombre_directo: "Usa",
        nombre_inverso: "Es usado por",
        direccion_impacto: "destino_a_origen",
        propaga_criticidad: true,
        cardinalidad: "N:N",
        permite_ciclos: false,
        color: "#9333ea",
        estilo: "solida",
        bloqueado: true,
        activo: true
      },
      {
        id: "alimentado_por",
        codigo: "ALIMENTADO_POR",
        nombre_directo: "Alimentado por",
        nombre_inverso: "Alimenta a",
        direccion_impacto: "destino_a_origen",
        propaga_criticidad: true,
        cardinalidad: "N:1",
        permite_ciclos: false,
        color: "#dc2626",
        estilo: "solida",
        bloqueado: true,
        activo: true
      },
      {
        id: "respaldado_por",
        codigo: "RESPALDADO_POR",
        nombre_directo: "Respaldado por",
        nombre_inverso: "Respalda a",
        direccion_impacto: "ninguna",
        propaga_criticidad: false,
        cardinalidad: "N:1",
        permite_ciclos: false,
        color: "#64748b",
        estilo: "punteada",
        bloqueado: true,
        activo: true
      },
      {
        id: "soporta_a",
        codigo: "SOPORTA_A",
        nombre_directo: "Soporta a",
        nombre_inverso: "Es soportado por",
        direccion_impacto: "origen_a_destino",
        propaga_criticidad: true,
        cardinalidad: "N:N",
        permite_ciclos: false,
        color: "#ea580c",
        estilo: "solida",
        bloqueado: true,
        activo: true
      }
    ],
    matriz_permitida: {
      "ejecuta_en": [
        { origen: "software_sistema", destino: "hardware" },
        { origen: "software_sistema", destino: "infraestructura_virtual" },
        { origen: "base_datos", destino: "hardware" },
        { origen: "base_datos", destino: "infraestructura_virtual" },
        { origen: "infraestructura_virtual", destino: "hardware" }
      ],
      "instalado_en": [
        { origen: "software_sistema", destino: "hardware" },
        { origen: "software_sistema", destino: "infraestructura_virtual" }
      ],
      "soporta_a": [
        { origen: "hardware", destino: "servicios_ti" },
        { origen: "red", destino: "servicios_ti" },
        { origen: "base_datos", destino: "servicios_ti" },
        { origen: "software_sistema", destino: "servicios_ti" },
        { origen: "infraestructura_virtual", destino: "servicios_ti" }
      ],
      "depende_de": [
        { origen: "servicios_ti", destino: "servicios_ti" },
        { origen: "servicios_ti", destino: "base_datos" },
        { origen: "servicios_ti", destino: "red" }
      ],
      "conectado_a": [
        { origen: "red", destino: "red" },
        { origen: "hardware", destino: "red" }
      ],
      "alimentado_por": [
        { origen: "hardware", destino: "infraestructura_fisica" },
        { origen: "red", destino: "infraestructura_fisica" }
      ],
      "respaldado_por": [
        { origen: "hardware", destino: "hardware" },
        { origen: "base_datos", destino: "hardware" }
      ]
    }
  },
  criticidad_entornos: {
    niveles_criticidad: [
      {
        codigo: "CRITICA",
        nombre: "Crítica",
        peso: 4,
        color: "#dc2626",
        rto_horas: 1,
        rpo_horas: 0.25,
        descripcion: "Interrupción detiene operaciones críticas de la empresa o genera impacto regulatorio severo.",
        bloqueado: true,
        activo: true
      },
      {
        codigo: "ALTA",
        nombre: "Alta",
        peso: 3,
        color: "#ea580c",
        rto_horas: 4,
        rpo_horas: 1,
        descripcion: "Degradación grave del servicio sin alternativa inmediata; afecta a múltiples departamentos.",
        bloqueado: true,
        activo: true
      },
      {
        codigo: "MEDIA",
        nombre: "Media",
        peso: 2,
        color: "#d97706",
        rto_horas: 24,
        rpo_horas: 4,
        descripcion: "Afectación parcial de funciones no esenciales o con procedimientos manuales viables.",
        bloqueado: true,
        activo: true
      },
      {
        codigo: "BAJA",
        nombre: "Baja",
        peso: 1,
        color: "#2563eb",
        rto_horas: 48,
        rpo_horas: 24,
        descripcion: "Impacto menor o cosmético sin afectación operativa en la continuidad del negocio.",
        bloqueado: true,
        activo: true
      }
    ],
    criticidad_efectiva: {
      activada: true,
      profundidad_maxima: 2,
      utilizar_en_tickets: "efectiva",
      recalculo_automatico: true
    },
    entornos: [
      { id: "PRODUCCION", nombre: "Producción", peso_riesgo: 3, productivo: true, color: "#dc2626", activo: true },
      { id: "PREPRODUCCION", nombre: "Preproducción", peso_riesgo: 2, productivo: false, color: "#ea580c", activo: true },
      { id: "CONTINGENCIA", nombre: "Contingencia / DRP", peso_riesgo: 2, productivo: true, color: "#7c3aed", activo: true },
      { id: "PRUEBAS", nombre: "Pruebas / QA", peso_riesgo: 1, productivo: false, color: "#d97706", activo: true },
      { id: "DESARROLLO", nombre: "Desarrollo", peso_riesgo: 0, productivo: false, color: "#16a34a", activo: true }
    ]
  },
  reglas_integridad: {
    reglas: [
      { id: 1, nombre: "No eliminar un CI con relaciones activas", descripcion: "Exige retirar o desvincular relaciones previas", severidad: "bloquear", bloqueado: true, activa: true },
      { id: 2, nombre: "Relación exclusiva entre clases autorizadas", descripcion: "Valida la matriz de clases permitidas de 1.5.4.2", severidad: "bloquear", bloqueado: true, activa: true },
      { id: 3, nombre: "Control anti-ciclos en relaciones jerárquicas", descripcion: "Evita dependencias circulares infinitas", severidad: "bloquear", bloqueado: false, activa: true },
      { id: 4, nombre: "No admitir relaciones vigentes duplicadas", descripcion: "Un solo enlace idéntico entre el mismo par origen-destino", severidad: "bloquear", bloqueado: true, activa: true },
      { id: 5, nombre: "CI retirado o inactivo bloqueado para nuevas relaciones", descripcion: "Impide asociar CI fuera de servicio en tickets y topología", severidad: "bloquear", bloqueado: false, activa: true },
      { id: 6, nombre: "Alerta automática a servicios dependientes al retirar", descripcion: "Notifica a responsables de servicios impactados", severidad: "advertir", bloqueado: false, activa: true },
      { id: 7, nombre: "Detección de CI huérfano", descripcion: "CI de clase obligatoria sin ninguna relación tras 7 días", severidad: "advertir", bloqueado: false, activa: true },
      { id: 8, nombre: "Unicidad estricta de serie, IP y hostname", descripcion: "Evita colisión de identificadores en la CMDB", severidad: "bloquear", bloqueado: true, activa: true },
      { id: 9, nombre: "Completitud de atributos obligatorios en estado activo", descripcion: "Requiere datos mínimos de gestión tras 3 días de gracia", severidad: "advertir", bloqueado: false, activa: true },
      { id: 10, nombre: "Coherencia de criticidad CI vs servicio que soporta", descripcion: "Un CI que soporta servicio crítico debe ser crítico", severidad: "advertir", bloqueado: false, activa: true },
      { id: 11, nombre: "Responsable técnico obligatorio en producción", descripcion: "Todo elemento productivo debe tener custodio o técnico", severidad: "bloquear", bloqueado: false, activa: true },
      { id: 12, nombre: "Límite máximo de relaciones por CI", descripcion: "Avisa si un nodo supera 200 relaciones para control de calidad", severidad: "advertir", bloqueado: false, activa: true }
    ]
  },
  fuentes_atributos_protegidos: {
    fuentes: [
      { id: "rfc_cambio", nombre: "Gestión de Cambios (RFC)", prioridad: 1, confiable: true, bloqueado: true },
      { id: "importacion", nombre: "Importación Masiva Homologada", prioridad: 2, confiable: true, bloqueado: true },
      { id: "manual", nombre: "Edición Manual Directa", prioridad: 3, confiable: false, bloqueado: true },
      { id: "integracion", nombre: "Integración Externa / Discovery", prioridad: 2, confiable: true, bloqueado: true }
    ],
    atributos_protegidos: [
      { id: "sw_version", clase: "software_sistema", atributo: "version_software", entorno: "PRODUCCION", criticidad_minima: "ALTA", politica: "solo_rfc" },
      { id: "ip_addr", clase: "hardware", atributo: "ip_principal", entorno: "PRODUCCION", criticidad_minima: "ALTA", politica: "solo_rfc" },
      { id: "so_edicion", clase: "hardware", atributo: "sistema_operativo", entorno: "PRODUCCION", criticidad_minima: "ALTA", politica: "solo_rfc" },
      { id: "rel_topologia", clase: "todas", atributo: "relaciones_cmdb", entorno: "PRODUCCION", criticidad_minima: "CRITICA", politica: "solo_rfc" },
      { id: "firmware", clase: "red", atributo: "firmware", entorno: "PRODUCCION", criticidad_minima: "ALTA", politica: "solo_rfc" },
      { id: "hardware_specs", clase: "hardware", atributo: "memoria_ram_gb", entorno: "PRODUCCION", criticidad_minima: "MEDIA", politica: "excepcion_con_motivo" }
    ]
  },
  auditoria_lineas_base: {
    plantillas_auditoria: [
      {
        id: "auditoria_criticos",
        nombre: "Auditoría Trimestral de CI Críticos y de Alta Disponibilidad",
        alcance: "Criticidad Crítica y Alta en entorno Producción",
        frecuencia: "trimestral",
        metodo: "Revisión automática de integridad + 20% muestreo físico",
        responsable: "Gestor de Activos y Configuración",
        activo: true
      },
      {
        id: "auditoria_servicios_negocio",
        nombre: "Auditoría Semestral de Servicios y Dependencias",
        alcance: "Servicios de TI y Negocio",
        frecuencia: "semestral",
        metodo: "Revisión integral de relaciones y propietarios",
        responsable: "Gestor de Activos y Configuración",
        activo: true
      }
    ],
    indicadores_calidad: [
      { indicador: "CI con atributos obligatorios completos", meta_porcentaje: 95 },
      { indicador: "CI con responsable técnico designado", meta_porcentaje: 95 },
      { indicador: "CI con relaciones topológicas mínimas", meta_porcentaje: 90 },
      { indicador: "Verificación física anual completada", meta_porcentaje: 95 },
      { indicador: "Tasa de modificaciones fuera de cambio", meta_porcentaje: 0 }
    ],
    lineas_base_configuracion: [
      {
        id: "lb_auto_rfc",
        nombre: "Línea base automática previa a RFC Crítica",
        activacion: "Automatizada al aprobar Cambio de Riesgo Alto o Crítico",
        retencion_meses: 24,
        incluye_relaciones: true,
        incluye_atributos: true,
        activa: true
      },
      {
        id: "lb_cierre_anual",
        nombre: "Línea base de cierre de ejercicio anual",
        activacion: "Programada anual al 31 de diciembre",
        retencion_meses: 36,
        incluye_relaciones: true,
        incluye_atributos: true,
        activa: true
      }
    ]
  }
};

export async function obtenerConfiguracionCmdbRelaciones(idUsuario: number | undefined, pestana: string) {
    // 1. Versión publicada activa
    const versionPublicada = await queryRow(`
      SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    // 2. Borrador activo
    const borradorActual = await queryRow(`
      SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    // 3. Bloqueo concurrente
    const recursoLock = `activos:1.5.4:${pestana}`;
    const bloqueoActual = await queryRow(`
      SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
             CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
      FROM bloqueo_edicion_concurrente b
      LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recursoLock]);

    const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_154[pestana] || {};
    const snapshotActivo = borradorActual?.snapshot || snapshotBase;
    const diff = calcularDiff(snapshotBase, snapshotActivo);

    // Contar CIs registrados
    const totalCi = await queryRow(`
      SELECT COUNT(*) as total FROM elemento_configuracion WHERE estado_registro = true
    `);

    // Historial de versiones
    const historialVersiones = await query(`
      SELECT cmv.id_version, cmv.numero_version, cmv.es_publicada, cmv.es_borrador, cmv.fecha_creacion, cmv.motivo, cmv.impacto_resumen, cmv.id_usuario_creacion,
             CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
      FROM configuracion_modulo_versiones cmv
      LEFT JOIN usuario u ON u.id_usuario = cmv.id_usuario_creacion
      WHERE cmv.modulo = 'activos_y_cmdb' AND cmv.pantalla = '1.5.4' AND cmv.pestana = $1
      ORDER BY cmv.id_version DESC LIMIT 20
    `, [pestana]);

    return {
      pestana,
      version_publicada: versionPublicada ? {
        ...versionPublicada,
        snapshot: versionPublicada.snapshot || VALORES_FABRICA_154[pestana]
      } : {
        numero_version: 1,
        snapshot: VALORES_FABRICA_154[pestana]
      },
      borrador: borradorActual ? {
        ...borradorActual,
        snapshot: borradorActual.snapshot
      } : null,
      tiene_borrador: !!borradorActual,
      bloqueo: bloqueoActual ? {
        bloqueado_por_mi: idUsuario === bloqueoActual.id_usuario,
        usuario_nombre: bloqueoActual.nombre_completo || "Otro usuario",
        expira_en: bloqueoActual.fecha_expiracion
      } : null,
      diff_preview: diff,
      total_activos: parseInt(totalCi?.total || "0", 10),
      historial_versiones: historialVersiones || []
    };
}

export async function procesarAccionCmdbRelaciones(idUsuario: number, body: any) {
  const { pestana, snapshot, accion, motivo } = body;

  if (!pestana) {
    throw new ErrorDominio("Pestaña no especificada");
  }

  if (accion === "restaurar_fabrica") {
    const valoresFabrica = VALORES_FABRICA_154[pestana];
    if (!valoresFabrica) {
      throw new ErrorDominio("No existen valores de fábrica para esta pestaña");
    }

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones 
        (modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, motivo, id_usuario_creacion)
      VALUES
        ('activos_y_cmdb', '1.5.4', $1, 1, false, true, $2, 'Restauración a valores de fábrica', $3)
    `, [pestana, JSON.stringify(valoresFabrica), idUsuario]);

    return { ok: true, mensaje: "Valores de fábrica restablecidos en el borrador" };
  }

  // Guardar borrador
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  const resBorrador = await queryRow(`
    INSERT INTO configuracion_modulo_versiones 
      (modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, motivo, id_usuario_creacion)
    VALUES
      ('activos_y_cmdb', '1.5.4', $1, 1, false, true, $2, $3, $4)
    RETURNING id_version
  `, [pestana, JSON.stringify(snapshot), motivo || "Borrador de configuración CMDB guardado", idUsuario]);

  // Actualizar bloqueo por 15 minutos
  const recursoLock = `activos:1.5.4:${pestana}`;
  await query(`
    INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
    VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
    ON CONFLICT (recurso) DO UPDATE
    SET id_usuario = EXCLUDED.id_usuario,
        fecha_bloqueo = NOW(),
        fecha_expiracion = NOW() + INTERVAL '15 minutes'
  `, [recursoLock, idUsuario]);

  return {
    ok: true,
    mensaje: "Borrador de CMDB guardado exitosamente",
    id_version: resBorrador.id_version
  };
}

export async function publicarConfiguracionCmdbRelaciones(idUsuario: number, body: any) {
  const { pestana, snapshot, motivo, diff } = body;

  if (!pestana || !snapshot) {
    throw new ErrorDominio("Faltan datos obligatorios para publicar");
  }

  // 1. Obtener última versión publicada
  const ultimaVersion = await queryRow(`
    SELECT numero_version FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const proximaVersion = (ultimaVersion?.numero_version || 0) + 1;

  // 2. Marcar anteriores como no publicadas
  await query(`
    UPDATE configuracion_modulo_versiones
    SET es_publicada = false
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1
  `, [pestana]);

  // 3. Insertar nueva versión publicada
  await query(`
    INSERT INTO configuracion_modulo_versiones
      (modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion)
    VALUES
      ('activos_y_cmdb', '1.5.4', $1, $2, true, false, $3, $4, $5, $6)
  `, [
    pestana,
    proximaVersion,
    JSON.stringify(snapshot),
    JSON.stringify(diff || {}),
    motivo || `Publicación formal de configuración CMDB v${proximaVersion}`,
    idUsuario
  ]);

  // 4. Limpiar borrador de esta pestaña
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  // 5. Liberar bloqueo concurrente
  const recursoLock = `activos:1.5.4:${pestana}`;
  await query(`
    DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1
  `, [recursoLock]);

  // 6. Si se publica 'criticidad_entornos', sincronizar o registrar evento
  await query(`
    INSERT INTO auditoria_cambio_configuracion 
      (modulo, pantalla, pestana, version_publicada, id_usuario, motivo, fecha_cambio)
    VALUES 
      ('activos_y_cmdb', '1.5.4', $1, $2, $3, $4, NOW())
    ON CONFLICT DO NOTHING
  `, [pestana, proximaVersion, idUsuario, motivo || `Publicación v${proximaVersion}`]);

  return {
    ok: true,
    mensaje: `Versión v${proximaVersion} de CMDB publicada exitosamente`,
    nueva_version: proximaVersion
  };
}

export async function descartarBorradorCmdbRelaciones(idUsuario: number, pestana: string) {
  if (!pestana) {
    throw new ErrorDominio("Pestaña no especificada");
  }

  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.4' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  const recursoLock = `activos:1.5.4:${pestana}`;
  await query(`
    DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2
  `, [recursoLock, idUsuario]);

  return { ok: true, mensaje: "Borrador de CMDB descartado exitosamente" };
}
