import { transaccion } from "@/shared/lib/db";
import type { PoolClient } from "pg";

/**
 * Siembra idempotente del menú lateral de los 10 perfiles del sistema.
 *
 * Fuente: DOCUMENTACIÓN/MENUS_Y_PERFILES.md
 * Patrón: igual que migrar_menu_tecnico.ts (upsert por id_opcion_menu + asignación por perfil).
 *
 * Arquitectura modular: las rutas listadas son las delgadas de `src/app`; la lógica vive en
 * `src/modules/<feature>/`. Las opciones cuya página aún no existe se siembran con
 * `bloqueado = true` para poder habilitarlas a medida que se implementan.
 *
 * Ejecutar con:  npx tsx src/shared/lib/scripts/migrar_menu_perfiles.ts
 */

interface OpcionSemilla {
  id: number;
  padre: number | null;
  orden: number;
  nivel: number;
  nombre: string;
  url: string;
  desc: string;
  bloqueado: boolean;
  abierto: boolean;
}

/** Nombres de los perfiles (id_perfil -> nombre) para trazabilidad en consola. */
const NOMBRES_PERFIL: Record<number, string> = {
  1: "Administrador",
  2: "Técnico",
  3: "Solicitante",
  4: "Supervisor",
  5: "Gestor de Área",
  6: "Auditor",
  7: "Aprobador",
  8: "Gestor de Cambios",
  9: "Gestor de Activos y Configuración",
  10: "Gestor de Problemas",
};

/**
 * Árbol de menú por perfil. Cada perfil usa un rango de IDs propio
 * (10000 + id_perfil * 1000) para no colisionar con los IDs históricos.
 */
const MENUS_POR_PERFIL: Record<number, OpcionSemilla[]> = {
  // ===== PERFIL 1 — Administrador (58 opciones) =====
  1: [
    { id: 11001, padre: null, orden: 1, nivel: 1, nombre: "Configuración", url: "/admin", desc: "Grupo de configuración del sistema; solo el Administrador edita y publica.", bloqueado: false, abierto: true },
    { id: 11002, padre: 11001, orden: 1, nivel: 2, nombre: "Identidades y accesos", url: "/admin", desc: "Usuarios, perfiles y estructura del menú.", bloqueado: false, abierto: false },
    { id: 11003, padre: 11002, orden: 1, nivel: 3, nombre: "Gestión de usuarios", url: "/admin/usuarios", desc: "Alta, edición, bloqueo y desbloqueo de usuarios; asignación de perfiles múltiples; envío de credenciales.", bloqueado: false, abierto: false },
    { id: 11004, padre: 11002, orden: 2, nivel: 3, nombre: "Perfiles y permisos", url: "/admin/perfiles", desc: "Matriz de permisos por perfil.", bloqueado: false, abierto: false },
    { id: 11005, padre: 11002, orden: 3, nivel: 3, nombre: "Estructura del menú", url: "/admin/menu", desc: "Orden, visibilidad y bloqueo de ítems por perfil.", bloqueado: false, abierto: false },
    { id: 11006, padre: 11001, orden: 2, nivel: 2, nombre: "Catálogo de servicios y SLAs", url: "/admin/servicios", desc: "Servicios de incidentes y de solicitudes, categorías y objetivos de tiempo.", bloqueado: false, abierto: false },
    { id: 11007, padre: 11006, orden: 1, nivel: 3, nombre: "Servicios de incidentes", url: "/admin/servicios?tipo=1", desc: "Listado y edición de servicios de incidente.", bloqueado: false, abierto: false },
    { id: 11008, padre: 11006, orden: 2, nivel: 3, nombre: "Servicios de solicitudes", url: "/admin/servicios?tipo=2", desc: "Listado, edición y flujo de aprobación por servicio.", bloqueado: false, abierto: false },
    { id: 11009, padre: 11006, orden: 3, nivel: 3, nombre: "Crear servicio", url: "/admin/servicios?vista=crear", desc: "Formulario oficial de servicio con validaciones en tiempo real.", bloqueado: false, abierto: false },
    { id: 11010, padre: 11006, orden: 4, nivel: 3, nombre: "Configuración de categorías", url: "/admin/servicios?vista=categorias", desc: "CRUD de categorías con unicidad de nombre y código.", bloqueado: false, abierto: false },
    { id: 11011, padre: 11006, orden: 5, nivel: 3, nombre: "Objetivos SLA", url: "/admin/servicios/sla", desc: "Matriz institucional de tiempos por prioridad y matriz impacto × urgencia.", bloqueado: false, abierto: false },
    { id: 11012, padre: 11001, orden: 3, nivel: 2, nombre: "Configuración de procesos", url: "/admin/procesos", desc: "Formularios, flujos y reglas por proceso ITIL.", bloqueado: true, abierto: false },
    { id: 11059, padre: 11012, orden: 1, nivel: 3, nombre: "Gestión de incidentes", url: "/admin/procesos/incidentes", desc: "Configuración del proceso de gestión de incidentes.", bloqueado: false, abierto: false },
    { id: 11013, padre: 11059, orden: 1, nivel: 4, nombre: "Configuración de formulario", url: "/admin/tickets-formularios?tipo=incidente", desc: "Campos, orden y obligatoriedad del formulario de incidente.", bloqueado: false, abierto: false },
    { id: 11014, padre: 11059, orden: 2, nivel: 4, nombre: "Flujo de estados y acciones", url: "/admin/tickets-vistas?seccion=estados&tipo=incidente", desc: "Estados, transiciones y acciones por rol.", bloqueado: false, abierto: false },
    { id: 11060, padre: 11012, orden: 2, nivel: 3, nombre: "Gestión de solicitudes", url: "/admin/procesos/solicitudes", desc: "Configuración del proceso de gestión de solicitudes de servicio.", bloqueado: false, abierto: false },
    { id: 11015, padre: 11060, orden: 1, nivel: 4, nombre: "Configuración de formulario", url: "/admin/tickets-formularios?tipo=solicitud", desc: "Formulario de solicitud.", bloqueado: false, abierto: false },
    { id: 11016, padre: 11060, orden: 2, nivel: 4, nombre: "Flujo de atención y aprobaciones", url: "/admin/tickets-vistas?seccion=estados&tipo=solicitud", desc: "Estados, tareas y etapas de aprobación.", bloqueado: false, abierto: false },
    { id: 11017, padre: 11012, orden: 3, nivel: 3, nombre: "Gestión de problemas", url: "/admin/procesos/problemas", desc: "Prompt 1.", bloqueado: false, abierto: false },
    { id: 11018, padre: 11017, orden: 1, nivel: 4, nombre: "Configuración de formulario", url: "/admin/procesos/problemas/formulario", desc: "Formulario configurable de problemas con versionado.", bloqueado: false, abierto: false },
    { id: 11019, padre: 11017, orden: 2, nivel: 4, nombre: "Flujo de investigación y seguimiento", url: "/admin/procesos/problemas/flujo", desc: "Estados, transiciones, asignación, objetivos, escalamiento, reapertura, tareas y problemas mayores.", bloqueado: false, abierto: false },
    { id: 11020, padre: 11017, orden: 3, nivel: 4, nombre: "Relación con incidentes, errores conocidos y conocimiento", url: "/admin/procesos/problemas/relaciones", desc: "Umbrales, vínculos, KEDB, RFC, conocimiento y CI.", bloqueado: false, abierto: false },
    { id: 11021, padre: 11012, orden: 4, nivel: 3, nombre: "Gestión de cambios", url: "/admin/procesos/cambios", desc: "Prompt 2.", bloqueado: false, abierto: false },
    { id: 11022, padre: 11021, orden: 1, nivel: 4, nombre: "Configuración de formulario", url: "/admin/procesos/cambios/formulario", desc: "Formulario de RFC configurable; unificar los modales con los de problemas.", bloqueado: false, abierto: false },
    { id: 11023, padre: 11021, orden: 2, nivel: 4, nombre: "Tipos de cambio y requisitos", url: "/admin/procesos/cambios/tipos-requisitos", desc: "Tipos, autoridad, modelos estándar y clasificación.", bloqueado: false, abierto: false },
    { id: 11024, padre: 11021, orden: 3, nivel: 4, nombre: "Flujo de evaluación, autorización y revisión posterior", url: "/admin/procesos/cambios/flujo-evaluacion", desc: "Estados, transiciones, etapas, comités, plazos, tareas, cierre y PIR; unificar `Iconos.tsx`.", bloqueado: false, abierto: false },
    { id: 11025, padre: 11021, orden: 4, nivel: 4, nombre: "Notificaciones y calendario de cambios", url: "/admin/procesos/cambios/notificaciones-calendario", desc: "Eventos, ventanas, congelamientos, feriados, conflictos y presentación; el Gestor de Cambios edita solo las ventanas, congelamientos y feriados.", bloqueado: false, abierto: false },
    { id: 11026, padre: 11001, orden: 4, nivel: 2, nombre: "Organización y soporte", url: "/admin/organizacion", desc: "", bloqueado: true, abierto: false },
    { id: 11027, padre: 11026, orden: 1, nivel: 3, nombre: "Departamentos empresariales", url: "/admin/departamentos-empresa", desc: "Áreas de negocio (finanzas, legal, ventas, marketing) y su Gestor de Área.", bloqueado: false, abierto: false },
    { id: 11028, padre: 11026, orden: 2, nivel: 3, nombre: "Departamentos y grupos resolutores de TI", url: "/admin/departamentos", desc: "Áreas técnicas y grupos resolutores.", bloqueado: false, abierto: false },
    { id: 11029, padre: 11026, orden: 3, nivel: 3, nombre: "Técnicos y niveles de soporte", url: "/admin/tecnicos", desc: "Técnicos, niveles N1/N2/N3 y ausencias.", bloqueado: false, abierto: false },
    { id: 11030, padre: 11026, orden: 4, nivel: 3, nombre: "Supervisores", url: "/admin/departamentos?vista=supervisores", desc: "Asignación de supervisores a áreas técnicas.", bloqueado: false, abierto: false },
    { id: 11031, padre: 11001, orden: 5, nivel: 2, nombre: "Activos y configuración", url: "/admin/activos-config/tipos-modelos-atributos", desc: "Prompt 3.", bloqueado: false, abierto: false },
    { id: 11032, padre: 11031, orden: 1, nivel: 3, nombre: "Tipos, modelos y atributos de activos", url: "/admin/activos-config/tipos-modelos-atributos", desc: "Clases, fabricantes, atributos, formulario, códigos, ubicaciones, listas, ficha e importación.", bloqueado: false, abierto: false },
    { id: 11033, padre: 11031, orden: 2, nivel: 3, nombre: "Ciclos de vida y reglas de transición", url: "/admin/activos-config/ciclos-vida-transiciones", desc: "", bloqueado: false, abierto: false },
    { id: 11034, padre: 11031, orden: 3, nivel: 3, nombre: "Licencias y contratos", url: "/admin/activos-config/licencias-contratos", desc: "", bloqueado: false, abierto: false },
    { id: 11035, padre: 11031, orden: 4, nivel: 3, nombre: "Tipos de elementos de configuración y relaciones de CMDB", url: "/admin/activos-config/cmdb-relaciones", desc: "", bloqueado: false, abierto: false },
    { id: 11036, padre: 11001, orden: 6, nivel: 2, nombre: "Comunicaciones y notificaciones", url: "/admin/comunicaciones", desc: "", bloqueado: true, abierto: false },
    { id: 11037, padre: 11036, orden: 1, nivel: 3, nombre: "Plantillas de correo y otros canales", url: "/admin/notificaciones?seccion=plantillas", desc: "Plantillas y reglas de notificación por evento.", bloqueado: false, abierto: false },
    { id: 11038, padre: 11036, orden: 2, nivel: 3, nombre: "Configuración de contacto", url: "/admin/notificaciones?seccion=contacto", desc: "Remitente, SMTP y datos de contacto de la mesa.", bloqueado: false, abierto: false },
    { id: 11039, padre: 11001, orden: 7, nivel: 2, nombre: "Gobierno del conocimiento", url: "/admin/conocimiento", desc: "", bloqueado: true, abierto: false },
    { id: 11040, padre: 11039, orden: 1, nivel: 3, nombre: "Categorías, responsables y reglas de publicación y revisión", url: "/admin/conocimiento-config", desc: "", bloqueado: false, abierto: false },
    { id: 11041, padre: 11001, orden: 8, nivel: 2, nombre: "Auditoría, seguridad y retención", url: "/admin/auditoria", desc: "", bloqueado: true, abierto: false },
    { id: 11042, padre: 11041, orden: 1, nivel: 3, nombre: "Auditoría de cambios", url: "/admin/auditoria-sistema", desc: "Registro inmutable de cambios de configuración (antes y después).", bloqueado: false, abierto: false },
    { id: 11043, padre: 11041, orden: 2, nivel: 3, nombre: "Registros de seguridad y autenticación", url: "/admin/seguridad-logs", desc: "", bloqueado: false, abierto: false },
    { id: 11044, padre: 11041, orden: 3, nivel: 3, nombre: "Retención y mantenimiento de datos", url: "/admin/mantenimiento-datos", desc: "", bloqueado: false, abierto: false },
    { id: 11045, padre: null, orden: 2, nivel: 1, nombre: "Reportes y analítica", url: "/reportes", desc: "", bloqueado: true, abierto: true },
    { id: 11046, padre: 11045, orden: 1, nivel: 2, nombre: "Indicadores operativos y SLA", url: "/plataforma/reportes/operativos", desc: "Indicadores globales de SLA, volumen y satisfacción.", bloqueado: false, abierto: false },
    { id: 11047, padre: 11045, orden: 2, nivel: 2, nombre: "Tableros", url: "/plataforma/reportes/tableros", desc: "Diseñador de tableros.", bloqueado: false, abierto: false },
    { id: 11048, padre: null, orden: 3, nivel: 1, nombre: "Supervisión global", url: "/tickets/gestion", desc: "Acceso de solo consulta a toda la operación (el Administrador no opera tickets por defecto; ve con VistaTicketAdministrador).", bloqueado: false, abierto: true },
    { id: 11049, padre: 11048, orden: 1, nivel: 2, nombre: "Todos los tickets", url: "/tickets/gestion/todos", desc: "", bloqueado: false, abierto: false },
    { id: 11050, padre: 11048, orden: 2, nivel: 2, nombre: "Auditoría forense de tickets", url: "/tickets/gestion/auditoria", desc: "", bloqueado: false, abierto: false },
    { id: 11051, padre: 11048, orden: 3, nivel: 2, nombre: "Cambios (consulta global)", url: "/cambios/gestion/todos", desc: "", bloqueado: false, abierto: false },
    { id: 11052, padre: 11048, orden: 4, nivel: 2, nombre: "Problemas (consulta global)", url: "/problemas", desc: "", bloqueado: false, abierto: false },
    { id: 11053, padre: 11048, orden: 5, nivel: 2, nombre: "Inventario y CMDB (consulta global)", url: "/activos/inventario", desc: "", bloqueado: false, abierto: false },
    { id: 11054, padre: 11048, orden: 6, nivel: 2, nombre: "Eventos y resiliencia (consulta)", url: "/operacion", desc: "", bloqueado: false, abierto: false },
    { id: 11055, padre: null, orden: 4, nivel: 1, nombre: "Salud del sistema", url: "/admin/salud-sistema", desc: "Estado técnico del sistema para el Administrador.", bloqueado: false, abierto: true },
    { id: 11056, padre: null, orden: 5, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 11057, padre: 11056, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 11058, padre: 11056, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 2 — Técnico (44 opciones) =====
  2: [
    { id: 12001, padre: null, orden: 1, nivel: 1, nombre: "Mi trabajo", url: "/plataforma/perfiles/tecnico", desc: "Espacio personal del técnico (Prompt 4, M1).", bloqueado: false, abierto: true },
    { id: 12002, padre: 12001, orden: 1, nivel: 2, nombre: "Panel del técnico", url: "/plataforma/perfiles/tecnico/panel", desc: "Qué atender ahora: indicadores, tickets urgentes, agenda, avisos y carga.", bloqueado: false, abierto: false },
    { id: 12003, padre: 12001, orden: 2, nivel: 2, nombre: "Mis tareas", url: "/plataforma/perfiles/tecnico/tareas", desc: "Tareas de tickets, problemas, cambios, mantenimientos y recordatorios personales.", bloqueado: false, abierto: false },
    { id: 12004, padre: 12001, orden: 3, nivel: 2, nombre: "Mi agenda y disponibilidad", url: "/plataforma/perfiles/tecnico/agenda", desc: "Calendario personal y estado Disponible / Ocupado / No disponible.", bloqueado: false, abierto: false },
    { id: 12005, padre: 12001, orden: 4, nivel: 2, nombre: "Mi desempeño", url: "/plataforma/perfiles/tecnico/desempeno", desc: "Indicadores propios y agregados del grupo.", bloqueado: false, abierto: false },
    { id: 12006, padre: null, orden: 2, nivel: 1, nombre: "Mesa de Servicio", url: "/plataforma/perfiles/tecnico/mesa", desc: "", bloqueado: true, abierto: true },
    { id: 12007, padre: 12006, orden: 1, nivel: 2, nombre: "Mis tickets asignados", url: "/plataforma/perfiles/tecnico/mesa/asignados", desc: "Cola personal con SLA y acciones rápidas.", bloqueado: false, abierto: false },
    { id: 12008, padre: 12006, orden: 2, nivel: 2, nombre: "Bandeja de pendientes", url: "/plataforma/perfiles/tecnico/mesa/pendientes", desc: "Cola sin asignar de mis grupos; tomar de forma atómica.", bloqueado: false, abierto: false },
    { id: 12009, padre: 12006, orden: 3, nivel: 2, nombre: "Tickets de mi área técnica", url: "/plataforma/perfiles/tecnico/mesa/area", desc: "Consulta de todo el departamento de TI y ofrecer ayuda.", bloqueado: false, abierto: false },
    { id: 12010, padre: 12006, orden: 4, nivel: 2, nombre: "Registrar ticket para un usuario", url: "/plataforma/perfiles/tecnico/mesa/registrar", desc: "Registro por teléfono, chat o presencial, con resolución en primer contacto.", bloqueado: false, abierto: false },
    { id: 12011, padre: 12006, orden: 5, nivel: 2, nombre: "Búsqueda avanzada", url: "/plataforma/perfiles/tecnico/mesa/buscar", desc: "", bloqueado: false, abierto: false },
    { id: 12012, padre: 12006, orden: 6, nivel: 2, nombre: "Historial de resueltos", url: "/plataforma/perfiles/tecnico/mesa/historial", desc: "", bloqueado: false, abierto: false },
    { id: 12013, padre: 12006, orden: 7, nivel: 2, nombre: "Incidente mayor (sala de crisis)", url: "/plataforma/perfiles/tecnico/mesa/incidente-mayor", desc: "Vista de coordinación cuando el Supervisor declara un incidente mayor: línea de tiempo, tareas y comunicados.", bloqueado: false, abierto: false },
    { id: 12014, padre: null, orden: 3, nivel: 1, nombre: "Seguimiento de SLA", url: "/plataforma/perfiles/tecnico/sla", desc: "", bloqueado: true, abierto: true },
    { id: 12015, padre: 12014, orden: 1, nivel: 2, nombre: "Semáforo de SLA de mi cola", url: "/plataforma/perfiles/tecnico/sla/semaforo", desc: "", bloqueado: false, abierto: false },
    { id: 12016, padre: 12014, orden: 2, nivel: 2, nombre: "Objetivos de tiempo vigentes", url: "/plataforma/perfiles/tecnico/sla/objetivos", desc: "", bloqueado: false, abierto: false },
    { id: 12017, padre: null, orden: 4, nivel: 1, nombre: "Gestión de Problemas", url: "/plataforma/perfiles/tecnico/problemas", desc: "", bloqueado: true, abierto: true },
    { id: 12018, padre: 12017, orden: 1, nivel: 2, nombre: "Problemas asignados a mí", url: "/plataforma/perfiles/tecnico/problemas/asignados", desc: "", bloqueado: false, abierto: false },
    { id: 12019, padre: 12017, orden: 2, nivel: 2, nombre: "Problemas de mi grupo", url: "/plataforma/perfiles/tecnico/problemas/grupo", desc: "", bloqueado: false, abierto: false },
    { id: 12020, padre: 12017, orden: 3, nivel: 2, nombre: "Registrar problema", url: "/plataforma/perfiles/tecnico/problemas/nuevo", desc: "", bloqueado: false, abierto: false },
    { id: 12021, padre: 12017, orden: 4, nivel: 2, nombre: "Candidatos a problema", url: "/plataforma/perfiles/tecnico/problemas/candidatos", desc: "", bloqueado: false, abierto: false },
    { id: 12022, padre: 12017, orden: 5, nivel: 2, nombre: "Errores conocidos (KEDB)", url: "/plataforma/perfiles/tecnico/problemas/errores-conocidos", desc: "", bloqueado: false, abierto: false },
    { id: 12023, padre: null, orden: 5, nivel: 1, nombre: "Gestión de Cambios", url: "/plataforma/perfiles/tecnico/cambios", desc: "", bloqueado: true, abierto: true },
    { id: 12024, padre: 12023, orden: 1, nivel: 2, nombre: "Mis cambios", url: "/plataforma/perfiles/tecnico/cambios/mis-cambios", desc: "", bloqueado: false, abierto: false },
    { id: 12025, padre: 12023, orden: 2, nivel: 2, nombre: "Registrar solicitud RFC", url: "/plataforma/perfiles/tecnico/cambios/nuevo", desc: "", bloqueado: false, abierto: false },
    { id: 12026, padre: 12023, orden: 3, nivel: 2, nombre: "Cambios por implementar", url: "/plataforma/perfiles/tecnico/cambios/implementacion", desc: "Consola de implementación: Go/No-Go, bitácora, rollback y resultado.", bloqueado: false, abierto: false },
    { id: 12027, padre: 12023, orden: 4, nivel: 2, nombre: "Calendario de cambios", url: "/plataforma/perfiles/tecnico/cambios/calendario", desc: "", bloqueado: false, abierto: false },
    { id: 12028, padre: 12023, orden: 5, nivel: 2, nombre: "Cambios que afectan mis servicios", url: "/plataforma/perfiles/tecnico/cambios/impacto", desc: "", bloqueado: false, abierto: false },
    { id: 12029, padre: 12023, orden: 6, nivel: 2, nombre: "Historial de cambios", url: "/plataforma/perfiles/tecnico/cambios/historial", desc: "", bloqueado: false, abierto: false },
    { id: 12030, padre: null, orden: 6, nivel: 1, nombre: "Activos y CMDB", url: "/plataforma/perfiles/tecnico/activos", desc: "", bloqueado: true, abierto: true },
    { id: 12031, padre: 12030, orden: 1, nivel: 2, nombre: "Inventario de activos", url: "/plataforma/perfiles/tecnico/activos/inventario", desc: "", bloqueado: false, abierto: false },
    { id: 12032, padre: 12030, orden: 2, nivel: 2, nombre: "Mapa de topología CMDB", url: "/plataforma/perfiles/tecnico/activos/mapa", desc: "", bloqueado: false, abierto: false },
    { id: 12033, padre: 12030, orden: 3, nivel: 2, nombre: "Mantenimiento y reparaciones", url: "/plataforma/perfiles/tecnico/activos/mantenimiento", desc: "", bloqueado: false, abierto: false },
    { id: 12034, padre: 12030, orden: 4, nivel: 2, nombre: "Inventario físico en campo", url: "/plataforma/perfiles/tecnico/activos/conteos", desc: "Conteo con escaneo desde teléfono.", bloqueado: false, abierto: false },
    { id: 12035, padre: 12030, orden: 5, nivel: 2, nombre: "Licencias de software (consulta)", url: "/plataforma/perfiles/tecnico/activos/licencias", desc: "", bloqueado: false, abierto: false },
    { id: 12036, padre: null, orden: 7, nivel: 1, nombre: "Gestión del Conocimiento", url: "/plataforma/perfiles/tecnico/conocimiento", desc: "", bloqueado: true, abierto: true },
    { id: 12037, padre: 12036, orden: 1, nivel: 2, nombre: "Base de conocimiento", url: "/plataforma/perfiles/tecnico/conocimiento/base", desc: "", bloqueado: false, abierto: false },
    { id: 12038, padre: 12036, orden: 2, nivel: 2, nombre: "Mis artículos", url: "/plataforma/perfiles/tecnico/conocimiento/mis-articulos", desc: "", bloqueado: false, abierto: false },
    { id: 12039, padre: 12036, orden: 3, nivel: 2, nombre: "Crear artículo", url: "/plataforma/perfiles/tecnico/conocimiento/nuevo", desc: "", bloqueado: false, abierto: false },
    { id: 12040, padre: 12036, orden: 4, nivel: 2, nombre: "Revisiones pendientes", url: "/plataforma/perfiles/tecnico/conocimiento/revisiones", desc: "", bloqueado: false, abierto: false },
    { id: 12041, padre: null, orden: 8, nivel: 1, nombre: "Catálogo de servicios (consulta)", url: "/plataforma/servicios/catalogo", desc: "", bloqueado: false, abierto: true },
    { id: 12042, padre: null, orden: 9, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 12043, padre: 12042, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 12044, padre: 12042, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 3 — Solicitante (13 opciones) =====
  3: [
    { id: 13001, padre: null, orden: 1, nivel: 1, nombre: "Mesa de Servicio", url: "/tickets", desc: "Autoservicio: crear tickets y seguir los propios.", bloqueado: false, abierto: true },
    { id: 13002, padre: 13001, orden: 1, nivel: 2, nombre: "Crear ticket", url: "/tickets/catalogo", desc: "Elegir el servicio en el catálogo y completar el formulario dinámico de incidente o solicitud.", bloqueado: false, abierto: false },
    { id: 13003, padre: 13001, orden: 2, nivel: 2, nombre: "Mis tickets", url: "/tickets", desc: "Lista de los propios con estado y tiempo restante.", bloqueado: false, abierto: false },
    { id: 13004, padre: null, orden: 2, nivel: 1, nombre: "Catálogo de Servicios", url: "/tickets/catalogo", desc: "", bloqueado: false, abierto: true },
    { id: 13005, padre: 13004, orden: 1, nivel: 2, nombre: "Catálogo de incidentes", url: "/tickets/catalogo?tipo=incidente", desc: "Categorías y servicios para reportar fallas; sin botones superiores que repitan el menú.", bloqueado: false, abierto: false },
    { id: 13006, padre: 13004, orden: 2, nivel: 2, nombre: "Catálogo de solicitudes de servicio", url: "/tickets/catalogo?tipo=solicitud", desc: "Categorías y servicios para pedir requerimientos; muestra si requiere aprobación.", bloqueado: false, abierto: false },
    { id: 13007, padre: null, orden: 3, nivel: 1, nombre: "Gestión de Conocimiento", url: "/conocimiento", desc: "Guías de autoayuda: solo artículos públicos publicados.", bloqueado: false, abierto: true },
    { id: 13008, padre: 13007, orden: 1, nivel: 2, nombre: "Buscar y leer artículos", url: "/conocimiento", desc: "Buscador por texto, categoría y servicio.", bloqueado: false, abierto: false },
    { id: 13009, padre: null, orden: 4, nivel: 1, nombre: "Mis activos", url: "/activos/mis-activos", desc: "Activos que el usuario tiene en custodia.", bloqueado: false, abierto: true },
    { id: 13010, padre: null, orden: 5, nivel: 1, nombre: "Avisos de servicio", url: "/avisos/mantenimientos", desc: "Mantenimientos programados con interrupción que afectan a mi área, tomados del calendario de cambios.", bloqueado: false, abierto: true },
    { id: 13011, padre: null, orden: 6, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 13012, padre: 13011, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 13013, padre: 13011, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 4 — Supervisor (48 opciones) =====
  4: [
    { id: 14001, padre: null, orden: 1, nivel: 1, nombre: "Panel de supervisión", url: "/plataforma/perfiles/supervisor/panel", desc: "Página de inicio del supervisor: estado del equipo en un vistazo.", bloqueado: false, abierto: true },
    { id: 14002, padre: null, orden: 2, nivel: 1, nombre: "Supervisión y despacho", url: "/tickets/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 14003, padre: 14002, orden: 1, nivel: 2, nombre: "Centro de asignación", url: "/tickets/gestion/asignar", desc: "Asignar y reasignar tickets del área técnica.", bloqueado: false, abierto: false },
    { id: 14004, padre: 14002, orden: 2, nivel: 2, nombre: "Monitoreo de técnicos", url: "/tickets/gestion/tecnicos", desc: "Carga, disponibilidad y desempeño del equipo.", bloqueado: false, abierto: false },
    { id: 14005, padre: 14004, orden: 1, nivel: 3, nombre: "Ausencias y guardias del equipo", url: "/plataforma/perfiles/supervisor/equipo/ausencias", desc: "Registrar y editar ausencias de mi equipo; las usa la asignación automática.", bloqueado: false, abierto: false },
    { id: 14006, padre: 14002, orden: 3, nivel: 2, nombre: "Todos los tickets de mi área técnica", url: "/tickets/gestion/todos", desc: "", bloqueado: false, abierto: false },
    { id: 14007, padre: 14002, orden: 4, nivel: 2, nombre: "Escalamientos y riesgos de SLA", url: "/plataforma/perfiles/supervisor/sla/escalamientos", desc: "Tickets escalados jerárquicamente y en riesgo; permite intervenir.", bloqueado: false, abierto: false },
    { id: 14008, padre: 14002, orden: 5, nivel: 2, nombre: "Incidentes mayores", url: "/plataforma/perfiles/supervisor/incidentes-mayores", desc: "Declarar, coordinar, comunicar y cerrar incidentes mayores.", bloqueado: false, abierto: false },
    { id: 14009, padre: null, orden: 3, nivel: 1, nombre: "Gestión de tickets", url: "/tickets/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 14010, padre: 14009, orden: 1, nivel: 2, nombre: "Incidentes", url: "/tickets/gestion/incidentes", desc: "", bloqueado: false, abierto: false },
    { id: 14011, padre: 14009, orden: 2, nivel: 2, nombre: "Solicitudes de servicio", url: "/tickets/gestion/solicitudes", desc: "", bloqueado: false, abierto: false },
    { id: 14012, padre: 14009, orden: 3, nivel: 2, nombre: "Mis tickets", url: "/tickets/gestion/mios", desc: "", bloqueado: false, abierto: false },
    { id: 14013, padre: 14009, orden: 4, nivel: 2, nombre: "Asignados", url: "/tickets/gestion/asignados", desc: "", bloqueado: false, abierto: false },
    { id: 14014, padre: 14009, orden: 5, nivel: 2, nombre: "Bandeja de pendientes", url: "/tickets/gestion/bandeja", desc: "", bloqueado: false, abierto: false },
    { id: 14015, padre: 14009, orden: 6, nivel: 2, nombre: "Historial de resueltos", url: "/tickets/gestion/resueltos", desc: "", bloqueado: false, abierto: false },
    { id: 14016, padre: 14009, orden: 7, nivel: 2, nombre: "Registrar ticket para un usuario", url: "/tickets/gestion/crear", desc: "", bloqueado: false, abierto: false },
    { id: 14017, padre: 14009, orden: 8, nivel: 2, nombre: "Auditoría de mi área", url: "/tickets/gestion/auditoria", desc: "Línea de tiempo de tickets limitada a mi área.", bloqueado: false, abierto: false },
    { id: 14018, padre: null, orden: 4, nivel: 1, nombre: "Seguimiento de SLA", url: "/plataforma/perfiles/supervisor/sla", desc: "", bloqueado: true, abierto: true },
    { id: 14019, padre: 14018, orden: 1, nivel: 2, nombre: "Semáforo de SLA del grupo", url: "/plataforma/perfiles/supervisor/sla/semaforo", desc: "Misma vista que el técnico con alcance de todo el grupo.", bloqueado: false, abierto: false },
    { id: 14020, padre: 14018, orden: 2, nivel: 2, nombre: "Objetivos de tiempo vigentes", url: "/plataforma/perfiles/tecnico/sla/objetivos", desc: "Se reutiliza en modo consulta.", bloqueado: false, abierto: false },
    { id: 14021, padre: 14018, orden: 3, nivel: 2, nombre: "Incumplimientos y causas", url: "/plataforma/perfiles/supervisor/sla/incumplimientos", desc: "Análisis de tickets vencidos por servicio, técnico y causa.", bloqueado: false, abierto: false },
    { id: 14022, padre: null, orden: 5, nivel: 1, nombre: "Gestión de Problemas", url: "/problemas", desc: "", bloqueado: false, abierto: true },
    { id: 14023, padre: 14022, orden: 1, nivel: 2, nombre: "Registro de problemas", url: "/problemas", desc: "", bloqueado: false, abierto: false },
    { id: 14024, padre: 14022, orden: 2, nivel: 2, nombre: "Asignación de problemas", url: "/plataforma/perfiles/supervisor/problemas/asignar", desc: "Reparte problemas sin responsable mientras no exista el Gestor de Problemas.", bloqueado: false, abierto: false },
    { id: 14025, padre: 14022, orden: 3, nivel: 2, nombre: "Errores conocidos", url: "/problemas/kedb", desc: "", bloqueado: false, abierto: false },
    { id: 14026, padre: null, orden: 6, nivel: 1, nombre: "Gestión de Cambios", url: "/cambios/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 14027, padre: 14026, orden: 1, nivel: 2, nombre: "Aprobaciones técnicas de RFC", url: "/plataforma/perfiles/supervisor/cambios/aprobaciones", desc: "Etapa Técnica de las RFC del grupo implementador; segregación de funciones.", bloqueado: false, abierto: false },
    { id: 14028, padre: 14026, orden: 2, nivel: 2, nombre: "Calendario de cambios", url: "/cambios/gestion/calendario", desc: "", bloqueado: false, abierto: false },
    { id: 14029, padre: 14026, orden: 3, nivel: 2, nombre: "Cambios que afectan a mi equipo", url: "/plataforma/perfiles/supervisor/cambios/impacto", desc: "Misma lógica del técnico con alcance de grupo.", bloqueado: false, abierto: false },
    { id: 14030, padre: 14026, orden: 4, nivel: 2, nombre: "Programación de implementaciones del equipo", url: "/plataforma/perfiles/supervisor/cambios/programar", desc: "Programar y reprogramar dentro de ventanas permitidas.", bloqueado: false, abierto: false },
    { id: 14031, padre: null, orden: 7, nivel: 1, nombre: "Activos", url: "/activos", desc: "", bloqueado: false, abierto: true },
    { id: 14032, padre: 14031, orden: 1, nivel: 2, nombre: "Inventario (consulta)", url: "/activos/inventario", desc: "", bloqueado: false, abierto: false },
    { id: 14033, padre: 14031, orden: 2, nivel: 2, nombre: "Aprobación de bajas de mi área", url: "/plataforma/perfiles/supervisor/activos/bajas", desc: "Aprueba o rechaza bajas solicitadas por técnicos.", bloqueado: false, abierto: false },
    { id: 14034, padre: 14031, orden: 3, nivel: 2, nombre: "Licencias (consulta)", url: "/activos/licencias", desc: "", bloqueado: false, abierto: false },
    { id: 14035, padre: null, orden: 8, nivel: 1, nombre: "Gestión del Conocimiento", url: "/conocimiento", desc: "", bloqueado: false, abierto: true },
    { id: 14036, padre: 14035, orden: 1, nivel: 2, nombre: "Base de conocimiento", url: "/conocimiento", desc: "", bloqueado: false, abierto: false },
    { id: 14037, padre: 14035, orden: 2, nivel: 2, nombre: "Revisión y publicación de artículos", url: "/plataforma/perfiles/supervisor/conocimiento/revisiones", desc: "Revisa artículos del equipo cuando es revisor de la categoría.", bloqueado: false, abierto: false },
    { id: 14038, padre: null, orden: 9, nivel: 1, nombre: "Reportes del equipo", url: "/plataforma/perfiles/supervisor/reportes", desc: "", bloqueado: true, abierto: true },
    { id: 14039, padre: 14038, orden: 1, nivel: 2, nombre: "Indicadores operativos y SLA", url: "/plataforma/reportes/operativos", desc: "Con alcance de mi área técnica.", bloqueado: false, abierto: false },
    { id: 14040, padre: 14038, orden: 2, nivel: 2, nombre: "Productividad individual", url: "/plataforma/reportes/productividad", desc: "Resueltos, tiempos, reabiertos y satisfacción por técnico (uso de gestión, no punitivo).", bloqueado: false, abierto: false },
    { id: 14041, padre: null, orden: 10, nivel: 1, nombre: "Mi equipo", url: "/plataforma/perfiles/supervisor/equipo", desc: "", bloqueado: true, abierto: true },
    { id: 14042, padre: 14041, orden: 1, nivel: 2, nombre: "Vistas y respuestas compartidas", url: "/plataforma/perfiles/supervisor/equipo/vistas", desc: "Vistas guardadas y respuestas predefinidas del grupo.", bloqueado: false, abierto: false },
    { id: 14043, padre: null, orden: 11, nivel: 1, nombre: "Operación de servicios", url: "/operacion", desc: "", bloqueado: false, abierto: true },
    { id: 14044, padre: 14043, orden: 1, nivel: 2, nombre: "Eventos y alertas", url: "/operacion/eventos", desc: "Eventos de monitoreo; permite convertir un evento en incidente.", bloqueado: false, abierto: false },
    { id: 14045, padre: 14043, orden: 2, nivel: 2, nombre: "Disponibilidad, capacidad y continuidad", url: "/operacion/resiliencia", desc: "Indicadores de resiliencia de los servicios del área.", bloqueado: false, abierto: false },
    { id: 14046, padre: null, orden: 12, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 14047, padre: 14046, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 14048, padre: 14046, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 5 — Gestor de Área (23 opciones) =====
  5: [
    { id: 15001, padre: null, orden: 1, nivel: 1, nombre: "Panel del área", url: "/plataforma/perfiles/gestor-area/panel", desc: "Inicio del jefe de área (no TI).", bloqueado: false, abierto: true },
    { id: 15002, padre: null, orden: 2, nivel: 1, nombre: "Mesa de servicio del área", url: "/tickets/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 15003, padre: 15002, orden: 1, nivel: 2, nombre: "Registrar ticket para el área", url: "/tickets/gestion/crear", desc: "Crear tickets a nombre de un colaborador de su departamento.", bloqueado: false, abierto: false },
    { id: 15004, padre: 15002, orden: 2, nivel: 2, nombre: "Tickets de mi departamento", url: "/tickets/gestion/departamento", desc: "Solo los del departamento; vista de Gobernanza sin acciones técnicas.", bloqueado: false, abierto: false },
    { id: 15005, padre: 15002, orden: 3, nivel: 2, nombre: "Colaboradores de mi área", url: "/tickets/gestion/colaboradores", desc: "", bloqueado: false, abierto: false },
    { id: 15006, padre: null, orden: 3, nivel: 1, nombre: "Aprobaciones", url: "/tickets/gestion/aprobaciones", desc: "", bloqueado: false, abierto: true },
    { id: 15007, padre: 15006, orden: 1, nivel: 2, nombre: "Mis aprobaciones de solicitudes", url: "/tickets/gestion/aprobaciones", desc: "Solicitudes que requieren aprobación de jefatura.", bloqueado: false, abierto: false },
    { id: 15008, padre: 15006, orden: 2, nivel: 2, nombre: "Aprobación de negocio de cambios", url: "/plataforma/perfiles/gestor-area/cambios/aprobaciones", desc: "Etapa Negocio de las RFC que afectan a mi departamento.", bloqueado: false, abierto: false },
    { id: 15009, padre: 15006, orden: 3, nivel: 2, nombre: "Historial de mis decisiones", url: "/plataforma/perfiles/gestor-area/aprobaciones/historial", desc: "", bloqueado: false, abierto: false },
    { id: 15010, padre: 15006, orden: 4, nivel: 2, nombre: "Delegación de aprobaciones", url: "/plataforma/perfiles/gestor-area/aprobaciones/delegacion", desc: "Delegar por ausencia a un suplente del área.", bloqueado: false, abierto: false },
    { id: 15011, padre: null, orden: 4, nivel: 1, nombre: "Catálogo de servicios (consulta)", url: "/tickets/catalogo", desc: "", bloqueado: false, abierto: true },
    { id: 15012, padre: null, orden: 5, nivel: 1, nombre: "Cambios que afectan a mi área", url: "/cambios/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 15013, padre: 15012, orden: 1, nivel: 2, nombre: "Calendario de mantenimientos", url: "/cambios/gestion/calendario", desc: "", bloqueado: false, abierto: false },
    { id: 15014, padre: 15012, orden: 2, nivel: 2, nombre: "Cambios con interrupción para mi área", url: "/plataforma/perfiles/gestor-area/cambios/impacto", desc: "", bloqueado: false, abierto: false },
    { id: 15015, padre: 15012, orden: 3, nivel: 2, nombre: "Solicitar un cambio de negocio", url: "/cambios/gestion/crear", desc: "Solo tipo Normal.", bloqueado: false, abierto: false },
    { id: 15016, padre: null, orden: 6, nivel: 1, nombre: "Activos y contratos del área", url: "/plataforma/perfiles/gestor-area/activos", desc: "", bloqueado: true, abierto: true },
    { id: 15017, padre: 15016, orden: 1, nivel: 2, nombre: "Activos de mi área", url: "/plataforma/perfiles/gestor-area/activos", desc: "Lectura de activos por colaborador, sin datos financieros sensibles.", bloqueado: false, abierto: false },
    { id: 15018, padre: 15016, orden: 2, nivel: 2, nombre: "Licencias y contratos de mi departamento", url: "/plataforma/perfiles/gestor-area/contratos", desc: "", bloqueado: false, abierto: false },
    { id: 15019, padre: null, orden: 7, nivel: 1, nombre: "Reportes del área", url: "/plataforma/reportes/area", desc: "Tickets por servicio, SLA percibido, satisfacción y costo referencial consumido.", bloqueado: false, abierto: true },
    { id: 15020, padre: null, orden: 8, nivel: 1, nombre: "Gestión de Conocimiento", url: "/conocimiento", desc: "", bloqueado: false, abierto: true },
    { id: 15021, padre: null, orden: 9, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 15022, padre: 15021, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 15023, padre: 15021, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 6 — Auditor (29 opciones) =====
  6: [
    { id: 16001, padre: null, orden: 1, nivel: 1, nombre: "Panel de auditoría", url: "/plataforma/perfiles/auditor/panel", desc: "Hallazgos, cumplimiento y muestras pendientes (solo lectura).", bloqueado: false, abierto: true },
    { id: 16002, padre: null, orden: 2, nivel: 1, nombre: "Auditoría de tickets", url: "/tickets/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 16003, padre: 16002, orden: 1, nivel: 2, nombre: "Todos los tickets (solo lectura)", url: "/tickets/gestion/todos", desc: "Presentador sin acciones, con línea de tiempo y evidencias.", bloqueado: false, abierto: false },
    { id: 16004, padre: 16002, orden: 2, nivel: 2, nombre: "Auditoría forense", url: "/tickets/gestion/auditoria", desc: "Línea de tiempo inmutable por ticket, usuario, CI o fecha.", bloqueado: false, abierto: false },
    { id: 16005, padre: 16002, orden: 3, nivel: 2, nombre: "Segregación de funciones", url: "/plataforma/perfiles/auditor/cumplimiento/sod", desc: "Detecta aprobaciones del mismo usuario, autoaprobaciones y excepciones.", bloqueado: false, abierto: false },
    { id: 16006, padre: 16002, orden: 4, nivel: 2, nombre: "Muestreo de auditoría", url: "/plataforma/perfiles/auditor/muestreo", desc: "Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.", bloqueado: false, abierto: false },
    { id: 16007, padre: null, orden: 3, nivel: 1, nombre: "Auditoría del sistema", url: "/plataforma/perfiles/auditor/sistema", desc: "", bloqueado: true, abierto: true },
    { id: 16008, padre: 16007, orden: 1, nivel: 2, nombre: "Auditoría de cambios de configuración", url: "/admin/auditoria-sistema", desc: "Autorizar al perfil Auditor en solo lectura.", bloqueado: false, abierto: false },
    { id: 16009, padre: 16007, orden: 2, nivel: 2, nombre: "Registros de seguridad y autenticación", url: "/admin/seguridad-logs", desc: "Solo lectura.", bloqueado: false, abierto: false },
    { id: 16010, padre: 16007, orden: 3, nivel: 2, nombre: "Retención y mantenimiento de datos", url: "/admin/mantenimiento-datos", desc: "Solo lectura.", bloqueado: false, abierto: false },
    { id: 16011, padre: 16007, orden: 4, nivel: 2, nombre: "Perfiles y permisos (lectura)", url: "/admin/perfiles", desc: "Solo lectura.", bloqueado: false, abierto: false },
    { id: 16012, padre: 16007, orden: 5, nivel: 2, nombre: "Recertificación de accesos", url: "/plataforma/perfiles/auditor/accesos/recertificacion", desc: "Revisión periódica de usuarios y perfiles con confirmación o retiro.", bloqueado: false, abierto: false },
    { id: 16013, padre: null, orden: 4, nivel: 1, nombre: "Cumplimiento de procesos", url: "/plataforma/perfiles/auditor/cumplimiento", desc: "", bloqueado: true, abierto: true },
    { id: 16014, padre: 16013, orden: 1, nivel: 2, nombre: "Cambios: historial, emergencias y revisiones", url: "/cambios/gestion/todos", desc: "", bloqueado: false, abierto: false },
    { id: 16015, padre: 16013, orden: 2, nivel: 2, nombre: "Cambios sin autorización o fuera de ventana", url: "/plataforma/perfiles/auditor/cumplimiento/cambios", desc: "", bloqueado: false, abierto: false },
    { id: 16016, padre: 16013, orden: 3, nivel: 2, nombre: "Problemas y errores conocidos", url: "/problemas", desc: "", bloqueado: false, abierto: false },
    { id: 16017, padre: 16013, orden: 4, nivel: 2, nombre: "Cumplimiento de SLA", url: "/plataforma/reportes/operativos", desc: "", bloqueado: false, abierto: false },
    { id: 16018, padre: null, orden: 5, nivel: 1, nombre: "Activos y licencias", url: "/plataforma/perfiles/auditor/activos", desc: "", bloqueado: true, abierto: true },
    { id: 16019, padre: 16018, orden: 1, nivel: 2, nombre: "Inventario (lectura)", url: "/activos/inventario", desc: "", bloqueado: false, abierto: false },
    { id: 16020, padre: 16018, orden: 2, nivel: 2, nombre: "Cumplimiento de licencias", url: "/activos/licencias", desc: "", bloqueado: false, abierto: false },
    { id: 16021, padre: 16018, orden: 3, nivel: 2, nombre: "Resultados de auditorías de CMDB", url: "/plataforma/perfiles/auditor/cmdb/resultados", desc: "", bloqueado: false, abierto: false },
    { id: 16022, padre: 16018, orden: 4, nivel: 2, nombre: "Bajas y disposición", url: "/plataforma/perfiles/auditor/activos/bajas", desc: "Actas de baja, borrado seguro y destino final.", bloqueado: false, abierto: false },
    { id: 16023, padre: null, orden: 6, nivel: 1, nombre: "Reportes y evidencias", url: "/plataforma/reportes/auditoria", desc: "", bloqueado: true, abierto: true },
    { id: 16024, padre: 16023, orden: 1, nivel: 2, nombre: "Indicadores operativos y SLA", url: "/plataforma/reportes/operativos", desc: "", bloqueado: false, abierto: false },
    { id: 16025, padre: 16023, orden: 2, nivel: 2, nombre: "Tableros (lectura)", url: "/plataforma/reportes/tableros", desc: "", bloqueado: false, abierto: false },
    { id: 16026, padre: 16023, orden: 3, nivel: 2, nombre: "Informes de auditoría", url: "/plataforma/reportes/auditoria", desc: "Hallazgos, recomendaciones y seguimiento.", bloqueado: false, abierto: false },
    { id: 16027, padre: null, orden: 7, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 16028, padre: 16027, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 16029, padre: 16027, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 7 — Aprobador (18 opciones) =====
  7: [
    { id: 17001, padre: null, orden: 1, nivel: 1, nombre: "Panel del aprobador", url: "/plataforma/perfiles/aprobador/panel", desc: "Pendientes por vencer, reuniones del comité y decisiones recientes.", bloqueado: false, abierto: true },
    { id: 17002, padre: null, orden: 2, nivel: 1, nombre: "Aprobaciones pendientes", url: "/plataforma/perfiles/aprobador/aprobaciones", desc: "", bloqueado: true, abierto: true },
    { id: 17003, padre: 17002, orden: 1, nivel: 2, nombre: "Aprobaciones de cambios", url: "/plataforma/perfiles/aprobador/cambios", desc: "Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar, pedir información o delegar.", bloqueado: false, abierto: false },
    { id: 17004, padre: 17002, orden: 2, nivel: 2, nombre: "Aprobaciones de solicitudes de servicio", url: "/tickets/gestion/aprobaciones", desc: "", bloqueado: false, abierto: false },
    { id: 17005, padre: 17002, orden: 3, nivel: 2, nombre: "Modelos de cambio estándar", url: "/plataforma/perfiles/aprobador/cambios/modelos", desc: "", bloqueado: false, abierto: false },
    { id: 17006, padre: 17002, orden: 4, nivel: 2, nombre: "Bajas y renovaciones por monto", url: "/plataforma/perfiles/aprobador/activos", desc: "", bloqueado: false, abierto: false },
    { id: 17007, padre: 17002, orden: 5, nivel: 2, nombre: "Riesgo aceptado y cierre de problemas mayores", url: "/plataforma/perfiles/aprobador/problemas", desc: "", bloqueado: false, abierto: false },
    { id: 17008, padre: null, orden: 3, nivel: 1, nombre: "Comité asesor de cambios (CAB)", url: "/cambios/gestion/cab", desc: "", bloqueado: false, abierto: true },
    { id: 17009, padre: 17008, orden: 1, nivel: 2, nombre: "Dictamen colegiado", url: "/cambios/gestion/cab", desc: "Quórum, votación, voto de calidad, exclusión por conflicto de interés.", bloqueado: false, abierto: false },
    { id: 17010, padre: 17008, orden: 2, nivel: 2, nombre: "Agenda y actas", url: "/plataforma/perfiles/aprobador/cab/agenda", desc: "", bloqueado: false, abierto: false },
    { id: 17011, padre: 17008, orden: 3, nivel: 2, nombre: "Comité de emergencia (ECAB)", url: "/plataforma/perfiles/aprobador/cab/emergencia", desc: "Decisión rápida con plazo y revisión retroactiva.", bloqueado: false, abierto: false },
    { id: 17012, padre: null, orden: 4, nivel: 1, nombre: "Calendario de cambios", url: "/cambios/gestion/calendario", desc: "", bloqueado: false, abierto: true },
    { id: 17013, padre: null, orden: 5, nivel: 1, nombre: "Historial de mis decisiones", url: "/plataforma/perfiles/aprobador/historial", desc: "", bloqueado: false, abierto: true },
    { id: 17014, padre: null, orden: 6, nivel: 1, nombre: "Delegaciones", url: "/plataforma/perfiles/aprobador/delegaciones", desc: "Delegar por ausencia a un suplente con vigencia.", bloqueado: false, abierto: true },
    { id: 17015, padre: null, orden: 7, nivel: 1, nombre: "Reportes de decisiones", url: "/plataforma/reportes/decisiones", desc: "Tiempo de respuesta y tasas de aprobación y rechazo.", bloqueado: false, abierto: true },
    { id: 17016, padre: null, orden: 8, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 17017, padre: 17016, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 17018, padre: 17016, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 8 — Gestor de Cambios (25 opciones) =====
  8: [
    { id: 18001, padre: null, orden: 1, nivel: 1, nombre: "Panel de gestión de cambios", url: "/plataforma/perfiles/gestor-cambios/panel", desc: "Inicio: RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.", bloqueado: false, abierto: true },
    { id: 18002, padre: null, orden: 2, nivel: 1, nombre: "Solicitudes de cambio (RFC)", url: "/cambios/gestion", desc: "", bloqueado: false, abierto: true },
    { id: 18003, padre: 18002, orden: 1, nivel: 2, nombre: "Registrar solicitud RFC", url: "/cambios/gestion/crear", desc: "Formulario del Prompt 2 con validación de calendario y análisis de impacto.", bloqueado: false, abierto: false },
    { id: 18004, padre: 18002, orden: 2, nivel: 2, nombre: "Bandeja de RFC por evaluar", url: "/plataforma/perfiles/gestor-cambios/evaluacion", desc: "Asignar evaluador, calcular riesgo, revisar conflictos y enviar a autorización.", bloqueado: false, abierto: false },
    { id: 18005, padre: 18002, orden: 3, nivel: 2, nombre: "Historial consolidado", url: "/cambios/gestion/todos", desc: "", bloqueado: false, abierto: false },
    { id: 18006, padre: null, orden: 3, nivel: 1, nombre: "Evaluación y autorización", url: "/plataforma/perfiles/gestor-cambios/autorizaciones", desc: "", bloqueado: true, abierto: true },
    { id: 18007, padre: 18006, orden: 1, nivel: 2, nombre: "Seguimiento de etapas de aprobación", url: "/plataforma/perfiles/gestor-cambios/autorizaciones", desc: "Etapas pendientes, plazos, recordatorios y escalamiento.", bloqueado: false, abierto: false },
    { id: 18008, padre: null, orden: 4, nivel: 1, nombre: "Programación e implementación", url: "/plataforma/perfiles/gestor-cambios/programacion", desc: "", bloqueado: true, abierto: true },
    { id: 18009, padre: 18008, orden: 1, nivel: 2, nombre: "Calendario de ventanas", url: "/cambios/gestion/calendario", desc: "", bloqueado: false, abierto: false },
    { id: 18010, padre: 18008, orden: 2, nivel: 2, nombre: "Programación de cambios autorizados", url: "/plataforma/perfiles/gestor-cambios/programacion", desc: "", bloqueado: false, abierto: false },
    { id: 18011, padre: 18008, orden: 3, nivel: 2, nombre: "Conflictos y capacidad", url: "/plataforma/perfiles/gestor-cambios/conflictos", desc: "Solapamientos, congelamientos, feriados y máximos simultáneos.", bloqueado: false, abierto: false },
    { id: 18012, padre: 18008, orden: 4, nivel: 2, nombre: "Seguimiento de ejecución", url: "/plataforma/perfiles/gestor-cambios/ejecucion", desc: "Tablero en vivo de cambios en ejecución, extensiones de ventana y rollbacks.", bloqueado: false, abierto: false },
    { id: 18013, padre: null, orden: 5, nivel: 1, nombre: "Comité asesor de cambios (CAB)", url: "/cambios/gestion/cab", desc: "", bloqueado: false, abierto: true },
    { id: 18014, padre: 18013, orden: 1, nivel: 2, nombre: "Dictamen colegiado (presidencia)", url: "/cambios/gestion/cab", desc: "", bloqueado: false, abierto: false },
    { id: 18015, padre: 18013, orden: 2, nivel: 2, nombre: "Convocatoria, agenda y actas", url: "/plataforma/perfiles/gestor-cambios/cab/agenda", desc: "Genera agenda con corte, convoca reuniones extraordinarias y emite el acta.", bloqueado: false, abierto: false },
    { id: 18016, padre: null, orden: 6, nivel: 1, nombre: "Revisión post-implementación", url: "/plataforma/perfiles/gestor-cambios/pir", desc: "PIR pendientes y vencidas; incidentes causados; lecciones aprendidas.", bloqueado: false, abierto: true },
    { id: 18017, padre: null, orden: 7, nivel: 1, nombre: "Modelos de cambio estándar", url: "/plataforma/perfiles/gestor-cambios/modelos", desc: "Consulta y propuesta de modelos, métricas de éxito y suspensiones.", bloqueado: false, abierto: true },
    { id: 18018, padre: null, orden: 8, nivel: 1, nombre: "Reglas de calendario", url: "/plataforma/perfiles/gestor-cambios/calendario-reglas", desc: "", bloqueado: true, abierto: true },
    { id: 18019, padre: 18018, orden: 1, nivel: 2, nombre: "Ventanas de mantenimiento", url: "/admin/procesos/cambios/notificaciones-calendario?vista=ventanas", desc: "Edición permitida por el permiso `config.cambios.calendario`.", bloqueado: false, abierto: false },
    { id: 18020, padre: 18018, orden: 2, nivel: 2, nombre: "Períodos de congelamiento", url: "/admin/procesos/cambios/notificaciones-calendario?vista=congelamiento", desc: "", bloqueado: false, abierto: false },
    { id: 18021, padre: 18018, orden: 3, nivel: 2, nombre: "Feriados", url: "/admin/procesos/cambios/notificaciones-calendario?vista=feriados", desc: "", bloqueado: false, abierto: false },
    { id: 18022, padre: null, orden: 9, nivel: 1, nombre: "Reportes de cambios", url: "/plataforma/reportes/cambios", desc: "Tasa de éxito, emergencias, tiempos de ciclo, incidentes causados y cumplimiento de ventana.", bloqueado: false, abierto: true },
    { id: 18023, padre: null, orden: 10, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 18024, padre: 18023, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 18025, padre: 18023, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 9 — Gestor de Activos y Configuración (31 opciones) =====
  9: [
    { id: 19001, padre: null, orden: 1, nivel: 1, nombre: "Panel de activos y CMDB", url: "/gestor-activos/panel", desc: "Garantías por vencer, actas pendientes, sobreuso de licencias, inexactitudes y campañas activas.", bloqueado: false, abierto: true },
    { id: 19002, padre: null, orden: 2, nivel: 1, nombre: "Inventario de activos (HAM)", url: "/activos/inventario", desc: "", bloqueado: false, abierto: true },
    { id: 19003, padre: 19002, orden: 1, nivel: 2, nombre: "Listado y ficha del activo", url: "/activos/inventario", desc: "Ficha con atributos, relaciones, tickets, mantenimiento y auditoría.", bloqueado: false, abierto: false },
    { id: 19004, padre: 19002, orden: 2, nivel: 2, nombre: "Importación masiva", url: "/gestor-activos/importacion", desc: "Validación en seco, mapeo de columnas y reversión.", bloqueado: false, abierto: false },
    { id: 19005, padre: 19002, orden: 3, nivel: 2, nombre: "Recepción de adquisiciones", url: "/gestor-activos/recepcion", desc: "Recepción por lote con series, garantía y vínculo a la solicitud de origen.", bloqueado: false, abierto: false },
    { id: 19006, padre: 19002, orden: 4, nivel: 2, nombre: "Asignación, custodia y actas", url: "/gestor-activos/asignaciones", desc: "Asignar, transferir, devolver; actas y aceptación del custodio.", bloqueado: false, abierto: false },
    { id: 19007, padre: 19002, orden: 5, nivel: 2, nombre: "Mantenimiento y garantías", url: "/gestor-activos/mantenimiento", desc: "", bloqueado: false, abierto: false },
    { id: 19008, padre: 19002, orden: 6, nivel: 2, nombre: "Bajas y disposición", url: "/gestor-activos/bajas", desc: "Solicitudes de baja, borrado seguro, acta y destino final.", bloqueado: false, abierto: false },
    { id: 19009, padre: 19002, orden: 7, nivel: 2, nombre: "Inventario físico (campañas)", url: "/gestor-activos/inventario-fisico", desc: "Crear campañas, revisar discrepancias y cerrar con acta (el conteo en campo lo hace el técnico).", bloqueado: false, abierto: false },
    { id: 19010, padre: null, orden: 3, nivel: 1, nombre: "Licencias de software (SAM)", url: "/activos/licencias", desc: "", bloqueado: false, abierto: true },
    { id: 19011, padre: 19010, orden: 1, nivel: 2, nombre: "Cumplimiento y sobreuso", url: "/gestor-activos/licencias/cumplimiento", desc: "", bloqueado: false, abierto: false },
    { id: 19012, padre: 19010, orden: 2, nivel: 2, nombre: "Catálogo de software autorizado", url: "/gestor-activos/licencias/catalogo-software", desc: "", bloqueado: false, abierto: false },
    { id: 19013, padre: null, orden: 4, nivel: 1, nombre: "Proveedores y contratos", url: "/proveedores", desc: "", bloqueado: false, abierto: true },
    { id: 19014, padre: 19013, orden: 1, nivel: 2, nombre: "Proveedores", url: "/proveedores", desc: "Proveedores con validación de RUC y contacto.", bloqueado: false, abierto: false },
    { id: 19015, padre: 19013, orden: 2, nivel: 2, nombre: "Contratos y cobertura", url: "/gestor-activos/contratos", desc: "", bloqueado: false, abierto: false },
    { id: 19016, padre: 19013, orden: 3, nivel: 2, nombre: "Renovaciones y vencimientos", url: "/gestor-activos/renovaciones", desc: "Genera solicitudes de renovación y registra el historial.", bloqueado: false, abierto: false },
    { id: 19017, padre: null, orden: 5, nivel: 1, nombre: "CMDB", url: "/activos/cmdb", desc: "", bloqueado: false, abierto: true },
    { id: 19018, padre: 19017, orden: 1, nivel: 2, nombre: "Mapa de topología", url: "/activos/cmdb", desc: "", bloqueado: false, abierto: false },
    { id: 19019, padre: 19017, orden: 2, nivel: 2, nombre: "Modelado de clases CI", url: "/activos/cmdb/tipos", desc: "", bloqueado: false, abierto: false },
    { id: 19020, padre: 19017, orden: 3, nivel: 2, nombre: "Actualizaciones de CMDB desde cambios", url: "/gestor-activos/cmdb/actualizaciones", desc: "Aplica a la CMDB lo propuesto en las RFC cerradas.", bloqueado: false, abierto: false },
    { id: 19021, padre: 19017, orden: 4, nivel: 2, nombre: "Calidad y auditoría de CMDB", url: "/gestor-activos/cmdb/auditoria", desc: "", bloqueado: false, abierto: false },
    { id: 19022, padre: 19017, orden: 5, nivel: 2, nombre: "Líneas base", url: "/gestor-activos/cmdb/lineas-base", desc: "", bloqueado: false, abierto: false },
    { id: 19023, padre: 19017, orden: 6, nivel: 2, nombre: "Inexactitudes reportadas", url: "/gestor-activos/cmdb/inexactitudes", desc: "Tareas generadas por técnicos.", bloqueado: false, abierto: false },
    { id: 19032, padre: 19017, orden: 7, nivel: 2, nombre: "Análisis e impacto", url: "/activos/cmdb/analisis", desc: "Topología de dependencias, impacto en fallas y reconciliación Activo ↔ CI.", bloqueado: false, abierto: false },
    { id: 19024, padre: null, orden: 6, nivel: 1, nombre: "Catálogos de activos", url: "/gestor-activos/catalogos", desc: "", bloqueado: true, abierto: true },
    { id: 19025, padre: 19024, orden: 1, nivel: 2, nombre: "Fabricantes y modelos", url: "/admin/activos-config/tipos-modelos-atributos?vista=fabricantes", desc: "", bloqueado: false, abierto: false },
    { id: 19026, padre: 19024, orden: 2, nivel: 2, nombre: "Ubicaciones", url: "/admin/activos-config/tipos-modelos-atributos?vista=ubicaciones", desc: "", bloqueado: false, abierto: false },
    { id: 19027, padre: 19024, orden: 3, nivel: 2, nombre: "Listas auxiliares", url: "/admin/activos-config/tipos-modelos-atributos?vista=catalogos", desc: "", bloqueado: false, abierto: false },
    { id: 19028, padre: null, orden: 7, nivel: 1, nombre: "Reportes de activos", url: "/plataforma/reportes/activos", desc: "Inventario, antigüedad, costos, garantías, cumplimiento y exactitud de CMDB.", bloqueado: false, abierto: true },
    { id: 19029, padre: null, orden: 8, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 19030, padre: 19029, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 19031, padre: 19029, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
  // ===== PERFIL 10 — Gestor de Problemas (16 opciones) =====
  10: [
    { id: 20001, padre: null, orden: 1, nivel: 1, nombre: "Panel de gestión de problemas", url: "/gestor-problemas/panel", desc: "Problemas abiertos, sin asignar, por vencer, mayores y errores conocidos por revisar.", bloqueado: false, abierto: true },
    { id: 20002, padre: null, orden: 2, nivel: 1, nombre: "Registro de problemas", url: "/problemas", desc: "", bloqueado: false, abierto: true },
    { id: 20003, padre: null, orden: 3, nivel: 1, nombre: "Bandeja y asignación", url: "/gestor-problemas/asignacion", desc: "Asignar responsables, grupos y prioridad.", bloqueado: false, abierto: true },
    { id: 20004, padre: null, orden: 4, nivel: 1, nombre: "Identificación proactiva", url: "/gestor-problemas/candidatos", desc: "", bloqueado: true, abierto: true },
    { id: 20005, padre: 20004, orden: 1, nivel: 2, nombre: "Candidatos a problema", url: "/gestor-problemas/candidatos", desc: "Sugerencias de las reglas de umbral con alcance global.", bloqueado: false, abierto: false },
    { id: 20006, padre: 20004, orden: 2, nivel: 2, nombre: "Incidentes recurrentes", url: "/gestor-problemas/recurrentes", desc: "Agrupación por servicio, CI, categoría y código de resolución.", bloqueado: false, abierto: false },
    { id: 20007, padre: null, orden: 5, nivel: 1, nombre: "Análisis de causa raíz", url: "/gestor-problemas/analisis", desc: "Herramientas de 5 porqués, Ishikawa y línea de tiempo.", bloqueado: false, abierto: true },
    { id: 20008, padre: null, orden: 6, nivel: 1, nombre: "Errores conocidos (KEDB)", url: "/problemas/kedb", desc: "Publicar, retirar y revisar periódicamente.", bloqueado: false, abierto: true },
    { id: 20009, padre: null, orden: 7, nivel: 1, nombre: "Problemas mayores y revisión", url: "/gestor-problemas/mayores", desc: "", bloqueado: false, abierto: true },
    { id: 20010, padre: null, orden: 8, nivel: 1, nombre: "Solicitudes de cambio derivadas", url: "/gestor-problemas/cambios", desc: "RFC vinculadas a problemas y su estado.", bloqueado: false, abierto: true },
    { id: 20011, padre: null, orden: 9, nivel: 1, nombre: "Conocimiento derivado", url: "/gestor-problemas/conocimiento", desc: "Artículos generados y pendientes por problema.", bloqueado: false, abierto: true },
    { id: 20012, padre: null, orden: 10, nivel: 1, nombre: "Objetivos de tiempo", url: "/gestor-problemas/objetivos", desc: "Consulta de los objetivos internos de problemas.", bloqueado: false, abierto: true },
    { id: 20013, padre: null, orden: 11, nivel: 1, nombre: "Reportes de problemas", url: "/plataforma/reportes/problemas", desc: "Tiempo hasta causa raíz, recurrencia, problemas mayores y uso de errores conocidos.", bloqueado: false, abierto: true },
    { id: 20014, padre: null, orden: 12, nivel: 1, nombre: "Mi cuenta", url: "/mi-cuenta", desc: "Datos personales, cambio de clave y selector de perfil (ya existentes); se amplía con preferencias.", bloqueado: false, abierto: true },
    { id: 20015, padre: 20014, orden: 1, nivel: 2, nombre: "Mi perfil y seguridad", url: "/mi-cuenta", desc: "Ver y editar datos permitidos, cambiar contraseña y ver sesiones.", bloqueado: false, abierto: false },
    { id: 20016, padre: 20014, orden: 2, nivel: 2, nombre: "Preferencias de notificación", url: "/mi-cuenta/notificaciones", desc: "Eventos × canales (app y correo), resumen diario y horas de silencio; los eventos obligatorios del perfil no se silencian.", bloqueado: false, abierto: false },
  ],
};

async function migrar() {
  console.log("Iniciando siembra del menú de los 10 perfiles (MENUS_Y_PERFILES.md)...");

  await transaccion(async (client: PoolClient) => {
    // 1. Columnas extendidas de opciones_menu (idempotente).
    console.log("1. Extendiendo opciones_menu...");
    await client.query(`
      ALTER TABLE opciones_menu
        ADD COLUMN IF NOT EXISTS permiso_requerido VARCHAR(100),
        ADD COLUMN IF NOT EXISTS modulo_requerido VARCHAR(50),
        ADD COLUMN IF NOT EXISTS condicion_nivel JSONB,
        ADD COLUMN IF NOT EXISTS contador_clave VARCHAR(50),
        ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS abierto_por_defecto BOOLEAN DEFAULT false;
    `);

    // 2. Sembrar el árbol de cada perfil.
    for (const [idPerfilStr, opciones] of Object.entries(MENUS_POR_PERFIL)) {
      const idPerfil = Number(idPerfilStr);
      const nombrePerfil = NOMBRES_PERFIL[idPerfil] ?? `Perfil ${idPerfil}`;
      console.log(`2.${idPerfil} Sembrando ${opciones.length} opciones para ${nombrePerfil} (id_perfil=${idPerfil})...`);

      // Limpiar asignaciones previas del perfil para evitar menús obsoletos.
      await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = $1;`, [idPerfil]);

      let orden = 0;
      for (const op of opciones) {
        orden += 1;
        await client.query(
          `INSERT INTO opciones_menu (
             id_opcion_menu, id_padre, orden, nivel, nombre, url_menu, descripcion,
             bloqueado, abierto_por_defecto, contador_clave, estado_registro
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
           ON CONFLICT (id_opcion_menu) DO UPDATE SET
             id_padre = EXCLUDED.id_padre,
             orden = EXCLUDED.orden,
             nivel = EXCLUDED.nivel,
             nombre = EXCLUDED.nombre,
             url_menu = EXCLUDED.url_menu,
             descripcion = EXCLUDED.descripcion,
             bloqueado = EXCLUDED.bloqueado,
             abierto_por_defecto = EXCLUDED.abierto_por_defecto,
             contador_clave = EXCLUDED.contador_clave,
             estado_registro = true;`,
          [op.id, op.padre, op.orden, op.nivel, op.nombre, op.url, op.desc, op.bloqueado, op.abierto, null]
        );

        await client.query(
          `INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
             orden = EXCLUDED.orden,
             estado_registro = true;`,
          [op.id, idPerfil, orden]
        );
      }
    }

    // 3. Sincronizar la secuencia de IDs para futuros inserts sin id explícito.
    await client.query(
      `SELECT setval('opciones_menu_id_opcion_menu_seq', (SELECT MAX(id_opcion_menu) FROM opciones_menu));`
    );

    console.log("Siembra del menú de los 10 perfiles completada con éxito.");
  });

  process.exit(0);
}

migrar().catch((err) => {
  console.error("Error en la siembra de menús:", err);
  process.exit(1);
});
