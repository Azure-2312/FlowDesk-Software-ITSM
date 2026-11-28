"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InvolucradoItem {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol_crisis: string;
  tipo: "tecnico" | "gestor_area" | "gestor_modulo" | "otro";
}

interface Comunicado {
  texto: string;
  fecha: string | null;
  usuario: string | null;
}

// Transiciones permitidas (misma regla que el servidor: shared/lib/incidente-mayor).
const OPCIONES_ESTADO: Record<string, { valor: string; etiqueta: string }[]> = {
  ABIERTO: [
    { valor: "ABIERTO", etiqueta: "ABIERTO (Crisis activa)" },
    { valor: "MITIGADO", etiqueta: "MITIGADO (Servicio restablecido)" },
    { valor: "CERRADO", etiqueta: "CERRADO (Resuelto)" },
  ],
  MITIGADO: [
    { valor: "MITIGADO", etiqueta: "MITIGADO (Servicio restablecido)" },
    { valor: "ABIERTO", etiqueta: "ABIERTO (Crisis reactivada)" },
    { valor: "CERRADO", etiqueta: "CERRADO (Resuelto)" },
  ],
  CERRADO: [{ valor: "CERRADO", etiqueta: "CERRADO (Resuelto)" }],
};

interface IncidenteMayor {
  id_incidente_mayor: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  severidad: string;
  estado: string;
  sala_virtual: string | null;
  comunicados: Comunicado[] | null;
  involucrados: InvolucradoItem[];
  fecha_declaracion: string;
  fecha_cierre: string | null;
  codigo_ticket: string | null;
  codigo_problema: string | null;
  id_problema: number | null;
  declarado_por: string | null;
  departamento_nombre: string | null;
}

export default function VistaIncidentesMayores() {
  const [items, setItems] = useState<IncidenteMayor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modal de Detalle / Expediente
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState<IncidenteMayor | null>(null);
  const [nuevoComunicado, setNuevoComunicado] = useState<string>("");
  const [guardandoComunicado, setGuardandoComunicado] = useState<boolean>(false);
  const [actualizandoEstado, setActualizandoEstado] = useState<boolean>(false);

  async function cargarIncidentes() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/incidentes-mayores?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(Array.isArray(json) ? json : []);
      } else {
        setError(json.error ?? "No se pudieron cargar los incidentes mayores.");
      }
    } catch {
      setError("Error de conexión al cargar los incidentes mayores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarIncidentes();
  }, []);

  // Mantener actualizado el expediente si se vuelve a cargar
  useEffect(() => {
    if (incidenteSeleccionado) {
      const actual = items.find((x) => x.id_incidente_mayor === incidenteSeleccionado.id_incidente_mayor);
      if (actual) setIncidenteSeleccionado(actual);
    }
  }, [items]);

  const filtrados = items.filter((im) => {
    if (filtroEstado !== "TODOS" && im.estado !== filtroEstado) return false;
    if (filtroSeveridad !== "TODOS" && im.severidad !== filtroSeveridad) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchCod = im.codigo.toLowerCase().includes(q);
      const matchTit = im.titulo.toLowerCase().includes(q);
      const matchDesc = im.descripcion?.toLowerCase().includes(q);
      if (!matchCod && !matchTit && !matchDesc) return false;
    }
    return true;
  });

  const totalAbiertos = items.filter((x) => x.estado === "ABIERTO").length;
  const totalMitigados = items.filter((x) => x.estado === "MITIGADO").length;
  const totalCerrados = items.filter((x) => x.estado === "CERRADO").length;

  async function cambiarEstado(idIncidente: number, nuevoEstado: string) {
    setActualizandoEstado(true);
    try {
      const res = await fetch("/api/tickets/incidentes-mayores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_incidente_mayor: idIncidente, estado: nuevoEstado }),
      });
      if (res.ok) {
        await cargarIncidentes();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo actualizar el estado.");
      }
    } catch {
      alert("Error de conexión al actualizar estado.");
    } finally {
      setActualizandoEstado(false);
    }
  }

  async function publicarComunicado(e: React.FormEvent) {
    e.preventDefault();
    if (!incidenteSeleccionado || !nuevoComunicado.trim()) return;

    setGuardandoComunicado(true);
    try {
      const res = await fetch("/api/tickets/incidentes-mayores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_incidente_mayor: incidenteSeleccionado.id_incidente_mayor,
          comunicado: nuevoComunicado.trim(),
        }),
      });
      if (res.ok) {
        setNuevoComunicado("");
        await cargarIncidentes();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo emitir el comunicado.");
      }
    } catch {
      alert("Error de conexión al emitir comunicado.");
    } finally {
      setGuardandoComunicado(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Incidentes Críticos & Sala de Crisis (ITIL v4)
          </span>
          <h1 className="titulo-pagina">
            Bandeja de Incidentes Mayores
          </h1>
          <p className="descripcion-pagina">
            Supervisión institucional, estado de contingencia y equipos multidisciplinarios involucrados ({filtrados.length} incidentes).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/plataforma/incidentes/mayores?vista=declarar"
            className="boton-peligro"
          >
            + Declarar Incidente Mayor
          </Link>
          <button className="boton-secundario"
            type="button"
            onClick={cargarIncidentes}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* 2. Tarjetas Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #fecaca", borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>Crisis Activas (Abiertos)</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626", marginTop: 4 }}>{totalAbiertos}</div>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>Requieren atención prioritaria</span>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #fed7aa", borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9a3412", textTransform: "uppercase" }}>En Mitigación</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ea580c", marginTop: 4 }}>{totalMitigados}</div>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>Servicio restablecido / bajo monitoreo</span>
        </div>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #bbf7d0", borderRadius: 8, padding: "14px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Cerrados / Resueltos</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#16a34a", marginTop: 4 }}>{totalCerrados}</div>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>Investigación post-incidente completada</span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 14,
          marginBottom: 16,
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            type="text"
            placeholder="Buscar por código (IM-...), título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
          />
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, backgroundColor: "#ffffff" }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="ABIERTO">Abiertos</option>
            <option value="MITIGADO">Mitigados</option>
            <option value="CERRADO">Cerrados</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Severidad:</label>
          <select
            value={filtroSeveridad}
            onChange={(e) => setFiltroSeveridad(e.target.value)}
            style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, backgroundColor: "#ffffff" }}
          >
            <option value="TODOS">Todas las severidades</option>
            <option value="P1">P1 - Crítica</option>
            <option value="P2">P2 - Alta</option>
          </select>
        </div>
      </div>

      {/* 4. Listado Principal */}
      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando incidentes mayores...</div>
      ) : error ? (
        <div style={{ padding: 16, backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c" }}>{error}</div>
      ) : filtrados.length === 0 ? (
        <div className="estado-vacio">
          No se encontraron incidentes mayores con los criterios seleccionados.
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "12px 16px" }}>Código</th>
                <th style={{ padding: "12px 16px" }}>Severidad</th>
                <th style={{ padding: "12px 16px" }}>Título & Resumen</th>
                <th style={{ padding: "12px 16px" }}>Estado</th>
                <th style={{ padding: "12px 16px" }}>Equipo Convocado</th>
                <th style={{ padding: "12px 16px" }}>Declarado por</th>
                <th style={{ padding: "12px 16px" }}>Fecha Inicio</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((im) => {
                const totalInvolucrados = Array.isArray(im.involucrados) ? im.involucrados.length : 0;
                return (
                  <tr
                    key={im.id_incidente_mayor}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: im.estado === "ABIERTO" ? "#fffafa" : "#ffffff",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                      {im.codigo}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 800,
                          backgroundColor: im.severidad === "P1" ? "#dc2626" : "#f97316",
                          color: "#ffffff",
                        }}
                      >
                        {im.severidad}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{im.titulo}</div>
                      {im.descripcion && (
                        <div style={{ fontSize: 11.5, color: "#64748b", maxWidth: 380, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {im.descripcion}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          backgroundColor:
                            im.estado === "ABIERTO"
                              ? "#fee2e2"
                              : im.estado === "MITIGADO"
                              ? "#ffedd5"
                              : "#dcfce7",
                          color:
                            im.estado === "ABIERTO"
                              ? "#991b1b"
                              : im.estado === "MITIGADO"
                              ? "#9a3412"
                              : "#166534",
                        }}
                      >
                        {im.estado}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 11.5,
                          fontWeight: 600,
                          backgroundColor: totalInvolucrados > 0 ? "#eff6ff" : "#f1f5f9",
                          color: totalInvolucrados > 0 ? "#1d4ed8" : "#64748b",
                        }}
                      >
                        {totalInvolucrados} miembros
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#334155", fontSize: 12.5 }}>
                      {im.declarado_por || "Supervisor TI"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                      {new Date(im.fecha_declaracion).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button className="boton-primario boton-sm"
                        type="button"
                        onClick={() => setIncidenteSeleccionado(im)}
                      >
                        Ver Expediente
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Modal / Expediente Completo del Incidente Mayor */}
      {incidenteSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Cabecera del Modal */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 800,
                      backgroundColor: incidenteSeleccionado.severidad === "P1" ? "#dc2626" : "#f97316",
                      color: "#ffffff",
                    }}
                  >
                    {incidenteSeleccionado.severidad}
                  </span>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    {incidenteSeleccionado.codigo} · {incidenteSeleccionado.titulo}
                  </h2>
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Declarado el {new Date(incidenteSeleccionado.fecha_declaracion).toLocaleString("es-PE")} por{" "}
                  <strong>{incidenteSeleccionado.declarado_por || "Supervisor TI"}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Ticket de origen: <strong>{incidenteSeleccionado.codigo_ticket || "—"}</strong>
                  {" · "}Problema vinculado:{" "}
                  {incidenteSeleccionado.id_problema ? (
                    <Link href={`/plataforma/problemas/${incidenteSeleccionado.id_problema}`}>
                      {incidenteSeleccionado.codigo_problema}
                    </Link>
                  ) : (
                    <strong>—</strong>
                  )}
                </div>
              </div>

              <button className="boton-icono boton-sm"
                type="button"
                onClick={() => setIncidenteSeleccionado(null)}
              >
                ×
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Barra de Estado y Sala Virtual */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  padding: 16,
                  backgroundColor: "#f1f5f9",
                  borderRadius: 8,
                }}
              >
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                    Estado Operativo Actual
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select
                      value={incidenteSeleccionado.estado}
                      disabled={actualizandoEstado || incidenteSeleccionado.estado === "CERRADO"}
                      onChange={(e) => {
                        if (
                          e.target.value === "CERRADO" &&
                          !confirm("Un incidente mayor cerrado ya no se puede modificar. ¿Confirmas el cierre?")
                        ) return;
                        cambiarEstado(incidenteSeleccionado.id_incidente_mayor, e.target.value);
                      }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        fontSize: 13,
                        fontWeight: 700,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {(OPCIONES_ESTADO[incidenteSeleccionado.estado] ?? OPCIONES_ESTADO.ABIERTO).map((o) => (
                        <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                      ))}
                    </select>
                    {actualizandoEstado && <span style={{ fontSize: 12, color: "#64748b" }}>Actualizando...</span>}
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>
                    Sala Virtual de Crisis
                  </label>
                  {incidenteSeleccionado.sala_virtual ? (
                    <a
                      href={incidenteSeleccionado.sala_virtual}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#1d4ed8",
                        fontWeight: 600,
                        fontSize: 13,
                        textDecoration: "underline",
                      }}
                    >
                      Unirse a Sala Virtual ({incidenteSeleccionado.sala_virtual})
                    </a>
                  ) : (
                    <span style={{ fontSize: 12.5, color: "#94a3b8" }}>Sin sala virtual registrada</span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                  Descripción y Alcance de Impacto
                </h3>
                <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, padding: "10px 14px", backgroundColor: "#fafafa", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  {incidenteSeleccionado.descripcion || "Sin descripción adicional especificada."}
                </div>
              </div>

              {/* Equipo Involucrado */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Equipo Multidisciplinario Involucrado ({incidenteSeleccionado.involucrados?.length || 0})
                  </h3>
                </div>

                {!incidenteSeleccionado.involucrados || incidenteSeleccionado.involucrados.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "#64748b", padding: 12, border: "1px dashed #cbd5e1", borderRadius: 6, textAlign: "center" }}>
                    No se especificaron involucrados adicionales al declarar.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 10 }}>
                    {incidenteSeleccionado.involucrados.map((inv) => (
                      <div
                        key={inv.id_usuario}
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          backgroundColor: "#ffffff",
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, fontSize: 12.5, color: "#0f172a" }}>{inv.nombre}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor:
                                inv.tipo === "tecnico"
                                  ? "#eff6ff"
                                  : inv.tipo === "gestor_area"
                                  ? "#fef3c7"
                                  : inv.tipo === "gestor_modulo"
                                  ? "#ede9fe"
                                  : "#f1f5f9",
                              color:
                                inv.tipo === "tecnico"
                                  ? "#1d4ed8"
                                  : inv.tipo === "gestor_area"
                                  ? "#b45309"
                                  : inv.tipo === "gestor_modulo"
                                  ? "#6d28d9"
                                  : "#334155",
                              textTransform: "uppercase",
                            }}
                          >
                            {inv.tipo?.replace("_", " ") || "Involucrado"}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>{inv.correo}</div>
                        <div style={{ fontSize: 11.5, color: "#0369a1", fontWeight: 500, marginTop: 2 }}>
                          {inv.rol_crisis}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bitácora de Comunicados Oficiales */}
              <div>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
                  Bitácora de Comunicados Oficiales de Crisis
                </h3>

                {(!incidenteSeleccionado.comunicados || incidenteSeleccionado.comunicados.length === 0) ? (
                  <div style={{ fontSize: 12.5, color: "#64748b", padding: 12, border: "1px dashed #cbd5e1", borderRadius: 6, textAlign: "center", marginBottom: 12 }}>
                    Aún no se han emitido comunicados oficiales en esta crisis.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                    {incidenteSeleccionado.comunicados.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#f8fafc",
                          borderLeft: "3px solid #2563eb",
                          borderRadius: 4,
                          fontSize: 12.5,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 11, marginBottom: 3 }}>
                          <strong>Boletín Oficial #{i + 1}{c.usuario ? ` · ${c.usuario}` : ""}</strong>
                          <span>{c.fecha ? new Date(c.fecha).toLocaleString("es-PE") : "—"}</span>
                        </div>
                        <div style={{ color: "#1e293b" }}>{c.texto}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para emitir comunicado */}
                {incidenteSeleccionado.estado !== "CERRADO" && (
                <form onSubmit={publicarComunicado} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                      Emitir nuevo comunicado oficial a los involucrados:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Se completó el failover de base de datos. Pruebas de humo en curso..."
                      value={nuevoComunicado}
                      onChange={(e) => setNuevoComunicado(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12.5 }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={guardandoComunicado || !nuevoComunicado.trim()}
                    className="boton-primario"
                  >
                    {guardandoComunicado ? "Publicando..." : "Emitir Comunicado"}
                  </button>
                </form>
                )}
              </div>
            </div>

            {/* Pie del Modal */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "#f8fafc",
              }}
            >
              <button className="boton-secundario"
                type="button"
                onClick={() => setIncidenteSeleccionado(null)}
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
