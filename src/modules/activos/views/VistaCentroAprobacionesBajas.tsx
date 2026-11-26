"use client";

import { useEffect, useState } from "react";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";
import { Check, X, Clock, CheckCircle2, AlertCircle, RefreshCw, FileText } from "@/shared/components/ui/Iconos";

interface Props {
  vistaInicial?: "pendientes" | "historial";
}

interface SolicitudBaja {
  id_solicitud: number;
  id_activo: number;
  motivo: string;
  estado: string;
  comentario_resolucion?: string;
  fecha_solicitud: string;
  fecha_resolucion?: string;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca?: string;
  modelo?: string;
  solicitante_nombre?: string;
  custodio_nombre?: string;
  resolutor_nombre?: string;
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

export default function VistaCentroAprobacionesBajas({ vistaInicial = "pendientes" }: Props) {
  const [vista, setVista] = useState<"pendientes" | "historial">(vistaInicial);
  const [solicitudes, setSolicitudes] = useState<SolicitudBaja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal de acción
  const [solicitudAccion, setSolicitudAccion] = useState<{
    item: SolicitudBaja;
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
      const res = await fetch(`/api/activos/bajas/aprobaciones?vista=${vista}&_t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No fue posible cargar las solicitudes de baja.");
      } else {
        setSolicitudes(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Error de comunicación al consultar el servicio de bajas de activos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  async function ejecutarDecision() {
    if (!solicitudAccion) return;

    if (solicitudAccion.decision === "RECHAZAR" && comentarioAccion.trim().length < 5) {
      alert("Por favor ingrese el motivo del rechazo (mínimo 5 caracteres).");
      return;
    }

    setProcesando(true);
    try {
      const res = await fetch("/api/activos/bajas/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_solicitud: solicitudAccion.item.id_solicitud,
          decision: solicitudAccion.decision,
          comentario:
            comentarioAccion.trim() ||
            (solicitudAccion.decision === "APROBAR"
              ? "Baja de activo autorizada formalmente por la Jefatura de Área."
              : "Solicitud de baja desestimada por la Jefatura de Área."),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No fue posible registrar la decisión de baja.");
        return;
      }

      setMensajeExito(
        solicitudAccion.decision === "APROBAR"
          ? `Baja del activo ${solicitudAccion.item.codigo_patrimonial} aprobada correctamente.`
          : `Baja del activo ${solicitudAccion.item.codigo_patrimonial} rechazada.`
      );
      setTimeout(() => setMensajeExito(null), 4000);
      setSolicitudAccion(null);
      setComentarioAccion("");
      await cargarDatos();
    } catch {
      alert("Error de red al procesar la aprobación de la baja.");
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
            Gestión de Activos · Bajas y Desincorporaciones
          </span>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
            Centro de Aprobaciones
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Control de bajas patrimoniales, disposición final de activos y dictamen de retiro departamental.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              backgroundColor: vista === "pendientes" && solicitudes.length > 0 ? "#eff6ff" : "#f8fafc",
              border: `1px solid ${vista === "pendientes" && solicitudes.length > 0 ? "#bfdbfe" : "#e2e8f0"}`,
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: vista === "pendientes" && solicitudes.length > 0 ? "#1d4ed8" : "#475569",
            }}
          >
            {vista === "pendientes" ? <Clock size={14} /> : <FileText size={14} />}
            <span>
              {solicitudes.length} {vista === "pendientes" ? (solicitudes.length === 1 ? "baja pendiente" : "bajas pendientes") : (solicitudes.length === 1 ? "resolución" : "resoluciones")}
            </span>
          </div>

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
              <span>Cargando solicitudes de baja...</span>
            </div>
          </div>
        ) : solicitudes.length === 0 ? (
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
              {vista === "pendientes"
                ? "No hay solicitudes de baja pendientes"
                : "No se registran resoluciones históricas de baja"}
            </p>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
              {vista === "pendientes"
                ? "Todas las bajas patrimoniales de tu departamento se encuentran al día."
                : "El historial de desincorporaciones aparecerá aquí una vez emitidos los dictámenes."}
            </p>
          </div>
        ) : vista === "pendientes" ? (
          <TablaDobleScroll minWidth={1000}>
            <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Código Patrimonial</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Activo / Dispositivo</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "200px" }}>Custodio / Solicitante</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", maxWidth: "260px" }}>Motivo de la Baja</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Fecha Solicitud</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", textAlign: "right", width: "230px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id_solicitud} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span className="codigo-pill">{s.codigo_patrimonial}</span>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{s.tipo_activo}</div>
                      <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                        {[s.marca, s.modelo].filter(Boolean).join(" · ") || "Sin modelo especificado"}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="avatar-iniciales">{obtenerIniciales(s.solicitante_nombre)}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "12.5px" }}>
                            {s.solicitante_nombre || "—"}
                          </div>
                          {s.custodio_nombre && s.custodio_nombre !== s.solicitante_nombre && (
                            <div style={{ fontSize: "11px", color: "#64748b" }}>Custodio: {s.custodio_nombre}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", maxWidth: "260px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569" }}>
                        {s.motivo}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#475569", fontSize: "12.5px" }}>
                      {formatearFecha(s.fecha_solicitud)}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="boton-tabla-aprobar"
                          onClick={() => setSolicitudAccion({ item: s, decision: "APROBAR" })}
                          title="Autorizar baja de activo"
                        >

                          <span>Aprobar Baja</span>
                        </button>

                        <button
                          type="button"
                          className="boton-tabla-rechazar"
                          onClick={() => setSolicitudAccion({ item: s, decision: "RECHAZAR" })}
                          title="Rechazar baja de activo"
                        >

                          <span>Rechazar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaDobleScroll>
        ) : (
          <TablaDobleScroll minWidth={1000}>
            <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Fecha Resolución</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Código Patrimonial</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Activo</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "180px" }}>Solicitante</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "120px" }}>Resolución</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "170px" }}>Dictaminado Por</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", maxWidth: "260px" }}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id_solicitud} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                      {formatearFecha(s.fecha_resolucion || s.fecha_solicitud)}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span className="codigo-pill">{s.codigo_patrimonial}</span>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ color: "#0f172a", fontWeight: 600, fontSize: "13px" }}>{s.tipo_activo}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        {[s.marca, s.modelo].filter(Boolean).join(" ")}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#334155", fontSize: "12.5px" }}>
                      {s.solicitante_nombre || "—"}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span
                        className={`badge-estado ${
                          s.estado === "APROBADA" ? "badge-estado-aprobado" : "badge-estado-rechazado"
                        }`}
                      >
                        {s.estado}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px" }}>
                      {s.resolutor_nombre || "Jefatura de Área"}
                    </td>

                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px", maxWidth: "260px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.comentario_resolucion || s.motivo || "Sin observaciones adicionales."}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaDobleScroll>
        )}

        {/* Barra de Resumen Inferior */}
        {!cargando && solicitudes.length > 0 && (
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
              Mostrando <strong>{solicitudes.length}</strong> {vista === "pendientes" ? "bajas patrimoniales pendientes" : "resoluciones históricas"}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>FlowDesk ITSM · Gestión de Activos</span>
          </div>
        )}
      </div>

      {/* Modal de Dictamen de Baja */}
      {solicitudAccion && (
        <div className="modal-overlay" onClick={() => !procesando && setSolicitudAccion(null)}>
          <div className="modal-contenido" style={{ maxWidth: "500px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: solicitudAccion.decision === "APROBAR" ? "#ecfdf5" : "#fef2f2",
                  color: solicitudAccion.decision === "APROBAR" ? "#059669" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {solicitudAccion.decision === "APROBAR" ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  {solicitudAccion.decision === "APROBAR" ? "Aprobar Baja de Activo" : "Rechazar Baja de Activo"}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                  {solicitudAccion.item.codigo_patrimonial} · {solicitudAccion.item.tipo_activo}
                </span>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.45 }}>
              Dictamen patrimonial sobre el activo <strong style={{ color: "#0f172a" }}>{solicitudAccion.item.codigo_patrimonial}</strong> ({[solicitudAccion.item.marca, solicitudAccion.item.modelo].filter(Boolean).join(" ")}).
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                {solicitudAccion.decision === "RECHAZAR" ? "Motivo del rechazo (obligatorio):" : "Comentarios u observaciones:"}
              </label>
              <textarea
                value={comentarioAccion}
                onChange={(e) => setComentarioAccion(e.target.value)}
                rows={3}
                placeholder={
                  solicitudAccion.decision === "RECHAZAR"
                    ? "Explique las razones por las cuales se desestima la baja..."
                    : "Comentario opcional sobre el dictamen..."
                }
                className="input-base"
                style={{ width: "100%", fontSize: "13px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setSolicitudAccion(null)}
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
                className={solicitudAccion.decision === "APROBAR" ? "boton-tabla-aprobar" : "boton-tabla-rechazar"}
                style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}
              >
                {procesando ? "Procesando..." : solicitudAccion.decision === "APROBAR" ? "Confirmar Baja" : "Confirmar Rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
