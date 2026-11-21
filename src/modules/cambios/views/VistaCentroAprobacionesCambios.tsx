"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";
import { Eye, Check, X, Clock, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight } from "@/shared/components/ui/Iconos";

interface Props {
  vistaInicial?: "pendientes" | "historial";
}

interface CambioPendiente {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  justificacion: string;
  ventana_inicio?: string;
  ventana_fin?: string;
  fecha_creacion: string;
  solicitante_nombre?: string;
  tipo_aprobacion: "CAB" | "VB_AREA" | "TECNICA";
}

interface DecisionHistorial {
  id_cambio_aprobacion?: number;
  id_cambio?: number;
  decision: string;
  comentario: string;
  fecha_decision: string;
  codigo_cambio?: string;
  referencia?: string;
  titulo: string;
  tipo_cambio?: string;
  tipo?: string;
}

function obtenerIniciales(nombre?: string): string {
  if (!nombre) return "U";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function VistaCentroAprobacionesCambios({ vistaInicial = "pendientes" }: Props) {
  const [vista, setVista] = useState<"pendientes" | "historial">(vistaInicial);
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "CAB" | "VB_AREA" | "TECNICA">("TODOS");

  // Datos
  const [pendientes, setPendientes] = useState<CambioPendiente[]>([]);
  const [historial, setHistorial] = useState<DecisionHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal de acción
  const [itemAccion, setItemAccion] = useState<{
    item: CambioPendiente;
    decision: "APROBAR" | "RECHAZAR";
  } | null>(null);
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (vistaInicial) {
      setVista(vistaInicial);
    }
  }, [vistaInicial]);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      if (vista === "pendientes") {
        // Cargar autorizaciones CAB, V°B° de área y evaluaciones técnicas en paralelo
        const [resCab, resArea, resTecnicas] = await Promise.allSettled([
          fetch(`/api/cambios/aprobaciones?_t=${Date.now()}`),
          fetch(`/api/cambios/area/aprobaciones?_t=${Date.now()}`),
          fetch(`/api/cambios/aprobaciones/tecnicas?_t=${Date.now()}`),
        ]);

        const listaCab: CambioPendiente[] =
          resCab.status === "fulfilled" && resCab.value.ok
            ? ((await resCab.value.json()) || []).map((c: any) => ({
                ...c,
                tipo_aprobacion: "CAB" as const,
              }))
            : [];

        const listaArea: CambioPendiente[] =
          resArea.status === "fulfilled" && resArea.value.ok
            ? ((await resArea.value.json()) || []).map((c: any) => ({
                ...c,
                tipo_aprobacion: "VB_AREA" as const,
              }))
            : [];

        const listaTecnicas: CambioPendiente[] =
          resTecnicas.status === "fulfilled" && resTecnicas.value.ok
            ? ((await resTecnicas.value.json()) || []).map((c: any) => ({
                ...c,
                tipo_aprobacion: "TECNICA" as const,
              }))
            : [];

        setPendientes([...listaCab, ...listaArea, ...listaTecnicas]);
      } else {
        const res = await fetch(`/api/cambios/historial?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setHistorial(Array.isArray(data) ? data : []);
        } else {
          const resFallback = await fetch(`/api/solicitudes/historial?_t=${Date.now()}`);
          if (resFallback.ok) {
            const dataFallback = await resFallback.json();
            setHistorial(Array.isArray(dataFallback) ? dataFallback : []);
          } else {
            setError("No fue posible cargar el historial de cambios.");
          }
        }
      }
    } catch {
      setError("Error de comunicación al consultar el servicio de aprobaciones de cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  const totalCab = useMemo(() => pendientes.filter((p) => p.tipo_aprobacion === "CAB").length, [pendientes]);
  const totalArea = useMemo(() => pendientes.filter((p) => p.tipo_aprobacion === "VB_AREA").length, [pendientes]);
  const totalTecnica = useMemo(() => pendientes.filter((p) => p.tipo_aprobacion === "TECNICA").length, [pendientes]);

  const pendientesFiltrados = useMemo(() => {
    if (filtroTipo === "TODOS") return pendientes;
    return pendientes.filter((p) => p.tipo_aprobacion === filtroTipo);
  }, [pendientes, filtroTipo]);

  async function ejecutarDecision() {
    if (!itemAccion) return;

    if (itemAccion.decision === "RECHAZAR" && comentarioAccion.trim().length < 5) {
      alert("Por favor ingrese el motivo del rechazo (mínimo 5 caracteres).");
      return;
    }

    setProcesando(true);
    try {
      let endpoint = "";
      let payload: any = {};

      if (itemAccion.item.tipo_aprobacion === "CAB") {
        endpoint = "/api/cambios/aprobaciones";
        payload = {
          id_cambio: itemAccion.item.id_cambio,
          decision: itemAccion.decision === "APROBAR" ? "APROBADO" : "RECHAZADO",
          comentario:
            comentarioAccion.trim() ||
            (itemAccion.decision === "APROBAR"
              ? "Autorización formal otorgada por el Comité de Cambios (CAB)."
              : "Cambio denegado por el Comité de Cambios (CAB)."),
        };
      } else if (itemAccion.item.tipo_aprobacion === "VB_AREA") {
        endpoint = "/api/cambios/area/aprobaciones";
        payload = {
          id_cambio: itemAccion.item.id_cambio,
          decision: itemAccion.decision === "APROBAR" ? "APROBADO" : "RECHAZADO",
          comentario:
            comentarioAccion.trim() ||
            (itemAccion.decision === "APROBAR"
              ? "V°B° favorable de la Jefatura de Área."
              : "V°B° denegado por la Jefatura de Área."),
        };
      } else {
        endpoint = "/api/cambios/aprobaciones/tecnicas";
        payload = {
          id_cambio: itemAccion.item.id_cambio,
          decision: itemAccion.decision === "APROBAR" ? "APROBADO" : "OBSERVADO",
          comentario:
            comentarioAccion.trim() ||
            (itemAccion.decision === "APROBAR"
              ? "Evaluación técnica favorable (arquitectura, impacto y rollback validados)."
              : "Evaluación técnica desfavorable o con observaciones críticas."),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No fue posible registrar la decisión.");
        return;
      }

      setMensajeExito(
        itemAccion.decision === "APROBAR"
          ? `Decisión de aprobación registrada para ${itemAccion.item.codigo_cambio}.`
          : `Dictamen de rechazo emitido para ${itemAccion.item.codigo_cambio}.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
      setItemAccion(null);
      setComentarioAccion("");
      await cargarDatos();
    } catch {
      alert("Error de red al procesar el dictamen.");
    } finally {
      setProcesando(false);
    }
  }

  function formatearFecha(f?: string | null) {
    if (!f) return "—";
    const d = new Date(f);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  }

  function renderBadgeTipoAprobacion(tipo: "CAB" | "VB_AREA" | "TECNICA") {
    if (tipo === "CAB") {
      return (
        <span
          style={{
            fontSize: "11.5px",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            whiteSpace: "nowrap",
          }}
        >
          Autorización CAB
        </span>
      );
    }
    if (tipo === "VB_AREA") {
      return (
        <span
          style={{
            fontSize: "11.5px",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            backgroundColor: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            whiteSpace: "nowrap",
          }}
        >
          V°B° de Área
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: "11.5px",
          padding: "3px 8px",
          borderRadius: "6px",
          fontWeight: 600,
          backgroundColor: "#f8fafc",
          color: "#334155",
          border: "1px solid #cbd5e1",
          whiteSpace: "nowrap",
        }}
      >
        Evaluación Técnica
      </span>
    );
  }

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Cabecera Corporativa */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#2563eb",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Gestión de Cambios · Centro de Dictámenes
          </span>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
            Centro de Aprobaciones
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Autorización de cambios (CAB), evaluación técnica de viabilidad y V°B° de área empresarial.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {vista === "pendientes" && pendientes.length > 0 && (
            <div className="control-segmentado">
              <button
                type="button"
                onClick={() => setFiltroTipo("TODOS")}
                className={`control-segmentado-item ${filtroTipo === "TODOS" ? "activo" : ""}`}
              >
                <span>Todos</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>({pendientes.length})</span>
              </button>
              {totalCab > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("CAB")}
                  className={`control-segmentado-item ${filtroTipo === "CAB" ? "activo" : ""}`}
                >
                  <span>CAB</span>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>({totalCab})</span>
                </button>
              )}
              {totalArea > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("VB_AREA")}
                  className={`control-segmentado-item ${filtroTipo === "VB_AREA" ? "activo" : ""}`}
                >
                  <span>V°B° Área</span>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>({totalArea})</span>
                </button>
              )}
              {totalTecnica > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("TECNICA")}
                  className={`control-segmentado-item ${filtroTipo === "TECNICA" ? "activo" : ""}`}
                >
                  <span>Técnica</span>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>({totalTecnica})</span>
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            title="Actualizar listado"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "7px 12px",
              height: "34px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#334155",
              cursor: cargando ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <RefreshCw size={13} style={{ animation: cargando ? "spin 1s linear infinite" : "none" }} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "8px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de Datos */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {cargando ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b", fontSize: "13.5px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={16} style={{ animation: "spin 1s linear infinite", color: "#2563eb" }} />
              <span>Cargando aprobaciones de cambios...</span>
            </div>
          </div>
        ) : vista === "pendientes" ? (
          pendientesFiltrados.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center", color: "#64748b" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                Sin solicitudes de cambio pendientes de dictamen
              </p>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                No tienes solicitudes de cambio asignadas en este momento para la categoría seleccionada.
              </p>
            </div>
          ) : (
            <TablaDobleScroll minWidth={1050}>
              <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "1050px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "130px" }}>Código</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Tipo de Dictamen</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Título / Resumen</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "200px" }}>Solicitante</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "180px" }}>Ventana Propuesta</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", textAlign: "right", width: "260px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendientesFiltrados.map((item) => (
                    <tr key={`${item.tipo_aprobacion}-${item.id_cambio}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        <Link href={`/plataforma/cambios/gestion/${item.id_cambio}`}>
                          <span className="codigo-pill">{item.codigo_cambio}</span>
                        </Link>
                      </td>

                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                        {renderBadgeTipoAprobacion(item.tipo_aprobacion)}
                      </td>

                      <td style={{ padding: "12px 16px", maxWidth: "320px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px", lineHeight: 1.35 }}>
                          {item.titulo}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.justificacion || "Sin justificación adicional registrada"}
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="avatar-iniciales">{obtenerIniciales(item.solicitante_nombre)}</span>
                          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "12.5px" }}>
                            {item.solicitante_nombre || "—"}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#475569", fontSize: "12px" }}>
                        <div>{formatearFecha(item.ventana_inicio)}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>al {formatearFecha(item.ventana_fin)}</div>
                      </td>

                      <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                          <Link
                            href={`/plataforma/cambios/gestion/${item.id_cambio}`}
                            className="boton-tabla-detalle"
                            title="Ver detalle del cambio (RFC)"
                          >
                            <Eye size={13} />
                            <span>Ver RFC</span>
                          </Link>

                          <button
                            type="button"
                            className="boton-tabla-aprobar"
                            onClick={() => setItemAccion({ item, decision: "APROBAR" })}
                            title="Emitir dictamen favorable"
                          >
                            <Check size={13} />
                            <span>Aprobar</span>
                          </button>

                          <button
                            type="button"
                            className="boton-tabla-rechazar"
                            onClick={() => setItemAccion({ item, decision: "RECHAZAR" })}
                            title="Denegar o rechazar solicitud"
                          >
                            <X size={13} />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaDobleScroll>
          )
        ) : (
          historial.length === 0 ? (
            <div style={{ padding: "56px 24px", textAlign: "center", color: "#64748b" }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
                No se registran decisiones históricas emitidas en cambios.
              </p>
            </div>
          ) : (
            <TablaDobleScroll minWidth={1050}>
              <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "1050px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Fecha Decisión</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "140px" }}>Referencia / Código</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Título del Cambio</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "110px" }}>Tipo</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "120px" }}>Decisión</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", maxWidth: "260px" }}>Comentario Registrado</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", textAlign: "right", width: "110px" }}>Expediente</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((d, idx) => {
                    const refCodigo = d.codigo_cambio || d.referencia || `EXP-${idx + 1}`;
                    const idRfc = d.id_cambio;
                    return (
                      <tr key={`${refCodigo}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                          {formatearFecha(d.fecha_decision)}
                        </td>

                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          {idRfc ? (
                            <Link href={`/plataforma/cambios/gestion/${idRfc}`}>
                              <span className="codigo-pill">{refCodigo}</span>
                            </Link>
                          ) : (
                            <span className="codigo-pill">{refCodigo}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", maxWidth: "260px" }}>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{d.titulo}</div>
                        </td>

                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 600,
                            }}
                          >
                            {d.tipo_cambio || d.tipo || "CAMBIO"}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                          <span
                            className={`badge-estado ${
                              d.decision === "APROBADO"
                                ? "badge-estado-aprobado"
                                : d.decision === "OBSERVADO"
                                ? "badge-estado-pendiente"
                                : "badge-estado-rechazado"
                            }`}
                          >
                            {d.decision}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px", maxWidth: "260px" }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {d.comentario || "Sin observaciones adicionales."}
                          </div>
                        </td>

                        <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                          {idRfc ? (
                            <Link href={`/plataforma/cambios/gestion/${idRfc}`} className="boton-tabla-detalle">
                              <Eye size={12} />
                              <span>Ver RFC</span>
                            </Link>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </TablaDobleScroll>
          )
        )}

        {/* Barra de Resumen Inferior */}
        {!cargando && (
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "#64748b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {vista === "pendientes"
                ? `Mostrando ${pendientesFiltrados.length} cambios pendientes de autorización`
                : `Mostrando ${historial.length} decisiones históricas`}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>FlowDesk ITSM · Gestión de Cambios</span>
          </div>
        )}
      </div>

      {/* Modal de Dictamen */}
      {itemAccion && (
        <div className="modal-overlay" onClick={() => !procesando && setItemAccion(null)}>
          <div className="modal-contenido" style={{ maxWidth: "500px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: itemAccion.decision === "APROBAR" ? "#ecfdf5" : "#fef2f2",
                  color: itemAccion.decision === "APROBAR" ? "#059669" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {itemAccion.decision === "APROBAR" ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  {itemAccion.decision === "APROBAR" ? "Aprobar Solicitud de Cambio" : "Rechazar Solicitud de Cambio"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {itemAccion.item.codigo_cambio} · {itemAccion.item.tipo_aprobacion === "CAB" ? "Comité CAB" : itemAccion.item.tipo_aprobacion === "VB_AREA" ? "V°B° Área" : "Evaluación Técnica"}
                </span>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.45 }}>
              Dictamen formal para <strong style={{ color: "#0f172a" }}>{itemAccion.item.titulo}</strong>.
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                {itemAccion.decision === "RECHAZAR" ? "Motivo del rechazo (obligatorio):" : "Comentarios u observaciones:"}
              </label>
              <textarea
                value={comentarioAccion}
                onChange={(e) => setComentarioAccion(e.target.value)}
                rows={3}
                placeholder={
                  itemAccion.decision === "RECHAZAR"
                    ? "Explique las razones o requerimientos no satisfechos..."
                    : "Comentario opcional sobre el dictamen..."
                }
                className="input-base"
                style={{ width: "100%", fontSize: "13px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setItemAccion(null)}
                disabled={procesando}
                className="boton-secundario"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarDecision}
                disabled={procesando}
                className={itemAccion.decision === "APROBAR" ? "boton-tabla-aprobar" : "boton-tabla-rechazar"}
                style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}
              >
                {procesando ? "Procesando..." : itemAccion.decision === "APROBAR" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
