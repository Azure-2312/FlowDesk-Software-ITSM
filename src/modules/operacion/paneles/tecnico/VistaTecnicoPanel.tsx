"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types";

export default function PaginaPanelTecnico() {
  const [ticketsAsignados, setTicketsAsignados] = useState<Ticket[]>([]);
  const [ticketsPendientes, setTicketsPendientes] = useState<Ticket[]>([]);
  const [recordatorios, setRecordatorios] = useState<any[]>([]);
  const [ticketsResueltos, setTicketsResueltos] = useState<Ticket[]>([]);
  const [periodoDesempeno, setPeriodoDesempeno] = useState<"7_dias" | "30_dias" | "todo">("30_dias");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatosPanel() {
    setCargando(true);
    setError(null);
    try {
      const [resAsignados, resPendientes, resRecordatorios, resResueltos] = await Promise.all([
        fetch(`/api/tickets?vista=asignados&_t=${Date.now()}`).then((r) => r.json()),
        fetch(`/api/tickets?vista=bandeja&_t=${Date.now()}`).then((r) => r.json()),
        fetch(`/api/operacion/recordatorios?_t=${Date.now()}`).then((r) => r.json()).catch(() => ({ recordatorios: [] })),
        fetch(`/api/tickets?vista=resueltos&solo_asignados_a_mi=1&_t=${Date.now()}`).then((r) => r.json()).catch(() => ({ tickets: [] })),
      ]);

      setTicketsAsignados(resAsignados.tickets || []);
      setTicketsPendientes(resPendientes.tickets || []);
      setRecordatorios(resRecordatorios.recordatorios || []);
      setTicketsResueltos(resResueltos.tickets || []);
    } catch {
      setError("Error de conexión al cargar datos del panel.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatosPanel();
  }, []);

  // Métricas operativas superiores (en cartera activa actual)
  const totalAsignados = ticketsAsignados.length;
  const totalPendientes = ticketsPendientes.length;
  const totalVencidos = ticketsAsignados.filter((t) => t.sla_vencido).length;
  const totalEnRiesgo = ticketsAsignados.filter(
    (t) => !t.sla_vencido && (t.minutos_restantes_sla ?? 9999) <= 60 && (t.minutos_restantes_sla ?? 9999) > 0
  ).length;

  // Banner de Incidente Mayor activo
  const incidenteMayorActivo = useMemo(() => {
    return ticketsAsignados.find((t) => t.prioridad_codigo === "P1" && t.id_tipo_ticket === 1);
  }, [ticketsAsignados]);

  // Lista "Atender ahora": Top 10 más urgentes combinando asignados y cola de pendientes
  const atenderAhora = useMemo(() => {
    const todos = [...ticketsAsignados, ...ticketsPendientes];
    return todos
      .sort((a, b) => {
        const aV = a.sla_vencido ? 1 : 0;
        const bV = b.sla_vencido ? 1 : 0;
        if (aV !== bV) return bV - aV;

        const aRest = a.minutos_restantes_sla ?? 999999;
        const bRest = b.minutos_restantes_sla ?? 999999;
        if (aRest !== bRest) return aRest - bRest;

        const prioRank: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
        const aPrio = prioRank[a.prioridad_codigo || "P4"] || 5;
        const bPrio = prioRank[b.prioridad_codigo || "P4"] || 5;
        return aPrio - bPrio;
      })
      .slice(0, 10);
  }, [ticketsAsignados, ticketsPendientes]);

  // Filtro por período para desempeño
  function estaEnPeriodo(fechaIso: string | undefined | null) {
    if (periodoDesempeno === "todo") return true;
    if (!fechaIso) return false;
    const t = new Date(fechaIso).getTime();
    const dias = periodoDesempeno === "7_dias" ? 7 : 30;
    const cutoff = Date.now() - dias * 24 * 60 * 60 * 1000;
    return t >= cutoff;
  }

  // Conjuntos de tickets filtrados por período
  const asignadosPeriodo = useMemo(() => {
    return ticketsAsignados.filter((t) => estaEnPeriodo(t.fecha_creacion));
  }, [ticketsAsignados, periodoDesempeno]);

  const resueltosPeriodo = useMemo(() => {
    return ticketsResueltos.filter((t) => estaEnPeriodo(t.fecha_resolucion || t.fecha_creacion));
  }, [ticketsResueltos, periodoDesempeno]);

  const todosPeriodo = useMemo(() => {
    return [...asignadosPeriodo, ...resueltosPeriodo];
  }, [asignadosPeriodo, resueltosPeriodo]);

  // Cálculos dinámicos de desempeño
  const totalResueltos = resueltosPeriodo.length;
  const totalEnPeriodo = todosPeriodo.length;

  const resueltosCumplieronSla = resueltosPeriodo.filter((t) => t.sla_cumplido).length;
  const resueltosIncumplieronSla = resueltosPeriodo.filter((t) => !t.sla_cumplido).length;
  const activosVencidos = asignadosPeriodo.filter((t) => t.sla_vencido).length;

  // Total de compromisos de SLA que debieron haberse cumplido a la fecha:
  // Tickets resueltos + tickets activos cuyo plazo de SLA ya expiró
  const totalCompromisosSla = resueltosCumplieronSla + resueltosIncumplieronSla + activosVencidos;
  const porcentajeSla = totalCompromisosSla > 0
    ? Math.round((resueltosCumplieronSla / totalCompromisosSla) * 100)
    : 100;

  // FCR: casos resueltos sin reapertura y sin incidente mayor
  const fcrCount = resueltosPeriodo.filter(
    (t) => (t.conteo_reaperturas ?? 0) === 0 && !t.es_incidente_mayor
  ).length;
  const tasaFcr = totalResueltos > 0 ? Math.round((fcrCount / totalResueltos) * 100) : 0;

  // Tasa de reaperturas sobre todos los tickets del período
  const reabiertosCount = todosPeriodo.filter((t) => (t.conteo_reaperturas ?? 0) > 0).length;
  const tasaReaperturas = totalEnPeriodo > 0 ? Math.round((reabiertosCount / totalEnPeriodo) * 100) : 0;

  // CSAT dinámico desde BD
  const ticketsConCsat = todosPeriodo.filter(
    (t) => t.calificacion_csat !== null && t.calificacion_csat !== undefined
  );
  const promedioCsat = ticketsConCsat.length > 0
    ? (
        ticketsConCsat.reduce((sum, t) => sum + Number(t.calificacion_csat), 0) /
        ticketsConCsat.length
      ).toFixed(1)
    : null;

  // MTTR: tiempo medio de solución en horas para los tickets resueltos
  const resueltosConFechas = resueltosPeriodo.filter((t) => t.fecha_creacion && t.fecha_resolucion);
  const mttrHoras = resueltosConFechas.length > 0
    ? (
        resueltosConFechas.reduce((sum, t) => {
          const ms = new Date(t.fecha_resolucion!).getTime() - new Date(t.fecha_creacion).getTime();
          return sum + Math.max(0, ms / (1000 * 60 * 60));
        }, 0) / resueltosConFechas.length
      ).toFixed(1)
    : null;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Dashboard del especialista técnico
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Visión centralizada de prioridades operativas, SLA y desempeño del turno
          </p>
        </div>

        <button
          type="button"
          onClick={cargarDatosPanel}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      {/* Banner de Incidente Mayor */}
      {incidenteMayorActivo && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #f87171",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                Incidente Mayor Activo
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "#991b1b" }}>
                {incidenteMayorActivo.codigo_ticket}: {incidenteMayorActivo.titulo}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "#7f1d1d", marginTop: 4 }}>
              Afectación crítica en progreso. Requiere atención prioritaria inmediata según protocolo ITIL.
            </div>
          </div>
          <Link
            href={`/plataforma/tickets/${incidenteMayorActivo.id_ticket}`}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Atender de inmediato
          </Link>
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Tarjetas de Indicadores Operativos Superiores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 18,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b" }}>Asignados a mí</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
            {cargando ? "-" : totalAsignados}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>En cartera activa</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 18,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b" }}>Bandeja sin asignar</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#d97706", marginTop: 4 }}>
            {cargando ? "-" : totalPendientes}
          </div>
          <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>En cola de grupo</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 18,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b" }}>SLA en riesgo (menor a 1h)</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalEnRiesgo > 0 ? "#dc2626" : "#0f172a", marginTop: 4 }}>
            {cargando ? "-" : totalEnRiesgo}
          </div>
          <div style={{ fontSize: 12, color: totalEnRiesgo > 0 ? "#dc2626" : "#64748b", marginTop: 4 }}>
            Requieren acción inmediata
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: 18,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748b" }}>SLA vencidos</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalVencidos > 0 ? "#dc2626" : "#16a34a", marginTop: 4 }}>
            {cargando ? "-" : totalVencidos}
          </div>
          <div style={{ fontSize: 12, color: totalVencidos > 0 ? "#dc2626" : "#16a34a", marginTop: 4 }}>
            {totalVencidos > 0 ? "Expirados en cartera" : "Sin vencidos"}
          </div>
        </div>
      </div>

      {/* Grid Central: Atender Ahora + Agenda */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 28 }}>
        {/* Tabla Atender Ahora */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Qué atender ahora (Top 10 más urgentes)
              </h2>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Ordenado por SLA de vencimiento y prioridad ITIL
              </div>
            </div>
          </div>

          {cargando ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              Cargando prioridades...
            </div>
          ) : atenderAhora.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              No tienes tickets urgentes pendientes en este momento.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 16px", fontWeight: 600 }}>ID</th>
                  <th style={{ padding: "10px 16px", fontWeight: 600 }}>Título</th>
                  <th style={{ padding: "10px 16px", fontWeight: 600 }}>Prioridad</th>
                  <th style={{ padding: "10px 16px", fontWeight: 600 }}>SLA</th>
                  <th style={{ padding: "10px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {atenderAhora.map((t) => (
                  <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 16px", fontWeight: 600, color: "#2563eb" }}>
                      <Link href={`/plataforma/tickets/${t.id_ticket}`}>{t.codigo_ticket}</Link>
                    </td>
                    <td style={{ padding: "10px 16px", color: "#1e293b", maxWidth: 260 }}>
                      <Link href={`/plataforma/tickets/${t.id_ticket}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {t.titulo}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor:
                            t.prioridad_codigo === "P1"
                              ? "#fecaca"
                              : t.prioridad_codigo === "P2"
                              ? "#fed7aa"
                              : "#fef08a",
                          color:
                            t.prioridad_codigo === "P1"
                              ? "#991b1b"
                              : t.prioridad_codigo === "P2"
                              ? "#9a3412"
                              : "#854d0e",
                        }}
                      >
                        {t.prioridad_codigo || "P4"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {t.sla_vencido ? (
                        <span style={{ color: "#dc2626", fontWeight: 600, fontSize: 11.5 }}>Vencido</span>
                      ) : (
                        <span style={{ color: "#16a34a", fontSize: 11.5 }}>
                          {Math.round((t.minutos_restantes_sla ?? 0) / 60)}h restantes
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>
                      <Link
                        href={`/plataforma/tickets/${t.id_ticket}`}
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #cbd5e1",
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#1e293b",
                          textDecoration: "none",
                        }}
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Agenda de hoy */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Mi agenda de hoy
            </h2>
          </div>

          {recordatorios.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#64748b", padding: "16px 0", textAlign: "center" }}>
              Sin actividades programadas para hoy.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recordatorios.slice(0, 4).map((r) => (
                <div
                  key={r.id_recordatorio}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "#f8fafc",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.titulo}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {new Date(r.fecha_hora).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección Integrada: Mi Desempeño Individual */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Mi desempeño individual
            </h2>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: "2px 0 0" }}>
              Indicadores consolidados calculados dinámicamente sobre la cartera integral de tickets (activos y resueltos)
            </p>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => setPeriodoDesempeno("7_dias")}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: periodoDesempeno === "7_dias" ? 600 : 500,
                backgroundColor: periodoDesempeno === "7_dias" ? "#2563eb" : "#ffffff",
                color: periodoDesempeno === "7_dias" ? "#ffffff" : "#475569",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => setPeriodoDesempeno("30_dias")}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: periodoDesempeno === "30_dias" ? 600 : 500,
                backgroundColor: periodoDesempeno === "30_dias" ? "#2563eb" : "#ffffff",
                color: periodoDesempeno === "30_dias" ? "#ffffff" : "#475569",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              onClick={() => setPeriodoDesempeno("todo")}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: periodoDesempeno === "todo" ? 600 : 500,
                backgroundColor: periodoDesempeno === "todo" ? "#2563eb" : "#ffffff",
                color: periodoDesempeno === "todo" ? "#ffffff" : "#475569",
                border: "1px solid #cbd5e1",
                cursor: "pointer",
              }}
            >
              Histórico total
            </button>
          </div>
        </div>

        {cargando ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Calculando indicadores dinámicos...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
            {/* 1. Tickets Resueltos */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Tickets Resueltos</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                {totalResueltos}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                De {totalEnPeriodo} tickets asignados
              </div>
            </div>

            {/* 2. Cumplimiento de SLA */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Cumplimiento de SLA</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: porcentajeSla >= 90 ? "#16a34a" : porcentajeSla >= 75 ? "#d97706" : "#dc2626",
                  marginTop: 4,
                }}
              >
                {porcentajeSla}%
              </div>
              <div style={{ fontSize: 11, color: porcentajeSla < 90 ? "#dc2626" : "#64748b", marginTop: 4 }}>
                {resueltosCumplieronSla} cumplidos / {totalCompromisosSla} evaluados ({activosVencidos} vencidos)
              </div>
            </div>

            {/* 3. Resolución en 1er Contacto (FCR) */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Resolución 1er Contacto</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>
                {tasaFcr}%
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {fcrCount} de {totalResueltos} casos sin reapertura
              </div>
            </div>

            {/* 4. Tasa de Reaperturas */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Tasa de Reaperturas</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: tasaReaperturas <= 5 ? "#16a34a" : "#dc2626",
                  marginTop: 4,
                }}
              >
                {tasaReaperturas}%
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {reabiertosCount} ticket(s) reabiertos
              </div>
            </div>

            {/* 5. Satisfacción CSAT */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Satisfacción CSAT</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: promedioCsat ? "#16a34a" : "#64748b",
                  marginTop: 4,
                }}
              >
                {promedioCsat !== null ? `${promedioCsat} / 5.0` : "Sin encuestas"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {ticketsConCsat.length} calificaciones registradas
              </div>
            </div>

            {/* 6. Tiempo Medio de Solución (MTTR) */}
            <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Tiempo Medio (MTTR)</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                {mttrHoras !== null ? `${mttrHoras} h` : "N/D"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                {resueltosConFechas.length > 0 ? "Promedio en resueltos" : "Sin casos resueltos"}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11.5, color: "#94a3b8" }}>
          * El cumplimiento de SLA evalúa la totalidad de compromisos vencidos o resueltos: integra los casos cerrados dentro del plazo frente a los vencidos activos y cerrados extemporáneos.
        </div>
      </div>
    </div>
  );
}
