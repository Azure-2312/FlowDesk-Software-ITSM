import type {
  FiltrosReporteGerencial,
  ReporteGerencial,
} from "./reportesGerencialesService";

/**
 * Generacion del archivo CSV de reportes gerenciales (HU-27).
 *
 * - Codificacion UTF-8 con BOM para compatibilidad directa con Microsoft Excel.
 * - Separador punto y coma (;) y finales de linea CRLF.
 * - Solo agrega datos; no permite modificar ni eliminar registros (RN-30).
 */

const SEPARADOR = ";";

function escapar(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[";\r\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function linea(valores: unknown[]): string {
  return valores.map(escapar).join(SEPARADOR);
}

function formatoPorcentaje(parcial: number, total: number): string {
  return total > 0 ? `${Math.round((parcial / total) * 100)}%` : "N/D";
}

function formatoHoras(valor: number | null): string {
  return valor === null || valor === undefined ? "N/D" : `${valor} h`;
}

function formatoNumero(valor: number | null): string {
  return valor === null || valor === undefined ? "N/D" : String(valor);
}

function descriptivoFiltros(
  reporte: ReporteGerencial,
  filtros: FiltrosReporteGerencial
): string[] {
  const partes: string[] = [];
  partes.push(`Desde: ${filtros.desde || "inicio de registros"}`);
  partes.push(`Hasta: ${filtros.hasta || "fecha actual"}`);

  const departamento = filtros.idDepartamento
    ? reporte.catalogos.departamentos.find((d) => d.id === filtros.idDepartamento)?.nombre ||
      String(filtros.idDepartamento)
    : "Todos";
  partes.push(`Departamento de TI: ${departamento}`);

  const prioridad = filtros.idPrioridad
    ? reporte.catalogos.prioridades.find((p) => p.id === filtros.idPrioridad)?.nombre ||
      String(filtros.idPrioridad)
    : "Todas";
  partes.push(`Prioridad: ${prioridad}`);

  return partes;
}

export function generarCsvReporteGerencial(
  reporte: ReporteGerencial,
  filtros: FiltrosReporteGerencial,
  generadoEn: Date = new Date()
): string {
  const { kpis } = reporte;
  const lineas: string[] = [];

  lineas.push(linea(["REPORTE GERENCIAL DE GESTION ITSM", "FlowDesk Software ITSM - ITIL 4"]));
  lineas.push(linea(["Generado", generadoEn.toISOString()]));
  lineas.push(linea(["Filtros", descriptivoFiltros(reporte, filtros).join(" | ")]));
  lineas.push("");

  lineas.push(linea(["INDICADORES GENERALES"]));
  lineas.push(linea(["Metrica", "Valor", "Detalle"]));
  lineas.push(linea(["Total de tickets", kpis.total, "Tickets en el alcance y rango seleccionados"]));
  lineas.push(linea(["Incidentes", kpis.incidentes, "Fallas no planificadas"]));
  lineas.push(linea(["Solicitudes", kpis.solicitudes, "Requerimientos de servicio"]));
  lineas.push(linea(["Carga activa", kpis.activos, "Tickets abiertos, asignados, en proceso o en espera"]));
  lineas.push(
    linea(["Cumplimiento SLA", formatoPorcentaje(kpis.a_tiempo, kpis.resueltos_total),
      `${kpis.a_tiempo} de ${kpis.resueltos_total} tickets resueltos a tiempo`])
  );
  lineas.push(
    linea(["SLA vencido en cola", kpis.sla_vencidos, "Tickets activos con fecha limite de SLA superada"])
  );
  lineas.push(linea(["MTTR (tiempo medio de resolucion)", formatoHoras(kpis.mttr_horas), "Promedio sobre tickets con fecha de resolucion"]));
  lineas.push(linea(["MTTA (tiempo medio de primera respuesta)", formatoHoras(kpis.mtta_horas), "Promedio sobre tickets con primera respuesta"]));
  lineas.push(
    linea(["CSAT promedio", formatoNumero(kpis.csat_promedio), `${kpis.csat_respondidas} encuestas respondidas`])
  );
  lineas.push("");

  lineas.push(linea(["DESGLOSE POR DEPARTAMENTO DE TI"]));
  lineas.push(
    linea([
      "Departamento",
      "Total",
      "Activos",
      "Resueltos",
      "Cumplimiento SLA",
      "MTTR (h)",
      "MTTA (h)",
    ])
  );
  if (reporte.porDepartamento.length === 0) {
    lineas.push(linea(["Sin registros con los filtros seleccionados"]));
  }
  for (const fila of reporte.porDepartamento) {
    lineas.push(
      linea([
        fila.departamento,
        fila.total,
        fila.activos,
        fila.resueltos,
        formatoPorcentaje(fila.a_tiempo, fila.resueltos),
        formatoHoras(fila.mttr_horas),
        formatoHoras(fila.mtta_horas),
      ])
    );
  }
  lineas.push("");

  lineas.push(linea(["DESGLOSE POR PRIORIDAD"]));
  lineas.push(
    linea(["Prioridad", "Total", "Activos", "Resueltos", "Cumplimiento SLA", "MTTR (h)"])
  );
  if (reporte.porPrioridad.length === 0) {
    lineas.push(linea(["Sin registros con los filtros seleccionados"]));
  }
  for (const fila of reporte.porPrioridad) {
    lineas.push(
      linea([
        `${fila.codigo} - ${fila.prioridad}`,
        fila.total,
        fila.activos,
        fila.resueltos,
        formatoPorcentaje(fila.a_tiempo, fila.resueltos),
        formatoHoras(fila.mttr_horas),
      ])
    );
  }
  lineas.push("");

  lineas.push(linea(["DESGLOSE POR ESTADO"]));
  lineas.push(linea(["Estado", "Total", "Participacion"]));
  if (reporte.porEstado.length === 0) {
    lineas.push(linea(["Sin registros con los filtros seleccionados"]));
  }
  for (const fila of reporte.porEstado) {
    lineas.push(linea([fila.estado, fila.total, formatoPorcentaje(fila.total, kpis.total)]));
  }
  lineas.push("");

  lineas.push(linea(["EVOLUCION MENSUAL POR FECHA DE CREACION"]));
  lineas.push(linea(["Mes", "Creados", "Resueltos", "Cumplimiento SLA", "MTTR (h)"]));
  if (reporte.porMes.length === 0) {
    lineas.push(linea(["Sin registros con los filtros seleccionados"]));
  }
  for (const fila of reporte.porMes) {
    lineas.push(
      linea([
        fila.mes,
        fila.total,
        fila.resueltos,
        formatoPorcentaje(fila.a_tiempo, fila.resueltos),
        formatoHoras(fila.mttr_horas),
      ])
    );
  }

  return "\uFEFF" + lineas.join("\r\n");
}

export function nombreArchivoReporteGerencial(generadoEn: Date = new Date()): string {
  const marca = generadoEn.toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `reporte_gerencial_${marca}.csv`;
}
