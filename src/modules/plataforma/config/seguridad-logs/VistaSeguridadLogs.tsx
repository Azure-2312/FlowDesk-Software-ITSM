"use client";

import { useEffect, useState } from "react";
import { LogAccesoItem } from "@/modules/seguridad";

export default function PaginaSeguridadLogs() {
  const [logs, setLogs] = useState<LogAccesoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroResultado, setFiltroResultado] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  async function cargarLogs() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroResultado) params.set("resultado", filtroResultado);
      if (busqueda.trim()) params.set("buscar", busqueda.trim());

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudieron obtener los registros de seguridad");
        return;
      }
      setLogs(datos.logs || []);
    } catch {
      setError("Error de conexión al cargar el log de seguridad");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLogs();
  }, [filtroResultado]);

  function manejarBusqueda(e: React.FormEvent) {
    e.preventDefault();
    cargarLogs();
  }

  const total = logs.length;
  const exitosos = logs.filter((l) => l.exitoso).length;
  const fallidos = logs.filter((l) => !l.exitoso).length;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Log de Seguridad y Control de Accesos</h1>
          <p>
            Trazabilidad ISO/IEC 27001 y SOX: Registro inmutable de intentos de inicio de sesión, mitigación de fuerza bruta y auditoría de direcciones IP.
          </p>
        </div>
        <button
          className="boton-mini"
          onClick={cargarLogs}
          disabled={cargando}
          title="Actualizar log de seguridad"
          aria-label="Actualizar log de seguridad"
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

      {/* Métricas rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total Eventos</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{total}</div>
        </div>
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px 16px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#166534", textTransform: "uppercase", fontWeight: 700 }}>Accesos Válidos</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>{exitosos}</div>
        </div>
        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "12px 16px", borderRadius: 8 }}>
          <span style={{ fontSize: 11, color: "#991b1b", textTransform: "uppercase", fontWeight: 700 }}>Intentos Fallidos / Bloqueos</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#b91c1c" }}>{fallidos}</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="barra-filtros" style={{ marginBottom: 16 }}>
        <form onSubmit={manejarBusqueda} style={{ display: "flex", gap: 8, flex: 1, minWidth: 220 }}>
          <input
            type="text"
            className="input-base"
            placeholder="Buscar por correo, usuario o dirección IP..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ flex: 1, fontSize: 12.5 }}
          />
          <button
            type="submit"
            className="boton-mini"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "7px 10px" }}
            title="Buscar eventos"
            aria-label="Buscar eventos"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Resultado:</label>
          <select
            className="input-base"
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value)}
            style={{ fontSize: 12.5 }}
          >
            <option value="">Todos los eventos</option>
            <option value="exitoso">Solo Exitosos</option>
            <option value="fallido">Solo Fallidos (Alerta)</option>
          </select>
        </div>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {cargando ? (
        <p className="descripcion">Cargando registros de auditoría...</p>
      ) : logs.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: 0, color: "#64748b" }}>No se encontraron eventos de seguridad con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Correo Intentado</th>
                <th>Usuario Asociado</th>
                <th>Dirección IP</th>
                <th style={{ textAlign: "center" }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id_log}>
                  <td style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>#{l.id_log}</td>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {new Date(l.fecha).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 12.5, color: "#0f172a" }}>
                    {l.correo_intento}
                  </td>
                  <td style={{ fontSize: 12, color: l.usuario_nombre ? "#334155" : "#94a3b8" }}>
                    {l.usuario_nombre || "No identificado"}
                  </td>
                  <td style={{ fontSize: 11.5, fontFamily: "monospace", color: "#475569" }}>
                    {l.ip}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {l.exitoso ? (
                      <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#166534", border: "1px solid #86efac" }}>
                        Inicio Correcto
                      </span>
                    ) : (
                      <span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                        Fallido
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
