import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { calcularDiffConfig as calcularDiffBase } from "@/shared/lib/configuracionModulo";

const calcularDiff = (original: any, modificado: any) =>
  calcularDiffBase(original, modificado, {
    etiquetaCambio: "clave",
    mensajeEstructura: "Estructura global de configuración actualizada",
  });

// Valores de fábrica referenciales para submódulo 1.5.1 (Activos y CMDB)
export const VALORES_FABRICA_151: Record<string, any> = {
  clases_tipos: {
    clases: [
      {
        id: "hardware",
        codigo: "HDW",
        nombre: "Hardware",
        descripcion: "Equipos físicos de cómputo, servidores, almacenamiento y periféricos corporativos.",
        icono: "Laptop",
        color: "#3b82f6",
        es_inventariable: true,
        es_ci_defecto: true,
        se_asigna_custodio: true,
        tiene_ubicacion: true,
        exige_modelo: true,
        exige_numero_serie: true,
        exige_hostname_unico: true,
        tiene_mantenimiento: true,
        tiene_garantia: true,
        tiene_almacenamiento: true,
        ciclo_vida_id: "ciclo_hardware",
        prefijo_codigo: "HDW",
        vida_util_meses: 48,
        garantia_meses: 36,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "computadora_escritorio", codigo: "DSK", nombre: "Computadora de escritorio", activo: true, exige_hostname_unico: true },
          { id: "portatil", codigo: "LAP", nombre: "Portátil / Laptop", activo: true, exige_hostname_unico: true },
          { id: "servidor_fisico", codigo: "SRV", nombre: "Servidor físico", activo: true, exige_hostname_unico: true },
          { id: "monitor", codigo: "MON", nombre: "Monitor", activo: true, exige_hostname_unico: false },
          { id: "impresora_multifuncional", codigo: "PRN", nombre: "Impresora y multifuncional", activo: true, exige_hostname_unico: false },
          { id: "dispositivo_movil", codigo: "MOV", nombre: "Dispositivo móvil (teléfono, tablet)", activo: true, exige_hostname_unico: false },
          { id: "periferico", codigo: "PRF", nombre: "Periférico", activo: true, exige_hostname_unico: false },
          { id: "almacenamiento_san_nas", codigo: "STR", nombre: "Almacenamiento (NAS, SAN, discos)", activo: true, exige_hostname_unico: false },
          { id: "proyector_audiovisual", codigo: "AV", nombre: "Proyector y audiovisual", activo: true, exige_hostname_unico: false },
          { id: "ups_energia", codigo: "UPS", nombre: "UPS y respaldo de energía", activo: true, exige_hostname_unico: false }
        ]
      },
      {
        id: "red",
        codigo: "NET",
        nombre: "Equipos de Red",
        descripcion: "Equipamiento de telecomunicaciones, conmutación, enrutamiento y seguridad perimetral.",
        icono: "Network",
        color: "#06b6d4",
        es_inventariable: true,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: true,
        exige_modelo: true,
        exige_numero_serie: true,
        exige_hostname_unico: true,
        tiene_mantenimiento: true,
        tiene_garantia: true,
        tiene_almacenamiento: false,
        ciclo_vida_id: "ciclo_hardware",
        prefijo_codigo: "NET",
        vida_util_meses: 60,
        garantia_meses: 36,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "switch_red", codigo: "SW", nombre: "Switch", activo: true },
          { id: "router_red", codigo: "RTR", nombre: "Router", activo: true },
          { id: "punto_acceso", codigo: "AP", nombre: "Punto de acceso inalámbrico (AP)", activo: true },
          { id: "firewall", codigo: "FW", nombre: "Firewall / UTM", activo: true },
          { id: "balanceador", codigo: "LB", nombre: "Balanceador de carga", activo: true },
          { id: "telefonia_ip", codigo: "TIP", nombre: "Telefonía IP / PBX", activo: true }
        ]
      },
      {
        id: "infraestructura_fisica",
        codigo: "INF",
        nombre: "Infraestructura Física",
        descripcion: "Racks, gabinetes y elementos pasivos de centros de datos y salas técnicas.",
        icono: "Box",
        color: "#64748b",
        es_inventariable: true,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: true,
        exige_modelo: false,
        exige_numero_serie: false,
        exige_hostname_unico: false,
        tiene_mantenimiento: true,
        tiene_garantia: true,
        tiene_almacenamiento: false,
        ciclo_vida_id: "ciclo_hardware",
        prefijo_codigo: "INF",
        vida_util_meses: 120,
        garantia_meses: 60,
        visible_selector_incidentes: false,
        activo: true,
        tipos: [
          { id: "rack_gabinete", codigo: "RCK", nombre: "Rack y gabinete", activo: true }
        ]
      },
      {
        id: "software",
        codigo: "SFT",
        nombre: "Software",
        descripcion: "Sistemas operativos, aplicaciones de negocio y programas de escritorio (CI lógicos).",
        icono: "FileCode",
        color: "#8b5cf6",
        es_inventariable: false,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: false,
        exige_modelo: false,
        exige_numero_serie: false,
        exige_hostname_unico: false,
        tiene_mantenimiento: false,
        tiene_garantia: false,
        tiene_almacenamiento: false,
        ciclo_vida_id: "ciclo_logico",
        prefijo_codigo: "SFT",
        vida_util_meses: 0,
        garantia_meses: 0,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "sistema_operativo", codigo: "OS", nombre: "Sistema operativo", activo: true },
          { id: "aplicacion_negocio", codigo: "APP", nombre: "Aplicación de negocio", activo: true },
          { id: "software_escritorio", codigo: "DSW", nombre: "Software de escritorio", activo: true },
          { id: "middleware", codigo: "MID", nombre: "Middleware", activo: true }
        ]
      },
      {
        id: "base_datos",
        codigo: "DAT",
        nombre: "Base de Datos",
        descripcion: "Instancias y esquemas de motores de base de datos relacionales y no relacionales.",
        icono: "Database",
        color: "#ec4899",
        es_inventariable: false,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: false,
        exige_modelo: false,
        exige_numero_serie: false,
        exige_hostname_unico: false,
        tiene_mantenimiento: false,
        tiene_garantia: false,
        tiene_almacenamiento: true,
        ciclo_vida_id: "ciclo_logico",
        prefijo_codigo: "DAT",
        vida_util_meses: 0,
        garantia_meses: 0,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "instancia_bd", codigo: "BDI", nombre: "Instancia de base de datos", activo: true }
        ]
      },
      {
        id: "infraestructura_virtual",
        codigo: "VIR",
        nombre: "Infraestructura Virtual",
        descripcion: "Máquinas virtuales, clústeres, hipervisores y contenedores lógicos.",
        icono: "Cloud",
        color: "#0ea5e9",
        es_inventariable: false,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: false,
        exige_modelo: false,
        exige_numero_serie: false,
        exige_hostname_unico: true,
        tiene_mantenimiento: false,
        tiene_garantia: false,
        tiene_almacenamiento: true,
        ciclo_vida_id: "ciclo_logico",
        prefijo_codigo: "VIR",
        vida_util_meses: 0,
        garantia_meses: 0,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "maquina_virtual", codigo: "VM", nombre: "Máquina virtual", activo: true },
          { id: "cluster_contenedor", codigo: "CLS", nombre: "Clúster o contenedor", activo: true },
          { id: "hipervisor", codigo: "HYP", nombre: "Hipervisor", activo: true }
        ]
      },
      {
        id: "servicios",
        codigo: "SRV",
        nombre: "Servicios",
        descripcion: "Servicios institucionales de TI y servicios del negocio soportados por la infraestructura.",
        icono: "Layers",
        color: "#10b981",
        es_inventariable: false,
        es_ci_defecto: true,
        se_asigna_custodio: false,
        tiene_ubicacion: false,
        exige_modelo: false,
        exige_numero_serie: false,
        exige_hostname_unico: false,
        tiene_mantenimiento: false,
        tiene_garantia: false,
        tiene_almacenamiento: false,
        ciclo_vida_id: "ciclo_logico",
        prefijo_codigo: "SRV",
        vida_util_meses: 0,
        garantia_meses: 0,
        visible_selector_incidentes: true,
        activo: true,
        tipos: [
          { id: "servicio_negocio", codigo: "SBN", nombre: "Servicio de negocio", activo: true },
          { id: "servicio_ti", codigo: "STI", nombre: "Servicio de TI", activo: true }
        ]
      }
    ]
  },
  fabricantes_modelos: {
    fabricantes: [
      { id: 1, nombre: "Lenovo", sitio_web: "https://www.lenovo.com", contacto_soporte: "soporte@lenovo.com", activo: true, total_modelos: 2 },
      { id: 2, nombre: "Dell Technologies", sitio_web: "https://www.dell.com", contacto_soporte: "support@dell.com", activo: true, total_modelos: 2 },
      { id: 3, nombre: "Hewlett Packard Enterprise (HPE)", sitio_web: "https://www.hpe.com", contacto_soporte: "support@hpe.com", activo: true, total_modelos: 1 },
      { id: 4, nombre: "Cisco Systems", sitio_web: "https://www.cisco.com", contacto_soporte: "tac@cisco.com", activo: true, total_modelos: 1 },
      { id: 5, nombre: "Apple", sitio_web: "https://www.apple.com", contacto_soporte: "enterprise@apple.com", activo: true, total_modelos: 1 },
      { id: 6, nombre: "Microsoft", sitio_web: "https://www.microsoft.com", contacto_soporte: "support@microsoft.com", activo: true, total_modelos: 1 }
    ],
    modelos: [
      { id: 1, fabricante_id: 1, tipo_id: "portatil", nombre: "ThinkPad X1 Carbon Gen 11", numero_parte: "21HM0004LM", garantia_meses: 36, vida_util_meses: 48, eol: "2027-12-31", eos: "2029-12-31", activo: true },
      { id: 2, fabricante_id: 2, tipo_id: "portatil", nombre: "Latitude 5430", numero_parte: "LAT-5430-I7", garantia_meses: 36, vida_util_meses: 48, eol: "2027-06-30", eos: "2029-06-30", activo: true },
      { id: 3, fabricante_id: 3, tipo_id: "servidor_fisico", nombre: "ProLiant DL380 Gen10", numero_parte: "P02462-B21", garantia_meses: 36, vida_util_meses: 60, eol: "2028-12-31", eos: "2031-12-31", activo: true },
      { id: 4, fabricante_id: 2, tipo_id: "servidor_fisico", nombre: "PowerEdge R740", numero_parte: "PER740-2U", garantia_meses: 36, vida_util_meses: 60, eol: "2027-12-31", eos: "2030-12-31", activo: true },
      { id: 5, fabricante_id: 4, tipo_id: "switch_red", nombre: "Catalyst 3850 48P", numero_parte: "WS-C3850-48P-L", garantia_meses: 60, vida_util_meses: 72, eol: "2026-10-31", eos: "2028-10-31", activo: true }
    ]
  },
  atributos: {
    atributos_base: [
      { id: 1, clase_id: "hardware", codigo: "hostname", etiqueta: "Hostname", tipo_dato: "texto_corto", obligatorio: "siempre", unico: true, sensible: false, protegido: true, aparece_en_incidentes: true, cuenta_completitud: true, orden: 1 },
      { id: 2, clase_id: "hardware", codigo: "sistema_operativo", etiqueta: "Sistema operativo", tipo_dato: "lista", obligatorio: "siempre", unico: false, sensible: false, protegido: true, aparece_en_incidentes: true, cuenta_completitud: true, orden: 2 },
      { id: 3, clase_id: "hardware", codigo: "procesador", etiqueta: "Procesador", tipo_dato: "texto_corto", obligatorio: "no", unico: false, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 3 },
      { id: 4, clase_id: "hardware", codigo: "ram_gb", etiqueta: "Memoria RAM (GB)", tipo_dato: "entero", obligatorio: "siempre", unico: false, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 4 },
      { id: 5, clase_id: "hardware", codigo: "almacenamiento_gb", etiqueta: "Almacenamiento (GB)", tipo_dato: "entero", obligatorio: "no", unico: false, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 5 },
      { id: 6, clase_id: "hardware", codigo: "direccion_ip", etiqueta: "Dirección IP", tipo_dato: "ip", obligatorio: "segun_estado", unico: true, sensible: false, protegido: true, aparece_en_incidentes: true, cuenta_completitud: true, orden: 6 },
      { id: 7, clase_id: "hardware", codigo: "direccion_mac", etiqueta: "Dirección MAC", tipo_dato: "mac", obligatorio: "segun_estado", unico: true, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 7 },
      { id: 8, clase_id: "red", codigo: "num_puertos", etiqueta: "Número de puertos", tipo_dato: "entero", obligatorio: "siempre", unico: false, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 8 },
      { id: 9, clase_id: "red", codigo: "firmware", etiqueta: "Versión de firmware", tipo_dato: "texto_corto", obligatorio: "no", unico: false, sensible: false, protegido: true, aparece_en_incidentes: false, cuenta_completitud: true, orden: 9 },
      { id: 10, clase_id: "software", codigo: "version", etiqueta: "Versión de software", tipo_dato: "texto_corto", obligatorio: "siempre", unico: false, sensible: false, protegido: true, aparece_en_incidentes: true, cuenta_completitud: true, orden: 10 },
      { id: 11, clase_id: "base_datos", codigo: "motor_bd", etiqueta: "Motor de base de datos", tipo_dato: "lista", obligatorio: "siempre", unico: false, sensible: false, protegido: true, aparece_en_incidentes: true, cuenta_completitud: true, orden: 11 },
      { id: 12, clase_id: "base_datos", codigo: "puerto", etiqueta: "Puerto de conexión", tipo_dato: "entero", obligatorio: "siempre", unico: false, sensible: false, protegido: false, aparece_en_incidentes: false, cuenta_completitud: true, orden: 12 }
    ]
  },
  formulario: {
    secciones: [
      { id: "sec_a", titulo: "Sección A — Identificación", orden: 1, abierta_defecto: true },
      { id: "sec_b", titulo: "Sección B — Asignación y ubicación", orden: 2, abierta_defecto: true },
      { id: "sec_c", titulo: "Sección C — Adquisición y finanzas", orden: 3, abierta_defecto: false },
      { id: "sec_d", titulo: "Sección D — Ciclo de vida", orden: 4, abierta_defecto: false },
      { id: "sec_e", titulo: "Sección E — Atributos técnicos", orden: 5, abierta_defecto: true },
      { id: "sec_f", titulo: "Sección F — CMDB", orden: 6, abierta_defecto: true },
      { id: "sec_g", titulo: "Sección G — Otros", orden: 7, abierta_defecto: false }
    ],
    campos_bloqueados: ["codigo", "nombre", "clase_id", "tipo_id", "estado_id"],
    minimo_campos_visibles: 8,
    permitir_sobrescritura_por_tipo: true
  },
  codigo_etiquetas: {
    formato_codigo: "{PREFIJO_TIPO}-{AAAA}-{CORRELATIVO:6}",
    alcance_correlativo: "por_tipo",
    reinicio_anual: false,
    longitud_correlativo: 6,
    separador: "-",
    simbolo_etiqueta: "ambos",
    contenido_qr: "enlace_ficha",
    tamano_etiqueta: "50x25",
    mostrar_logo: true,
    mostrar_codigo: true,
    mostrar_nombre: true,
    mostrar_tipo: true,
    mostrar_ubicacion: true
  },
  ubicaciones: {
    niveles_permitidos: ["SEDE", "EDIFICIO", "PISO", "AMBIENTE", "RACK"],
    profundidad_maxima: 6,
    exigir_responsable_en_rack: true,
    heredar_departamento_si_vacio: true
  },
  catalogos_auxiliares: {
    condicion_fisica: [
      { id: "nuevo", codigo: "NUEVO", nombre: "Nuevo", color: "#10b981", exige_informe: false, orden: 1, activo: true },
      { id: "bueno", codigo: "BUENO", nombre: "Bueno", color: "#3b82f6", exige_informe: false, orden: 2, activo: true },
      { id: "regular", codigo: "REGULAR", nombre: "Regular", color: "#f59e0b", exige_informe: false, orden: 3, activo: true },
      { id: "malo", codigo: "MALO", nombre: "Malo", color: "#ef4444", exige_informe: true, orden: 4, activo: true }
    ],
    monedas: [
      { codigo: "USD", simbolo: "$", nombre: "Dólar estadounidense", por_defecto: true, activo: true },
      { codigo: "PEN", simbolo: "S/.", nombre: "Sol peruano", por_defecto: false, activo: true },
      { codigo: "EUR", simbolo: "€", nombre: "Euro", por_defecto: false, activo: true }
    ],
    tipos_adquisicion: [
      { codigo: "COMPRA", nombre: "Compra directa", exige_contrato: false, orden: 1, activo: true },
      { codigo: "ARRENDAMIENTO", nombre: "Arrendamiento (Leasing)", exige_contrato: true, orden: 2, activo: true },
      { codigo: "DONACION", nombre: "Donación", exige_contrato: false, orden: 3, activo: true },
      { codigo: "COMODATO", nombre: "Comodato", exige_contrato: true, orden: 4, activo: true },
      { codigo: "OTRO", nombre: "Otro", exige_contrato: false, orden: 5, activo: true }
    ],
    tipos_documento: [
      { codigo: "FACTURA", nombre: "Factura comercial", obligatorio_baja: false, orden: 1, activo: true },
      { codigo: "GARANTIA", nombre: "Certificado de garantía", obligatorio_baja: false, orden: 2, activo: true },
      { codigo: "ACTA_ENTREGA", nombre: "Acta de entrega / custodia", obligatorio_baja: false, orden: 3, activo: true },
      { codigo: "ACTA_BAJA", nombre: "Acta de baja y disposición", obligatorio_baja: true, orden: 4, activo: true },
      { codigo: "CERTIFICADO_BORRADO", nombre: "Certificado de borrado seguro", obligatorio_baja: true, orden: 5, activo: true },
      { codigo: "MANUAL", nombre: "Manual técnico / Ficha", obligatorio_baja: false, orden: 6, activo: true },
      { codigo: "FOTO", nombre: "Fotografía de evidencia", obligatorio_baja: false, orden: 7, activo: true }
    ],
    centros_costo: [
      { codigo: "CC-TI-01", nombre: "Tecnología e Infraestructura", departamento: "TI" },
      { codigo: "CC-ADM-01", nombre: "Administración General", departamento: "Administración" },
      { codigo: "CC-OPS-01", nombre: "Operaciones Institucionales", departamento: "Operaciones" }
    ]
  },
  ficha_listado: {
    cabecera_elementos: [
      { id: "codigo", nombre: "Código de activo", visible: true, orden: 1 },
      { id: "nombre", nombre: "Nombre / Hostname", visible: true, orden: 2 },
      { id: "estado", nombre: "Insignia de estado de ciclo de vida", visible: true, orden: 3 },
      { id: "clase_tipo", nombre: "Clase y tipo de activo", visible: true, orden: 4 },
      { id: "fabricante_modelo", nombre: "Fabricante y modelo", visible: true, orden: 5 },
      { id: "criticidad", nombre: "Criticidad institucional", visible: true, orden: 6 },
      { id: "entorno", nombre: "Entorno operativo", visible: true, orden: 7 },
      { id: "custodio", nombre: "Custodio responsable", visible: true, orden: 8 },
      { id: "ubicacion", nombre: "Ubicación física", visible: true, orden: 9 },
      { id: "garantia", nombre: "Indicador de garantía", visible: true, orden: 10 }
    ],
    pestanas_ficha: [
      { id: "general", nombre: "General", orden: 1, visible: true, solo_lectura: false },
      { id: "atributos_tecnicos", nombre: "Atributos técnicos", orden: 2, visible: true, solo_lectura: false },
      { id: "asignacion_ubicacion", nombre: "Asignación y ubicación", orden: 3, visible: true, solo_lectura: false },
      { id: "cmdb_relaciones", nombre: "CMDB y relaciones", orden: 4, visible: true, solo_lectura: false },
      { id: "tickets_asociados", nombre: "Tickets asociados", orden: 5, visible: true, solo_lectura: true },
      { id: "mantenimiento_garantia", nombre: "Mantenimiento y garantía", orden: 6, visible: true, solo_lectura: false },
      { id: "software_licencias", nombre: "Software y licencias", orden: 7, visible: true, solo_lectura: false },
      { id: "documentos", nombre: "Documentos", orden: 8, visible: true, solo_lectura: false },
      { id: "verificacion_inventario", nombre: "Verificación e inventario", orden: 9, visible: true, solo_lectura: true },
      { id: "comentarios_bitacora", nombre: "Comentarios y bitácora", orden: 10, visible: true, solo_lectura: false },
      { id: "historial_auditoria", nombre: "Historial / auditoría", orden: 11, visible: true, solo_lectura: true }
    ],
    columnas_listado_71: ["codigo", "nombre", "tipo", "marca_modelo", "estado", "custodio", "ubicacion", "garantia"],
    vistas_guardadas_defecto: ["Todos", "Mis activos", "En stock", "En reparación", "Garantía por vencer", "Sin custodio", "Pendientes de baja"]
  },
  importacion_inventario: {
    limite_filas_archivo: 5000,
    tiempo_reversion_horas: 24,
    clave_coincidencia_defecto: "codigo_patrimonial",
    modo_importacion_defecto: "crear_y_actualizar",
    frecuencia_campanias_defecto: "trimestral",
    tolerancia_no_verificado_campanias: 2,
    accion_sobrante: "crear_activo_provisional",
    generar_incidente_seguridad_al_perder: true
  }
};

export interface ResultadoConfig {
  httpStatus: number;
  payload: any;
}

export async function obtenerConfiguracionTiposModelosAtributos(idUsuario: number | undefined, pestana: string) {
    // 1. Versión publicada activa
    const versionPublicada = await queryRow(`
      SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    // 2. Borrador activo
    const borradorActual = await queryRow(`
      SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    // 3. Bloqueo concurrente
    const recursoLock = `activos:1.5.1:${pestana}`;
    const bloqueoActual = await queryRow(`
      SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
             CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
      FROM bloqueo_edicion_concurrente b
      LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recursoLock]);

    const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_151[pestana] || {};
    const snapshotActivo = borradorActual?.snapshot || snapshotBase;
    const diff = calcularDiff(snapshotBase, snapshotActivo);

    // Contar activos inventariados
    const totalActivos = await queryRow(`
      SELECT COUNT(*) as total FROM activo WHERE estado_registro = true
    `);

    // Historial de versiones
    const historialVersiones = await query(`
      SELECT cmv.id_version, cmv.numero_version, cmv.es_publicada, cmv.es_borrador, cmv.fecha_creacion, cmv.motivo, cmv.impacto_resumen, cmv.id_usuario_creacion,
             CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
      FROM configuracion_modulo_versiones cmv
      LEFT JOIN usuario u ON u.id_usuario = cmv.id_usuario_creacion
      WHERE cmv.modulo = 'activos_y_cmdb' AND cmv.pantalla = '1.5.1' AND cmv.pestana = $1
      ORDER BY cmv.id_version DESC LIMIT 20
    `, [pestana]);

    // Catálogos de apoyo
    const usuariosCatalogo = await query(`
      SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico,
             p.nombre as perfil, p.id_perfil
      FROM usuario u
      LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
      LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
      WHERE u.estado_registro = true
      ORDER BY u.nombres ASC
    `);

    const departamentosCatalogo = await query(`
      SELECT id_departamento_empresa as id_departamento, nombre 
      FROM departamento_empresa 
      WHERE estado_registro = true 
      ORDER BY nombre ASC
    `);

    const ubicacionesCatalogo = await query(`
      SELECT id_ubicacion, codigo, nombre, tipo_nivel, ruta_completa, capacidad_u
      FROM ubicacion
      WHERE activo = true
      ORDER BY ruta_completa ASC
    `);

    return {
      pestana,
      version_publicada: versionPublicada ? {
        ...versionPublicada,
        snapshot: versionPublicada.snapshot || VALORES_FABRICA_151[pestana]
      } : {
        numero_version: 1,
        snapshot: VALORES_FABRICA_151[pestana]
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
      total_activos: parseInt(totalActivos?.total || "0", 10),
      historial_versiones: historialVersiones || [],
      catalogo_usuarios: usuariosCatalogo || [],
      catalogo_departamentos: departamentosCatalogo || [],
      catalogo_ubicaciones: ubicacionesCatalogo || []
    };
}

export async function procesarAccionTiposModelosAtributos(idUsuario: number, body: any): Promise<ResultadoConfig> {
  const { pestana, snapshot, motivo, version_id_origen } = body;
  const accion = body.accion || "guardar_borrador";

  if (!pestana) {
    throw new ErrorDominio("La pestaña es obligatoria");
  }

  const recursoLock = `activos:1.5.1:${pestana}`;

  if (accion === "adquirir_bloqueo" || accion === "solicitar_control") {
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND fecha_expiracion <= NOW()`, [recursoLock]);
    const existente = await queryRow(`
      SELECT id_bloqueo, id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente WHERE recurso = $1
    `, [recursoLock]);

    if (accion !== "solicitar_control" && existente && existente.id_usuario !== idUsuario && new Date(existente.fecha_expiracion) > new Date()) {
      return {
        httpStatus: 423,
        payload: {
          bloqueado: true,
          mensaje: "La pestaña está siendo editada por otro usuario"
        }
      };
    }

    await query(`
      INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
      ON CONFLICT (recurso) DO UPDATE SET 
        id_usuario = EXCLUDED.id_usuario,
        fecha_bloqueo = NOW(),
        fecha_expiracion = NOW() + INTERVAL '15 minutes'
    `, [recursoLock, idUsuario]);

    return { httpStatus: 200, payload: { ok: true, mensaje: "Bloqueo adquirido" } };
  }

  if (accion === "liberar_bloqueo") {
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, idUsuario]);
    return { httpStatus: 200, payload: { ok: true, mensaje: "Bloqueo liberado" } };
  }

  if (accion === "guardar_borrador") {
    const versionPub = await queryRow(`
      SELECT snapshot, numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot || VALORES_FABRICA_151[pestana], snapshot);

    // Eliminar borrador anterior si existiese
    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    // Insertar nuevo borrador
    const nuevoBorrador = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.1', $1, $2, false, true, $3, $4, $5, $6
      ) RETURNING id_version, fecha_creacion
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(snapshot), JSON.stringify(diff), motivo || "Borrador de trabajo", idUsuario]);

    // Refrescar bloqueo
    await query(`
      INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
      ON CONFLICT (recurso) DO UPDATE SET fecha_expiracion = NOW() + INTERVAL '15 minutes'
    `, [recursoLock, idUsuario]);

    return {
      httpStatus: 200,
      payload: {
        ok: true,
        mensaje: "Borrador guardado exitosamente",
        borrador: {
          id_version: nuevoBorrador?.id_version,
          snapshot,
          diff,
          fecha_creacion: nuevoBorrador?.fecha_creacion
        }
      }
    };
  }

  if (accion === "restaurar_fabrica") {
    const fabrica = VALORES_FABRICA_151[pestana];
    if (!fabrica) {
      throw new ErrorDominio("No existen valores de fábrica para esta pestaña", 404);
    }

    const versionPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot, fabrica);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const borradorRestaurado = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.1', $1, $2, false, true, $3, $4, 'Restauración de valores de fábrica en borrador', $5
      ) RETURNING id_version, fecha_creacion
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(fabrica), JSON.stringify(diff), idUsuario]);

    return {
      httpStatus: 200,
      payload: {
        ok: true,
        mensaje: "Valores de fábrica cargados en borrador",
        borrador: {
          id_version: borradorRestaurado?.id_version,
          snapshot: fabrica,
          diff,
          fecha_creacion: borradorRestaurado?.fecha_creacion
        }
      }
    };
  }

  if (accion === "restaurar_version") {
    if (!version_id_origen) {
      throw new ErrorDominio("ID de versión requerido");
    }

    const versionOrigen = await queryRow(`
      SELECT snapshot FROM configuracion_modulo_versiones
      WHERE id_version = $1
    `, [version_id_origen]);

    if (!versionOrigen?.snapshot) {
      throw new ErrorDominio("Versión no encontrada", 404);
    }

    const versionPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot, versionOrigen.snapshot);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const borradorRestaurado = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.1', $1, $2, false, true, $3, $4, $5, $6
      ) RETURNING id_version, fecha_creacion
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(versionOrigen.snapshot), JSON.stringify(diff), motivo || `Restaurado desde versión previa #${version_id_origen}`, idUsuario]);

    return {
      httpStatus: 200,
      payload: {
        ok: true,
        mensaje: "Versión histórica cargada en borrador",
        borrador: {
          id_version: borradorRestaurado?.id_version,
          snapshot: versionOrigen.snapshot,
          diff,
          fecha_creacion: borradorRestaurado?.fecha_creacion
        }
      }
    };
  }

  throw new ErrorDominio("Acción no reconocida");
}

export async function publicarConfiguracionTiposModelosAtributos(idUsuario: number, body: any) {
  const { pestana, motivo, impacto_resumen } = body;

  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  // Verificar si existe bloqueo activo por otro usuario
  const recursoLock = `activos:1.5.1:${pestana}`;
  const bloqueoActual = await queryRow(`
    SELECT id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente 
    WHERE recurso = $1 AND fecha_expiracion > NOW()
  `, [recursoLock]);

  if (bloqueoActual && bloqueoActual.id_usuario !== idUsuario) {
    throw new ErrorDominio("La configuración está bloqueada por otro usuario", 423);
  }

  const borrador = await queryRow(`
    SELECT id_version, snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  if (!borrador) {
    throw new ErrorDominio("No hay un borrador pendiente de publicación");
  }

  const versionPubPrevia = await queryRow(`
    SELECT id_version, numero_version, snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const nuevoNumero = (versionPubPrevia?.numero_version || 0) + 1;
  const diff = calcularDiff(versionPubPrevia?.snapshot, borrador.snapshot);

  if (versionPubPrevia) {
    await query(`
      UPDATE configuracion_modulo_versiones
      SET es_publicada = false
      WHERE id_version = $1
    `, [versionPubPrevia.id_version]);
  }

  const nuevaPublicada = await queryRow(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
    ) VALUES (
      'activos_y_cmdb', '1.5.1', $1, $2, true, false, $3, $4, $5, $6, $7
    ) RETURNING id_version, numero_version, fecha_creacion
  `, [
    pestana,
    nuevoNumero,
    JSON.stringify(borrador.snapshot),
    JSON.stringify(diff),
    motivo || `Publicación formal versión v${nuevoNumero}`,
    impacto_resumen || "Publicación de configuración de tipos, modelos y atributos de activos",
    idUsuario
  ]);

  // Eliminar el borrador publicado
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE id_version = $1
  `, [borrador.id_version]);

  // Liberar bloqueo
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

  return {
    ok: true,
    mensaje: `Versión v${nuevoNumero} publicada exitosamente`,
    id_version: nuevaPublicada?.id_version,
    numero_version: nuevoNumero,
    fecha_creacion: nuevaPublicada?.fecha_creacion
  };
}

export async function descartarBorradorTiposModelosAtributos(idUsuario: number, pestana: string) {
  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.1' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  const recursoLock = `activos:1.5.1:${pestana}`;
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, idUsuario]);

  return { ok: true, mensaje: "Borrador descartado correctamente" };
}
