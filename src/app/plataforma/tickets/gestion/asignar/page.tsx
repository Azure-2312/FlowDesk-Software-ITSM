"use client";

import { useEffect, useState } from "react";
import { Ticket, DepartamentoTI, TecnicoConCarga } from "@/types";
import ModalDetalleTicket from "@/components/ModalDetalleTicket";

const ESTADOS_OPERATIVOS: Record<string, { etiqueta: string; color: string; bg: string }> = {
  DISPONIBLE: { etiqueta: "Disponible", color: "#059669", bg: "#ecfdf5" },
  EN_ATENCION: { etiqueta: "En atención", color: "#2563eb", bg: "#eff6ff" },
  EN_GUARDIA: { etiqueta: "En guardia", color: "#7c3aed", bg: "#f5f3ff" },
  EN_RECESO: { etiqueta: "En receso", color: "#d97706", bg: "#fffbeb" },
  VACACIONES: { etiqueta: "Vacaciones", color: "#64748b", bg: "#f8fafc" },
};

export default function PaginaAsignarTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tecnicos, setTecnicos] = useState<TecnicoConCarga[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoTI[]>([]);
  const [cargando, setCargando] = useState(true);

  // Selección y Asignación
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [notaAsignacion, setNotaAsignacion] = useState("");
  const [asignando, setAsignando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorAsignacion, setErrorAsignacion] = useState<string | null>(null);

  // Modal de detalle
  const [verDetalleModalId, setVerDetalleModalId] = useState<number | null>(null);

  // Filtros de Tickets
  const [filtroAsignacion, setFiltroAsignacion] = useState<"sin_asignar" | "todos_activos">("sin_asignar");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busquedaTicket, setBusquedaTicket] = useState("");

  // Filtro de técnicos en panel de asignación
  const [deptoTecnicoFiltro, setDeptoTecnicoFiltro] = useState<string>("");

  async function cargarDatos() {
    setCargando(true);
    try {
      const [resTickets, resTecnicos, resDeptos] = await Promise.all([
        fetch("/api/tickets?vista=todos").then((r) => r.json()),
        fetch("/api/tecnicos").then((r) => r.json()),
        fetch("/api/departamentos-ti").then((r) => r.json()),
      ]);

      const listaTickets: Ticket[] = resTickets.tickets || [];
      setTickets(listaTickets);
      setTecnicos(resTecnicos.tecnicos || []);
      setDepartamentos(resDeptos.departamentos || []);

      // Si había un ticket seleccionado, refrescar sus datos
      if (ticketSeleccionado) {
        const refrescado = listaTickets.find((t) => t.id_ticket === ticketSeleccionado.id_ticket);
        if (refrescado) setTicketSeleccionado(refrescado);
      }
    } catch {
      console.error("Error al cargar datos para despacho");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function ejecutarAsignacion(idTecnico: number, nombreTecnico: string) {
    if (!ticketSeleccionado) return;

    setAsignando(true);
    setErrorAsignacion(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/tickets/${ticketSeleccionado.id_ticket}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario_asignado: idTecnico,
          nota_cambio: notaAsignacion.trim()
            ? `Asignación por despacho: ${notaAsignacion.trim()}`
            : `Ticket asignado al especialista ${nombreTecnico} mediante despacho de supervisión.`,
          es_nota_interna: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorAsignacion(data.error || "No se pudo asignar el ticket");
        return;
      }

      setMensajeExito(`Ticket [${ticketSeleccionado.codigo_ticket}] asignado con éxito a ${nombreTecnico}.`);
      setNotaAsignacion("");
      await cargarDatos();
    } catch {
      setErrorAsignacion("Error de conexión al procesar la asignación");
    } finally {
      setAsignando(false);
    }
  }

  // Filtrado de tickets
  const ticketsFiltrados = tickets.filter((t) => {
    if (filtroAsignacion === "sin_asignar" && t.id_usuario_asignado !== null) return false;
    if (filtroAsignacion === "todos_activos" && t.es_terminal) return false;
    if (filtroPrioridad && t.prioridad_codigo !== filtroPrioridad) return false;
    if (filtroTipo && t.tipo_codigo !== filtroTipo) return false;
    if (busquedaTicket.trim()) {
      const q = busquedaTicket.toLowerCase();
      const coincideCodigo = t.codigo_ticket.toLowerCase().includes(q);
      const coincideTitulo = t.titulo.toLowerCase().includes(q);
      const coincideSolicitante = (t.solicitante_nombre || "").toLowerCase().includes(q);
      if (!coincideCodigo && !coincideTitulo && !coincideSolicitante) return false;
    }
    return true;
  });

  // Métricas del despacho
  const sinAsignarTotal = tickets.filter((t) => t.id_usuario_asignado === null && !t.es_terminal).length;
  const criticosSinAsignar = tickets.filter(
    (t) => t.id_usuario_asignado === null && !t.es_terminal && (t.prioridad_codigo === "P1" || t.prioridad_codigo === "P2")
  ).length;
  const slaVencidos = tickets.filter((t) => !t.es_terminal && t.sla_vencido).length;
  const tecnicosDisponibles = tecnicos.filter((tec) => tec.estado_operativo === "DISPONIBLE").length;

  // Filtrado y recomendación de técnicos
  const tecnicosFiltrados = tecnicos
    .filter((tec) => {
      if (deptoTecnicoFiltro && tec.id_departamento !== parseInt(deptoTecnicoFiltro, 10)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Prioridad 1: DISPONIBLE primero
      const dispA = a.estado_operativo === "DISPONIBLE" ? 1 : 0;
      const dispB = b.estado_operativo === "DISPONIBLE" ? 1 : 0;
      if (dispA !== dispB) return dispB - dispA;

      // Prioridad 2: Menor porcentaje de ocupación WIP
      if (a.porcentaje_ocupacion !== b.porcentaje_ocupacion) {
        return a.porcentaje_ocupacion - b.porcentaje_ocupacion;
      }

      // Prioridad 3: Menor cantidad de tickets activos
      return a.tickets_activos - b.tickets_activos;
    });

  // Identificar técnico recomendado
  const idTecnicoRecomendado = tecnicosFiltrados.find(
    (t) => t.estado_operativo === "DISPONIBLE" && t.porcentaje_ocupacion < 80
  )?.id_usuario;

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Despacho y Asignación Inteligente de Tickets</h1>
          <p>
            Supervisión y triaje ITIL 4: distribución balanceada de tickets según niveles de soporte, disponibilidad operativa y capacidad WIP.
          </p>
        </div>
        <button
          className="boton-mini"
          onClick={cargarDatos}
          disabled={cargando}
          title="Actualizar despacho"
          aria-label="Actualizar despacho"
          style={{ padding: "6px 8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ animation: cargando ? "spin 1s linear infinite" : "none" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tarjetas Métricas Rápidas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: `4px solid ${sinAsignarTotal > 0 ? "#ea580c" : "#059669"}`,
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>TICKETS SIN ASIGNAR</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: sinAsignarTotal > 0 ? "#ea580c" : "#059669", marginTop: 2 }}>
            {sinAsignarTotal}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Bandeja de triaje</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: `4px solid ${criticosSinAsignar > 0 ? "#dc2626" : "#cbd5e1"}`,
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>CRÍTICOS P1/P2 SIN ATENDER</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: criticosSinAsignar > 0 ? "#dc2626" : "#475569", marginTop: 2 }}>
            {criticosSinAsignar}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Prioridad inmediata</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: `4px solid ${slaVencidos > 0 ? "#b91c1c" : "#cbd5e1"}`,
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SLA VENCIDO TOTAL</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: slaVencidos > 0 ? "#b91c1c" : "#475569", marginTop: 2 }}>
            {slaVencidos}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Fuera de plazo</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: "4px solid #059669",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>TÉCNICOS DISPONIBLES</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#059669", marginTop: 2 }}>
            {tecnicosDisponibles} de {tecnicos.length}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Listos para recibir carga</div>
        </div>
      </div>

      {/* Notificaciones de Éxito o Error */}
      {mensajeExito && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 6,
            color: "#065f46",
            fontSize: 12.5,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{mensajeExito}</span>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            style={{ background: "none", border: "none", color: "#065f46", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: 2 }}
            aria-label="Cerrar notificación"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {errorAsignacion && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            color: "#991b1b",
            fontSize: 12.5,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{errorAsignacion}</span>
          <button
            type="button"
            onClick={() => setErrorAsignacion(null)}
            style={{ background: "none", border: "none", color: "#991b1b", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: 2 }}
            aria-label="Cerrar error"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Disposición Principal en 2 Columnas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Columna Izquierda: Bandeja de Tickets */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 16,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: "#1e293b" }}>
              Bandeja de Tickets para Asignación ({ticketsFiltrados.length})
            </h3>
            <span style={{ fontSize: 11, color: "#64748b" }}>Seleccione un ticket para asignar especialista</span>
          </div>

          {/* Filtros de la bandeja */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: "1 1 100%" }}>
              <input
                type="text"
                className="input-base"
                style={{ width: "100%", fontSize: 12 }}
                placeholder="Buscar por código, título o solicitante..."
                value={busquedaTicket}
                onChange={(e) => setBusquedaTicket(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 6, width: "100%", flexWrap: "wrap" }}>
              <select
                className="input-base"
                style={{ fontSize: 11.5, flex: "1 1 120px" }}
                value={filtroAsignacion}
                onChange={(e) => setFiltroAsignacion(e.target.value as any)}
              >
                <option value="sin_asignar">Solo Sin Asignar</option>
                <option value="todos_activos">Todos los Activos</option>
              </select>

              <select
                className="input-base"
                style={{ fontSize: 11.5, flex: "1 1 100px" }}
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
              >
                <option value="">Todas las prioridades</option>
                <option value="P1">P1 - Crítica</option>
                <option value="P2">P2 - Alta</option>
                <option value="P3">P3 - Media</option>
                <option value="P4">P4 - Baja</option>
              </select>

              <select
                className="input-base"
                style={{ fontSize: 11.5, flex: "1 1 100px" }}
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="INCIDENTE">Incidentes</option>
                <option value="SOLICITUD">Solicitudes</option>
              </select>
            </div>
          </div>

          {/* Lista de Tickets */}
          {ticketsFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#64748b", fontSize: 12.5, backgroundColor: "#f8fafc", borderRadius: 6 }}>
              No hay tickets pendientes con los filtros aplicados.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "650px", overflowY: "auto", paddingRight: 4 }}>
              {ticketsFiltrados.map((t) => {
                const esActivo = ticketSeleccionado?.id_ticket === t.id_ticket;
                const sinTecnico = !t.id_usuario_asignado;

                return (
                  <div
                    key={t.id_ticket}
                    onClick={() => {
                      setTicketSeleccionado(t);
                      setMensajeExito(null);
                      setErrorAsignacion(null);
                    }}
                    style={{
                      border: `2px solid ${esActivo ? "#2563eb" : "#e2e8f0"}`,
                      borderRadius: 6,
                      padding: "10px 12px",
                      backgroundColor: esActivo ? "#eff6ff" : sinTecnico ? "#fffdfa" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <strong style={{ fontSize: 12, color: "#1e293b" }}>{t.codigo_ticket}</strong>
                        <span className={`badge-itil ${t.tipo_codigo === "INCIDENTE" ? "badge-tipo-incidente" : "badge-tipo-solicitud"}`} style={{ fontSize: 9.5 }}>
                          {t.tipo_codigo === "INCIDENTE" ? "Incidente" : "Solicitud"}
                        </span>
                        <span className={`badge-itil badge-prioridad-${t.prioridad_codigo?.toLowerCase()}`} style={{ fontSize: 9.5 }}>
                          {t.prioridad_codigo}
                        </span>
                      </div>

                      {t.sla_vencido ? (
                        <span className="badge-itil badge-sla-vencido" style={{ fontSize: 9.5 }}>
                          SLA vencido
                        </span>
                      ) : (
                        <span className="badge-itil badge-sla-ok" style={{ fontSize: 9.5 }}>
                          SLA ok
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                      {t.titulo}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748b" }}>
                      <span>{t.categoria_nombre}</span>
                      <span style={{ fontWeight: 500, color: sinTecnico ? "#d97706" : "#475569" }}>
                        {sinTecnico ? "Sin especialista asignado" : `Asignado: ${t.tecnico_nombre}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Despacho y Asignación */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 16,
            position: "sticky",
            top: 20,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "#1e293b" }}>
            Motor de Asignación y Selección de Especialista
          </h3>

          {!ticketSeleccionado ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 24px",
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                border: "1px dashed #cbd5e1",
                color: "#64748b",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#334155" }}>
                Ningún ticket seleccionado
              </div>
              <p style={{ fontSize: 11.5, margin: 0 }}>
                Haga clic en cualquiera de los tickets de la bandeja izquierda para ver las recomendaciones del motor ITIL 4 y asignar un técnico disponible.
              </p>
            </div>
          ) : (
            <div>
              {/* Tarjeta de Resumen del Ticket Activo */}
              <div
                style={{
                  backgroundColor: "#f1f5f9",
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#475569" }}>TICKET SELECCIONADO</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {ticketSeleccionado.codigo_ticket} - {ticketSeleccionado.titulo}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="boton-mini"
                    onClick={() => setVerDetalleModalId(ticketSeleccionado.id_ticket)}
                    title="Ver detalle completo del ticket"
                    aria-label="Ver detalle completo del ticket"
                    style={{ padding: "5px 8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: "#334155" }}>
                  <div>
                    <strong>Categoría:</strong> {ticketSeleccionado.categoria_nombre}
                  </div>
                  <div>
                    <strong>Prioridad:</strong> {ticketSeleccionado.prioridad_codigo} ({ticketSeleccionado.prioridad_nombre})
                  </div>
                  <div>
                    <strong>Solicitante:</strong> {ticketSeleccionado.solicitante_nombre}
                  </div>
                  <div>
                    <strong>Técnico actual:</strong> {ticketSeleccionado.tecnico_nombre || "Sin asignar"}
                  </div>
                </div>
              </div>

              {/* Filtro por Departamento para Asignar */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Filtrar especialistas por Departamento TI:
                </label>
                <select
                  className="input-base"
                  style={{ width: "100%", fontSize: 12 }}
                  value={deptoTecnicoFiltro}
                  onChange={(e) => setDeptoTecnicoFiltro(e.target.value)}
                >
                  <option value="">Todos los departamentos</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.codigo} - {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nota opcional para la asignación */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Nota interna de despacho (opcional):
                </label>
                <input
                  type="text"
                  className="input-base"
                  style={{ width: "100%", fontSize: 11.5 }}
                  placeholder="Instrucciones específicas para el especialista..."
                  value={notaAsignacion}
                  onChange={(e) => setNotaAsignacion(e.target.value)}
                />
              </div>

              {/* Lista de Técnicos Candidatos con Carga WIP */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                  Especialistas Candidatos ({tecnicosFiltrados.length})
                </span>
                <span style={{ fontSize: 10.5, color: "#64748b" }}>
                  Ordenados por disponibilidad y menor carga WIP
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "420px", overflowY: "auto" }}>
                {tecnicosFiltrados.map((tec) => {
                  const esActual = ticketSeleccionado.id_usuario_asignado === tec.id_usuario;
                  const esRecomendado = tec.id_usuario === idTecnicoRecomendado;
                  const cfgEstado = ESTADOS_OPERATIVOS[tec.estado_operativo] || ESTADOS_OPERATIVOS.DISPONIBLE;
                  const porcentaje = tec.porcentaje_ocupacion || 0;
                  const colorProgreso = porcentaje >= 80 ? "#dc2626" : porcentaje >= 50 ? "#f59e0b" : "#10b981";

                  return (
                    <div
                      key={tec.id_usuario}
                      style={{
                        border: `1.5px solid ${esRecomendado ? "#3b82f6" : esActual ? "#10b981" : "#e2e8f0"}`,
                        borderRadius: 6,
                        padding: "10px 12px",
                        backgroundColor: esRecomendado ? "#f8faff" : "#ffffff",
                      }}
                    >
                      {esRecomendado && (
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#1d4ed8",
                            backgroundColor: "#dbeafe",
                            padding: "2px 6px",
                            borderRadius: 4,
                            display: "inline-block",
                            marginBottom: 6,
                          }}
                        >
                          Recomendado por menor carga y disponibilidad
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div>
                          <strong style={{ fontSize: 12.5, color: "#111827", display: "block" }}>
                            {tec.nombre_completo}
                          </strong>
                          <div style={{ fontSize: 10.5, color: "#64748b" }}>
                            {tec.departamento_nombre} | Nivel {tec.nivel_soporte}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 4,
                            backgroundColor: cfgEstado.bg,
                            color: cfgEstado.color,
                          }}
                        >
                          {cfgEstado.etiqueta}
                        </span>
                      </div>

                      {/* Medidor de Capacidad WIP */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 2 }}>
                          <span style={{ color: "#64748b" }}>Carga WIP ({tec.tickets_activos}/{tec.capacidad_maxima_tickets} tickets):</span>
                          <strong style={{ color: colorProgreso }}>{porcentaje}%</strong>
                        </div>
                        <div style={{ width: "100%", height: 5, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${Math.min(100, porcentaje)}%`,
                              height: "100%",
                              backgroundColor: colorProgreso,
                            }}
                          />
                        </div>
                      </div>

                      {tec.especialidad_principal && (
                        <div style={{ fontSize: 10.5, color: "#475569", marginBottom: 8, fontStyle: "italic" }}>
                          Especialidad: {tec.especialidad_principal}
                        </div>
                      )}

                      <button
                        type="button"
                        className="boton-mini"
                        disabled={asignando || esActual}
                        onClick={() => ejecutarAsignacion(tec.id_usuario, tec.nombre_completo)}
                        style={{
                          width: "100%",
                          fontSize: 11,
                          backgroundColor: esActual ? "#f1f5f9" : esRecomendado ? "#2563eb" : "#ffffff",
                          color: esActual ? "#64748b" : esRecomendado ? "#ffffff" : "#1e293b",
                          borderColor: esRecomendado ? "#2563eb" : "#cbd5e1",
                          fontWeight: 600,
                        }}
                      >
                        {esActual
                          ? "Actualmente asignado a este ticket"
                          : asignando
                          ? "Asignando..."
                          : `Asignar ticket a ${tec.nombres}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Inspección Detallada */}
      {verDetalleModalId !== null && (
        <ModalDetalleTicket
          idTicket={verDetalleModalId}
          onCerrar={() => setVerDetalleModalId(null)}
          onActualizado={cargarDatos}
        />
      )}
    </div>
  );
}
