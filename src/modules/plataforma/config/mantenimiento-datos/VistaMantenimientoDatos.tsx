"use client";

import { useState } from "react";

export default function PaginaMantenimientoPurgaDatos() {
  const [aniosAntiguedad, setAniosAntiguedad] = useState(5);
  const [simulando, setSimulando] = useState(false);
  const [purgando, setPurgando] = useState(false);
  const [resultadoSimulacion, setResultadoSimulacion] = useState<any | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ejecutarSimulacion() {
    setSimulando(true);
    setError(null);
    setResultadoSimulacion(null);
    try {
      const res = await fetch("/api/admin/mantenimiento-datos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aniosAntiguedad,
          accion: "SIMULAR",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo realizar la simulación.");
        return;
      }
      setResultadoSimulacion(data);
    } catch {
      setError("Error de conexión al analizar registros.");
    } finally {
      setSimulando(false);
    }
  }

  async function ejecutarPurga() {
    if (!confirm(`¿Está completamente seguro de archivar y purgar los tickets con más de ${aniosAntiguedad} años de antigüedad? Esta acción se registrará formalmente en la bitácora inmutable de auditoría.`)) {
      return;
    }

    setPurgando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/admin/mantenimiento-datos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aniosAntiguedad,
          accion: "PURGAR",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo procesar la purga.");
        return;
      }

      setMensajeExito(data.mensaje);
      setResultadoSimulacion(null);
    } catch {
      setError("Error de conexión al procesar la purga.");
    } finally {
      setPurgando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Mantenimiento, Optimización y Purga Histórica de Datos</h1>
          <p className="subtitulo">
            Herramientas para archivar y purgar de manera segura tickets antiguos cerrados (ej. mayores a 5 años) para optimizar el rendimiento y espacio de almacenamiento de la base de datos PostgreSQL.
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Parámetros de Retención */}
        <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Política de Retención y Ciclo de Vida
          </h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
            Establezca el umbral de antigüedad para filtrar tickets cerrados o cancelados.
          </p>

          <div className="campo" style={{ marginBottom: 18 }}>
            <label className="etiqueta" style={{ fontWeight: 600 }}>Antigüedad Mínima de Tickets Cerrados</label>
            <select
              className="input-base"
              value={aniosAntiguedad}
              onChange={(e) => {
                setAniosAntiguedad(Number(e.target.value));
                setResultadoSimulacion(null);
              }}
            >
              <option value={1}>Mayor a 1 año</option>
              <option value={2}>Mayor a 2 años</option>
              <option value={3}>Mayor a 3 años</option>
              <option value={5}>Mayor a 5 años (Recomendado para cumplimiento normativo)</option>
              <option value={7}>Mayor a 7 años</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="boton-primario"
              onClick={ejecutarSimulacion}
              disabled={simulando}
              style={{ width: "auto", fontSize: 13, padding: "8px 18px" }}
            >
              {simulando ? "Analizando base de datos..." : "1. Simular Volumen a Purgar"}
            </button>
          </div>
        </div>

        {/* Resultados del Análisis y Ejecución */}
        <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Dictamen de Análisis Previo
          </h3>

          {!resultadoSimulacion ? (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
              Haga clic en &quot;Simular Volumen a Purgar&quot; para consultar cuántos registros califican sin alterar la base de datos.
            </div>
          ) : (
            <div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 6 }}>
                  Fecha de corte calculada: <strong>{resultadoSimulacion.fechaCorte}</strong>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  {resultadoSimulacion.totalTicketsCandidatos} tickets identificados
                </div>
                <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>
                  Espacio estimado a liberar: <strong>{resultadoSimulacion.estimadoKbLiberados}</strong>
                </div>
              </div>

              {resultadoSimulacion.totalTicketsCandidatos === 0 ? (
                <div style={{ fontSize: 12.5, color: "#166534", padding: 10, backgroundColor: "#f0fdf4", borderRadius: 6 }}>
                  Su base de datos se encuentra completamente optimizada. No existen tickets anteriores al umbral seleccionado.
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={ejecutarPurga}
                    disabled={purgando}
                    className="boton-primario"
                    style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c", width: "auto", fontSize: 13, padding: "8px 20px" }}
                  >
                    {purgando ? "Procesando purga..." : "2. Confirmar y Archivar Registros"}
                  </button>
                  <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                    Esta acción marcará los tickets como archivados y registrará el evento en la auditoría inmutable.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
