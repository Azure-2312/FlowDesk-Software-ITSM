"use strict";
// ============================================================================
// INFRAESTRUCTURA DE VISTAS (N1): REGISTRO ESTÁTICO Y GUARDS DE SERVIDOR
// ============================================================================
// Gestiona las pestañas con permiso propio de las pantallas fusionadas (ITIL 4).
// Permite fusionar opciones de menú en una sola pantalla sin escalar privilegios (R5).
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRO_VISTAS = void 0;
exports.obtenerRegistroVistas = obtenerRegistroVistas;
exports.obtenerVistaPorDefecto = obtenerVistaPorDefecto;
exports.cargarVistasPermitidas = cargarVistasPermitidas;
exports.puedeVerVista = puedeVerVista;
exports.exigirVistaPagina = exigirVistaPagina;
var navigation_1 = require("next/navigation");
var db_1 = require("@/shared/lib/db");
var page_auth_1 = require("@/shared/lib/page-auth");
// ----------------------------------------------------------------------------
// 1. REGISTRO ESTÁTICO DE VISTAS (ANEXO C: 32 PANTALLAS / 107 VISTAS)
// ----------------------------------------------------------------------------
exports.REGISTRO_VISTAS = {
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
    // 2. #21249 Mis aprobaciones
    "/plataforma/aprobaciones": {
        idOpcion: 21249,
        urlBase: "/plataforma/aprobaciones",
        nombre: "Mis aprobaciones",
        vistaPorDefecto: "pendientes",
        vistas: [
            { codigo: "pendientes", etiqueta: "Pendientes", idsLegados: [21249, 21061, 21088, 21089, 21121] },
            { codigo: "historial", etiqueta: "Historial", idsLegados: [21006] },
            { codigo: "historial-area", etiqueta: "Historial de mi área", idsLegados: [21005] },
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
    // 5. #21238 Incidentes mayores
    "/plataforma/incidentes/mayores": {
        idOpcion: 21238,
        urlBase: "/plataforma/incidentes/mayores",
        nombre: "Incidentes mayores",
        vistaPorDefecto: "listado",
        vistas: [
            { codigo: "listado", etiqueta: "Listado", idsLegados: [21238] },
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
        vistaPorDefecto: "riesgo",
        vistas: [
            { codigo: "riesgo", etiqueta: "En riesgo", idsLegados: [21045] },
            { codigo: "incumplimientos", etiqueta: "Incumplimientos", idsLegados: [21046] },
            { codigo: "objetivos", etiqueta: "Objetivos vigentes", idsLegados: [21047] },
            { codigo: "mi-cola", etiqueta: "Mi cola", idsLegados: [21048] },
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
    // 14. #21090 Modelos de cambio estándar
    "/plataforma/cambios/modelos": {
        idOpcion: 21090,
        urlBase: "/plataforma/cambios/modelos",
        nombre: "Modelos de cambio estándar",
        vistaPorDefecto: "consulta",
        vistas: [
            { codigo: "consulta", etiqueta: "Consulta", idsLegados: [21090] },
            { codigo: "administracion", etiqueta: "Administración", idsLegados: [21075] },
        ],
    },
    // 15. #21093 Bandeja de problemas
    "/plataforma/problemas/bandeja": {
        idOpcion: 21093,
        urlBase: "/plataforma/problemas/bandeja",
        nombre: "Bandeja de problemas",
        vistaPorDefecto: "sin-asignar",
        vistas: [
            { codigo: "sin-asignar", etiqueta: "Sin asignar", idsLegados: [21093, 21094] },
            { codigo: "asignados", etiqueta: "Asignados a mí", idsLegados: [21102] },
            { codigo: "grupo", etiqueta: "De mi grupo", idsLegados: [21103] },
            { codigo: "historial", etiqueta: "Historial", idsLegados: [21106] },
        ],
    },
    // 16. #21095 Candidatos a problema
    "/plataforma/problemas/candidatos": {
        idOpcion: 21095,
        urlBase: "/plataforma/problemas/candidatos",
        nombre: "Candidatos a problema",
        vistaPorDefecto: "propuestos",
        vistas: [
            { codigo: "propuestos", etiqueta: "Propuestos", idsLegados: [21095, 21096] },
            { codigo: "recurrentes", etiqueta: "Incidentes recurrentes", idsLegados: [21100] },
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
        ],
    },
    // 18. #21114 Inventario de activos
    "/plataforma/activos/inventario": {
        idOpcion: 21114,
        urlBase: "/plataforma/activos/inventario",
        nombre: "Inventario de activos",
        vistaPorDefecto: "todos",
        vistas: [
            { codigo: "todos", etiqueta: "Todos", idsLegados: [21114] },
            { codigo: "mi-area", etiqueta: "Activos de mi área", idsLegados: [21111] },
            { codigo: "operativo", etiqueta: "Inventario operativo", idsLegados: [21117] },
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
        vistaPorDefecto: "publicacion",
        vistas: [
            { codigo: "publicacion", etiqueta: "Publicación", idsLegados: [21161] },
            { codigo: "pendientes", etiqueta: "Revisiones pendientes", idsLegados: [21162] },
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
};
// ----------------------------------------------------------------------------
// 2. UTILIDADES DE CONSULTA DE VISTAS REGISTRADAS
// ----------------------------------------------------------------------------
function obtenerRegistroVistas(urlBase) {
    var normalizada = urlBase.split("?")[0].replace(/\/$/, "");
    return exports.REGISTRO_VISTAS[normalizada];
}
/**
 * Resuelve la vista inicial por defecto de una pantalla según el perfil activo (0.10.4).
 */
function obtenerVistaPorDefecto(urlBase, idPerfil) {
    var pantalla = obtenerRegistroVistas(urlBase);
    if (!pantalla)
        return "";
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
    return pantalla.vistaPorDefecto;
}
// ----------------------------------------------------------------------------
// 3. CONSULTA DE PERMISOS EN BASE DE DATOS (TABLA N1)
// ----------------------------------------------------------------------------
/**
 * Carga las vistas concedidas para un perfil en una pantalla.
 */
function cargarVistasPermitidas(urlBase, idPerfil) {
    return __awaiter(this, void 0, void 0, function () {
        var pantalla, sql, rows, permitidasSet_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pantalla = obtenerRegistroVistas(urlBase);
                    if (!pantalla)
                        return [2 /*return*/, []];
                    // Perfil 1 (Administrador) tiene acceso a todas las vistas registradas
                    if (idPerfil === 1) {
                        return [2 /*return*/, pantalla.vistas.map(function (v) { return v.codigo; })];
                    }
                    sql = "\n    SELECT ompv.vista\n    FROM opciones_menu_vistas_perfiles ompv\n    INNER JOIN opciones_menu om ON om.id_opcion_menu = ompv.id_opcion_menu\n    WHERE (om.url_menu = $1 OR om.id_opcion_menu = $2)\n      AND ompv.id_perfil = $3\n      AND ompv.estado_registro = true\n  ";
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, db_1.query)(sql, [pantalla.urlBase, pantalla.idOpcion, idPerfil])];
                case 2:
                    rows = _b.sent();
                    if (rows.length > 0) {
                        permitidasSet_1 = new Set(rows.map(function (r) { return r.vista; }));
                        return [2 /*return*/, pantalla.vistas.map(function (v) { return v.codigo; }).filter(function (c) { return permitidasSet_1.has(c); })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: 
                // Fallback seguro: devolver vista por defecto de la pantalla si el usuario tiene acceso a la pantalla
                return [2 /*return*/, [obtenerVistaPorDefecto(pantalla.urlBase, idPerfil)]];
            }
        });
    });
}
/**
 * Valida en acciones de servidor y rutas API si un perfil puede operar una vista (R5).
 */
function puedeVerVista(urlBase, vista, idPerfil) {
    return __awaiter(this, void 0, void 0, function () {
        var permitidas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, cargarVistasPermitidas(urlBase, idPerfil)];
                case 1:
                    permitidas = _a.sent();
                    return [2 /*return*/, permitidas.includes(vista)];
            }
        });
    });
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
function exigirVistaPagina(urlBase, searchParamsVista) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, idUsuario, idPerfil, sesion, pantalla, vistaSolicitada, _b, codigosPermitidos, vistasPermitidas, vistaActiva, defPerfil;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, page_auth_1.exigirMenuPagina)(urlBase)];
                case 1:
                    _a = _c.sent(), idUsuario = _a.idUsuario, idPerfil = _a.idPerfil, sesion = _a.sesion;
                    pantalla = obtenerRegistroVistas(urlBase);
                    if (!pantalla) {
                        return [2 /*return*/, {
                                vistaActiva: "",
                                vistasPermitidas: [],
                                idUsuario: idUsuario,
                                idPerfil: idPerfil,
                                sesion: sesion,
                            }];
                    }
                    if (!(typeof searchParamsVista === "object" && searchParamsVista !== null && "then" in searchParamsVista)) return [3 /*break*/, 3];
                    return [4 /*yield*/, searchParamsVista];
                case 2:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _b = searchParamsVista;
                    _c.label = 4;
                case 4:
                    vistaSolicitada = _b;
                    return [4 /*yield*/, cargarVistasPermitidas(pantalla.urlBase, idPerfil)];
                case 5:
                    codigosPermitidos = _c.sent();
                    if (codigosPermitidos.length === 0) {
                        (0, navigation_1.redirect)("/403");
                    }
                    vistasPermitidas = pantalla.vistas.filter(function (v) { return codigosPermitidos.includes(v.codigo); });
                    if (vistaSolicitada && codigosPermitidos.includes(vistaSolicitada)) {
                        vistaActiva = vistaSolicitada;
                    }
                    else {
                        defPerfil = obtenerVistaPorDefecto(pantalla.urlBase, idPerfil);
                        vistaActiva = codigosPermitidos.includes(defPerfil) ? defPerfil : codigosPermitidos[0];
                    }
                    return [2 /*return*/, {
                            vistaActiva: vistaActiva,
                            vistasPermitidas: vistasPermitidas,
                            idUsuario: idUsuario,
                            idPerfil: idPerfil,
                            sesion: sesion,
                        }];
            }
        });
    });
}
