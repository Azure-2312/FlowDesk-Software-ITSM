"use client";

import { useEffect, useState } from "react";

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
    <div className="space-y-4">
      {/* Cabecera Corporativa */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Gestión de Activos · Bajas y Desincorporaciones
          </span>
          <h1 className="text-xl font-bold text-slate-900 m-0">Centro de Aprobaciones</h1>
          <p className="text-sm text-slate-600 mt-1 mb-0">
            Control de bajas patrimoniales, disposición final de activos y dictamen de retiro departamental.
          </p>
        </div>
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
            Cargando solicitudes de baja...
          </div>
        ) : solicitudes.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              {vista === "pendientes"
                ? "No hay solicitudes de baja de activos pendientes en tu departamento."
                : "No se registran resoluciones históricas de baja en tu departamento."}
            </p>
          </div>
        ) : vista === "pendientes" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código Patrimonial</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Activo / Dispositivo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Custodio / Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Motivo de la Baja</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Solicitud</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id_solicitud} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                    {s.codigo_patrimonial}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{s.tipo_activo}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>
                      {[s.marca, s.modelo].filter(Boolean).join(" · ") || "Sin modelo especificado"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    <div>{s.solicitante_nombre || "—"}</div>
                    {s.custodio_nombre && s.custodio_nombre !== s.solicitante_nombre && (
                      <div style={{ fontSize: 11, color: "#64748b" }}>Custodio: {s.custodio_nombre}</div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 280, color: "#475569" }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.motivo}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                    {formatearFecha(s.fecha_solicitud)}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setSolicitudAccion({ item: s, decision: "APROBAR" })}
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
                        Aprobar Baja
                      </button>
                      <button
                        type="button"
                        onClick={() => setSolicitudAccion({ item: s, decision: "RECHAZAR" })}
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
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Resolución</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código Patrimonial</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Activo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Resolución</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Dictaminado Por</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id_solicitud} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                    {formatearFecha(s.fecha_resolucion || s.fecha_solicitud)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                    {s.codigo_patrimonial}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500 }}>
                    {s.tipo_activo}
                    <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
                      {[s.marca, s.modelo].filter(Boolean).join(" ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    {s.solicitante_nombre || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: s.estado === "APROBADA" ? "#ecfdf5" : "#fef2f2",
                        color: s.estado === "APROBADA" ? "#065f46" : "#991b1b",
                        border: `1px solid ${s.estado === "APROBADA" ? "#a7f3d0" : "#fecaca"}`,
                      }}
                    >
                      {s.estado}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {s.resolutor_nombre || "Jefatura de Área"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, maxWidth: 280 }}>
                    {s.comentario_resolucion || s.motivo || "Sin observaciones adicionales."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Dictamen de Baja */}
      {solicitudAccion && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => !procesando && setSolicitudAccion(null)}
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
                color: solicitudAccion.decision === "APROBAR" ? "#065f46" : "#991b1b",
              }}
            >
              {solicitudAccion.decision === "APROBAR" ? "Aprobar Baja de Activo" : "Rechazar Baja de Activo"}
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Dictamen sobre el activo <strong className="font-mono text-slate-900">{solicitudAccion.item.codigo_patrimonial}</strong> ({solicitudAccion.item.tipo_activo}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSolicitudAccion(null)}
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
                  solicitudAccion.decision === "APROBAR"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
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
