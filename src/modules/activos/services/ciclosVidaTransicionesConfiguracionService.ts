import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { calcularDiffConfig } from "@/shared/lib/configuracionModulo";

export const VALORES_FABRICA_152: Record<string, any> = {
  ciclos_estados: {
    ciclos: [
      {
        id: "ciclo_hardware",
        nombre: "Hardware inventariable",
        descripcion: "Ciclo de vida para equipos físicos, periféricos y equipamiento de infraestructura de red.",
        aplica_a: ["hardware", "red", "infraestructura_fisica"],
        activo: true,
        estados: [
          {
            id: "solicitado",
            codigo: "SOLICITADO",
            nombre: "Solicitado",
            tipo_estado: "planificado",
            color: "#64748b",
            es_inicial: true,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 1
          },
          {
            id: "ordenado",
            codigo: "ORDENADO",
            nombre: "Ordenado / En compra",
            tipo_estado: "planificado",
            color: "#3b82f6",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 2
          },
          {
            id: "en_stock",
            codigo: "EN_STOCK",
            nombre: "En stock / Almacén",
            tipo_estado: "disponible",
            color: "#10b981",
            es_inicial: false,
            es_inicial_alterno: true,
            cuenta_inventario: true,
            asignable: true,
            ci_activo: true,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: true,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 3
          },
          {
            id: "asignado",
            codigo: "ASIGNADO",
            nombre: "Asignado en uso",
            tipo_estado: "en_uso",
            color: "#0ea5e9",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: true,
            asignable: false,
            ci_activo: true,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: true,
            requiere_custodio: true,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 4
          },
          {
            id: "en_prestamo",
            codigo: "EN_PRESTAMO",
            nombre: "En préstamo temporal",
            tipo_estado: "en_uso",
            color: "#8b5cf6",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: true,
            asignable: false,
            ci_activo: true,
            permite_incidentes: true,
            permite_rfc: false,
            requiere_ubicacion: true,
            requiere_custodio: true,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 5
          },
          {
            id: "en_reparacion",
            codigo: "EN_REPARACION",
            nombre: "En reparación / Mantenimiento",
            tipo_estado: "en_mantenimiento",
            color: "#f59e0b",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: true,
            asignable: false,
            ci_activo: false,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: true,
            requiere_custodio: false,
            permite_edicion: "solo_tecnico",
            sistema: true,
            activo: true,
            orden: 6
          },
          {
            id: "retirado",
            codigo: "RETIRADO",
            nombre: "Retirado de operación",
            tipo_estado: "inactivo",
            color: "#6b7280",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: true,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 7
          },
          {
            id: "perdido_robado",
            codigo: "PERDIDO_ROBADO",
            nombre: "Perdido o robado",
            tipo_estado: "inactivo",
            color: "#ef4444",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: true,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 8
          },
          {
            id: "dado_de_baja",
            codigo: "DADO_DE_BAJA",
            nombre: "Dado de baja y dispuesto",
            tipo_estado: "final",
            color: "#1e293b",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 9
          },
          {
            id: "cancelado",
            codigo: "CANCELADO",
            nombre: "Cancelado",
            tipo_estado: "final",
            color: "#94a3b8",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 10
          }
        ]
      },
      {
        id: "ciclo_logico",
        nombre: "Elemento lógico (Software / Servicios / Nube)",
        descripcion: "Ciclo de vida para aplicaciones, bases de datos, máquinas virtuales y servicios de TI.",
        aplica_a: ["software", "base_de_datos", "infraestructura_virtual", "servicios"],
        activo: true,
        estados: [
          {
            id: "planificado",
            codigo: "PLANIFICADO",
            nombre: "Planificado",
            tipo_estado: "planificado",
            color: "#64748b",
            es_inicial: true,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: true,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 1
          },
          {
            id: "en_implementacion",
            codigo: "EN_IMPLEMENTACION",
            nombre: "En implementación / Pruebas",
            tipo_estado: "planificado",
            color: "#3b82f6",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: true,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 2
          },
          {
            id: "activo",
            codigo: "ACTIVO",
            nombre: "Activo en producción",
            tipo_estado: "en_uso",
            color: "#10b981",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: true,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "si",
            sistema: true,
            activo: true,
            orden: 3
          },
          {
            id: "en_mantenimiento",
            codigo: "EN_MANTENIMIENTO",
            nombre: "En mantenimiento programado",
            tipo_estado: "en_mantenimiento",
            color: "#f59e0b",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: true,
            permite_rfc: true,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "solo_tecnico",
            sistema: true,
            activo: true,
            orden: 4
          },
          {
            id: "retirado",
            codigo: "RETIRADO",
            nombre: "Retirado / Descomisionado",
            tipo_estado: "final",
            color: "#1e293b",
            es_inicial: false,
            es_inicial_alterno: false,
            cuenta_inventario: false,
            asignable: false,
            ci_activo: false,
            permite_incidentes: false,
            permite_rfc: false,
            requiere_ubicacion: false,
            requiere_custodio: false,
            permite_edicion: "no",
            sistema: true,
            activo: true,
            orden: 5
          }
        ]
      }
    ]
  },
  transiciones_reglas: {
    ciclo_id: "ciclo_hardware",
    transiciones: [
      {
        id: "tr_registrar_pedido",
        nombre: "Registrar pedido",
        estados_origen: ["solicitado"],
        estado_destino: "ordenado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_bloqueos_presupuestales"],
        campos_obligatorios: ["orden_compra", "proveedor_id", "fecha_pedido"],
        requiere_aprobacion: false,
        documento_generado: "ninguno",
        automatizaciones: ["actualizar_fechas_estimadas", "notificar_solicitante"],
        color_boton: "#3b82f6",
        orden: 1
      },
      {
        id: "tr_registrar_recepcion",
        nombre: "Registrar recepción",
        estados_origen: ["ordenado"],
        estado_destino: "en_stock",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: [],
        campos_obligatorios: ["numero_serie", "ubicacion_id", "guia_remision"],
        requiere_aprobacion: false,
        documento_generado: "etiqueta_qr",
        automatizaciones: ["calcular_fin_garantia_vida_util", "asignar_codigo_patrimonial", "generar_etiqueta"],
        color_boton: "#10b981",
        orden: 2
      },
      {
        id: "tr_ingreso_directo",
        nombre: "Ingreso directo a stock",
        estados_origen: ["solicitado"],
        estado_destino: "en_stock",
        perfiles_autorizados: ["Administrador"],
        condiciones_previas: [],
        campos_obligatorios: ["motivo_ingreso_directo", "ubicacion_id"],
        requiere_aprobacion: false,
        documento_generado: "etiqueta_qr",
        automatizaciones: ["asignar_codigo_patrimonial"],
        color_boton: "#10b981",
        orden: 3
      },
      {
        id: "tr_asignar",
        nombre: "Asignar a custodio",
        estados_origen: ["en_stock"],
        estado_destino: "asignado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_incidentes_abiertos", "garantia_vigente"],
        campos_obligatorios: ["custodio_id", "tipo_asignacion", "fecha_asignacion"],
        requiere_aprobacion: false,
        documento_generado: "acta_entrega",
        automatizaciones: ["registrar_custodio_fecha", "generar_acta_entrega", "solicitar_aceptacion_digital"],
        color_boton: "#0ea5e9",
        orden: 4
      },
      {
        id: "tr_prestar",
        nombre: "Entregar en préstamo",
        estados_origen: ["en_stock"],
        estado_destino: "en_prestamo",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_incidentes_abiertos"],
        campos_obligatorios: ["custodio_id", "fecha_devolucion_prevista"],
        requiere_aprobacion: false,
        documento_generado: "acta_entrega",
        automatizaciones: ["registrar_custodio_fecha", "programar_alerta_vencimiento_prestamo"],
        color_boton: "#8b5cf6",
        orden: 5
      },
      {
        id: "tr_transferir",
        nombre: "Transferir custodio",
        estados_origen: ["asignado"],
        estado_destino: "asignado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_incidentes_abiertos"],
        campos_obligatorios: ["nuevo_custodio_id", "motivo_transferencia"],
        requiere_aprobacion: false,
        documento_generado: "acta_transferencia",
        automatizaciones: ["cerrar_asignacion_previa", "registrar_nuevo_custodio", "generar_acta_entrega"],
        color_boton: "#0ea5e9",
        orden: 6
      },
      {
        id: "tr_devolver",
        nombre: "Devolver a stock",
        estados_origen: ["asignado", "en_prestamo"],
        estado_destino: "en_stock",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración", "Técnico"],
        condiciones_previas: [],
        campos_obligatorios: ["condicion_fisica", "checklist_devolucion"],
        requiere_aprobacion: false,
        documento_generado: "acta_devolucion",
        automatizaciones: ["cerrar_asignacion_historial", "actualizar_condicion_fisica", "limpiar_custodio_activo"],
        color_boton: "#10b981",
        orden: 7
      },
      {
        id: "tr_enviar_reparacion",
        nombre: "Enviar a reparación",
        estados_origen: ["en_stock", "asignado"],
        estado_destino: "en_reparacion",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración", "Técnico"],
        condiciones_previas: [],
        campos_obligatorios: ["motivo_reparacion", "proveedor_taller", "ticket_asociado"],
        requiere_aprobacion: false,
        documento_generado: "guia_salida",
        automatizaciones: ["desactivar_ci_cmdb", "registrar_historial_mantenimiento"],
        color_boton: "#f59e0b",
        orden: 8
      },
      {
        id: "tr_retornar_reparacion",
        nombre: "Retornar de reparación",
        estados_origen: ["en_reparacion"],
        estado_destino: "en_stock",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración", "Técnico"],
        condiciones_previas: [],
        campos_obligatorios: ["resultado_tecnico", "costo_reparacion"],
        requiere_aprobacion: false,
        documento_generado: "informe_tecnico",
        automatizaciones: ["reactivar_ci_cmdb", "actualizar_registro_mantenimiento"],
        color_boton: "#10b981",
        orden: 9
      },
      {
        id: "tr_retirar_servicio",
        nombre: "Retirar de servicio",
        estados_origen: ["en_stock", "asignado"],
        estado_destino: "retirado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_incidentes_abiertos", "sin_rfc_programadas", "sin_relaciones_criticas"],
        campos_obligatorios: ["motivo_retiro"],
        requiere_aprobacion: false,
        documento_generado: "acta_retiro",
        automatizaciones: ["liberar_licencias_asignadas", "desactivar_ci_cmdb", "cancelar_mantenimientos_programados"],
        color_boton: "#6b7280",
        orden: 10
      },
      {
        id: "tr_reportar_perdida_robo",
        nombre: "Reportar pérdida o robo",
        estados_origen: ["asignado", "en_stock", "en_prestamo"],
        estado_destino: "perdido_robado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración", "Supervisor"],
        condiciones_previas: [],
        campos_obligatorios: ["numero_denuncia", "descripcion_hechos"],
        requiere_aprobacion: false,
        documento_generado: "informe_incidente",
        automatizaciones: ["crear_incidente_seguridad", "liberar_licencias_asignadas", "notificar_oficial_seguridad"],
        color_boton: "#ef4444",
        orden: 11
      },
      {
        id: "tr_recuperar",
        nombre: "Recuperar activo",
        estados_origen: ["perdido_robado"],
        estado_destino: "en_stock",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: [],
        campos_obligatorios: ["motivo_recuperacion", "informe_verificacion"],
        requiere_aprobacion: false,
        documento_generado: "acta_recuperacion",
        automatizaciones: ["actualizar_estado_incidente_seguridad"],
        color_boton: "#10b981",
        orden: 12
      },
      {
        id: "tr_dar_de_baja",
        nombre: "Dar de baja y disposición",
        estados_origen: ["retirado", "perdido_robado", "en_reparacion"],
        estado_destino: "dado_de_baja",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: ["sin_incidentes_abiertos", "sin_rfc_programadas", "sin_asignacion_vigente", "sin_relaciones_criticas"],
        campos_obligatorios: ["motivo_baja", "fecha_baja", "destino_disposicion", "certificado_borrado"],
        requiere_aprobacion: true,
        etapas_aprobacion: [
          { perfil: "Supervisor", orden: 1, plazo_horas: 48 },
          { perfil: "Aprobador", orden: 2, plazo_horas: 72 }
        ],
        documento_generado: "acta_baja",
        automatizaciones: ["desactivar_ci_cmdb", "liberar_licencias_asignadas", "generar_acta_baja_firmada"],
        color_boton: "#1e293b",
        orden: 13
      },
      {
        id: "tr_cancelar_pedido",
        nombre: "Cancelar solicitud / pedido",
        estados_origen: ["solicitado", "ordenado"],
        estado_destino: "cancelado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: [],
        campos_obligatorios: ["motivo_cancelacion"],
        requiere_aprobacion: false,
        documento_generado: "ninguno",
        automatizaciones: ["notificar_solicitante"],
        color_boton: "#94a3b8",
        orden: 14
      }
    ]
  },
  asignacion_custodia: {
    tipos_asignacion: [
      { id: "personal", nombre: "Personal (Individual)", exige_custodio_persona: true, exige_fecha_devolucion: false, exige_aceptacion: true, duracion_maxima_dias: 0, activo: true },
      { id: "compartido", nombre: "Compartido o departamental", exige_custodio_persona: false, exige_fecha_devolucion: false, exige_aceptacion: false, duracion_maxima_dias: 0, activo: true },
      { id: "prestamo_temporal", nombre: "Préstamo temporal", exige_custodio_persona: true, exige_fecha_devolucion: true, exige_aceptacion: true, duracion_maxima_dias: 30, activo: true },
      { id: "ubicacion_servicio", nombre: "A ubicación o servicio técnico", exige_custodio_persona: false, exige_fecha_devolucion: false, exige_aceptacion: false, duracion_maxima_dias: 0, activo: true }
    ],
    reglas_custodia: {
      un_solo_custodio_vigente: true,
      limite_activos_por_usuario: [
        { tipo_activo: "portatil", maximo: 1, accion: "advertir" },
        { tipo_activo: "estacion_trabajo", maximo: 1, accion: "bloquear" },
        { tipo_activo: "dispositivo_movil", maximo: 1, accion: "advertir" }
      ],
      exigir_aceptacion_digital: true,
      plazo_aceptacion_dias: 5,
      accion_no_acepta: "escalar_supervisor",
      recordatorio_prestamo_vencimiento_dias: 3,
      permitir_transferencia_directa: true,
      accion_usuario_desvinculado: "notificar_gestor_y_crear_tarea",
      incluir_activos_departamentales_en_selector_incidentes: true
    },
    plantilla_acta_entrega: {
      titulo: "Acta Oficial de Entrega y Recepción de Activo Tecnológico",
      contenido: "Por medio de la presente, el colaborador {custodio} declara haber recibido en conformidad el activo {nombre} ({codigo}), con número de serie {serie}, asumiendo la custodia responsable y el compromiso de buen uso institucional conforme a las políticas de seguridad de la información.",
      politica_uso_aceptable: "El custodio se compromete a no prestar el activo a terceros no autorizados, proteger las credenciales corporativas, reportar cualquier extravío o daño dentro de las 24 horas y devolver el bien al término de su relación laboral o asignación (ISO/IEC 27001 A.5.10)."
    },
    checklist_devolucion: [
      { id: "1", tarea: "Inspección física visual (ausencia de rajaduras o daños por impacto)", obligatorio: true },
      { id: "2", tarea: "Entrega completa de accesorios originales (cargador, cables, periféricos)", obligatorio: true },
      { id: "3", tarea: "Copia de respaldo o purga de datos personales y cierre de sesiones corporativas", obligatorio: true },
      { id: "4", tarea: "Verificación de legibilidad de la etiqueta con código patrimonial", obligatorio: true }
    ]
  },
  adquisicion_recepcion: {
    servicios_solicitud_vinculados: [
      { id: 1, servicio_id: 101, servicio_nombre: "Solicitud de computadora portátil para nuevo ingreso", tipo_activo_generado: "portatil", crear_activo_previo: true, estado_inicial: "solicitado" },
      { id: 2, servicio_id: 102, servicio_nombre: "Renovación planificada de estaciones de trabajo de cómputo", tipo_activo_generado: "estacion_trabajo", crear_activo_previo: true, estado_inicial: "solicitado" },
      { id: 3, servicio_id: 103, servicio_nombre: "Adquisición de servidor de rack de infraestructura", tipo_activo_generado: "servidor_fisico", crear_activo_previo: true, estado_inicial: "solicitado" }
    ],
    campos_compra_exigidos: [
      { id: "orden_compra", etiqueta: "Número de Orden de Compra", obligatorio: true },
      { id: "proveedor_id", etiqueta: "Proveedor adjudicado (Módulo 8)", obligatorio: true },
      { id: "fecha_pedido", etiqueta: "Fecha de emisión del pedido", obligatorio: true },
      { id: "monto_estimado", etiqueta: "Monto total de adquisición", obligatorio: false },
      { id: "fecha_entrega_estimada", etiqueta: "Fecha estimada de entrega en almacén", obligatorio: false }
    ],
    reglas_recepcion: {
      auto_calcular_garantia: true,
      auto_asignar_codigo: true,
      imprimir_etiqueta_tras_recepcion: true,
      permitir_recepcion_parcial: true,
      estado_destino_defecto: "en_stock",
      resolver_solicitud_origen_al_completar: true,
      permitir_ingreso_directo_sin_solicitud: true
    }
  },
  mantenimiento_fin_vida: {
    tipos_mantenimiento: [
      { id: "preventivo", nombre: "Mantenimiento preventivo periódico", genera_ticket: true, rfc_estandar_permitida: true, activo: true },
      { id: "correctivo", nombre: "Mantenimiento correctivo por avería", genera_ticket: true, rfc_estandar_permitida: false, activo: true },
      { id: "calibracion", nombre: "Calibración y certificación técnica", genera_ticket: true, rfc_estandar_permitida: true, activo: true },
      { id: "actualizacion", nombre: "Actualización de hardware o firmware", genera_ticket: false, rfc_estandar_permitida: true, activo: true }
    ],
    planes_preventivos: [
      {
        id: 1,
        nombre: "Mantenimiento Preventivo Semestral de Portátiles",
        aplica_a: "portatil",
        frecuencia_meses: 6,
        checklist_tareas: ["Limpieza interna de ventiladores", "Cambio de pasta térmica si aplica", "Diagnóstico de batería", "Actualización de BIOS"],
        responsable_grupo: "Soporte Técnico Nivel 1",
        accion_vencimiento: "crear_solicitud_servicio",
        anticipacion_dias: 15,
        activo: true
      },
      {
        id: 2,
        nombre: "Inspección Anual de Servidores de Infraestructura Central",
        aplica_a: "servidor_fisico",
        frecuencia_meses: 12,
        checklist_tareas: ["Verificación de fuentes redundantes", "Inspección de discos RAID", "Comprobación de firmware iLO/iDRAC"],
        responsable_grupo: "Infraestructura y Redes",
        accion_vencimiento: "crear_rfc_estandar",
        anticipacion_dias: 30,
        activo: true
      }
    ],
    politica_fin_vida: {
      anticipacion_alerta_meses: 6,
      accion_sugerida: "planificar_reemplazo",
      usar_fechas_eol_eos_modelo: true,
      cambiar_estado_a_obsoleto_automatico: false,
      suspender_alertas_si_en_reparacion: true
    }
  },
  baja_disposicion: {
    motivos_baja: [
      { id: "obsolescencia", codigo: "OBSOLESCENCIA", nombre: "Obsolescencia tecnológica superada", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
      { id: "dano_irreparable", codigo: "DANO_IRREPARABLE", nombre: "Daño físico o siniestro irreparable", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
      { id: "perdida", codigo: "PERDIDA", nombre: "Pérdida o extravío no recuperable", exige_aprobacion: true, exige_informe_tecnico: false, exige_borrado_seguro: false, exige_denuncia: true, exige_incidente_seguridad: true, exige_acta: true, activo: true },
      { id: "robo", codigo: "ROBO", nombre: "Robo o sustracción delictiva", exige_aprobacion: true, exige_informe_tecnico: false, exige_borrado_seguro: false, exige_denuncia: true, exige_incidente_seguridad: true, exige_acta: true, activo: true },
      { id: "venta", codigo: "VENTA", nombre: "Venta patrimonial autorizada", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
      { id: "donacion", codigo: "DONACION", nombre: "Donación social institucional", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
      { id: "devolucion_proveedor", codigo: "DEVOLUCION_PROVEEDOR", nombre: "Devolución por fin de arrendamiento", exige_aprobacion: false, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true },
      { id: "reciclaje", codigo: "RECICLAJE", nombre: "Reciclaje y chatarrización RAEE", exige_aprobacion: true, exige_informe_tecnico: true, exige_borrado_seguro: true, exige_denuncia: false, exige_incidente_seguridad: false, exige_acta: true, activo: true }
    ],
    destinos_disposicion: [
      { id: "venta", nombre: "Venta a terceros", exige_datos_receptor: true, exige_monto_venta: true, exige_certificado: false },
      { id: "donacion", nombre: "Donación a entidad sin fines de lucro", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
      { id: "reciclaje", nombre: "Operador de reciclaje RAEE certificado", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
      { id: "devolucion_proveedor", nombre: "Retorno al arrendador o proveedor", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true },
      { id: "destruccion_certificada", nombre: "Destrucción física certificada", exige_datos_receptor: true, exige_monto_venta: false, exige_certificado: true }
    ],
    metodos_borrado_seguro: [
      { id: "sobrescritura", nombre: "Sobrescritura NIST SP 800-88 / DoD 5220.22-M (3 pasadas)", aplicable_a: "Discos duros mecánicos y SSD", exige_certificado: true },
      { id: "criptografico", nombre: "Borrado criptográfico (Crypto-Erase / Instant Secure Erase)", aplicable_a: "Unidades SED / NVMe SSD", exige_certificado: true },
      { id: "desmagnetizacion", nombre: "Desmagnetización física (Degaussing)", aplicable_a: "Cintas magnéticas y discos mecánicos", exige_certificado: true },
      { id: "destruccion_fisica", nombre: "Trituración mecánica o desintegración", aplicable_a: "Cualquier medio físico con datos", exige_certificado: true }
    ],
    bloqueos_integridad: {
      bloquear_si_rfc_abierta: true,
      bloquear_si_incidentes_abiertos: true,
      bloquear_si_asignacion_vigente: true,
      bloquear_si_ci_dependientes_activos: true
    },
    retencion_anios: 7
  }
};

export interface ResultadoConfig {
  httpStatus: number;
  payload: any;
}

export async function obtenerConfiguracionCiclosVidaTransiciones(idUsuario: number | undefined, pestana: string) {
  // 1. Versión publicada activa
    const versionPublicada = await queryRow(`
      SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    // 2. Borrador activo
    const borradorActual = await queryRow(`
      SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    // 3. Bloqueo concurrente
    const recursoLock = `activos:1.5.2:${pestana}`;
    const bloqueoActual = await queryRow(`
      SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
             CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
      FROM bloqueo_edicion_concurrente b
      LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recursoLock]);

    const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_152[pestana] || {};
    const snapshotActivo = borradorActual?.snapshot || snapshotBase;
    const diff = calcularDiffConfig(snapshotBase, snapshotActivo);

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
      WHERE cmv.modulo = 'activos_y_cmdb' AND cmv.pantalla = '1.5.2' AND cmv.pestana = $1
      ORDER BY cmv.id_version DESC LIMIT 20
    `, [pestana]);

    return {
      pestana,
      version_publicada: versionPublicada ? {
        ...versionPublicada,
        snapshot: versionPublicada.snapshot || VALORES_FABRICA_152[pestana]
      } : {
        numero_version: 1,
        snapshot: VALORES_FABRICA_152[pestana]
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
      historial_versiones: historialVersiones || []
    };
}

export async function procesarAccionCiclosVidaTransiciones(idUsuario: number, body: any): Promise<ResultadoConfig> {
  const { pestana, snapshot, motivo, version_id_origen } = body;
  const accion = body.accion || "guardar_borrador";

  if (!pestana) {
    throw new ErrorDominio("La pestaña es obligatoria");
  }

  const recursoLock = `activos:1.5.2:${pestana}`;

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
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiffConfig(versionPub?.snapshot || VALORES_FABRICA_152[pestana], snapshot);

    // Eliminar borrador anterior si existiese
    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    // Insertar nuevo borrador
    const nuevoBorrador = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.2', $1, $2, false, true, $3, $4, $5, $6
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
    const fabrica = VALORES_FABRICA_152[pestana];
    if (!fabrica) {
      throw new ErrorDominio("No existen valores de fábrica para esta pestaña", 404);
    }

    const versionPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiffConfig(versionPub?.snapshot, fabrica);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const borradorRestaurado = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.2', $1, $2, false, true, $3, $4, 'Restauración de valores de fábrica en borrador', $5
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
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiffConfig(versionPub?.snapshot, versionOrigen.snapshot);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    const borradorRestaurado = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'activos_y_cmdb', '1.5.2', $1, $2, false, true, $3, $4, $5, $6
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

export async function publicarConfiguracionCiclosVidaTransiciones(idUsuario: number, body: any) {
  const { pestana, snapshot, motivo, diff } = body;

  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  if (!motivo || motivo.trim().length < 10) {
    throw new ErrorDominio("El motivo de publicación debe tener al menos 10 caracteres");
  }

  // Verificar si hay borrador
  const borrador = await queryRow(`
    SELECT id_version, snapshot, diff FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
    ORDER BY id_version DESC LIMIT 1
  `, [pestana]);

  if (!borrador && !snapshot) {
    throw new ErrorDominio("No hay un borrador pendiente de publicación");
  }

  const snapshotFinal = snapshot || borrador.snapshot;

  // Obtener última versión publicada para calcular vN+1
  const ultimaPub = await queryRow(`
    SELECT numero_version FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const nuevoNumeroVersion = (ultimaPub?.numero_version || 0) + 1;

  // Marcar anteriores como no activas
  await query(`
    UPDATE configuracion_modulo_versiones 
    SET es_publicada = false 
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1
  `, [pestana]);

  // Eliminar borradores
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  // Insertar nueva versión publicada
  const nuevaPublicacion = await queryRow(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
    ) VALUES (
      'activos_y_cmdb', '1.5.2', $1, $2, true, false, $3, $4, $5, $6
    ) RETURNING id_version, fecha_creacion
  `, [
    pestana,
    nuevoNumeroVersion,
    JSON.stringify(snapshotFinal),
    JSON.stringify(diff || borrador?.diff || { cambios: ["Publicación formal"] }),
    motivo.trim(),
    idUsuario
  ]);

  // Liberar bloqueo concurrente
  const recursoLock = `activos:1.5.2:${pestana}`;
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

  return {
    ok: true,
    mensaje: `Versión v${nuevoNumeroVersion} publicada exitosamente`,
    id_version: nuevaPublicacion?.id_version,
    numero_version: nuevoNumeroVersion,
    fecha_creacion: nuevaPublicacion?.fecha_creacion
  };
}

export async function descartarBorradorCiclosVidaTransiciones(pestana: string) {
  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'activos_y_cmdb' AND pantalla = '1.5.2' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  const recursoLock = `activos:1.5.2:${pestana}`;
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

  return { ok: true, mensaje: "Borrador descartado correctamente" };
}
