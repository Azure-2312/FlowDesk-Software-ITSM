import { query, queryRow } from "@/shared/lib/db";

/**
 * Reportes gerenciales (HU-27) y base para la exportacion CSV.
 *
 * Todas las cifras son agregadas de la tabla `ticket`: el reporte no expone
 * contenido de tickets ni datos personales. El alcance del usuario se aplica
 * siempre en el servidor (mismo criterio que `indicadoresService`):
 * - Supervisor (4): solo los departamentos de TI que supervisa.
 * - Gestor de Area (5): solo su departamento de empresa.
 * - Demas perfiles con `reportes:ver`: alcance global.
 */

/** Error de validacion de filtros: el controlador debe responder HTTP 400. */
export class ErrorValidacionReporte extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "ErrorValidacionReporte";
  }
}

export interface ContextoReporteGerencial {
  idPerfil?: number;
  idUsuario: number;
}

export interface FiltrosReporteGerencial {
  desde?: string; // AAAA-MM-DD
  hasta?: string; // AAAA-MM-DD
  idDepartamento?: number;
  idPrioridad?: number;
}

export interface KpisReporteGerencial {
  total: number;
  incidentes: number;
  solicitudes: number;
  activos: number;
  abiertos: number;
  asignados: number;
  en_proceso: number;
  en_espera: number;
  resueltos_total: number;
  a_tiempo: number;
  sla_vencidos: number;
  mttr_horas: number | null;
  mtta_horas: number | null;
  csat_promedio: number | null;
  csat_respondidas: number;
}

export interface FilaDepartamentoReporte {
  id_departamento: number | null;
  departamento: string;
  total: number;
  activos: number;
  resueltos: number;
  a_tiempo: number;
  mttr_horas: number | null;
  mtta_horas: number | null;
}

export interface FilaPrioridadReporte {
  id_prioridad: number;
  codigo: string;
  prioridad: string;
  color: string | null;
  total: number;
  activos: number;
  resueltos: number;
  a_tiempo: number;
  mttr_horas: number | null;
}

export interface FilaEstadoReporte {
  id_estado: number;
  estado: string;
  orden: number;
  color: string | null;
  total: number;
}

export interface FilaMesReporte {
  mes: string;
  total: number;
  resueltos: number;
  a_tiempo: number;
  mttr_horas: number | null;
}

export interface CatalogoDepartamentoReporte {
  id: number;
  nombre: string;
}

export interface CatalogoPrioridadReporte {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ReporteGerencial {
  kpis: KpisReporteGerencial;
  porDepartamento: FilaDepartamentoReporte[];
  porPrioridad: FilaPrioridadReporte[];
  porEstado: FilaEstadoReporte[];
  porMes: FilaMesReporte[];
  catalogos: {
    departamentos: CatalogoDepartamentoReporte[];
    prioridades: CatalogoPrioridadReporte[];
  };
}

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Tiempo medio en horas (promedio sobre los tickets que tienen la marca de tiempo). */
const EXPRESION_MTTR = `ROUND(AVG(EXTRACT(EPOCH FROM (t.fecha_resolucion - t.fecha_creacion)) / 3600), 2)::float8`;
const EXPRESION_MTTA = `ROUND(AVG(EXTRACT(EPOCH FROM (t.fecha_primera_respuesta - t.fecha_creacion)) / 3600), 2)::float8`;

function validarFechaParametro(valor: string, nombre: string): string {
  const limpio = valor.trim();
  if (!FORMATO_FECHA.test(limpio) || Number.isNaN(Date.parse(limpio))) {
    throw new ErrorValidacionReporte(`El filtro '${nombre}' debe tener formato AAAA-MM-DD.`);
  }
  return limpio;
}

function validarIdParametro(valor: string, nombre: string): number {
  const numero = Number(valor.trim());
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorValidacionReporte(`El filtro '${nombre}' no es valido.`);
  }
  return numero;
}

/**
 * Valida y normaliza los parametros de consulta del reporte.
 * Lanza `ErrorValidacionReporte` cuando el rango de fechas o los identificadores son invalidos.
 */
export function parsearFiltrosReporteGerencial(
  searchParams: URLSearchParams | { get(nombre: string): string | null }
): FiltrosReporteGerencial {
  const filtros: FiltrosReporteGerencial = {};

  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const idDepartamento = searchParams.get("id_departamento");
  const idPrioridad = searchParams.get("id_prioridad");

  if (desde && desde.trim()) filtros.desde = validarFechaParametro(desde, "desde");
  if (hasta && hasta.trim()) filtros.hasta = validarFechaParametro(hasta, "hasta");

  if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
    throw new ErrorValidacionReporte("La fecha 'desde' no puede ser posterior a la fecha 'hasta'.");
  }

  if (idDepartamento && idDepartamento.trim()) {
    filtros.idDepartamento = validarIdParametro(idDepartamento, "departamento");
  }
  if (idPrioridad && idPrioridad.trim()) {
    filtros.idPrioridad = validarIdParametro(idPrioridad, "prioridad");
  }

  return filtros;
}

interface AlcanceSql {
  condiciones: string[];
  parametros: unknown[];
}

function construirAlcance(
  contexto: ContextoReporteGerencial,
  filtros: FiltrosReporteGerencial
): AlcanceSql {
  const condiciones = ["t.estado_registro = true"];
  const parametros: unknown[] = [];
  const agregar = (valor: unknown): string => {
    parametros.push(valor);
    return `$${parametros.length}`;
  };

  // Alcance por perfil (misma logica que indicadoresService).
  if (contexto.idPerfil === 4) {
    const ref = agregar(contexto.idUsuario);
    condiciones.push(`t.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = ${ref} AND d.estado_registro = true
    )`);
  } else if (contexto.idPerfil === 5) {
    const ref = agregar(contexto.idUsuario);
    condiciones.push(`t.id_departamento_empresa = (
      SELECT u.id_departamento_empresa FROM usuario u WHERE u.id_usuario = ${ref}
    )`);
  }

  if (filtros.desde) {
    condiciones.push(`t.fecha_creacion >= (${agregar(filtros.desde)})::date`);
  }
  if (filtros.hasta) {
    condiciones.push(`t.fecha_creacion < ((${agregar(filtros.hasta)})::date + INTERVAL '1 day')`);
  }
  if (filtros.idDepartamento) {
    condiciones.push(`t.id_departamento = ${agregar(filtros.idDepartamento)}`);
  }
  if (filtros.idPrioridad) {
    condiciones.push(`t.id_prioridad = ${agregar(filtros.idPrioridad)}`);
  }

  return { condiciones, parametros };
}

const SQL_KPIS = `
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE tt.codigo = 'INCIDENTE')::int AS incidentes,
    COUNT(*) FILTER (WHERE tt.codigo = 'SOLICITUD')::int AS solicitudes,
    COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4))::int AS activos,
    COUNT(*) FILTER (WHERE t.id_estado = 1)::int AS abiertos,
    COUNT(*) FILTER (WHERE t.id_estado = 2)::int AS asignados,
    COUNT(*) FILTER (WHERE t.id_estado = 3)::int AS en_proceso,
    COUNT(*) FILTER (WHERE t.id_estado = 4)::int AS en_espera,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6))::int AS resueltos_total,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS a_tiempo,
    COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.fecha_limite_sla < now())::int AS sla_vencidos,
    ${EXPRESION_MTTR} AS mttr_horas,
    ${EXPRESION_MTTA} AS mtta_horas,
    ROUND(AVG(t.calificacion_csat), 2)::float8 AS csat_promedio,
    COUNT(*) FILTER (WHERE t.calificacion_csat IS NOT NULL)::int AS csat_respondidas
  FROM ticket t
  LEFT JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
  WHERE {where}
`;

const SQL_POR_DEPARTAMENTO = `
  SELECT
    d.id_departamento,
    COALESCE(d.nombre, 'Sin departamento TI') AS departamento,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4))::int AS activos,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6))::int AS resueltos,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS a_tiempo,
    ${EXPRESION_MTTR} AS mttr_horas,
    ${EXPRESION_MTTA} AS mtta_horas
  FROM ticket t
  LEFT JOIN departamento_ti d ON d.id_departamento = t.id_departamento
  WHERE {where}
  GROUP BY d.id_departamento, d.nombre
  ORDER BY total DESC, departamento ASC
`;

const SQL_POR_PRIORIDAD = `
  SELECT
    prio.id_prioridad,
    prio.codigo,
    prio.nombre AS prioridad,
    prio.color,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4))::int AS activos,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6))::int AS resueltos,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS a_tiempo,
    ${EXPRESION_MTTR} AS mttr_horas
  FROM ticket t
  LEFT JOIN prioridad_ticket prio ON prio.id_prioridad = t.id_prioridad
  WHERE {where}
  GROUP BY prio.id_prioridad, prio.codigo, prio.nombre, prio.color, prio.nivel
  ORDER BY prio.nivel ASC
`;

const SQL_POR_ESTADO = `
  SELECT
    e.id_estado,
    e.nombre AS estado,
    e.orden,
    e.color,
    COUNT(*)::int AS total
  FROM ticket t
  LEFT JOIN estado_ticket e ON e.id_estado = t.id_estado
  WHERE {where}
  GROUP BY e.id_estado, e.nombre, e.orden, e.color
  ORDER BY e.orden ASC
`;

const SQL_POR_MES = `
  SELECT
    TO_CHAR(t.fecha_creacion, 'YYYY-MM') AS mes,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6))::int AS resueltos,
    COUNT(*) FILTER (WHERE t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS a_tiempo,
    ${EXPRESION_MTTR} AS mttr_horas
  FROM ticket t
  WHERE {where}
  GROUP BY 1
  ORDER BY 1 ASC
`;

const SQL_CATALOGO_DEPARTAMENTOS = `
  SELECT id_departamento AS id, nombre
  FROM departamento_ti
  WHERE estado_registro = true
  ORDER BY nombre ASC
`;

const SQL_CATALOGO_PRIORIDADES = `
  SELECT id_prioridad AS id, codigo, nombre
  FROM prioridad_ticket
  WHERE estado_registro = true
  ORDER BY nivel ASC
`;

/**
 * Sustituye el marcador `{where}` por la clausula construida. Se usa una
 * funcion reemplazadora porque el texto contiene parametros `$1`, `$2`, ... y
 * `String.replace` interpretaria `$n` como grupos de captura si no.
 */
function conWhere(sql: string, where: string): string {
  return sql.replace("{where}", () => where);
}

/**
 * Construye el reporte gerencial completo: indicadores globales, desglose por
 * departamento, prioridad, estado y mes, mas los catalogos de filtros.
 */
export async function obtenerReporteGerencial(
  contexto: ContextoReporteGerencial,
  filtros: FiltrosReporteGerencial = {}
): Promise<ReporteGerencial> {
  const alcance = construirAlcance(contexto, filtros);
  const where = alcance.condiciones.join(" AND ");
  const parametros = alcance.parametros;

  const [kpis, porDepartamento, porPrioridad, porEstado, porMes, departamentos, prioridades] =
    await Promise.all([
      queryRow<Record<string, unknown>>(conWhere(SQL_KPIS, where), parametros),
      query<Record<string, unknown>>(conWhere(SQL_POR_DEPARTAMENTO, where), parametros),
      query<Record<string, unknown>>(conWhere(SQL_POR_PRIORIDAD, where), parametros),
      query<Record<string, unknown>>(conWhere(SQL_POR_ESTADO, where), parametros),
      query<Record<string, unknown>>(conWhere(SQL_POR_MES, where), parametros),
      query<{ id: number; nombre: string }>(SQL_CATALOGO_DEPARTAMENTOS),
      query<{ id: number; codigo: string; nombre: string }>(SQL_CATALOGO_PRIORIDADES),
    ]);

  return {
    kpis: (kpis || {}) as unknown as KpisReporteGerencial,
    porDepartamento: porDepartamento as unknown as FilaDepartamentoReporte[],
    porPrioridad: porPrioridad as unknown as FilaPrioridadReporte[],
    porEstado: porEstado as unknown as FilaEstadoReporte[],
    porMes: porMes as unknown as FilaMesReporte[],
    catalogos: {
      departamentos,
      prioridades,
    },
  };
}
