// ============================================================================
// INFRAESTRUCTURA DE VISTAS (N1): REGISTRO ESTÁTICO Y GUARDS DE SERVIDOR
// ============================================================================
// Gestiona las pestañas con permiso propio de las pantallas fusionadas (ITIL 4).
// Permite fusionar opciones de menú en una sola pantalla sin escalar privilegios (R5).
// ============================================================================

import { redirect } from "next/navigation";
import { query } from "@/shared/lib/db";
import { exigirMenuPagina, obtenerSesionPagina } from "@/shared/lib/page-auth";

export interface DefinicionVista {
  codigo: string;
  etiqueta: string;
  idsLegados?: number[];
}

export interface PantallaConVistas {
  idOpcion: number;
  urlBase: string;
  nombre: string;
  vistaPorDefecto: string;
  vistas: DefinicionVista[];
}

// ----------------------------------------------------------------------------
// 1. REGISTRO ESTÁTICO DE VISTAS (ANEXO C: 32 PANTALLAS / 107 VISTAS)
// ----------------------------------------------------------------------------
export const REGISTRO_VISTAS: Record<string, PantallaConVistas> = {
  // 1. #21022 Inicio
  "/plataforma/inicio": {
    idOpcion: 21022,
    urlBase: "/plataforma/inicio",
    nombre: "Inicio",
    vistaPorDefecto: "solicitante",
    vistas: [
      { codigo: "solicitante", etiqueta: "Solicitante", idsLegados: [21022] },
      { codigo: "tecnico", etiqueta: "Técnico", idsLegados: [21017] },
      { codigo: "supervisor", etiqueta: "Supervisor", idsLegados: [21014] },
      { codigo: "aprobador", etiqueta: "Aprobador", idsLegados: [21015] },
      { codigo: "area", etiqueta: "Área", idsLegados: [21016] },
      { codigo: "gestion-activos", etiqueta: "Gestión de Activos", idsLegados: [21007] },
      { codigo: "gestion-cambios", etiqueta: "Gestión de Cambios", idsLegados: [21012] },
      { codigo: "gestion-problemas", etiqueta: "Gestión de Problemas", idsLegados: [21013] },
      { codigo: "auditor", etiqueta: "Auditor", idsLegados: [21011] },
      { codigo: "administrador", etiqueta: "Administrador", idsLegados: [21021] },
    ],
  },

  // 3. #21233 Bandeja de incidentes
  "/plataforma/incidentes/bandeja": {
    idOpcion: 21233,
    urlBase: "/plataforma/incidentes/bandeja",
    nombre: "Bandeja de incidentes",
    vistaPorDefecto: "bandeja",
    vistas: [
      { codigo: "bandeja", etiqueta: "Sin asignar", idsLegados: [21233] },
      { codigo: "asignados", etiqueta: "Asignados a mí", idsLegados: [21232] },
      { codigo: "departamento", etiqueta: "De mi departamento", idsLegados: [21235] },
      { codigo: "resueltos", etiqueta: "Resueltos", idsLegados: [21234] },
      { codigo: "todos", etiqueta: "Todos", idsLegados: [21230, 21258] },
    ],
  },

  // 4. #21244 Bandeja de solicitudes
  "/plataforma/solicitudes/bandeja": {
    idOpcion: 21244,
    urlBase: "/plataforma/solicitudes/bandeja",
    nombre: "Bandeja de solicitudes",
    vistaPorDefecto: "bandeja",
    vistas: [
      { codigo: "bandeja", etiqueta: "Sin asignar", idsLegados: [21244] },
      { codigo: "asignados", etiqueta: "Asignadas a mí", idsLegados: [21243] },
      { codigo: "departamento", etiqueta: "De mi departamento", idsLegados: [21246] },
      { codigo: "resueltos", etiqueta: "Resueltas", idsLegados: [21245] },
      { codigo: "todos", etiqueta: "Todas", idsLegados: [21241, 21258] },
    ],
  },

  // #21273 Centro de aprobaciones (Solicitudes de servicio)
  "/plataforma/solicitudes/aprobaciones": {
    idOpcion: 21273,
    urlBase: "/plataforma/solicitudes/aprobaciones",
    nombre: "Centro de aprobaciones",
    vistaPorDefecto: "pendientes",
    vistas: [
      { codigo: "pendientes", etiqueta: "Pendientes", idsLegados: [21273] },
      { codigo: "historial", etiqueta: "Historial", idsLegados: [21273] },
    ],
  },

  // 5. #21238 Incidentes mayores
  "/plataforma/incidentes/mayores": {
    idOpcion: 21238,
    urlBase: "/plataforma/incidentes/mayores",
    nombre: "Incidentes mayores",
    vistaPorDefecto: "listado",
    vistas: [
      { codigo: "listado", etiqueta: "Bandeja de incidentes", idsLegados: [21238] },
      { codigo: "declarar", etiqueta: "Declarar incidente", idsLegados: [21238] },
      { codigo: "sala-crisis", etiqueta: "Sala de crisis", idsLegados: [21239] },
    ],
  },

  // 6. #21240 Configuración de incidentes
  "/plataforma/incidentes/configuracion": {
    idOpcion: 21240,
    urlBase: "/plataforma/incidentes/configuracion",
    nombre: "Configuración de incidentes",
    vistaPorDefecto: "campos",
    vistas: [
      { codigo: "campos", etiqueta: "Campos del formulario", idsLegados: [21240] },
      { codigo: "reglas", etiqueta: "Reglas operativas y parámetros", idsLegados: [21187] },
    ],
  },

  // 7. #21250 Configuración de solicitudes
  "/plataforma/solicitudes/configuracion": {
    idOpcion: 21250,
    urlBase: "/plataforma/solicitudes/configuracion",
    nombre: "Configuración de solicitudes",
    vistaPorDefecto: "campos",
    vistas: [
      { codigo: "campos", etiqueta: "Campos del formulario", idsLegados: [21250] },
      { codigo: "reglas", etiqueta: "Reglas operativas y parámetros", idsLegados: [21186] },
    ],
  },

  // 8. #21045 Monitor de SLA
  "/plataforma/servicios/sla": {
    idOpcion: 21045,
    urlBase: "/plataforma/servicios/sla",
    nombre: "Monitor de SLA",
    vistaPorDefecto: "mi-cola",
    vistas: [
      { codigo: "mi-cola", etiqueta: "Mi cola", idsLegados: [21048] },
      { codigo: "objetivos", etiqueta: "Objetivos de SLA", idsLegados: [21047] },
      { codigo: "riesgo", etiqueta: "En riesgo", idsLegados: [21045] },
      { codigo: "incumplimientos", etiqueta: "Incumplimientos", idsLegados: [21046] },
      { codigo: "grupo", etiqueta: "Grupo", idsLegados: [21049] },
      { codigo: "problemas", etiqueta: "Problemas", idsLegados: [21101] },
    ],
  },

  // 9. #21068 Mis cambios
  "/plataforma/cambios/mis-cambios": {
    idOpcion: 21068,
    urlBase: "/plataforma/cambios/mis-cambios",
    nombre: "Mis cambios",
    vistaPorDefecto: "en-tramite",
    vistas: [
      { codigo: "en-tramite", etiqueta: "En trámite", idsLegados: [21068] },
      { codigo: "por-implementar", etiqueta: "Por implementar", idsLegados: [21064] },
      { codigo: "afectan-area", etiqueta: "Afectan mi área", idsLegados: [21063] },
      { codigo: "afectan-equipo", etiqueta: "Afectan mi equipo", idsLegados: [21065] },
      { codigo: "afectan-servicios", etiqueta: "Afectan mis servicios", idsLegados: [21066] },
      { codigo: "historial", etiqueta: "Historial", idsLegados: [21067] },
    ],
  },

  // 10. #21071 Calendario de cambios
  "/plataforma/cambios/gestion/calendario": {
    idOpcion: 21071,
    urlBase: "/plataforma/cambios/gestion/calendario",
    nombre: "Calendario de cambios",
    vistaPorDefecto: "calendario",
    vistas: [
      { codigo: "calendario", etiqueta: "Calendario", idsLegados: [21071, 21062] },
      { codigo: "programacion", etiqueta: "Programación", idsLegados: [21069, 21076] },
    ],
  },

  // 11. #21073 Gestión de cambios
  "/plataforma/cambios/gestion": {
    idOpcion: 21073,
    urlBase: "/plataforma/cambios/gestion",
    nombre: "Gestión de cambios",
    vistaPorDefecto: "por-evaluar",
    vistas: [
      { codigo: "por-evaluar", etiqueta: "Por evaluar", idsLegados: [21073] },
      { codigo: "aprobacion", etiqueta: "En aprobación", idsLegados: [21079] },
      { codigo: "ejecucion", etiqueta: "En ejecución", idsLegados: [21078] },
      { codigo: "historial", etiqueta: "Historial", idsLegados: [21080] },
    ],
  },

  // 12. #21082 CAB y ECAB
  "/plataforma/cambios/cab": {
    idOpcion: 21082,
    urlBase: "/plataforma/cambios/cab",
    nombre: "CAB y ECAB",
    vistaPorDefecto: "agenda",
    vistas: [
      { codigo: "agenda", etiqueta: "Agenda y actas", idsLegados: [21082, 21084] },
      { codigo: "emergencia", etiqueta: "Comité de emergencia (ECAB)", idsLegados: [21083] },
      { codigo: "dictamen", etiqueta: "Dictamen colegiado", idsLegados: [21085] },
      { codigo: "miembros", etiqueta: "Miembros y quórum", idsLegados: [21193] },
    ],
  },

  // #21274 Centro de aprobaciones (Cambios: evaluación técnica y V°B° de área)
  "/plataforma/cambios/aprobaciones": {
    idOpcion: 21274,
    urlBase: "/plataforma/cambios/aprobaciones",
    nombre: "Centro de aprobaciones",
    vistaPorDefecto: "pendientes",
    vistas: [
      { codigo: "pendientes", etiqueta: "Pendientes", idsLegados: [21274] },
      { codigo: "historial", etiqueta: "Historial", idsLegados: [21274] },
    ],
  },

  // 13. #21191 Configuración de cambios
  "/plataforma/cambios/configuracion": {
    idOpcion: 21191,
    urlBase: "/plataforma/cambios/configuracion",
    nombre: "Configuración de cambios",
    vistaPorDefecto: "campos",
    vistas: [
      { codigo: "campos", etiqueta: "Campos del formulario", idsLegados: [21191] },
      { codigo: "listas", etiqueta: "Listas y catálogos", idsLegados: [21191] },
      { codigo: "riesgo", etiqueta: "Cuestionario de riesgo", idsLegados: [21191] },
      { codigo: "autoridad", etiqueta: "Matriz de autoridad", idsLegados: [21196] },
      { codigo: "calendario", etiqueta: "Ventanas y congelamientos", idsLegados: [21192, 21195, 21197] },
    ],
  },



  // 16. #21095 Candidatos a problema
  "/plataforma/problemas/candidatos": {
    idOpcion: 21095,
    urlBase: "/plataforma/problemas/candidatos",
    nombre: "Candidatos a problema",
    vistaPorDefecto: "propuestos",
    vistas: [
      { codigo: "propuestos", etiqueta: "Candidatos a problema", idsLegados: [21095, 21096] },
    ],
  },

  // 17. #21199 Configuración de problemas
  "/plataforma/problemas/configuracion": {
    idOpcion: 21199,
    urlBase: "/plataforma/problemas/configuracion",
    nombre: "Configuración de problemas",
    vistaPorDefecto: "campos",
    vistas: [
      { codigo: "campos", etiqueta: "Campos del formulario", idsLegados: [21199] },
      { codigo: "listas", etiqueta: "Listas auxiliares", idsLegados: [21199] },
      { codigo: "umbral", etiqueta: "Umbral de recurrencia", idsLegados: [21199] },
    ],
  },

  // 18. #21114 Inventario de activos
  "/plataforma/activos/inventario": {
    idOpcion: 21114,
    urlBase: "/plataforma/activos/inventario",
    nombre: "Inventario de activos",
    vistaPorDefecto: "todos",
    vistas: [
      { codigo: "operativo", etiqueta: "Inventario operativo", idsLegados: [21117] },
      { codigo: "asignaciones", etiqueta: "Asignaciones y custodia", idsLegados: [21118] },
      { codigo: "todos", etiqueta: "Todos", idsLegados: [21114] },
      { codigo: "mi-area", etiqueta: "Activos de mi área", idsLegados: [21111] },
      { codigo: "importar", etiqueta: "Importación masiva", idsLegados: [21113] },
    ],
  },

  // 19. #21126 Mantenimiento y garantías
  "/plataforma/activos/mantenimiento": {
    idOpcion: 21126,
    urlBase: "/plataforma/activos/mantenimiento",
    nombre: "Mantenimiento y garantías",
    vistaPorDefecto: "garantias",
    vistas: [
      { codigo: "garantias", etiqueta: "Garantías", idsLegados: [21126] },
      { codigo: "reparaciones", etiqueta: "Reparaciones", idsLegados: [21127] },
    ],
  },

  // 20. #21132 Licencias de software
  "/plataforma/activos/licencias": {
    idOpcion: 21132,
    urlBase: "/plataforma/activos/licencias",
    nombre: "Licencias de software",
    vistaPorDefecto: "licencias",
    vistas: [
      { codigo: "licencias", etiqueta: "Licencias", idsLegados: [21132] },
      { codigo: "consulta", etiqueta: "Consulta", idsLegados: [21130] },
      { codigo: "catalogo-software", etiqueta: "Catálogo de software", idsLegados: [21129] },
    ],
  },

  // 21. #21144 Contratos y proveedores
  "/plataforma/activos/contratos": {
    idOpcion: 21144,
    urlBase: "/plataforma/activos/contratos",
    nombre: "Contratos y proveedores",
    vistaPorDefecto: "contratos",
    vistas: [
      { codigo: "contratos", etiqueta: "Contratos", idsLegados: [21144] },
      { codigo: "mi-area", etiqueta: "De mi departamento", idsLegados: [21145] },
      { codigo: "renovaciones", etiqueta: "Renovaciones", idsLegados: [21147] },
      { codigo: "proveedores", etiqueta: "Proveedores", idsLegados: [21146] },
    ],
  },

  // #21276 Comprobantes electrónicos de proveedores (SUNAT vía Nubefact).
  // Misma base de información; cada perfil ve su pestaña:
  // Gestor de Activos registra/emite, Gestor de Área da conformidad, Auditor consulta.
  "/plataforma/activos/comprobantes": {
    idOpcion: 21276,
    urlBase: "/plataforma/activos/comprobantes",
    nombre: "Comprobantes electrónicos",
    vistaPorDefecto: "registro",
    vistas: [
      { codigo: "registro", etiqueta: "Registro y emisión", idsLegados: [21276] },
      { codigo: "conformidad", etiqueta: "Conformidad de mi área", idsLegados: [21276] },
      { codigo: "consulta", etiqueta: "Consulta y trazabilidad", idsLegados: [21276] },
    ],
  },

  // 22. #21123 Bajas de activos
  "/plataforma/activos/bajas": {
    idOpcion: 21123,
    urlBase: "/plataforma/activos/bajas",
    nombre: "Bajas de activos",
    vistaPorDefecto: "gestion",
    vistas: [
      { codigo: "gestion", etiqueta: "Gestión", idsLegados: [21123] },
      { codigo: "consulta", etiqueta: "Consulta", idsLegados: [21122] },
    ],
  },

  // #21275 Centro de aprobaciones (Activos: bajas de activos)
  "/plataforma/activos/aprobaciones": {
    idOpcion: 21275,
    urlBase: "/plataforma/activos/aprobaciones",
    nombre: "Centro de aprobaciones",
    vistaPorDefecto: "pendientes",
    vistas: [
      { codigo: "pendientes", etiqueta: "Pendientes", idsLegados: [21275] },
      { codigo: "historial", etiqueta: "Historial", idsLegados: [21275] },
    ],
  },

  // 23. #21154 Configuración de activos
  "/plataforma/activos/configuracion": {
    idOpcion: 21154,
    urlBase: "/plataforma/activos/configuracion",
    nombre: "Configuración de activos",
    vistaPorDefecto: "tipos-atributos",
    vistas: [
      { codigo: "tipos-atributos", etiqueta: "Tipos y atributos", idsLegados: [21154] },
      { codigo: "fabricantes-modelos", etiqueta: "Fabricantes y modelos", idsLegados: [21150] },
      { codigo: "ubicaciones", etiqueta: "Ubicaciones", idsLegados: [21155] },
      { codigo: "listas", etiqueta: "Listas auxiliares", idsLegados: [21152] },
      { codigo: "facturacion", etiqueta: "Facturación electrónica (SUNAT)", idsLegados: [21154] },
    ],
  },

  // 24. #21141 Configuración de CMDB
  "/plataforma/cmdb/configuracion": {
    idOpcion: 21141,
    urlBase: "/plataforma/cmdb/configuracion",
    nombre: "Configuración de CMDB",
    vistaPorDefecto: "clases",
    vistas: [
      { codigo: "clases", etiqueta: "Clases de CI", idsLegados: [21141] },
      { codigo: "relaciones", etiqueta: "Tipos de relación", idsLegados: [21153] },
    ],
  },

  // 25. #21161 Revisión y publicación
  "/plataforma/conocimiento/publicacion": {
    idOpcion: 21161,
    urlBase: "/plataforma/conocimiento/publicacion",
    nombre: "Revisión y publicación",
    vistaPorDefecto: "pendientes",
    vistas: [
      { codigo: "pendientes", etiqueta: "Revisiones pendientes", idsLegados: [21162] },
      { codigo: "publicacion", etiqueta: "Publicación", idsLegados: [21161] },
    ],
  },

  // 26. #21202 Configuración de conocimiento
  "/plataforma/conocimiento/configuracion": {
    idOpcion: 21202,
    urlBase: "/plataforma/conocimiento/configuracion",
    nombre: "Configuración de conocimiento",
    vistaPorDefecto: "articulos",
    vistas: [
      { codigo: "articulos", etiqueta: "Inventario maestro", idsLegados: [21202] },
      { codigo: "politicas", etiqueta: "Políticas y categorías", idsLegados: [21202] },
    ],
  },

  // 27. #21164 Catálogo de servicios
  "/plataforma/servicios/catalogo": {
    idOpcion: 21164,
    urlBase: "/plataforma/servicios/catalogo",
    nombre: "Catálogo de servicios",
    vistaPorDefecto: "explorar",
    vistas: [
      { codigo: "explorar", etiqueta: "Explorar catálogo", idsLegados: [21164, 21237, 21248] },
      { codigo: "administrar-incidentes", etiqueta: "Servicios de incidentes", idsLegados: [21168] },
      { codigo: "administrar-solicitudes", etiqueta: "Servicios de solicitudes", idsLegados: [21169] },
      { codigo: "crear", etiqueta: "Crear servicio", idsLegados: [21166] },
      { codigo: "categorias", etiqueta: "Categorías", idsLegados: [21165] },
    ],
  },

  // 28. #21167 Objetivos SLA y matriz de prioridad
  "/plataforma/servicios/configuracion/sla": {
    idOpcion: 21167,
    urlBase: "/plataforma/servicios/configuracion/sla",
    nombre: "Objetivos SLA y matriz de prioridad",
    vistaPorDefecto: "tiempos",
    vistas: [
      { codigo: "tiempos", etiqueta: "Objetivos de tiempo", idsLegados: [21167] },
      { codigo: "matriz", etiqueta: "Matriz de prioridad", idsLegados: [21167] },
    ],
  },

  // 29. #21175 Indicadores operativos y SLA
  "/plataforma/reportes/operativos": {
    idOpcion: 21175,
    urlBase: "/plataforma/reportes/operativos",
    nombre: "Indicadores operativos y SLA",
    vistaPorDefecto: "operativo",
    vistas: [
      { codigo: "operativo", etiqueta: "Operativos institucionales", idsLegados: [21175] },
      { codigo: "area", etiqueta: "Reportes del área", idsLegados: [21182] },
      { codigo: "supervision", etiqueta: "Informe de Supervisión TI", idsLegados: [21175] },
    ],
  },

  // 30. #21179 Reportes de cambios y problemas
  "/plataforma/reportes/cambios": {
    idOpcion: 21179,
    urlBase: "/plataforma/reportes/cambios",
    nombre: "Reportes de cambios y problemas",
    vistaPorDefecto: "cambios",
    vistas: [
      { codigo: "cambios", etiqueta: "Cambios", idsLegados: [21179] },
      { codigo: "problemas", etiqueta: "Problemas", idsLegados: [21181] },
    ],
  },

  // 31. #21205 Grupos y técnicos de TI
  "/plataforma/organizacion/grupos-ti": {
    idOpcion: 21205,
    urlBase: "/plataforma/organizacion/grupos-ti",
    nombre: "Grupos y técnicos de TI",
    vistaPorDefecto: "grupos",
    vistas: [
      { codigo: "grupos", etiqueta: "Grupos resolutores", idsLegados: [21205] },
      { codigo: "tecnicos", etiqueta: "Técnicos y niveles", idsLegados: [21207] },
      { codigo: "supervisores", etiqueta: "Supervisores", idsLegados: [21206] },
    ],
  },

  // 32. #21220 Auditoría y accesos
  "/plataforma/seguridad/auditoria-sistema": {
    idOpcion: 21220,
    urlBase: "/plataforma/seguridad/auditoria-sistema",
    nombre: "Auditoría y accesos",
    vistaPorDefecto: "configuracion",
    vistas: [
      { codigo: "configuracion", etiqueta: "Auditoría de configuración", idsLegados: [21220] },
      { codigo: "accesos", etiqueta: "Registros de accesos", idsLegados: [21221] },
    ],
  },

  // #21277 Integraciones API (solo Administrador)
  "/plataforma/seguridad/integraciones-api": {
    idOpcion: 21277,
    urlBase: "/plataforma/seguridad/integraciones-api",
    nombre: "Integraciones API",
    vistaPorDefecto: "credenciales",
    vistas: [
      { codigo: "credenciales", etiqueta: "Credenciales de acceso", idsLegados: [21277] },
      { codigo: "bitacora", etiqueta: "Bitácora de la API", idsLegados: [21277] },
      { codigo: "externos", etiqueta: "Clientes de empresa externa", idsLegados: [21277] },
    ],
  },
};

// ----------------------------------------------------------------------------
// 2. UTILIDADES DE CONSULTA DE VISTAS REGISTRADAS
// ----------------------------------------------------------------------------

export function obtenerRegistroVistas(urlBase: string): PantallaConVistas | undefined {
  const normalizada = urlBase.split("?")[0].replace(/\/$/, "");
  return REGISTRO_VISTAS[normalizada];
}

/**
 * Resuelve la vista inicial por defecto de una pantalla según el perfil activo (0.10.4).
 */
export function obtenerVistaPorDefecto(urlBase: string, idPerfil?: number): string {
  const pantalla = obtenerRegistroVistas(urlBase);
  if (!pantalla) return "";

  if (pantalla.urlBase === "/plataforma/inicio" && idPerfil) {
    switch (idPerfil) {
      case 1: return "administrador";
      case 2: return "tecnico";
      case 3: return "solicitante";
      case 4: return "supervisor";
      case 5: return "area";
      case 6: return "auditor";
      case 7: return "aprobador";
      case 8: return "gestion-cambios";
      case 9: return "gestion-activos";
      case 10: return "gestion-problemas";
      default: return "solicitante";
    }
  }

  if (pantalla.urlBase === "/plataforma/servicios/sla" && idPerfil === 2) {
    return "mi-cola";
  }

  if (pantalla.urlBase === "/plataforma/activos/inventario" && idPerfil === 2) {
    return "operativo";
  }

  if (pantalla.urlBase === "/plataforma/activos/comprobantes") {
    if (idPerfil === 5) return "conformidad";
    if (idPerfil === 6) return "consulta";
  }

  if (pantalla.urlBase === "/plataforma/reportes/operativos" && idPerfil === 4) {
    return "supervision";
  }

  return pantalla.vistaPorDefecto;
}

// ----------------------------------------------------------------------------
// 3. CONSULTA DE PERMISOS EN BASE DE DATOS (TABLA N1)
// ----------------------------------------------------------------------------

/**
 * Carga las vistas concedidas para un perfil en una pantalla.
 */
export async function cargarVistasPermitidas(urlBase: string, idPerfil: number): Promise<string[]> {
  const pantalla = obtenerRegistroVistas(urlBase);
  if (!pantalla) return [];

  // Perfil 1 (Administrador) tiene acceso a todas las vistas registradas
  if (idPerfil === 1) {
    return pantalla.vistas.map((v) => v.codigo);
  }

  const sql = `
    SELECT ompv.vista
    FROM opciones_menu_vistas_perfiles ompv
    INNER JOIN opciones_menu om ON om.id_opcion_menu = ompv.id_opcion_menu
    WHERE (om.url_menu = $1 OR om.id_opcion_menu = $2)
      AND ompv.id_perfil = $3
      AND ompv.estado_registro = true
  `;

  try {
    const rows = await query<{ vista: string }>(sql, [pantalla.urlBase, pantalla.idOpcion, idPerfil]);
    if (rows.length > 0) {
      const permitidasSet = new Set(rows.map((r) => r.vista));
      return pantalla.vistas.map((v) => v.codigo).filter((c) => permitidasSet.has(c));
    }
  } catch {
    // Si la tabla no ha sido creada o está vacía, fallback seguro
  }

  // Fallback seguro: devolver vista por defecto de la pantalla si el usuario tiene acceso a la pantalla
  return [obtenerVistaPorDefecto(pantalla.urlBase, idPerfil)];
}

/**
 * Valida en acciones de servidor y rutas API si un perfil puede operar una vista (R5).
 */
export async function puedeVerVista(urlBase: string, vista: string, idPerfil: number): Promise<boolean> {
  const permitidas = await cargarVistasPermitidas(urlBase, idPerfil);
  return permitidas.includes(vista);
}

// ----------------------------------------------------------------------------
// 4. HELPER DE SERVIDOR PRINCIPAL (RSC GUARD)
// ----------------------------------------------------------------------------

/**
 * Exige acceso a la pantalla y resuelve la vista autorizada para el usuario.
 * Cumple con R5 y R8:
 *  1. Ejecuta guard de pantalla existente (exigirMenuPagina).
 *  2. Carga vistas permitidas del usuario para esta pantalla.
 *  3. Si la vista solicitada es válida y permitida -> la devuelve.
 *  4. Si es inválida o no permitida -> devuelve la primera vista permitida.
 *  5. Si no tiene ninguna permitida -> redirect("/403").
 */
export async function exigirVistaPagina(
  urlBase: string,
  searchParamsVista?: string | Promise<string | undefined> | undefined
): Promise<{
  vistaActiva: string;
  vistasPermitidas: DefinicionVista[];
  idUsuario: number;
  idPerfil: number;
  sesion: any;
}> {
  // 1. Guard de pantalla
  const { idUsuario, idPerfil, sesion } = await exigirMenuPagina(urlBase);

  const pantalla = obtenerRegistroVistas(urlBase);
  if (!pantalla) {
    return {
      vistaActiva: "",
      vistasPermitidas: [],
      idUsuario,
      idPerfil,
      sesion,
    };
  }

  // Resolver searchParams si es Promise (Next.js 14+)
  const paramResuelto = await Promise.resolve(searchParamsVista);
  const vistaSolicitada = typeof paramResuelto === "string" ? paramResuelto : undefined;

  // 2. Cargar vistas permitidas
  const codigosPermitidos = await cargarVistasPermitidas(pantalla.urlBase, idPerfil);
  if (codigosPermitidos.length === 0) {
    redirect("/403");
  }

  const vistasPermitidas = pantalla.vistas.filter((v) => codigosPermitidos.includes(v.codigo));

  // 3 y 4. Determinar vista activa
  let vistaActiva: string;
  if (vistaSolicitada && codigosPermitidos.includes(vistaSolicitada)) {
    vistaActiva = vistaSolicitada;
  } else {
    // Si no solicitó vista o no está permitida, usar la por defecto para su perfil si está permitida, sino la primera permitida
    const defPerfil = obtenerVistaPorDefecto(pantalla.urlBase, idPerfil);
    vistaActiva = codigosPermitidos.includes(defPerfil) ? defPerfil : codigosPermitidos[0];
  }

  return {
    vistaActiva,
    vistasPermitidas,
    idUsuario,
    idPerfil,
    sesion,
  };
}
