"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WidgetConfig {
  id: string;
  titulo: string;
  tipo_grafico: "PASTEL" | "BARRAS" | "LINEAS" | "TABLA";
  metrica: string;
  filtro: string;
  ancho: "MEDIO" | "COMPLETO";
  activo: boolean;
}

export default function PaginaDisenadorReportesDashboards() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: "w1", titulo: "Distribución de Tickets Abiertos por Tipo (Incidentes vs Solicitudes)", tipo_grafico: "PASTEL", metrica: "conteo_tickets", filtro: "estado=abierto,en_proceso", ancho: "MEDIO", activo: true },
    { id: "w2", titulo: "Cumplimiento Porcentual de SLA por Categoría y Tipo", tipo_grafico: "BARRAS", metrica: "porcentaje_cumplimiento_sla", filtro: "ultimos_30_dias", ancho: "MEDIO", activo: true },
    { id: "w3", titulo: "Composición de Carga Activa por Nivel de Prioridad (P1 a P4)", tipo_grafico: "PASTEL", metrica: "prioridad_activos", filtro: "carga_cola", ancho: "MEDIO", activo: true },
    { id: "w4", titulo: "Pipeline y Estados del Ciclo de Vida del Servicio", tipo_grafico: "BARRAS", metrica: "estados_pipeline", filtro: "general", ancho: "MEDIO", activo: true },
    { id: "w5", titulo: "Evolución Temporal del Tiempo Medio de Resolución (MTTR)", tipo_grafico: "LINEAS", metrica: "mttr_horas", filtro: "historico_semestral", ancho: "COMPLETO", activo: true },
  ]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargarConfiguracion() {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/reportes-disenador");
      const data = await res.json();
      if (res.ok && data.widgets) {
        setWidgets(data.widgets);
      }
    } catch {
      console.error("Error al cargar widgets de dashboard");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  function alternarWidget(id: string) {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, activo: !w.activo } : w))
    );
  }

  async function guardarDashboard() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/admin/reportes-disenador", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgets }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración.");
        return;
      }
      setMensajeExito("Estructura de tableros ejecutivos y gráficos guardada y auditada exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar el tablero.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Diseñador de Reportes y Dashboards Globales</h1>
          <p className="subtitulo">
            Configure los gráficos, widgets e indicadores ejecutivos que visualizarán los gerentes y directores de TI (gráficos de pastel de tickets, barras de SLA, distribución de prioridades).
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/tickets/reportes"
            className="boton-secundario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center" }}
          >
            Ver Reportes Ejecutivos
          </Link>
          <button
            type="button"
            className="boton-primario"
            onClick={guardarDashboard}
            disabled={guardando}
            style={{ width: "auto", fontSize: 13, padding: "8px 16px" }}
          >
            {guardando ? "Guardando..." : "Guardar Tablero"}
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Lista de Widgets Configurables */}
      {cargando ? (
        <p className="descripcion">Cargando configuración de tableros...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {widgets.map((w) => (
            <div
              key={w.id}
              style={{
                backgroundColor: "#ffffff",
                border: w.activo ? "1px solid #cbd5e1" : "1px dashed #cbd5e1",
                borderRadius: 8,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: w.activo ? 1 : 0.6,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    {w.tipo_grafico}
                  </span>
                  <strong style={{ fontSize: 14, color: "#0f172a" }}>{w.titulo}</strong>
                </div>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Métrica: <code>{w.metrica}</code> | Segmentación: <code>{w.filtro}</code> | Ancho de pantalla: {w.ancho}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => alternarWidget(w.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid #cbd5e1",
                    backgroundColor: w.activo ? "#ecfdf5" : "#f1f5f9",
                    color: w.activo ? "#047857" : "#64748b",
                  }}
                >
                  {w.activo ? "Widget Activo" : "Deshabilitado"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
