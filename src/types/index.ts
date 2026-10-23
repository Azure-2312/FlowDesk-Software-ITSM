// Tipos que reflejan las tablas de la base de datos.
// Tenerlos centralizados evita escribir la misma "forma" de objeto en cada archivo.

export interface Usuario {
  id_usuario: number;
  dni: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  celular: string | null;
  correo_personal?: string | null;
  correo_electronico: string;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  id_departamento_empresa?: number | null;
  departamento_empresa_nombre?: string | null;
  estado_registro: boolean;
  intentos_fallidos?: number;
  cuenta_bloqueada?: boolean;
  nivel_prioridad?: number;
}

// Un usuario tal como se muestra en el mantenimiento de Usuarios,
// ya con sus perfiles asignados incluidos (puede tener varios a la vez)
export interface UsuarioConPerfiles extends Usuario {
  perfiles: { id_perfil: number; nombre: string }[];
}

export interface Perfil {
  id_perfil: number;
  nombre: string;
  descripcion: string | null;
  estado_registro: boolean;
}

export interface PerfilConOpciones extends Perfil {
  opciones_ids: number[];
  cantidad_usuarios?: number;
  total_usuarios?: number;
}

// Opción de menú tal como sale de la base de datos (plana, sin hijos todavía)
export interface OpcionMenuPlana {
  id_opcion_menu: number;
  nombre: string;
  url_menu: string;
  descripcion: string | null;
  id_padre: number | null;
  nivel: number;
  orden: number;
  contador_clave?: string | null;
  bloqueado?: boolean;
  abierto_por_defecto?: boolean;
}

// Opción de menú ya organizada en árbol (con sus hijos anidados),
// que es como la vamos a mandar al frontend para pintar el menú.
export interface OpcionMenuArbol extends OpcionMenuPlana {
  hijos: OpcionMenuArbol[];
}

export interface OpcionMenuAdmin extends OpcionMenuPlana {
  nombre_padre: string | null;
  perfiles_ids: number[];
  estado_registro: boolean;
}

export interface PerfilBasico {
  id_perfil: number;
  nombre: string;
}

// Lo que guardamos dentro del token de sesión (JWT) tras el login.
// "perfiles" son TODOS los perfiles que tiene el usuario; "perfilActivo"
// es con cuál de ellos decidió entrar en esta sesión (si tiene varios,
// se lo preguntamos al hacer login).
export interface SesionUsuario {
  id_usuario: number;
  nombres: string;
  correo_electronico: string;
  perfiles: PerfilBasico[];
  perfilActivo: PerfilBasico;
}

// ============================================================
// MODELOS ITIL 4: SISTEMA DE TICKETS
// ============================================================

export interface TipoTicket {
  id_tipo_ticket: number;
  codigo: "INCIDENTE" | "SOLICITUD";
  nombre: string;
  descripcion: string;
  prefijo_codigo: string;
  estado_registro: boolean;
}

export interface ImpactoTicket {
  id_impacto: number;
  nivel: 1 | 2 | 3;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}

export interface UrgenciaTicket {
  id_urgencia: number;
  nivel: 1 | 2 | 3;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}

export interface PrioridadTicket {
  id_prioridad: number;
  codigo: "P1" | "P2" | "P3" | "P4";
  nombre: string;
  nivel: number;
  tiempo_resolucion_horas: number;
  tiempo_primera_respuesta_hrs: number;
  color: string;
  estado_registro: boolean;
}

export interface EstadoTicket {
  id_estado: number;
  codigo: "ABIERTO" | "ASIGNADO" | "EN_PROCESO" | "EN_ESPERA" | "RESUELTO" | "CERRADO" | "CANCELADO";
  nombre: string;
  orden: number;
  es_terminal: boolean;
  pausa_sla: boolean;
  color: string;
  estado_registro: boolean;
}

export interface MotivoEsperaTicket {
  id_motivo_espera: number;
  nombre: string;
  descripcion: string;
  estado_registro: boolean;
}

export interface CategoriaTicket {
  id_categoria: number;
  id_tipo_ticket: number | null;
  nombre: string;
  codigo_corto?: string;
  sla_default_respuesta?: number;
  sla_default_resolucion?: number;
  descripcion: string | null;
  estado_registro: boolean;
}

export interface ServicioWorkflowPaso {
  id_paso: number;
  id_servicio: number;
  orden: number;
  codigo_paso: string;
  nombre_paso: string;
  rol_ejecutor: string;
  es_compuerta_aprobacion: boolean;
  pausa_sla: boolean;
  estado_registro: boolean;
}

export interface ServicioCatalogo {
  id_servicio: number;
  codigo_servicio: string;
  id_tipo_ticket: number;
  tipo_nombre?: string;
  tipo_codigo?: string;
  id_categoria: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion_comercial: string;
  entregable: string;
  requiere_aprobacion: boolean;
  sla_horas_resolucion: number;
  sla_horas_respuesta: number;
  costo_referencial: number;
  icono?: string;
  estado_registro: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
  pasos?: ServicioWorkflowPaso[];
  perfiles_habilitados?: number[];
  esquema_formulario?: CampoFormularioServicio[];
  id_departamento_resolutor?: number | null;
  reglas_escalamiento?: ReglaEscalamientoServicio[];
}

export interface CampoFormularioServicio {
  clave: string;
  etiqueta: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "correo" | "lista" | "casilla";
  obligatorio: boolean;
  opciones?: string[];
  ayuda?: string;
}

export interface ReglaEscalamientoServicio {
  despues_horas: number;
  id_departamento: number;
}

export interface Ticket {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  descripcion: string;
  id_tipo_ticket: number;
  tipo_nombre?: string;
  tipo_codigo?: string;
  id_categoria: number;
  categoria_nombre?: string;
  id_servicio: number | null;
  servicio_nombre?: string | null;
  servicio_codigo?: string | null;
  id_departamento: number | null;
  id_departamento_empresa?: number | null;
  departamento_nombre?: string | null;
  departamento_empresa_nombre?: string | null;
  departamento_codigo?: string | null;
  canal_comunicacion: "PORTAL_WEB" | "CORREO_ELECTRONICO" | "LLAMADA_TELEFONICA" | "CHAT_EN_VIVO" | "SISTEMA_MONITOREO_AUTOMATICO";
  estado_aprobacion: "NO_APLICA" | "PENDIENTE_APROBACION" | "APROBADO" | "RECHAZADO";
  id_paso_actual: number | null;
  paso_actual_nombre?: string | null;
  categoria_resolucion?: string | null;
  calificacion_csat?: number | null;
  comentario_csat?: string | null;
  fecha_csat?: string | null;
  tiempo_pausado_minutos?: number;
  fecha_ultima_pausa?: string | null;
  id_impacto: number;
  impacto_nombre?: string;
  impacto_nivel?: number;
  id_urgencia: number;
  urgencia_nombre?: string;
  urgencia_nivel?: number;
  id_prioridad: number;
  prioridad_codigo?: string;
  prioridad_nombre?: string;
  prioridad_color?: string;
  tiempo_resolucion_horas?: number;
  id_estado: number;
  estado_codigo?: string;
  estado_nombre?: string;
  estado_color?: string;
  pausa_sla?: boolean;
  es_terminal?: boolean;
  id_motivo_espera: number | null;
  motivo_espera_nombre?: string | null;
  id_usuario_solicitante: number;
  solicitante_nombre?: string;
  solicitante_correo?: string;
  id_usuario_asignado: number | null;
  tecnico_nombre?: string | null;
  tecnico_correo?: string | null;
  solucion_aplicada: string | null;
  motivo_cancelacion: string | null;
  fecha_limite_sla: string;
  fecha_limite_respuesta_sla?: string | null;
  fecha_primera_respuesta: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
  sla_cumplido: boolean | null;
  minutos_restantes_sla?: number;
  sla_vencido?: boolean;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  campos_adicionales?: Record<string, any> | null;
  adjuntos?: AdjuntoTicket[];
  comentarios_cantidad?: number;
  aprobaciones?: TicketAprobacion[];
  id_problema?: number | null;
  problema_codigo?: string | null;
  problema_titulo?: string | null;
  id_ci?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  fecha_reapertura?: string | null;
  motivo_reapertura?: string | null;
  conteo_reaperturas?: number;
  es_incidente_mayor?: boolean | null;
}

export interface AdjuntoTicket {
  id_adjunto: number;
  id_ticket: number;
  nombre_archivo: string;
  tipo_mime: string;
  tamano_bytes: number;
  datos_base64?: string;
  id_usuario_subio: number;
  usuario_nombre?: string;
  fecha_creacion: string;
}

export interface TicketAprobacion {
  id_ticket_aprobacion: number;
  id_ticket: number;
  id_usuario_aprobador: number;
  aprobador_nombre?: string;
  aprobador_correo?: string;
  id_paso_workflow?: number | null;
  estado_decision: "APROBADO" | "RECHAZADO" | "OBSERVADO";
  comentario: string | null;
  fecha_decision: string;
  estado_registro: boolean;
}

export interface ComentarioTicket {
  id_comentario: number;
  id_ticket: number;
  id_usuario: number;
  usuario_nombre?: string;
  usuario_correo?: string;
  autor_nombre?: string;
  autor_perfil?: string;
  comentario: string;
  es_interno: boolean;
  id_estado_cambiado: number | null;
  estado_nombre?: string | null;
  fecha_creacion: string;
  estado_registro: boolean;
}

export interface CatalogosTickets {
  tipos: TipoTicket[];
  impactos: ImpactoTicket[];
  urgencias: UrgenciaTicket[];
  prioridades: PrioridadTicket[];
  estados: EstadoTicket[];
  motivosEspera: MotivoEsperaTicket[];
  categorias: CategoriaTicket[];
  tecnicos: {
    id_usuario: number;
    nombre: string;
    correo: string;
    id_departamento?: number;
    departamento_nombre?: string;
    nivel_soporte?: number;
    estado_operativo?: string;
    capacidad_maxima_tickets?: number;
    tickets_activos?: number;
  }[];
  servicios?: ServicioCatalogo[];
  departamentos?: DepartamentoTI[];
}

export interface DepartamentoTI {
  id_departamento: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  id_supervisor: number | null;
  supervisor_nombre?: string | null;
  supervisor_correo?: string | null;
  cantidad_tecnicos?: number;
  total_tecnicos?: number;
  tiempo_ola_horas?: number;
  tiempo_ola_critico_hrs?: number;
  estado_registro: boolean;
}

export interface AcuerdoNivelOperativo {
  id_ola: number;
  id_departamento: number;
  codigo_acuerdo: string;
  nombre_acuerdo: string;
  tipo_compromiso: string;
  tiempo_maximo_horas: number;
  tiempo_alerta_horas: number;
  descripcion: string | null;
  estado_registro: boolean;
}

export interface TecnicoDetalle {
  id_tecnico_detalle: number;
  id_usuario: number;
  id_departamento: number;
  departamento_nombre?: string;
  departamento_codigo?: string;
  nivel_soporte: 1 | 2 | 3;
  capacidad_maxima_tickets: number;
  estado_operativo: "DISPONIBLE" | "EN_ATENCION" | "EN_GUARDIA" | "EN_RECESO" | "VACACIONES";
  especialidad_principal: string | null;
  estado_registro: boolean;
}

export interface TecnicoConCarga extends TecnicoDetalle {
  nombre_completo: string;
  nombres: string;
  apellido_paterno: string;
  correo_electronico: string;
  celular: string | null;
  tickets_activos: number;
  tickets_resueltos: number;
  tickets_criticos: number;
  tickets_sla_vencido: number;
  porcentaje_ocupacion: number;
}

export interface CrearTicketPayload {
  titulo: string;
  descripcion: string;
  id_tipo_ticket: number;
  id_categoria: number;
  id_servicio?: number | null;
  id_departamento?: number | null;
  canal_comunicacion?: "PORTAL_WEB" | "CORREO_ELECTRONICO" | "LLAMADA_TELEFONICA" | "CHAT_EN_VIVO" | "SISTEMA_MONITOREO_AUTOMATICO";
  id_impacto: number;
  id_urgencia: number;
  id_usuario_solicitante?: number | null;
  autoasignar_tecnico?: boolean;
  campos_adicionales?: Record<string, any>;
  archivos?: {
    nombre: string;
    tipo: string;
    tamano: number;
    base64: string;
  }[];
}

export interface ActualizarTicketPayload {
  id_estado?: number;
  id_usuario_asignado?: number | null;
  id_departamento?: number | null;
  id_paso_actual?: number | null;
  id_motivo_espera?: number | null;
  solucion_aplicada?: string;
  categoria_resolucion?: string;
  motivo_cancelacion?: string;
  nota_cambio?: string;
  es_nota_interna?: boolean;
  decision_aprobacion?: "APROBADO" | "RECHAZADO";
  comentario_aprobacion?: string;
  calificacion_csat?: number;
  comentario_csat?: string;
  motivo_reapertura?: string;
  es_reapertura?: boolean;
  id_problema?: number | null;
  id_ci?: number | null;
}

// ============================================================
// GESTION DE ACTIVOS Y CMDB (ITIL v4)
// ============================================================

export interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  numero_serie?: string | null;
  tipo_activo: "LAPTOP" | "DESKTOP" | "SERVIDOR" | "SWITCH" | "IMPRESORA" | "ROUTER" | string;
  marca: string;
  modelo: string;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  id_usuario_custodio?: number | null;
  custodio_nombre?: string | null;
  estado_activo: "EN_OPERACION" | "EN_STOCK" | "MANTENIMIENTO" | "BAJA";
  fecha_adquisicion?: string | null;
  fecha_fin_garantia?: string | null;
  costo_compra?: number | null;
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
}

export interface ElementoConfiguracion {
  id_ci: number;
  id_activo?: number | null;
  activo_codigo?: string | null;
  codigo_ci: string;
  nombre: string;
  tipo_ci: "SERVICIO_TI" | "SERVIDOR_LOGICO" | "APLICACION" | "BASE_DATOS" | "NODO_RED" | string;
  ambiente: "PRODUCCION" | "QA" | "DESARROLLO";
  ip_principal?: string | null;
  version_software?: string | null;
  criticidad: "CRITICA" | "ALTA" | "MEDIA" | "BAJA";
  id_departamento_soporte?: number | null;
  departamento_soporte_nombre?: string | null;
  relaciones_padre?: CIRelacion[];
  relaciones_hijo?: CIRelacion[];
  fecha_creacion: string;
  estado_registro?: boolean;
  motivo_inactivacion?: string | null;
  fecha_inactivacion?: string | null;
  usuario_inactivacion?: number | null;
  usuario_inactivacion_nombre?: string | null;
}

export interface CIRelacion {
  id_ci_padre: number;
  padre_codigo?: string;
  padre_nombre?: string;
  id_ci_hijo: number;
  hijo_codigo?: string;
  hijo_nombre?: string;
  tipo_relacion: "DEPENDE_DE" | "ALBERGA_A" | "CONECTADO_CON";
}

export interface LicenciaSoftware {
  id_licencia: number;
  nombre_software: string;
  fabricante: string;
  clave_licencia?: string | null;
  tipo_licencia: "PERPETUA" | "SUSCRIPCION_ANUAL" | "POR_VOLUMEN" | "OEM" | string;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_vencimiento?: string | null;
  costo_anual?: number | null;
}

// ============================================================
// GESTION DE PROBLEMAS (ITIL v4)
// ============================================================

export interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_impacto: number;
  impacto_nombre?: string;
  id_urgencia: number;
  urgencia_nombre?: string;
  id_prioridad: number;
  prioridad_nombre?: string;
  id_estado: number; // 1: Registrado, 2: En Investigacion, 3: Causa Raiz Identificada, 4: Error Conocido, 5: Resuelto, 6: Cerrado
  estado_nombre?: string;
  causa_raiz?: string | null;
  metodo_analisis: "5_WHYS" | "ISHIKAWA" | "ARBOL_FALLAS" | "PRUEBAS_AISLAMIENTO" | string;
  workaround?: string | null;
  es_error_conocido: boolean;
  id_ci_afectado?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  id_usuario_asignado?: number | null;
  tecnico_asignado_nombre?: string | null;
  id_departamento?: number | null;
  departamento_nombre?: string | null;
  solucion_definitiva?: string | null;
  incidentes_asociados?: { id_ticket: number; codigo_ticket: string; titulo: string }[];
  fecha_creacion: string;
}

export interface ErrorConocido {
  id_error_conocido: number;
  id_problema: number;
  codigo_kedb: string;
  titulo: string;
  sintomas: string;
  workaround: string;
  solucion_definitiva?: string | null;
  fecha_publicacion: string;
}

// ============================================================
// GESTION DE CAMBIOS (CHANGE ENABLEMENT - ITIL v4)
// ============================================================

export interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  descripcion: string;
  tipo_cambio: "ESTANDAR" | "NORMAL" | "EMERGENCIA";
  id_impacto: number;
  impacto_nombre?: string;
  id_urgencia: number;
  urgencia_nombre?: string;
  id_prioridad: number;
  prioridad_nombre?: string;
  id_estado: number; // 1: Registrado, 2: Evaluacion CAB, 3: Aprobado, 4: En Planificacion, 5: En Ejecucion, 6: Exitoso, 7: Fallido, 8: Cancelado
  estado_nombre?: string;
  justificacion: string;
  plan_implementacion: string;
  plan_rollback: string;
  plan_pruebas?: string | null;
  ventana_inicio: string;
  ventana_fin: string;
  id_ci_afectado?: number | null;
  ci_codigo?: string | null;
  ci_nombre?: string | null;
  id_problema_origen?: number | null;
  problema_codigo?: string | null;
  codigo_problema?: string | null;
  id_incidente_origen?: number | null;
  incidente_codigo?: string | null;
  id_usuario_solicitante: number;
  solicitante_nombre?: string;
  solicitante_email?: string;
  id_usuario_responsable?: number | null;
  responsable_nombre?: string | null;
  resultado_pir?: string | null;
  incidentes_inducidos: number;
  aprobaciones?: CambioAprobacion[];
  fecha_creacion: string;
}

export interface CambioAprobacion {
  id_cambio_aprobacion: number;
  id_cambio: number;
  id_usuario_aprobador: number;
  aprobador_nombre?: string;
  decision: "APROBADO" | "RECHAZADO" | "OBSERVADO";
  comentario: string;
  fecha_decision: string;
}

// ============================================================
// GESTION DEL CONOCIMIENTO (KNOWLEDGE MANAGEMENT - ITIL v4)
// ============================================================

export interface ArticuloConocimiento {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  id_categoria?: number | null;
  categoria_nombre?: string | null;
  id_problema_origen?: number | null;
  estado_editorial: "BORRADOR" | "EN_REVISION" | "PUBLICADO" | "ARCHIVADO";
  id_autor: number;
  autor_nombre?: string;
  id_revisor?: number | null;
  revisor_nombre?: string | null;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  fecha_publicacion?: string | null;
  fecha_creacion: string;
  audiencia_perfiles?: number[];
  version?: number;
  veces_utilizado_en_tickets?: number;
  tipo_plantilla?: string | null;
  clasificacion_seguridad?: string | null;
  motivo_retiro?: string | null;
  fecha_revision?: string | null;
  estado_registro?: boolean;
}
