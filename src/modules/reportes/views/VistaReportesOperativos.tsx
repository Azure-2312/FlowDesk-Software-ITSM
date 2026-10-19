"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Indicadores {
  total: number;
  incidentes: number;
  solicitudes: number;
  resueltos_total: number;
  a_tiempo: number;
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  abiertos: number;
  asignados: number;
  en_proceso: number;
  en_espera: number;
  resueltos: number;
  cerrados: number;
  inc_resueltos?: number;
  inc_a_tiempo?: number;
  sol_resueltos?: number;
  sol_a_tiempo?: number;
  activos_p1?: number;
  activos_p2?: number;
  activos_p3?: number;
  activos_p4?: number;
}

export default function PaginaReportes() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/reportes/indicadores");
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudieron consultar indicadores");
      setIndicadores(datos.indicadores || null);
    } catch {
      console.error("Error al cargar datos para reportes");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const total = Number(indicadores?.total || 0);
  const incidentes = Number(indicadores?.incidentes || 0);
  const solicitudes = Number(indicadores?.solicitudes || 0);
  const resueltosTotal = Number(indicadores?.resueltos_total || 0);
  const aTiempo = Number(indicadores?.a_tiempo || 0);
  const tasaSLA = resueltosTotal > 0 ? Math.round((aTiempo / resueltosTotal) * 100) : 100;

  const incResueltos = Number(indicadores?.inc_resueltos || 0);
  const incATiempo = Number(indicadores?.inc_a_tiempo || 0);
  const tasaSLAInc = incResueltos > 0 ? Math.round((incATiempo / incResueltos) * 100) : 100;

  const solResueltos = Number(indicadores?.sol_resueltos || 0);
  const solATiempo = Number(indicadores?.sol_a_tiempo || 0);
  const tasaSLASol = solResueltos > 0 ? Math.round((solATiempo / solResueltos) * 100) : 100;

  const p1 = Number(indicadores?.p1 || 0);
  const p2 = Number(indicadores?.p2 || 0);
  const p3 = Number(indicadores?.p3 || 0);
  const p4 = Number(indicadores?.p4 || 0);

  const abiertos = Number(indicadores?.abiertos || 0);
  const asignados = Number(indicadores?.asignados || 0);
  const enProceso = Number(indicadores?.en_proceso || 0);
  const enEspera = Number(indicadores?.en_espera || 0);
  const resueltos = Number(indicadores?.resueltos || 0);
  const cerrados = Number(indicadores?.cerrados || 0);

  const cargaActiva = abiertos + asignados + enProceso + enEspera;

  // Calculo de sectores para el Grafico de Pastel (Incidentes vs Solicitudes)
  const pctInc = total > 0 ? (incidentes / total) : 0.5;
  const anguloInc = pctInc * 360;

  // Helper para generar ruta SVG de pastel
  function generarCoordenadasArco(cx: number, cy: number, r: number, anguloGrados: number) {
    const rad = ((anguloGrados - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function renderizarSectorPastel(cx: number, cy: number, r: number, anguloInicio: number, anguloFin: number, color: string) {
    if (anguloFin - anguloInicio >= 359.99) {
      return <circle cx={cx} cy={cy} r={r} fill={color} />;
    }
    const inicio = generarCoordenadasArco(cx, cy, r, anguloFin);
    const fin = generarCoordenadasArco(cx, cy, r, anguloInicio);
    const arcoMayor = anguloFin - anguloInicio <= 180 ? "0" : "1";
    const d = [
      "M", cx, cy,
      "L", inicio.x, inicio.y,
      "A", r, r, 0, arcoMayor, 0, fin.x, fin.y,
      "Z"
    ].join(" ");
    return <path d={d} fill={color} stroke="#ffffff" strokeWidth="2" />;
  }

  // Calculo de sectores para el Grafico de Carga por Prioridad
  const actP1 = Number(indicadores?.activos_p1 || 0);
  const actP2 = Number(indicadores?.activos_p2 || 0);
  const actP3 = Number(indicadores?.activos_p3 || 0);
  const actP4 = Number(indicadores?.activos_p4 || 0);
  const totalActivosPrioridad = (actP1 + actP2 + actP3 + actP4) || 1;

  const angP1 = (actP1 / totalActivosPrioridad) * 360;
  const angP2 = (actP2 / totalActivosPrioridad) * 360;
  const angP3 = (actP3 / totalActivosPrioridad) * 360;
  const angP4 = (actP4 / totalActivosPrioridad) * 360;

  function exportarReporteCSV() {
    if (!indicadores) return;
    const lineas = [
      "Metrica;Valor;Detalle",
      `Volumen Total;${total};Tickets registrados en el sistema`,
      `Incidentes;${incidentes};Fallas no planificadas`,
      `Solicitudes;${solicitudes};Requerimientos estandar`,
      `Cumplimiento SLA General;${tasaSLA}%;${aTiempo} de ${resueltosTotal} resueltos a tiempo`,
      `Cumplimiento SLA Incidentes;${tasaSLAInc}%;${incATiempo} de ${incResueltos} incidentes`,
      `Cumplimiento SLA Solicitudes;${tasaSLASol}%;${solATiempo} de ${solResueltos} solicitudes`,
      `Prioridad P1 Critica;${p1};Casos criticos`,
      `Prioridad P2 Alta;${p2};Casos de alta prioridad`,
      `Prioridad P3 Media;${p3};Casos de prioridad media`,
      `Prioridad P4 Baja;${p4};Casos de prioridad baja`,
      `Carga Activa;${cargaActiva};En atencion o en espera`,
    ];
    const contenido = "\uFEFF" + lineas.join("\r\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_itsm_kpis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1>Reportes y Dashboards Ejecutivos de Gestión ITIL 4</h1>
          <p>
            Métricas de Mesa de Servicio: Acuerdos de Nivel de Servicio (SLA), gráficos de pastel de tickets abiertos, barras de cumplimiento y distribución por prioridad.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/reportes/tableros"
            className="boton-secundario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Configurar Tableros
          </Link>
          <button
            type="button"
            className="boton-secundario"
            onClick={exportarReporteCSV}
            disabled={cargando}
            style={{ fontSize: 13, padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Exportar CSV
          </button>
          <button
            className="boton-mini"
            onClick={cargar}
            disabled={cargando}
            title="Recalcular métricas"
            aria-label="Recalcular métricas"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 10px" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {cargando ? (
        <p className="descripcion">Procesando indicadores gerenciales...</p>
      ) : (
        <div>
          {/* Fila 1: KPIs Principales */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Cumplimiento General de SLA
              </span>
              <div style={{ fontSize: 22, fontWeight: 700, color: tasaSLA >= 80 ? "#059669" : "#dc2626", marginTop: 4 }}>
                {tasaSLA}%
              </div>
              <span style={{ fontSize: 12, color: "#475569" }}>
                {aTiempo} de {resueltosTotal} tickets resueltos a tiempo
              </span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Volumen Total Registrado
              </span>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 4 }}>
                {total}
              </div>
              <span style={{ fontSize: 12, color: "#475569" }}>
                Expedientes gestionados en la plataforma
              </span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Carga Activa en Cola
              </span>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#d97706", marginTop: 4 }}>
                {cargaActiva}
              </div>
              <span style={{ fontSize: 12, color: "#78350f" }}>
                Tickets en proceso de atención o espera
              </span>
            </div>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                Eficacia de Cierre
              </span>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>
                {total > 0 ? Math.round(((resueltos + cerrados) / total) * 100) : 100}%
              </div>
              <span style={{ fontSize: 12, color: "#475569" }}>
                {resueltos + cerrados} expedientes finalizados
              </span>
            </div>
          </div>

          {/* Fila 2: Gráficos de Pastel (Pie Charts) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, marginBottom: 24 }}>
            {/* Gráfico de Pastel 1: Incidentes vs Solicitudes */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 14.5, margin: "0 0 14px", color: "#0f172a", fontWeight: 700 }}>
                Gráfico de Pastel: Distribución de Demanda por Naturaleza
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {total === 0 ? (
                    <circle cx="75" cy="75" r="60" fill="#e2e8f0" />
                  ) : (
                    <>
                      {renderizarSectorPastel(75, 75, 65, 0, anguloInc, "#dc2626")}
                      {renderizarSectorPastel(75, 75, 65, anguloInc, 360, "#2563eb")}
                      {/* Centro donut */}
                      <circle cx="75" cy="75" r="32" fill="#ffffff" />
                      <text x="75" y="78" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                        {total}
                      </text>
                      <text x="75" y="91" textAnchor="middle" fontSize="9" fill="#64748b">
                        TICKETS
                      </text>
                    </>
                  )}
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, backgroundColor: "#dc2626", borderRadius: 3 }} />
                    <div>
                      <strong style={{ color: "#991b1b" }}>Incidentes: </strong>
                      <span>{incidentes} ({total > 0 ? Math.round((incidentes / total) * 100) : 0}%)</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 14, height: 14, backgroundColor: "#2563eb", borderRadius: 3 }} />
                    <div>
                      <strong style={{ color: "#1d4ed8" }}>Solicitudes: </strong>
                      <span>{solicitudes} ({total > 0 ? Math.round((solicitudes / total) * 100) : 0}%)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                    Estructuración según ITIL 4 para segregar interrupciones de peticiones rutinarias.
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de Pastel 2: Carga Activa por Prioridad */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 14.5, margin: "0 0 14px", color: "#0f172a", fontWeight: 700 }}>
                Gráfico de Pastel: Carga Activa por Nivel de Prioridad
              </h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  {cargaActiva === 0 ? (
                    <circle cx="75" cy="75" r="60" fill="#e2e8f0" />
                  ) : (
                    <>
                      {renderizarSectorPastel(75, 75, 65, 0, angP1, "#b91c1c")}
                      {renderizarSectorPastel(75, 75, 65, angP1, angP1 + angP2, "#ea580c")}
                      {renderizarSectorPastel(75, 75, 65, angP1 + angP2, angP1 + angP2 + angP3, "#ca8a04")}
                      {renderizarSectorPastel(75, 75, 65, angP1 + angP2 + angP3, 360, "#2563eb")}
                      <circle cx="75" cy="75" r="32" fill="#ffffff" />
                      <text x="75" y="78" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                        {cargaActiva}
                      </text>
                      <text x="75" y="91" textAnchor="middle" fontSize="9" fill="#64748b">
                        ACTIVAS
                      </text>
                    </>
                  )}
                </svg>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, backgroundColor: "#b91c1c", borderRadius: 2 }} />
                    <span><strong>P1 Crítica:</strong> {actP1} casos (SLA 4h)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, backgroundColor: "#ea580c", borderRadius: 2 }} />
                    <span><strong>P2 Alta:</strong> {actP2} casos (SLA 8h)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, backgroundColor: "#ca8a04", borderRadius: 2 }} />
                    <span><strong>P3 Media:</strong> {actP3} casos (SLA 24h)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, backgroundColor: "#2563eb", borderRadius: 2 }} />
                    <span><strong>P4 Baja:</strong> {actP4} casos (SLA 72h)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 3: Barras de Cumplimiento de SLA */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14.5, margin: "0 0 14px", color: "#0f172a", fontWeight: 700 }}>
              Barras Comparativas de Cumplimiento de SLA (Meta Institucional: 80%)
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Barra General */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span><strong>SLA Global del Servicio:</strong></span>
                  <span style={{ fontWeight: 700, color: tasaSLA >= 80 ? "#059669" : "#dc2626" }}>
                    {tasaSLA}% {tasaSLA >= 80 ? "(Cumplido)" : "(Bajo el objetivo)"}
                  </span>
                </div>
                <div style={{ position: "relative", width: "100%", height: 16, backgroundColor: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, tasaSLA)}%`,
                      height: "100%",
                      backgroundColor: tasaSLA >= 80 ? "#10b981" : "#ef4444",
                      transition: "width 0.5s ease-in-out",
                    }}
                  />
                  {/* Línea objetivo 80% */}
                  <div
                    style={{
                      position: "absolute",
                      left: "80%",
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: "#0f172a",
                    }}
                    title="Meta contractual 80%"
                  />
                </div>
              </div>

              {/* Barra Incidentes */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span><strong>SLA de Resolución de Incidentes (Fallas):</strong></span>
                  <span style={{ fontWeight: 700, color: tasaSLAInc >= 80 ? "#059669" : "#dc2626" }}>
                    {tasaSLAInc}% ({incATiempo} de {incResueltos})
                  </span>
                </div>
                <div style={{ width: "100%", height: 16, backgroundColor: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, tasaSLAInc)}%`,
                      height: "100%",
                      backgroundColor: tasaSLAInc >= 80 ? "#059669" : "#dc2626",
                      transition: "width 0.5s ease-in-out",
                    }}
                  />
                </div>
              </div>

              {/* Barra Solicitudes */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span><strong>SLA de Entrega de Solicitudes (Peticiones):</strong></span>
                  <span style={{ fontWeight: 700, color: tasaSLASol >= 80 ? "#059669" : "#dc2626" }}>
                    {tasaSLASol}% ({solATiempo} de {solResueltos})
                  </span>
                </div>
                <div style={{ width: "100%", height: 16, backgroundColor: "#f1f5f9", borderRadius: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, tasaSLASol)}%`,
                      height: "100%",
                      backgroundColor: tasaSLASol >= 80 ? "#2563eb" : "#f59e0b",
                      transition: "width 0.5s ease-in-out",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fila 4: Pipeline Operativo del Ciclo de Vida */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14.5, margin: "0 0 12px", color: "#0f172a", fontWeight: 700 }}>
              Pipeline Operativo del Ciclo de Vida de Atención
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, textAlign: "center" }}>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Abiertos</span>
                <strong style={{ fontSize: 20, color: "#3b82f6" }}>{abiertos}</strong>
              </div>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Asignados</span>
                <strong style={{ fontSize: 20, color: "#6366f1" }}>{asignados}</strong>
              </div>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>En Proceso</span>
                <strong style={{ fontSize: 20, color: "#f59e0b" }}>{enProceso}</strong>
              </div>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>En Espera</span>
                <strong style={{ fontSize: 20, color: "#f97316" }}>{enEspera}</strong>
              </div>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Resueltos</span>
                <strong style={{ fontSize: 20, color: "#10b981" }}>{resueltos}</strong>
              </div>
              <div style={{ padding: "12px 8px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>Cerrados</span>
                <strong style={{ fontSize: 20, color: "#047857" }}>{cerrados}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
