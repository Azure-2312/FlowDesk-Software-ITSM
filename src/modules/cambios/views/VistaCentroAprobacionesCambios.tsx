"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

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
              ? "Visto Bueno formal otorgado por la Jefatura de Área."
              : "Visto Bueno denegado por la Jefatura de Área."),
        };
      } else {
        endpoint = "/api/cambios/aprobaciones/tecnicas";
        payload = {
          id_cambio: itemAccion.item.id_cambio,
          decision: itemAccion.decision,
          comentario:
            comentarioAccion.trim() ||
            (itemAccion.decision === "APROBAR"
              ? "Evaluación técnica aprobada conforme a directrices de gestión."
              : "Evaluación técnica desestimada."),
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
          ? `Cambio ${itemAccion.item.codigo_cambio} aprobado correctamente.`
          : `Cambio ${itemAccion.item.codigo_cambio} rechazado formalmente.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
      setItemAccion(null);
      setComentarioAccion("");
      await cargarDatos();
    } catch {
      alert("Error de red al procesar la aprobación del cambio.");
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

  return (
    <div className="space-y-4">
      {/* Cabecera Corporativa */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Gestión de Cambios · Centro de Dictámenes
          </span>
          <h1 className="text-xl font-bold text-slate-900 m-0">Centro de Aprobaciones</h1>
          <p className="text-sm text-slate-600 mt-1 mb-0">
            Autorización de cambios (CAB), evaluación técnica de viabilidad y V°B° de área empresarial.
          </p>
        </div>

        {/* Filtro secundario para vista de pendientes */}
        {vista === "pendientes" && pendientes.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Filtrar por:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setFiltroTipo("TODOS")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filtroTipo === "TODOS"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Todos ({pendientes.length})
              </button>
              {totalCab > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("CAB")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filtroTipo === "CAB"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Autorización CAB ({totalCab})
                </button>
              )}
              {totalArea > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("VB_AREA")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filtroTipo === "VB_AREA"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  V°B° de Área ({totalArea})
                </button>
              )}
              {totalTecnica > 0 && (
                <button
                  type="button"
                  onClick={() => setFiltroTipo("TECNICA")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filtroTipo === "TECNICA"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Evaluación Técnica ({totalTecnica})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {mensajeExito && (
        <div style={{ padding: "12px 16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Cargando aprobaciones de cambios...
          </div>
        ) : vista === "pendientes" ? (
          pendientesFiltrados.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                No tienes solicitudes de cambio pendientes de dictamen en este momento.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo de Dictamen</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título / Resumen</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Ventana Propuesta</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pendientesFiltrados.map((item) => (
                  <tr key={`${item.tipo_aprobacion}-${item.id_cambio}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace" }}>
                      <Link
                        href={`/plataforma/cambios/gestion/${item.id_cambio}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {item.codigo_cambio}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontWeight: 600,
                          backgroundColor:
                            item.tipo_aprobacion === "CAB"
                              ? "#eff6ff"
                              : item.tipo_aprobacion === "VB_AREA"
                              ? "#f0fdf4"
                              : "#f8fafc",
                          color:
                            item.tipo_aprobacion === "CAB"
                              ? "#1d4ed8"
                              : item.tipo_aprobacion === "VB_AREA"
                              ? "#166534"
                              : "#334155",
                          border: `1px solid ${
                            item.tipo_aprobacion === "CAB"
                              ? "#bfdbfe"
                              : item.tipo_aprobacion === "VB_AREA"
                              ? "#bbf7d0"
                              : "#cbd5e1"
                          }`,
                        }}
                      >
                        {item.tipo_aprobacion === "CAB"
                          ? "Autorización CAB"
                          : item.tipo_aprobacion === "VB_AREA"
                          ? "V°B° de Área"
                          : "Evaluación Técnica"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", maxWidth: 280 }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{item.titulo}</div>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.justificacion || "Sin justificación adicional"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#334155" }}>
                      {item.solicitante_nombre || "—"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                      <div>{formatearFecha(item.ventana_inicio)}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>al {formatearFecha(item.ventana_fin)}</div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                        <Link
                          href={`/plataforma/cambios/gestion/${item.id_cambio}`}
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            borderRadius: 6,
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            textDecoration: "none",
                            fontWeight: 500,
                            display: "inline-block",
                          }}
                        >
                          Ver RFC
                        </Link>
                        <button
                          type="button"
                          onClick={() => setItemAccion({ item, decision: "APROBAR" })}
                          style={{
                            padding: "6px 12px",
                            fontSize: 12,
                            borderRadius: 6,
                            border: "1px solid #059669",
                            backgroundColor: "#059669",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemAccion({ item, decision: "RECHAZAR" })}
                          style={{
                            padding: "6px 10px",
                            fontSize: 12,
                            borderRadius: 6,
                            border: "1px solid #fca5a5",
                            backgroundColor: "#ffffff",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          historial.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                No se registran decisiones históricas emitidas en cambios.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Decisión</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Referencia / Código</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título del Cambio</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Decisión</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Comentario Registrado</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Expediente</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((d, idx) => {
                  const refCodigo = d.codigo_cambio || d.referencia || `EXP-${idx + 1}`;
                  const idRfc = d.id_cambio;
                  return (
                    <tr key={`${refCodigo}-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                        {formatearFecha(d.fecha_decision)}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace" }}>
                        {idRfc ? (
                          <Link
                            href={`/plataforma/cambios/gestion/${idRfc}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {refCodigo}
                          </Link>
                        ) : (
                          refCodigo
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", maxWidth: 240, fontWeight: 500, color: "#1e293b" }}>
                        {d.titulo}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", fontWeight: 600 }}>
                          {d.tipo_cambio || d.tipo || "CAMBIO"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            backgroundColor:
                              d.decision === "APROBADO" ? "#ecfdf5" : d.decision === "OBSERVADO" ? "#fffbeb" : "#fef2f2",
                            color:
                              d.decision === "APROBADO" ? "#065f46" : d.decision === "OBSERVADO" ? "#92400e" : "#991b1b",
                            border: `1px solid ${
                              d.decision === "APROBADO" ? "#a7f3d0" : d.decision === "OBSERVADO" ? "#fde68a" : "#fecaca"
                            }`,
                          }}
                        >
                          {d.decision}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, maxWidth: 260 }}>
                        {d.comentario || "Sin observaciones adicionales."}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {idRfc ? (
                          <Link
                            href={`/plataforma/cambios/gestion/${idRfc}`}
                            style={{
                              padding: "4px 8px",
                              fontSize: 11.5,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#f8fafc",
                              color: "#1e293b",
                              textDecoration: "none",
                            }}
                          >
                            Ver RFC
                          </Link>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>

      {/* Modal de Dictamen */}
      {itemAccion && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => !procesando && setItemAccion(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 16,
                fontWeight: 700,
                color: itemAccion.decision === "APROBAR" ? "#065f46" : "#991b1b",
              }}
            >
              {itemAccion.decision === "APROBAR" ? "Aprobar Solicitud de Cambio" : "Rechazar Solicitud de Cambio"}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Dictamen sobre <strong className="font-mono text-slate-900">{itemAccion.item.codigo_cambio}</strong> (
              {itemAccion.item.tipo_aprobacion === "CAB"
                ? "Autorización CAB"
                : itemAccion.item.tipo_aprobacion === "VB_AREA"
                ? "Visto Bueno de Área"
                : "Evaluación Técnica"}
              ).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemAccion(null)}
                disabled={procesando}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarDecision}
                disabled={procesando}
                className={`px-4 py-2 text-xs font-semibold rounded-lg text-white transition-colors ${
                  itemAccion.decision === "APROBAR"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
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
