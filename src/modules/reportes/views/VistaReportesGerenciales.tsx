"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";
import type {
  CatalogoDepartamentoReporte,
  CatalogoPrioridadReporte,
  FiltrosReporteGerencial,
  ReporteGerencial,
} from "@/modules/reportes/services/reportesGerencialesService";

/**
 * Reportes gerenciales (HU-27) con filtros por rango de fechas, departamento
 * de TI y prioridad, mas exportacion CSV (HU-27).
 *
 * Directivas del proyecto: sin emojis, sin mensajes verdes de exito, campos con
 * error en rojo (#ef4444 / #fef2f2) mediante AlertaCampo y validacion doble
 * (cliente para experiencia de usuario, servidor para seguridad).
 */

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

interface FiltrosVista {
  desde: string;
  hasta: string;
  idDepartamento: string;
  idPrioridad: string;
}

function aIsoLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

function restarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha.getTime());
  copia.setDate(copia.getDate() - dias);
  return copia;
}

function porcentaje(parcial: number, total: number): string {
  return total > 0 ? `${Math.round((parcial / total) * 100)}%` : "N/D";
}

function formatoHoras(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "N/D" : `${valor} h`;
}

function formatMes(mes: string): string {
  const coincidencia = /^(\d{4})-(\d{2})$/.exec(mes);
  if (!coincidencia) return mes;
  const indice = Number(coincidencia[2]) - 1;
  return `${MESES_CORTOS[indice] || coincidencia[2]} ${coincidencia[1]}`;
}

function estiloInsignia(color?: string | null): CSSProperties {
  if (color && color.startsWith("#")) {
    return {
      backgroundColor: `${color}1F`,
      color: "#0f172a",
      border: `1px solid ${color}66`,
    };
  }
  return { backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" };
}

function TarjetaKpi(props: {
  titulo: string;
  valor: string;
  detalle: string;
  colorValor?: string;
}) {
  return (
    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
        {props.titulo}
      </span>
      <div style={{ fontSize: 22, fontWeight: 700, color: props.colorValor || "#111827", marginTop: 4 }}>
        {props.valor}
      </div>
      <span style={{ fontSize: 12, color: "#475569" }}>{props.detalle}</span>
    </div>
  );
}

function FilaVacia({ columnas }: { columnas: number }) {
  return (
    <tr>
      <td
        colSpan={columnas}
        style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}
      >
        Sin registros con los filtros seleccionados.
      </td>
    </tr>
  );
}

export default function VistaReportesGerenciales() {
  const [filtros, setFiltros] = useState<FiltrosVista>(() => {
    const hoy = new Date();
    return {
      desde: aIsoLocal(restarDias(hoy, 30)),
      hasta: aIsoLocal(hoy),
      idDepartamento: "",
      idPrioridad: "",
    };
  });

  const [reporte, setReporte] = useState<ReporteGerencial | null>(null);
  const [catalogos, setCatalogos] = useState<{
    departamentos: CatalogoDepartamentoReporte[];
    prioridades: CatalogoPrioridadReporte[];
  } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorRango = useMemo(() => {
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      return "La fecha inicial no puede ser posterior a la fecha final.";
    }
    return null;
  }, [filtros.desde, filtros.hasta]);

  const construirParametros = useCallback((): URLSearchParams => {
    const parametros = new URLSearchParams();
    if (filtros.desde) parametros.set("desde", filtros.desde);
    if (filtros.hasta) parametros.set("hasta", filtros.hasta);
    if (filtros.idDepartamento) parametros.set("id_departamento", filtros.idDepartamento);
    if (filtros.idPrioridad) parametros.set("id_prioridad", filtros.idPrioridad);
    return parametros;
  }, [filtros]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/reportes/gerenciales?${construirParametros().toString()}`);
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudieron generar los reportes");
      setReporte(datos.reporte);
      if (datos.reporte?.catalogos) setCatalogos(datos.reporte.catalogos);
    } catch (err) {
      setReporte(null);
      setError(err instanceof Error ? err.message : "No se pudieron generar los reportes.");
    } finally {
      setCargando(false);
    }
  }, [construirParametros]);

  useEffect(() => {
    if (errorRango) {
      setReporte(null);
      setCargando(false);
      return;
    }
    cargar();
  }, [cargar, errorRango]);

  async function exportarCsv() {
    if (!reporte || errorRango) return;
    setExportando(true);
    setError(null);
    try {
      const res = await fetch(`/api/reportes/gerenciales/export?${construirParametros().toString()}`);
      if (!res.ok) {
        const datos = await res.json().catch(() => ({}) as { error?: string });
        throw new Error(datos.error || "No se pudo exportar el reporte.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposicion = res.headers.get("Content-Disposition");
      const coincide = disposicion ? /filename="([^"]+)"/.exec(disposicion) : null;
      link.href = url;
      link.setAttribute("download", coincide?.[1] || "reporte_gerencial.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo exportar el reporte.");
    } finally {
      setExportando(false);
    }
  }

  function limpiarFiltros() {
    const hoy = new Date();
    setFiltros({
      desde: aIsoLocal(restarDias(hoy, 30)),
      hasta: aIsoLocal(hoy),
      idDepartamento: "",
      idPrioridad: "",
    });
  }

  const kpis = reporte?.kpis;
  const total = Number(kpis?.total || 0);
  const cargaActiva = Number(kpis?.activos || 0);
  const resueltosTotal = Number(kpis?.resueltos_total || 0);
  const aTiempo = Number(kpis?.a_tiempo || 0);
  const slaVencidos = Number(kpis?.sla_vencidos || 0);
  const pctSla = resueltosTotal > 0 ? Math.round((aTiempo / resueltosTotal) * 100) : null;

  const estiloCampoError: CSSProperties = errorRango
    ? { borderColor: "#ef4444", backgroundColor: "#fef2f2" }
    : {};

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Reportes Gerenciales de Gestion ITIL 4</h1>
          <p className="descripcion">
            Indicadores agregados de la Mesa de Servicio (HU-27): volumen, carga activa, tiempo
            medio de primera respuesta (MTTA), tiempo medio de resolucion (MTTR), cumplimiento de
            SLA y CSAT, con filtros por rango de fechas, departamento de TI y prioridad.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="boton-secundario"
            onClick={exportarCsv}
            disabled={exportando || cargando || !reporte || !!errorRango}
            style={{ fontSize: 13, padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Descargar el reporte filtrado en formato CSV para Excel"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exportando ? "Generando archivo..." : "Exportar CSV"}
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={cargar}
            disabled={cargando || !!errorRango}
            title="Recalcular indicadores"
            aria-label="Recalcular indicadores"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 10px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtros del reporte */}
      <div className="barra-filtros" style={{ alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>Rango de fechas</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="date"
              className="input-base"
              aria-label="Fecha inicial del reporte"
              value={filtros.desde}
              onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
              style={{ ...estiloCampoError, width: 150 }}
              aria-invalid={!!errorRango}
            />
            <input
              type="date"
              className="input-base"
              aria-label="Fecha final del reporte"
              value={filtros.hasta}
              onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
              style={{ ...estiloCampoError, width: 150 }}
              aria-invalid={!!errorRango}
            />
          </div>
          <AlertaCampo error={errorRango} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label htmlFor="filtro-departamento" style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>
            Departamento de TI
          </label>
          <select
            id="filtro-departamento"
            className="input-base"
            value={filtros.idDepartamento}
            onChange={(e) => setFiltros((f) => ({ ...f, idDepartamento: e.target.value }))}
            style={{ width: 210 }}
          >
            <option value="">Todos los departamentos</option>
            {(catalogos?.departamentos || []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label htmlFor="filtro-prioridad" style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>
            Prioridad
          </label>
          <select
            id="filtro-prioridad"
            className="input-base"
            value={filtros.idPrioridad}
            onChange={(e) => setFiltros((f) => ({ ...f, idPrioridad: e.target.value }))}
            style={{ width: 170 }}
          >
            <option value="">Todas las prioridades</option>
            {(catalogos?.prioridades || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="boton-secundario" onClick={limpiarFiltros} style={{ marginTop: 20 }}>
          Restablecer
        </button>
      </div>

      {error && !errorRango && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      {cargando ? (
        <p className="descripcion">Calculando indicadores gerenciales...</p>
      ) : errorRango ? (
        <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
          Corrige el rango de fechas para volver a calcular el reporte.
        </div>
      ) : !reporte ? (
        <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
          No hay indicadores disponibles para los filtros seleccionados.
        </div>
      ) : (
        <div>
          {/* Fila 1: indicadores clave */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            <TarjetaKpi
              titulo="Tickets en el periodo"
              valor={String(total)}
              detalle={`${kpis?.incidentes || 0} incidentes y ${kpis?.solicitudes || 0} solicitudes`}
            />
            <TarjetaKpi
              titulo="Carga activa en cola"
              valor={String(cargaActiva)}
              detalle={`${kpis?.abiertos || 0} abiertos, ${kpis?.asignados || 0} asignados, ${kpis?.en_proceso || 0} en proceso, ${kpis?.en_espera || 0} en espera`}
              colorValor="#d97706"
            />
            <TarjetaKpi
              titulo="Cumplimiento de SLA"
              valor={pctSla === null ? "N/D" : `${pctSla}%`}
              detalle={`${aTiempo} de ${resueltosTotal} tickets resueltos a tiempo`}
              colorValor={pctSla !== null && pctSla < 80 ? "#dc2626" : "#059669"}
            />
            <TarjetaKpi
              titulo="SLA vencido en cola"
              valor={String(slaVencidos)}
              detalle="Tickets activos con fecha limite de SLA superada"
              colorValor={slaVencidos > 0 ? "#dc2626" : "#111827"}
            />
            <TarjetaKpi
              titulo="MTTR promedio"
              valor={formatoHoras(kpis?.mttr_horas)}
              detalle="Tiempo medio de resolucion en horas"
              colorValor="#2563eb"
            />
            <TarjetaKpi
              titulo="MTTA promedio"
              valor={formatoHoras(kpis?.mtta_horas)}
              detalle="Tiempo medio de primera respuesta en horas"
              colorValor="#2563eb"
            />
            <TarjetaKpi
              titulo="CSAT promedio"
              valor={kpis?.csat_promedio === null || kpis?.csat_promedio === undefined ? "N/D" : `${kpis.csat_promedio} / 5`}
              detalle={`${kpis?.csat_respondidas || 0} encuestas respondidas`}
              colorValor="#7c3aed"
            />
            <TarjetaKpi
              titulo="Resolucion efectiva"
              valor={porcentaje(resueltosTotal, total)}
              detalle={`${resueltosTotal} tickets en estado resuelto o cerrado`}
              colorValor="#2563eb"
            />
          </div>

          {/* Fila 2: desglose por departamento */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14.5, margin: "0 0 10px", color: "#0f172a", fontWeight: 700 }}>
              Desglose por departamento de TI
            </h3>
            <div className="contenedor-tabla">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Departamento</th>
                    <th>Total</th>
                    <th>Activos</th>
                    <th>Resueltos</th>
                    <th>Cumplimiento SLA</th>
                    <th>MTTR</th>
                    <th>MTTA</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.porDepartamento.length === 0 ? (
                    <FilaVacia columnas={7} />
                  ) : (
                    reporte.porDepartamento.map((fila) => (
                      <tr key={`dep-${fila.id_departamento ?? "sin-departamento"}`}>
                        <td>{fila.departamento}</td>
                        <td>{fila.total}</td>
                        <td>{fila.activos}</td>
                        <td>{fila.resueltos}</td>
                        <td>{porcentaje(Number(fila.a_tiempo), Number(fila.resueltos))}</td>
                        <td>{formatoHoras(fila.mttr_horas)}</td>
                        <td>{formatoHoras(fila.mtta_horas)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fila 3: prioridad y estado */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 14.5, margin: "0 0 10px", color: "#0f172a", fontWeight: 700 }}>
                Distribucion por prioridad
              </h3>
              <div className="contenedor-tabla">
                <table className="tabla-datos">
                  <thead>
                    <tr>
                      <th>Prioridad</th>
                      <th>Total</th>
                      <th>Activos</th>
                      <th>Resueltos</th>
                      <th>Cumplimiento SLA</th>
                      <th>MTTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.porPrioridad.length === 0 ? (
                      <FilaVacia columnas={6} />
                    ) : (
                      reporte.porPrioridad.map((fila) => (
                        <tr key={`prio-${fila.id_prioridad}`}>
                          <td>
                            <span className="badge-itil" style={estiloInsignia(fila.color)}>
                              {fila.codigo} - {fila.prioridad}
                            </span>
                          </td>
                          <td>{fila.total}</td>
                          <td>{fila.activos}</td>
                          <td>{fila.resueltos}</td>
                          <td>{porcentaje(Number(fila.a_tiempo), Number(fila.resueltos))}</td>
                          <td>{formatoHoras(fila.mttr_horas)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 14.5, margin: "0 0 10px", color: "#0f172a", fontWeight: 700 }}>
                Distribucion por estado del ciclo de vida
              </h3>
              <div className="contenedor-tabla">
                <table className="tabla-datos">
                  <thead>
                    <tr>
                      <th>Estado</th>
                      <th>Total</th>
                      <th>Participacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.porEstado.length === 0 ? (
                      <FilaVacia columnas={3} />
                    ) : (
                      reporte.porEstado.map((fila) => (
                        <tr key={`estado-${fila.id_estado}`}>
                          <td>
                            <span className="badge-itil" style={estiloInsignia(fila.color)}>
                              {fila.estado}
                            </span>
                          </td>
                          <td>{fila.total}</td>
                          <td>{porcentaje(Number(fila.total), total)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Fila 4: evolucion mensual */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14.5, margin: "0 0 10px", color: "#0f172a", fontWeight: 700 }}>
              Evolucion mensual (por fecha de creacion)
            </h3>
            <div className="contenedor-tabla">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Creados</th>
                    <th>Resueltos</th>
                    <th>Cumplimiento SLA</th>
                    <th>MTTR</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.porMes.length === 0 ? (
                    <FilaVacia columnas={5} />
                  ) : (
                    reporte.porMes.map((fila) => (
                      <tr key={`mes-${fila.mes}`}>
                        <td>{formatMes(fila.mes)}</td>
                        <td>{fila.total}</td>
                        <td>{fila.resueltos}</td>
                        <td>{porcentaje(Number(fila.a_tiempo), Number(fila.resueltos))}</td>
                        <td>{formatoHoras(fila.mttr_horas)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="descripcion" style={{ fontSize: 12 }}>
            Fuente: metricas agregadas de la tabla de tickets. El reporte no muestra contenido de
            tickets ni datos personales; el alcance por perfil se aplica en el servidor. Para
            metricas operativas por tipo de ticket consulta la consola de Indicadores y SLAs.
          </p>
        </div>
      )}
    </div>
  );
}
