"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Ticket, CatalogosTickets, DepartamentoTI } from "@/types";
import ModalDetalleTicket from "@/components/ModalDetalleTicket";

interface Props {
  vista: "mios" | "bandeja" | "asignados" | "resueltos" | "todos" | "asignar" | "departamento" | "auditoria" | "aprobaciones";
  titulo: string;
  descripcion: string;
  tipoInicial?: string; // "1" = Incidente, "2" = Solicitud, etc.
  tipoFijo?: "1" | "2";
}

export default function TablaTickets({ vista, titulo, descripcion, tipoInicial, tipoFijo }: Props) {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosTickets | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoTI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros aplicados
  const [filtroTipo, setFiltroTipo] = useState<string>(tipoInicial || "");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroDepto, setFiltroDepto] = useState<string>("");
  const [filtroSlaVencido, setFiltroSlaVencido] = useState<string>("");
  const [filtroSolicitante, setFiltroSolicitante] = useState<string>("");
  const [filtroTecnico, setFiltroTecnico] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modal Flotante de Filtros Avanzados
  const [modalFiltrosAbierto, setModalFiltrosAbierto] = useState(false);
  // Estados temporales dentro del modal
  const [tempTipo, setTempTipo] = useState<string>(tipoInicial || "");
  const [tempPrioridad, setTempPrioridad] = useState<string>("");
  const [tempEstado, setTempEstado] = useState<string>("");
  const [tempDepto, setTempDepto] = useState<string>("");
  const [tempSlaVencido, setTempSlaVencido] = useState<string>("");
  const [tempSolicitante, setTempSolicitante] = useState<string>("");
  const [tempTecnico, setTempTecnico] = useState<string>("");
  const [tempBusqueda, setTempBusqueda] = useState<string>("");

  // Modal de detalle del ticket
  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState<number | null>(null);

  async function cargarCatalogosYDeptos() {
    try {
      const [resCat, resDeptos] = await Promise.all([
        fetch("/api/tickets/catalogos").then((r) => r.json()),
        fetch("/api/departamentos-ti").then((r) => r.json()),
      ]);
      setCatalogos(resCat);
      setDepartamentos(resDeptos.departamentos || []);
    } catch (err) {
      console.error("Error al cargar catalogos:", err);
    }
  }

  useEffect(() => {
    cargarCatalogosYDeptos();
  }, []);

  async function cargarTickets() {
    setCargando(true);
    setError(null);
    try {
      if (filtroTipo === "problemas") {
        const res = await fetch("/api/problemas");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No se pudieron obtener los problemas");
          return;
        }
        let lista = data.problemas || [];
        if (busqueda.trim()) {
          const b = busqueda.toLowerCase().trim();
          lista = lista.filter((p: any) =>
            p.codigo_problema?.toLowerCase().includes(b) ||
            p.titulo?.toLowerCase().includes(b) ||
            p.usuario_creador_nombre?.toLowerCase().includes(b)
          );
        }
        const mapped: Ticket[] = lista.map((p: any) => ({
          id_ticket: p.id_problema,
          codigo_ticket: p.codigo_problema,
          tipo_codigo: "PROBLEMA",
          tipo_nombre: "Problema ITIL",
          titulo: p.titulo,
          descripcion: p.descripcion || (p.diagnostico_causa_raiz ? `Causa Raíz: ${p.diagnostico_causa_raiz}` : "Investigación de causa raíz ITIL"),
          prioridad_codigo: p.prioridad_nombre || "Media",
          prioridad_nombre: p.prioridad_nombre || "Media",
          estado_nombre: p.estado_nombre || "Registrado",
          estado_color: "#7c3aed",
          sla_vencido: false,
          solicitante_nombre: p.usuario_creador_nombre || "Coordinador ITIL",
          solicitante_correo: p.usuario_creador_correo || "",
          departamento_nombre: p.departamento_nombre || "TI",
          tecnico_nombre: p.investigador_nombre || "Equipo Problemas",
          fecha_creacion: p.fecha_creacion,
          id_tipo_ticket: 3,
          id_prioridad: p.id_prioridad,
          id_estado: p.id_estado,
        }));
        setTickets(mapped);
        return;
      }

      if (filtroTipo === "cambios") {
        const res = await fetch("/api/cambios");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No se pudieron obtener las solicitudes de cambio");
          return;
        }
        let lista = data.cambios || [];
        if (busqueda.trim()) {
          const b = busqueda.toLowerCase().trim();
          lista = lista.filter((c: any) =>
            c.codigo_cambio?.toLowerCase().includes(b) ||
            c.titulo?.toLowerCase().includes(b) ||
            c.solicitante_nombre?.toLowerCase().includes(b)
          );
        }
        const mapped: Ticket[] = lista.map((c: any) => ({
          id_ticket: c.id_cambio,
          codigo_ticket: c.codigo_cambio,
          tipo_codigo: "CAMBIO",
          tipo_nombre: `RFC ${c.tipo_cambio || ""}`.trim(),
          titulo: c.titulo,
          descripcion: c.descripcion || "Modificación técnica de infraestructura",
          prioridad_codigo: c.prioridad_nombre || "Media",
          prioridad_nombre: c.prioridad_nombre || "Media",
          estado_nombre: c.estado_nombre || "Registrado",
          estado_color: "#0284c7",
          sla_vencido: false,
          solicitante_nombre: c.solicitante_nombre || "Solicitante RFC",
          solicitante_correo: c.solicitante_correo || "",
          departamento_nombre: c.departamento_nombre || "Infraestructura",
          tecnico_nombre: c.coordinador_nombre || "Gestor de Cambios",
          fecha_creacion: c.fecha_creacion,
          id_tipo_ticket: 4,
          id_prioridad: c.id_prioridad,
          id_estado: c.id_estado,
        }));
        setTickets(mapped);
        return;
      }

      const params = new URLSearchParams();
      params.set("vista", vista);
      if (filtroTipo) params.set("id_tipo", filtroTipo);
      if (filtroPrioridad) params.set("id_prioridad", filtroPrioridad);
      if (filtroEstado) params.set("id_estado", filtroEstado);
      if (filtroDepto) params.set("id_departamento", filtroDepto);
      if (filtroSlaVencido) params.set("sla_vencido", filtroSlaVencido);
      if (filtroSolicitante.trim()) params.set("solicitante", filtroSolicitante.trim());
      if (filtroTecnico.trim()) params.set("tecnico", filtroTecnico.trim());
      if (busqueda.trim()) params.set("buscar", busqueda.trim());

      const endpoint = tipoFijo === "1" ? "/api/incidentes" : tipoFijo === "2" ? "/api/solicitudes" : "/api/tickets";
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudieron obtener los tickets");
        return;
      }
      setTickets(data.tickets || []);
    } catch {
      setError("Error de conexion al cargar tickets");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTickets();
  }, [vista, filtroTipo, filtroPrioridad, filtroEstado, filtroDepto, filtroSlaVencido, filtroSolicitante, filtroTecnico]);

  function abrirModalFiltros() {
    setTempTipo(filtroTipo);
    setTempPrioridad(filtroPrioridad);
    setTempEstado(filtroEstado);
    setTempDepto(filtroDepto);
    setTempSlaVencido(filtroSlaVencido);
    setTempSolicitante(filtroSolicitante);
    setTempTecnico(filtroTecnico);
    setTempBusqueda(busqueda);
    setModalFiltrosAbierto(true);
  }

  function aplicarFiltrosModal(e?: FormEvent) {
    if (e) e.preventDefault();
    setFiltroTipo(tempTipo);
    setFiltroPrioridad(tempPrioridad);
    setFiltroEstado(tempEstado);
    setFiltroDepto(tempDepto);
    setFiltroSlaVencido(tempSlaVencido);
    setFiltroSolicitante(tempSolicitante);
    setFiltroTecnico(tempTecnico);
    setBusqueda(tempBusqueda);
    setModalFiltrosAbierto(false);
  }

  function limpiarFiltros() {
    setTempTipo("");
    setTempPrioridad("");
    setTempEstado("");
    setTempDepto("");
    setTempSlaVencido("");
    setTempSolicitante("");
    setTempTecnico("");
    setTempBusqueda("");
    setFiltroTipo("");
    setFiltroPrioridad("");
    setFiltroEstado("");
    setFiltroDepto("");
    setFiltroSlaVencido("");
    setFiltroSolicitante("");
    setFiltroTecnico("");
    setBusqueda("");
    setModalFiltrosAbierto(false);
  }

  // Contar cantidad de filtros activos
  let filtrosActivosCount = 0;
  if (filtroTipo) filtrosActivosCount++;
  if (filtroPrioridad) filtrosActivosCount++;
  if (filtroEstado) filtrosActivosCount++;
  if (filtroDepto) filtrosActivosCount++;
  if (filtroSlaVencido) filtrosActivosCount++;
  if (filtroSolicitante.trim()) filtrosActivosCount++;
  if (filtroTecnico.trim()) filtrosActivosCount++;
  if (busqueda.trim()) filtrosActivosCount++;

  return (
    <div className="vista-contenedor">
      {/* Cabecera de Página */}
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>{titulo}</h1>
          <p className="subtitulo">
            {descripcion}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="boton-primario"
            onClick={abrirModalFiltros}
            style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", fontSize: 13 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filtrar</span>
            {filtrosActivosCount > 0 && (
              <span
                style={{
                  backgroundColor: "#ffffff",
                  color: "#2563eb",
                  borderRadius: "999px",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 6px",
                  marginLeft: 2,
                }}
              >
                {filtrosActivosCount}
              </span>
            )}
          </button>

          <button
            className="boton-mini"
            onClick={cargarTickets}
            disabled={cargando}
            title="Actualizar lista de tickets"
            aria-label="Actualizar lista de tickets"
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

      {/* Pestañas de Acceso Rápido por Tipo de Ticket */}
      {!tipoFijo && <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 10, overflowX: "auto" }}>
        {[
          { id: "", label: "Todos los Tipos" },
          { id: "1", label: "Incidentes" },
          { id: "2", label: "Solicitudes de Servicio" },
          ...(vista === "todos" ? [
            { id: "problemas", label: "Problemas ITIL" },
            { id: "cambios", label: "Cambios RFC" },
          ] : []),
        ].map((tab) => {
          const activo = filtroTipo === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroTipo(tab.id)}
              style={{
                background: activo ? "#eff6ff" : "transparent",
                color: activo ? "#1d4ed8" : "#64748b",
                border: activo ? "1px solid #bfdbfe" : "1px solid transparent",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: activo ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>}

      {/* Barra de Búsqueda Rápida y Chips de Filtros Activos */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
          <span style={{ position: "absolute", left: 10, top: 10, color: "#94a3b8", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="input-base"
            placeholder="Buscar por código (ej. INC-2026-0001), título o solicitante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") cargarTickets(); }}
            style={{ width: "100%", paddingLeft: 32, fontSize: 13 }}
          />
        </div>

        {filtrosActivosCount > 0 && (
          <button
            type="button"
            className="boton-mini"
            onClick={limpiarFiltros}
            style={{ color: "#dc2626", borderColor: "#fca5a5", backgroundColor: "#fef2f2", fontSize: 12, padding: "7px 12px" }}
          >
            Limpiar {filtrosActivosCount} filtro(s)
          </button>
        )}
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Tabla de Tickets */}
      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: "36px 20px", textAlign: "center", color: "#64748b" }}>
          Consultando tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="contenedor-tabla" style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
          No se encontraron tickets con los criterios y filtros especificados.
        </div>
      ) : (
        <div className="contenedor-tabla">
          <div style={{ overflowX: "auto" }}>
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Código</th>
                  <th style={{ width: 100 }}>Tipo</th>
                  <th>Título y Descripción</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>SLA</th>
                  <th>Solicitante</th>
                  <th>Área / Técnico</th>
                  <th style={{ textAlign: "center", width: 100 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id_ticket}>
                    <td>
                      <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                        {t.codigo_ticket}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge-itil ${t.tipo_codigo === "INCIDENTE" ? "badge-tipo-incidente" : "badge-tipo-solicitud"}`}>
                        {t.tipo_nombre}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{t.titulo}</div>
                      <div style={{ fontSize: 11.5, color: "#64748b", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.descripcion}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-itil badge-prioridad-${t.prioridad_codigo?.toLowerCase()}`}>
                        {t.prioridad_codigo} - {t.prioridad_nombre}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: `${t.estado_color}20`,
                          color: t.estado_color,
                          border: `1px solid ${t.estado_color}`,
                          fontWeight: 700,
                        }}
                      >
                        {t.estado_nombre}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: t.sla_vencido ? "#dc2626" : "#16a34a" }}>
                        {t.sla_vencido ? "Vencido" : "En plazo"}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12.5 }}>{t.solicitante_nombre}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{t.solicitante_correo}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{t.departamento_nombre || "General"}</div>
                      <div style={{ fontSize: 11, color: t.tecnico_nombre ? "#16a34a" : "#d97706" }}>
                        {t.tecnico_nombre ? t.tecnico_nombre : "Sin asignar"}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => {
                          if (t.tipo_codigo === "PROBLEMA") {
                            router.push("/problemas");
                          } else if (t.tipo_codigo === "CAMBIO" || t.tipo_codigo?.startsWith("CAMBIO") || t.tipo_nombre?.includes("RFC") || t.codigo_ticket?.startsWith("RFC")) {
                            router.push("/cambios/gestion/todos");
                          } else {
                            setTicketSeleccionadoId(t.id_ticket);
                          }
                        }}
                        style={{ fontSize: 12, padding: "5px 10px" }}
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FLOTANTE DE FILTROS AVANZADOS (SOLICITADO POR EL USUARIO) */}
      {modalFiltrosAbierto && (
        <div className="modal-overlay" onClick={() => setModalFiltrosAbierto(false)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 580, padding: 24, backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  Filtros Avanzados de Tickets
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                  Seleccione los criterios para segmentar la información en la consola.
                </p>
              </div>
              <button
                type="button"
                className="modal-cerrar-boton"
                onClick={() => setModalFiltrosAbierto(false)}
                title="Cerrar modal de filtros"
                aria-label="Cerrar modal de filtros"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={aplicarFiltrosModal}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                {!tipoFijo && <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Tipo de Ticket</label>
                  <select
                    className="input-base"
                    value={tempTipo}
                    onChange={(e) => setTempTipo(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="1">Incidentes</option>
                    <option value="2">Solicitudes de Servicio</option>
                    {vista === "todos" && (
                      <>
                        <option value="problemas">Problemas ITIL</option>
                        <option value="cambios">Cambios RFC</option>
                      </>
                    )}
                  </select>
                </div>}

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Prioridad ITIL</label>
                  <select
                    className="input-base"
                    value={tempPrioridad}
                    onChange={(e) => setTempPrioridad(e.target.value)}
                  >
                    <option value="">Todas las prioridades</option>
                    {catalogos?.prioridades.map((p) => (
                      <option key={p.id_prioridad} value={p.id_prioridad}>
                        {p.codigo} - {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Estado de Atención</label>
                  <select
                    className="input-base"
                    value={tempEstado}
                    onChange={(e) => setTempEstado(e.target.value)}
                  >
                    <option value="">Todos los estados</option>
                    {catalogos?.estados.map((est) => (
                      <option key={est.id_estado} value={est.id_estado}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Departamento Resolutor</label>
                  <select
                    className="input-base"
                    value={tempDepto}
                    onChange={(e) => setTempDepto(e.target.value)}
                  >
                    <option value="">Todos los departamentos</option>
                    {departamentos.map((d) => (
                      <option key={d.id_departamento} value={d.id_departamento}>
                        [{d.codigo}] {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Compromiso SLA</label>
                  <select
                    className="input-base"
                    value={tempSlaVencido}
                    onChange={(e) => setTempSlaVencido(e.target.value)}
                  >
                    <option value="">Todos los acuerdos</option>
                    <option value="0">Dentro de SLA (En Plazo)</option>
                    <option value="1">SLA Vencido</option>
                  </select>
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Término en Título/Código</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. INC-2026 o VPN..."
                    value={tempBusqueda}
                    onChange={(e) => setTempBusqueda(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Solicitante</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Nombre o correo del solicitante..."
                    value={tempSolicitante}
                    onChange={(e) => setTempSolicitante(e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Técnico Asignado</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Nombre o correo del técnico..."
                    value={tempTecnico}
                    onChange={(e) => setTempTecnico(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <button
                  type="button"
                  className="boton-mini"
                  onClick={limpiarFiltros}
                  style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                >
                  Restablecer todo
                </button>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={() => setModalFiltrosAbierto(false)}
                    style={{ width: "auto", padding: "7px 14px", fontSize: 13 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="boton-primario"
                    style={{ width: "auto", padding: "7px 20px", fontSize: 13 }}
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle del Ticket Seleccionado */}
      {ticketSeleccionadoId !== null && (
        <ModalDetalleTicket
          idTicket={ticketSeleccionadoId}
          apiBase={tipoFijo === "1" ? "/api/incidentes" : tipoFijo === "2" ? "/api/solicitudes" : "/api/tickets"}
          onCerrar={() => setTicketSeleccionadoId(null)}
          onActualizado={cargarTickets}
        />
      )}
    </div>
  );
}
