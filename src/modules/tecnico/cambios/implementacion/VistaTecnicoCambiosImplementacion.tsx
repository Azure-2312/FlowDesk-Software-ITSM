"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PasoBitacora {
  hora: string;
  paso: string;
  resultado: "OK" | "ADVERTENCIA" | "FALLO";
}

export default function PaginaCambiosImplementacion() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);

  // Estados de la consola de implementación
  const [goNoGoListo, setGoNoGoListo] = useState(false);
  const [enEjecucion, setEnEjecucion] = useState(false);
  const [bitacora, setBitacora] = useState<PasoBitacora[]>([]);
  const [nuevoPasoTexto, setNuevoPasoTexto] = useState("");
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  async function cargarCambios() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios?vista=implementacion&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        setCambios(lista);
        if (lista.length > 0 && !seleccionado) {
          setSeleccionado(lista[0]);
        }
      }
    } catch (e) {
      console.error("Error al cargar cambios para implementación:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCambios();
  }, []);

  function registrarPaso() {
    if (!nuevoPasoTexto.trim()) return;
    const nuevo: PasoBitacora = {
      hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      paso: nuevoPasoTexto.trim(),
      resultado: "OK",
    };
    setBitacora((prev) => [...prev, nuevo]);
    setNuevoPasoTexto("");
  }

  function ejecutarRollback() {
    const nuevo: PasoBitacora = {
      hora: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      paso: "ROLLBACK INICIADO - Aplicando plan de reversión de emergencia.",
      resultado: "FALLO",
    };
    setBitacora((prev) => [...prev, nuevo]);
    setMensajeEstado("Rollback en ejecución. Se ha notificado al gestor de cambios.");
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Consola de implementación de cambios
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Ejecución controlada de RFC autorizadas con validación Go/No-Go y bitácora en tiempo real
          </p>
        </div>

        <button
          type="button"
          onClick={cargarCambios}
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

      {cargando ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando cambios programados...
        </div>
      ) : cambios.length === 0 ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No hay cambios pendientes de implementación
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No tienes RFC aprobadas asignadas para ejecución en este periodo.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
          {/* Lista lateral de cambios */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
              Cambios aprobados ({cambios.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cambios.map((c) => (
                <div
                  key={c.id_cambio}
                  onClick={() => {
                    setSeleccionado(c);
                    setBitacora([]);
                    setEnEjecucion(false);
                    setGoNoGoListo(false);
                    setMensajeEstado(null);
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    border: seleccionado?.id_cambio === c.id_cambio ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    backgroundColor: seleccionado?.id_cambio === c.id_cambio ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{c.codigo_cambio}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{c.tipo_cambio}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>
                    {c.titulo}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consola activa */}
          {seleccionado && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Encabezado del cambio */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                      }}
                    >
                      {seleccionado.codigo_cambio} • {seleccionado.tipo_cambio}
                    </span>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>
                      {seleccionado.titulo}
                    </h2>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      Ventana: {seleccionado.ventana_inicio ? new Date(seleccionado.ventana_inicio).toLocaleString("es-ES") : "Sin ventana"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    {!enEjecucion ? (
                      <button
                        type="button"
                        disabled={!goNoGoListo}
                        onClick={() => setEnEjecucion(true)}
                        style={{
                          padding: "8px 18px",
                          backgroundColor: goNoGoListo ? "#16a34a" : "#cbd5e1",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: goNoGoListo ? "pointer" : "not-allowed",
                        }}
                      >
                        Iniciar ejecución
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={ejecutarRollback}
                        style={{
                          padding: "8px 18px",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Ejecutar rollback
                      </button>
                    )}
                  </div>
                </div>

                {mensajeEstado && (
                  <div style={{ marginTop: 14, padding: 12, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 6, fontSize: 13 }}>
                    {mensajeEstado}
                  </div>
                )}
              </div>

              {/* Checklist Go / No-Go */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 20 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>
                  Validación previa (Decisión Go / No-Go)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={goNoGoListo}
                      onChange={(e) => setGoNoGoListo(e.target.checked)}
                    />
                    Confirmación de respaldo y personal de contingencia disponible
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={goNoGoListo}
                      onChange={(e) => setGoNoGoListo(e.target.checked)}
                    />
                    Aprobaciones de CAB completadas sin condiciones pendientes
                  </label>
                </div>
              </div>

              {/* Bitácora de Pasos en Tiempo Real */}
              <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 20 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>
                  Bitácora de ejecución técnica
                </h3>

                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <input
                    type="text"
                    placeholder="Escribe el paso ejecutado (ej. Respaldo verificado, servicio detenido...)"
                    value={nuevoPasoTexto}
                    onChange={(e) => setNuevoPasoTexto(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      fontSize: 13,
                    }}
                    disabled={!enEjecucion}
                  />
                  <button
                    type="button"
                    onClick={registrarPaso}
                    disabled={!enEjecucion || !nuevoPasoTexto.trim()}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: enEjecucion && nuevoPasoTexto.trim() ? "#2563eb" : "#cbd5e1",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: enEjecucion && nuevoPasoTexto.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    Registrar paso
                  </button>
                </div>

                {bitacora.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "16px 0" }}>
                    {enEjecucion ? "Registra los pasos ejecutados durante la ventana..." : "Inicia la ejecución para habilitar el registro de bitácora."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {bitacora.map((b, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: 6,
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 700, color: "#64748b", marginRight: 10, fontFamily: "monospace" }}>
                            [{b.hora}]
                          </span>
                          <span style={{ color: "#0f172a" }}>{b.paso}</span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            backgroundColor: b.resultado === "OK" ? "#ecfdf5" : "#fee2e2",
                            color: b.resultado === "OK" ? "#065f46" : "#991b1b",
                          }}
                        >
                          {b.resultado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
