"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cambio } from "@/types";

export default function PaginaCalendarioCambios() {
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarEventos() {
    setCargando(true);
    try {
      const res = await fetch("/api/cambios");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Ordenar por fecha de ventana de inicio ascendente
        data.sort((a, b) => new Date(a.ventana_inicio).getTime() - new Date(b.ventana_inicio).getTime());
        setCambios(data);
      }
    } catch (err) {
      console.error("Error al cargar calendario de cambios:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  // Detección de colisiones / conflictos de ventana entre cambios
  function detectarColision(cambioActual: Cambio): boolean {
    const inicio = new Date(cambioActual.ventana_inicio).getTime();
    const fin = new Date(cambioActual.ventana_fin).getTime();

    return cambios.some((c) => {
      if (c.id_cambio === cambioActual.id_cambio) return false;
      const cIni = new Date(c.ventana_inicio).getTime();
      const cFin = new Date(c.ventana_fin).getTime();
      const haySolape = inicio < cFin && fin > cIni;
      // Colisión si solapan tiempo y tienen el mismo CI o ambos son de alto impacto
      return haySolape && (c.id_ci_afectado === cambioActual.id_ci_afectado || (c.id_impacto === 3 && cambioActual.id_impacto === 3));
    });
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Calendario de Ventanas de Mantenimiento y Cambios (ITIL v4)</h1>
          <p>
            Programación de ventanas de intervención autorizadas, verificación de colisiones y congelamientos oficiales (Change Freeze).
          </p>
        </div>
        <Link href="/plataforma/cambios/gestion/crear" className="boton-primario" style={{ width: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Programar Cambio
        </Link>
      </div>

      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: 12.5,
          color: "#334155",
          lineHeight: 1.6,
        }}
      >
        <strong>Gestión de Conflictos y Ventanas de Silencio:</strong> El sistema analiza en tiempo real las ventanas de inicio y fin para alertar sobre solapamientos en un mismo elemento de configuración (CI) o colisiones durante periodos de cierre de operaciones.
      </div>

      {cargando ? (
        <div style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando cronograma oficial de cambios...
        </div>
      ) : cambios.length === 0 ? (
        <div style={{ padding: 36, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontWeight: 600 }}>
            No hay ventanas de cambio programadas en el cronograma institucional.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Periodo de Congelamiento Institucional de Cierre de Año */}
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <strong style={{ fontSize: 14, color: "#991b1b" }}>
                  20 de Diciembre al 02 de Enero (Anual)
                </strong>
                <span
                  className="badge-itil"
                  style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}
                >
                  Change Freeze Oficial
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#7f1d1d" }}>
                Congelamiento obligatorio de cambios para resguardar la facturación y cierre contable del ejercicio. Únicamente se autorizan cambios de Emergencia (ECAB).
              </div>
            </div>
          </div>

          {/* Lista de Cambios Programados desde Base de Datos */}
          {cambios.map((c) => {
            const tieneColision = detectarColision(c);

            return (
              <div
                key={c.id_cambio}
                style={{
                  backgroundColor: tieneColision ? "#fffbeb" : "#f8fafc",
                  border: `1px solid ${tieneColision ? "#fde68a" : "#e2e8f0"}`,
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>
                      {new Date(c.ventana_inicio).toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </strong>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      ({new Date(c.ventana_inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date(c.ventana_fin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                    </span>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: c.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : "#eff6ff",
                        color: c.tipo_cambio === "EMERGENCIA" ? "#991b1b" : "#1d4ed8",
                        border: `1px solid ${c.tipo_cambio === "EMERGENCIA" ? "#fca5a5" : "#bfdbfe"}`,
                      }}
                    >
                      {c.tipo_cambio}
                    </span>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: c.id_estado === 3 ? "#ecfdf5" : "#f1f5f9",
                        color: c.id_estado === 3 ? "#065f46" : "#475569",
                        border: `1px solid ${c.id_estado === 3 ? "#a7f3d0" : "#cbd5e1"}`,
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                    {tieneColision && (
                      <span
                        className="badge-itil"
                        style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", fontWeight: 700 }}
                      >
                        Alerta de Colisión Horaria
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "#334155" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{c.codigo_cambio}</span>: {c.titulo}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    CI Afectado: <strong>{c.ci_codigo ? `[${c.ci_codigo}] ${c.ci_nombre}` : "General"}</strong> • Solicitante: {c.solicitante_nombre}
                  </div>
                </div>

                <div>
                  <Link
                    href="/plataforma/cambios/gestion/todos"
                    className="boton-mini"
                    style={{ textDecoration: "none", fontSize: 11.5 }}
                  >
                    Ver en Historial
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
