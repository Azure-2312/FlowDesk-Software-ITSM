"use client";

import { useEffect, useState } from "react";
import { Ticket, DepartamentoTI, TecnicoConCarga } from "@/types";
import ModalDetalleTicket from "@/components/ModalDetalleTicket";

const ESTADOS_OPERATIVOS = [
  { clave: "DISPONIBLE", etiqueta: "Disponible", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" },
  { clave: "EN_ATENCION", etiqueta: "En atención", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { clave: "EN_GUARDIA", etiqueta: "En guardia", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { clave: "EN_RECESO", etiqueta: "En receso", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { clave: "VACACIONES", etiqueta: "Vacaciones", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
];

export default function PaginaSupervisionTecnicos() {
  const [tecnicos, setTecnicos] = useState<TecnicoConCarga[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoTI[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState<number | null>(null);
  const [tecnicoFiltroId, setTecnicoFiltroId] = useState<number | null>(null);

  // Filtros
  const [filtroDepto, setFiltroDepto] = useState<string>("");
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  async function cargar() {
    setCargando(true);
    try {
      const [resTecnicos, resDeptos, resTickets] = await Promise.all([
        fetch("/api/tecnicos").then((r) => r.json()),
        fetch("/api/departamentos-ti").then((r) => r.json()),
        fetch("/api/tickets?vista=todos").then((r) => r.json()),
      ]);

      setTecnicos(resTecnicos.tecnicos || []);
      setDepartamentos(resDeptos.departamentos || []);
      setTickets(resTickets.tickets || []);
    } catch {
      console.error("Error al cargar datos de supervision tecnica");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstadoOperativo(idUsuario: number, nuevoEstado: string) {
    setActualizandoId(idUsuario);
    try {
      const res = await fetch(`/api/tecnicos/${idUsuario}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_operativo: nuevoEstado }),
      });

      if (res.ok) {
        setTecnicos((prev) =>
          prev.map((t) =>
            t.id_usuario === idUsuario
              ? { ...t, estado_operativo: nuevoEstado as any }
              : t
          )
        );
      } else {
        const data = await res.json();
        alert(data.error || "No se pudo actualizar la disponibilidad operativa");
      }
    } catch {
      alert("Error de comunicacion al actualizar disponibilidad");
    } finally {
      setActualizandoId(null);
    }
  }

  // Filtrado de técnicos
  const tecnicosFiltrados = tecnicos.filter((t) => {
    if (filtroDepto && t.id_departamento !== parseInt(filtroDepto, 10)) return false;
    if (filtroNivel && t.nivel_soporte !== parseInt(filtroNivel, 10)) return false;
    if (filtroEstado && t.estado_operativo !== filtroEstado) return false;
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      const coincideNombre = t.nombre_completo.toLowerCase().includes(b);
      const coincideCorreo = t.correo_electronico.toLowerCase().includes(b);
      const coincideEspecialidad = (t.especialidad_principal || "").toLowerCase().includes(b);
      if (!coincideNombre && !coincideCorreo && !coincideEspecialidad) return false;
    }
    return true;
  });

  // Métricas globales
  const totalTecnicos = tecnicos.length;
  const disponibles = tecnicos.filter((t) => t.estado_operativo === "DISPONIBLE").length;
  const sobrecargados = tecnicos.filter((t) => t.porcentaje_ocupacion >= 80).length;
  const criticosActivos = tecnicos.reduce((acc, t) => acc + (t.tickets_criticos || 0), 0);
  const slaVencidos = tecnicos.reduce((acc, t) => acc + (t.tickets_sla_vencido || 0), 0);

  // Tickets a mostrar
  const ticketsAMostrar = tecnicoFiltroId
    ? tickets.filter((t) => t.id_usuario_asignado === tecnicoFiltroId)
    : tickets;

  const tecnicoSeleccionado = tecnicos.find((t) => t.id_usuario === tecnicoFiltroId);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Supervisión y Monitoreo del Equipo Técnico</h1>
          <p>
            Supervisión operativa ITIL 4: balance de capacidad WIP, disponibilidad operativa, cumplimiento de SLA y especialidades por departamento.
          </p>
        </div>
        <button
          className="boton-mini"
          onClick={cargar}
          disabled={cargando}
          title="Actualizar datos"
          aria-label="Actualizar datos"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
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

      {/* Tarjetas de Indicadores Operativos (KPIs) */}
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
            borderLeft: "4px solid #2563eb",
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>TOTAL ESPECIALISTAS</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>{totalTecnicos}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{departamentos.length} departamentos TI</div>
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
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>DISPONIBLES AHORA</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#059669", marginTop: 2 }}>{disponibles}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Listos para asignación</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: `4px solid ${sobrecargados > 0 ? "#dc2626" : "#cbd5e1"}`,
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SOBRECARGA WIP (&gt;=80%)</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: sobrecargados > 0 ? "#dc2626" : "#475569", marginTop: 2 }}>
            {sobrecargados}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Límite de capacidad</div>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
            borderLeft: `4px solid ${criticosActivos > 0 ? "#ea580c" : "#cbd5e1"}`,
          }}
        >
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>CRÍTICOS P1/P2 EN CURSO</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: criticosActivos > 0 ? "#ea580c" : "#475569", marginTop: 2 }}>
            {criticosActivos}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Alta prioridad</div>
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
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>SLA VENCIDO ACTIVO</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: slaVencidos > 0 ? "#b91c1c" : "#475569", marginTop: 2 }}>
            {slaVencidos}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Requieren escalamiento</div>
        </div>
      </div>

      {/* Barra de Filtros Limpia */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          backgroundColor: "transparent",
          marginBottom: 20,
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <input
            type="text"
            className="input-base"
            style={{ width: "100%", fontSize: 12 }}
            placeholder="Buscar técnico por nombre, correo o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <select
            className="input-base"
            style={{ width: "100%", fontSize: 12 }}
            value={filtroDepto}
            onChange={(e) => setFiltroDepto(e.target.value)}
          >
            <option value="">Todos los departamentos</option>
            {departamentos.map((d) => (
              <option key={d.id_departamento} value={d.id_departamento}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 120 }}>
          <select
            className="input-base"
            style={{ width: "100%", fontSize: 12 }}
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
          >
            <option value="">Todos los niveles</option>
            <option value="1">Nivel 1 (Mesa)</option>
            <option value="2">Nivel 2 (Campo/Redes)</option>
            <option value="3">Nivel 3 (Sistemas/Sec)</option>
          </select>
        </div>

        <div style={{ minWidth: 130 }}>
          <select
            className="input-base"
            style={{ width: "100%", fontSize: 12 }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todas las disponibilidades</option>
            {ESTADOS_OPERATIVOS.map((eo) => (
              <option key={eo.clave} value={eo.clave}>
                {eo.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {(filtroDepto || filtroNivel || filtroEstado || busqueda) && (
          <button
            type="button"
            className="boton-mini"
            style={{ fontSize: 11 }}
            onClick={() => {
              setFiltroDepto("");
              setFiltroNivel("");
              setFiltroEstado("");
              setBusqueda("");
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de Técnicos y Carga de Trabajo */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, color: "#334155" }}>
            Especialistas Técnicos ({tecnicosFiltrados.length})
          </h3>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            Haga clic en una tarjeta para filtrar los tickets asignados a ese técnico.
          </span>
        </div>

        {tecnicosFiltrados.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: 8 }}>
            No se encontraron técnicos con los filtros seleccionados.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            {tecnicosFiltrados.map((tec) => {
              const esSeleccionado = tecnicoFiltroId === tec.id_usuario;
              const cfgEstado = ESTADOS_OPERATIVOS.find((e) => e.clave === tec.estado_operativo) || ESTADOS_OPERATIVOS[0];
              const porcentaje = tec.porcentaje_ocupacion || 0;
              const colorProgreso = porcentaje >= 80 ? "#dc2626" : porcentaje >= 50 ? "#f59e0b" : "#10b981";

              return (
                <div
                  key={tec.id_usuario}
                  style={{
                    backgroundColor: esSeleccionado ? "#eff6ff" : "#ffffff",
                    border: `2px solid ${esSeleccionado ? "#2563eb" : "#e2e8f0"}`,
                    borderRadius: 8,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: esSeleccionado ? "0 4px 12px rgba(37, 99, 235, 0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Cabecera del Técnico */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                      <div
                        onClick={() => setTecnicoFiltroId(esSeleccionado ? null : tec.id_usuario)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        <strong style={{ fontSize: 13.5, color: "#111827", display: "block" }}>
                          {tec.nombre_completo}
                        </strong>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{tec.correo_electronico}</div>
                      </div>

                      {/* Selector de Estado Operativo Rápido */}
                      <select
                        aria-label="Estado operativo del técnico"
                        value={tec.estado_operativo}
                        disabled={actualizandoId === tec.id_usuario}
                        onChange={(e) => cambiarEstadoOperativo(tec.id_usuario, e.target.value)}
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: `1px solid ${cfgEstado.border}`,
                          backgroundColor: cfgEstado.bg,
                          color: cfgEstado.color,
                          cursor: "pointer",
                        }}
                      >
                        {ESTADOS_OPERATIVOS.map((eo) => (
                          <option key={eo.clave} value={eo.clave}>
                            {eo.etiqueta}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Etiquetas de Departamento y Nivel */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          fontWeight: 600,
                        }}
                      >
                        Nivel {tec.nivel_soporte}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: "#f0fdf4",
                          color: "#166534",
                          border: "1px solid #bbf7d0",
                        }}
                      >
                        {tec.departamento_nombre || "Sin depto"}
                      </span>
                    </div>

                    {tec.especialidad_principal && (
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 6, fontStyle: "italic" }}>
                        Esp: {tec.especialidad_principal}
                      </div>
                    )}
                  </div>

                  {/* Barra de Capacidad y Carga WIP */}
                  <div
                    onClick={() => setTecnicoFiltroId(esSeleccionado ? null : tec.id_usuario)}
                    style={{ cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "#64748b" }}>Carga WIP ({tec.tickets_activos}/{tec.capacidad_maxima_tickets}):</span>
                      <strong style={{ color: colorProgreso }}>{porcentaje}%</strong>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        backgroundColor: "#f1f5f9",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, porcentaje)}%`,
                          height: "100%",
                          backgroundColor: colorProgreso,
                          borderRadius: 3,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Métricas Detalladas */}
                  <div
                    onClick={() => setTecnicoFiltroId(esSeleccionado ? null : tec.id_usuario)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 4,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ backgroundColor: "#f8fafc", padding: "5px 6px", borderRadius: 4, textAlign: "center" }}>
                      <span style={{ color: "#64748b", display: "block", fontSize: 10 }}>Resueltos</span>
                      <strong style={{ color: "#059669" }}>{tec.tickets_resueltos}</strong>
                    </div>
                    <div style={{ backgroundColor: "#f8fafc", padding: "5px 6px", borderRadius: 4, textAlign: "center" }}>
                      <span style={{ color: "#64748b", display: "block", fontSize: 10 }}>P1/P2</span>
                      <strong style={{ color: tec.tickets_criticos > 0 ? "#ea580c" : "#64748b" }}>
                        {tec.tickets_criticos}
                      </strong>
                    </div>
                    <div style={{ backgroundColor: "#f8fafc", padding: "5px 6px", borderRadius: 4, textAlign: "center" }}>
                      <span style={{ color: "#64748b", display: "block", fontSize: 10 }}>SLA Venc</span>
                      <strong style={{ color: tec.tickets_sla_vencido > 0 ? "#dc2626" : "#64748b" }}>
                        {tec.tickets_sla_vencido}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="boton-mini"
                    style={{
                      width: "100%",
                      fontSize: 11,
                      backgroundColor: esSeleccionado ? "#2563eb" : "#f8fafc",
                      color: esSeleccionado ? "#ffffff" : "#334155",
                      borderColor: esSeleccionado ? "#2563eb" : "#cbd5e1",
                    }}
                    onClick={() => setTecnicoFiltroId(esSeleccionado ? null : tec.id_usuario)}
                  >
                    {esSeleccionado ? "Quitar filtro" : "Ver tickets asignados"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla de Tickets Asignados o Generales */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14.5, margin: 0, color: "#111827" }}>
              {tecnicoSeleccionado
                ? `Tickets de ${tecnicoSeleccionado.nombre_completo} (${ticketsAMostrar.length})`
                : `Todos los tickets del equipo de soporte (${ticketsAMostrar.length})`}
            </h3>
            <span style={{ fontSize: 11, color: "#64748b" }}>
              {tecnicoSeleccionado
                ? `Departamento: ${tecnicoSeleccionado.departamento_nombre || "N/A"} - Nivel ${tecnicoSeleccionado.nivel_soporte}`
                : "Monitoreo general de tickets asignados y en progreso"}
            </span>
          </div>

          {tecnicoFiltroId && (
            <button
              type="button"
              className="boton-mini"
              onClick={() => setTecnicoFiltroId(null)}
              style={{ fontSize: 11.5 }}
            >
              Mostrar todos los tickets
            </button>
          )}
        </div>

        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Título / Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>SLA</th>
                <th>Técnico Asignado</th>
                <th style={{ textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ticketsAMostrar.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                    No hay tickets para mostrar con el filtro actual.
                  </td>
                </tr>
              ) : (
                ticketsAMostrar.map((t) => (
                  <tr key={t.id_ticket}>
                    <td style={{ fontWeight: 700, fontSize: 12 }}>{t.codigo_ticket}</td>
                    <td>
                      <span className={`badge-itil ${t.tipo_codigo === "INCIDENTE" ? "badge-tipo-incidente" : "badge-tipo-solicitud"}`}>
                        {t.tipo_codigo === "INCIDENTE" ? "Incidente" : "Solicitud"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 12.5 }}>{t.titulo}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{t.categoria_nombre}</div>
                    </td>
                    <td>
                      <span className={`badge-itil badge-prioridad-${t.prioridad_codigo?.toLowerCase()}`}>
                        {t.prioridad_codigo}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge-itil"
                        style={{ backgroundColor: `${t.estado_color}20`, color: t.estado_color, border: `1px solid ${t.estado_color}` }}
                      >
                        {t.estado_nombre}
                      </span>
                    </td>
                    <td>
                      {t.sla_vencido ? (
                        <span className="badge-itil badge-sla-vencido">Vencido</span>
                      ) : t.pausa_sla ? (
                        <span className="badge-itil badge-sla-pausa">Pausado</span>
                      ) : (
                        <span className="badge-itil badge-sla-ok">A tiempo</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{t.tecnico_nombre || "Sin asignar"}</td>
                    <td style={{ textAlign: "center", width: 50 }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => setTicketSeleccionadoId(t.id_ticket)}
                        title="Ver detalle del ticket"
                        aria-label="Ver detalle del ticket"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ticketSeleccionadoId !== null && (
        <ModalDetalleTicket
          idTicket={ticketSeleccionadoId}
          onCerrar={() => setTicketSeleccionadoId(null)}
          onActualizado={cargar}
        />
      )}
    </div>
  );
}
