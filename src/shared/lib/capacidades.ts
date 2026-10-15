import type { SesionUsuario } from "@/types";

/**
 * RBAC por capacidades (dominio:accion).
 *
 * Objetivo: que las paginas y los controladores de API dejen de enumerar
 * identificadores de perfil y consulten capacidades semanticas.
 *
 * IMPORTANTE: mientras no exista una tabla `perfil_capacidades` en la base de
 * datos, `CAPACIDADES_POR_PERFIL` actua como puente y replica el
 * comportamiento vigente. La idea es reemplazar este mapa por una consulta a
 * la base de datos sin tocar a los consumidores.
 */

/** Perfiles del sistema (db/seed.sql + migraciones). */
export const PERFILES = {
  ADMINISTRADOR: 1,
  TECNICO: 2,
  SOLICITANTE: 3,
  SUPERVISOR: 4,
  GESTOR_AREA: 5,
  AUDITOR: 6,
  APROBADOR: 7,
  GESTOR_CAMBIOS: 8,
  GESTOR_ACTIVOS: 9,
  GESTOR_PROBLEMAS: 10,
} as const;

export type IdPerfil = (typeof PERFILES)[keyof typeof PERFILES];

/** Catalogo de capacidades en formato `dominio:accion`. */
export const CAPACIDADES = {
  // Mesa de servicio / tickets
  TICKETS_VER: "tickets:ver",
  TICKETS_CREAR: "tickets:crear",
  TICKETS_GESTIONAR: "tickets:gestionar",
  TICKETS_ADMINISTRAR: "tickets:administrar",

  // Incidentes
  INCIDENTES_VER: "incidentes:ver",
  INCIDENTES_GESTIONAR: "incidentes:gestionar",

  // Solicitudes de servicio
  SOLICITUDES_VER: "solicitudes:ver",
  SOLICITUDES_CREAR: "solicitudes:crear",
  SOLICITUDES_APROBAR: "solicitudes:aprobar",

  // Problemas y KEDB
  PROBLEMAS_VER: "problemas:ver",
  PROBLEMAS_CREAR: "problemas:crear",
  PROBLEMAS_GESTIONAR: "problemas:gestionar",
  PROBLEMAS_CONFIGURAR: "problemas:configurar",
  KEDB_VER: "kedb:ver",

  // Cambios (RFC)
  CAMBIOS_VER: "cambios:ver",
  CAMBIOS_CREAR: "cambios:crear",
  CAMBIOS_APROBAR: "cambios:aprobar",
  CAMBIOS_GESTIONAR: "cambios:gestionar",
  CAMBIOS_CONFIGURAR: "cambios:configurar",

  // Activos, licencias y CMDB
  ACTIVOS_VER: "activos:ver",
  ACTIVOS_GESTIONAR: "activos:gestionar",
  ACTIVOS_CONFIGURAR: "activos:configurar",
  LICENCIAS_VER: "licencias:ver",
  LICENCIAS_GESTIONAR: "licencias:gestionar",
  CMDB_VER: "cmdb:ver",
  CMDB_GESTIONAR: "cmdb:gestionar",

  // Conocimiento
  CONOCIMIENTO_VER: "conocimiento:ver",
  CONOCIMIENTO_GESTIONAR: "conocimiento:gestionar",
  CONOCIMIENTO_CONFIGURAR: "conocimiento:configurar",

  // Servicios y SLA
  SERVICIOS_VER: "servicios:ver",
  SERVICIOS_CONFIGURAR: "servicios:configurar",

  // Operacion de servicios
  OPERACION_VER: "operacion:ver",
  OPERACION_EVENTOS: "operacion:eventos:ver",
  OPERACION_RESILIENCIA: "operacion:resiliencia:ver",

  // Proveedores
  PROVEEDORES_VER: "proveedores:ver",
  PROVEEDORES_GESTIONAR: "proveedores:gestionar",

  // Administracion de plataforma
  ADMIN_USUARIOS: "admin:usuarios",
  ADMIN_PERFILES: "admin:perfiles",
  ADMIN_ORGANIZACION: "admin:organizacion",
  ADMIN_MENU: "admin:menu",
  ADMIN_CONFIGURACION: "admin:configuracion",
  ADMIN_NOTIFICACIONES: "admin:notificaciones",
  ADMIN_MANTENIMIENTO: "admin:mantenimiento",
  ADMIN_REPORTES: "admin:reportes",

  // Auditoria y seguridad
  AUDITORIA_VER: "auditoria:ver",
  SEGURIDAD_LOGS: "seguridad:logs",

  // Reportes
  REPORTES_VER: "reportes:ver",
} as const;

export type Capacidad = (typeof CAPACIDADES)[keyof typeof CAPACIDADES];

const TODAS = Object.values(CAPACIDADES) as Capacidad[];

/** Capacidades operativas de operacion de servicios. */
const OPERACION_BASE: Capacidad[] = [
  CAPACIDADES.OPERACION_VER,
  CAPACIDADES.OPERACION_EVENTOS,
];

const OPERACION_COMPLETA: Capacidad[] = [
  ...OPERACION_BASE,
  CAPACIDADES.OPERACION_RESILIENCIA,
];

/** Puente perfil -> capacidades mientras no exista `perfil_capacidades`. */
export const CAPACIDADES_POR_PERFIL: Record<number, readonly Capacidad[]> = {
  // Administrador: acceso total.
  [PERFILES.ADMINISTRADOR]: TODAS,

  // Tecnico: atiende incidentes y tickets asignados.
  [PERFILES.TECNICO]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.TICKETS_GESTIONAR,
    CAPACIDADES.INCIDENTES_VER,
    CAPACIDADES.INCIDENTES_GESTIONAR,
    CAPACIDADES.SOLICITUDES_VER,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.PROBLEMAS_CREAR,
    CAPACIDADES.KEDB_VER,
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.CONOCIMIENTO_VER,
    CAPACIDADES.SERVICIOS_VER,
    ...OPERACION_BASE,
  ],

  // Solicitante: crea y sigue sus propios tickets.
  [PERFILES.SOLICITANTE]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.TICKETS_CREAR,
    CAPACIDADES.INCIDENTES_VER,
    CAPACIDADES.SOLICITUDES_VER,
    CAPACIDADES.SOLICITUDES_CREAR,
    CAPACIDADES.CONOCIMIENTO_VER,
    CAPACIDADES.SERVICIOS_VER,
  ],

  // Supervisor: opera tickets sin configurar la plataforma.
  [PERFILES.SUPERVISOR]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.TICKETS_GESTIONAR,
    CAPACIDADES.INCIDENTES_VER,
    CAPACIDADES.INCIDENTES_GESTIONAR,
    CAPACIDADES.SOLICITUDES_VER,
    CAPACIDADES.SOLICITUDES_APROBAR,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.PROBLEMAS_CREAR,
    CAPACIDADES.KEDB_VER,
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.CONOCIMIENTO_VER,
    CAPACIDADES.SERVICIOS_VER,
    CAPACIDADES.REPORTES_VER,
    ...OPERACION_COMPLETA,
  ],

  // Gestor de Area: aprueba requerimientos de su unidad.
  [PERFILES.GESTOR_AREA]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.SOLICITUDES_VER,
    CAPACIDADES.SOLICITUDES_APROBAR,
    CAPACIDADES.CONOCIMIENTO_VER,
    CAPACIDADES.SERVICIOS_VER,
    CAPACIDADES.OPERACION_VER,
  ],

  // Auditor: lectura integral sin modificar datos.
  [PERFILES.AUDITOR]: [
    CAPACIDADES.AUDITORIA_VER,
    CAPACIDADES.SEGURIDAD_LOGS,
    CAPACIDADES.REPORTES_VER,
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.KEDB_VER,
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.CONOCIMIENTO_VER,
    CAPACIDADES.SERVICIOS_VER,
    CAPACIDADES.PROVEEDORES_VER,
    ...OPERACION_COMPLETA,
  ],

  // Aprobador (CAB): autoriza cambios.
  [PERFILES.APROBADOR]: [
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.CAMBIOS_APROBAR,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.PROVEEDORES_VER,
    ...OPERACION_COMPLETA,
  ],

  // Gestor de Cambios: coordina el calendario de cambios.
  [PERFILES.GESTOR_CAMBIOS]: [
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.CAMBIOS_CREAR,
    CAPACIDADES.CAMBIOS_GESTIONAR,
    CAPACIDADES.CAMBIOS_CONFIGURAR,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.PROVEEDORES_VER,
    ...OPERACION_COMPLETA,
  ],

  // Gestor de Activos y Configuracion: custodia inventario y CMDB.
  [PERFILES.GESTOR_ACTIVOS]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.ACTIVOS_GESTIONAR,
    CAPACIDADES.ACTIVOS_CONFIGURAR,
    CAPACIDADES.LICENCIAS_VER,
    CAPACIDADES.LICENCIAS_GESTIONAR,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.CMDB_GESTIONAR,
    CAPACIDADES.PROVEEDORES_VER,
    CAPACIDADES.PROVEEDORES_GESTIONAR,
    ...OPERACION_COMPLETA,
  ],

  // Gestor de Problemas: coordina problemas y errores conocidos.
  [PERFILES.GESTOR_PROBLEMAS]: [
    CAPACIDADES.TICKETS_VER,
    CAPACIDADES.PROBLEMAS_VER,
    CAPACIDADES.PROBLEMAS_CREAR,
    CAPACIDADES.PROBLEMAS_GESTIONAR,
    CAPACIDADES.PROBLEMAS_CONFIGURAR,
    CAPACIDADES.KEDB_VER,
    CAPACIDADES.CAMBIOS_VER,
    CAPACIDADES.ACTIVOS_VER,
    CAPACIDADES.CMDB_VER,
    CAPACIDADES.CONOCIMIENTO_VER,
    ...OPERACION_BASE,
  ],
};

const cacheCapacidades = new Map<number, ReadonlySet<Capacidad>>();

/** Devuelve el conjunto de capacidades de un perfil. */
export function resolverCapacidades(idPerfil: number): ReadonlySet<Capacidad> {
  const cacheado = cacheCapacidades.get(idPerfil);
  if (cacheado) return cacheado;
  const capacidades = new Set<Capacidad>(CAPACIDADES_POR_PERFIL[idPerfil] ?? []);
  cacheCapacidades.set(idPerfil, capacidades);
  return capacidades;
}

export function tieneCapacidad(idPerfil: number, capacidad: Capacidad): boolean {
  return resolverCapacidades(idPerfil).has(capacidad);
}

export function tieneAlgunaCapacidad(
  idPerfil: number,
  capacidades: readonly Capacidad[]
): boolean {
  const conjunto = resolverCapacidades(idPerfil);
  return capacidades.some((capacidad) => conjunto.has(capacidad));
}

export function tieneTodasLasCapacidades(
  idPerfil: number,
  capacidades: readonly Capacidad[]
): boolean {
  const conjunto = resolverCapacidades(idPerfil);
  return capacidades.every((capacidad) => conjunto.has(capacidad));
}

/** Capacidades efectivas del perfil activo de una sesion. */
export function capacidadesDeSesion(
  sesion: SesionUsuario | null | undefined
): ReadonlySet<Capacidad> {
  if (!sesion?.perfilActivo) return new Set<Capacidad>();
  return resolverCapacidades(sesion.perfilActivo.id_perfil);
}

export function sesionTieneCapacidad(
  sesion: SesionUsuario | null | undefined,
  capacidad: Capacidad
): boolean {
  return capacidadesDeSesion(sesion).has(capacidad);
}

export function sesionTieneAlgunaCapacidad(
  sesion: SesionUsuario | null | undefined,
  capacidades: readonly Capacidad[]
): boolean {
  const conjunto = capacidadesDeSesion(sesion);
  return capacidades.some((capacidad) => conjunto.has(capacidad));
}
