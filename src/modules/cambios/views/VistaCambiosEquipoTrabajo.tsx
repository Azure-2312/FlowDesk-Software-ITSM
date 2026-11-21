"use client";

import Link from "next/link";
import { DatosEquipoTrabajo } from "@/modules/cambios/services/cambiosEquipoService";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface Props {
  datos: DatosEquipoTrabajo;
}

function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export default function VistaCambiosEquipoTrabajo({ datos }: Props) {
  const { nombreEquipo, integrantes, cambioActivo, historial } = datos;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
            Mi equipo de trabajo: {nombreEquipo}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Supervisión del equipo técnico, especialistas asignados y estado operativo de cambios en cartera.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/plataforma/cambios/equipos"
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
            }}
          >
            Ver todos los equipos
          </Link>
          <Link
            href="/plataforma/cambios/mis-cambios"
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              color: "#334155",
            }}
          >
            Mis cambios
          </Link>
        </div>
      </div>

      {/* 2. Contenido de Mi Equipo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Cambio Activo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Cambio RFC activo del equipo
            </h2>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {cambioActivo ? "1 cambio en ejecución" : "Sin ejecución activa"}
            </span>
          </div>

          {cambioActivo ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        backgroundColor: "#eff6ff",
                        color: "#1d4ed8",
                        border: "1px solid #bfdbfe",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {cambioActivo.nombre_estado}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>
                      {cambioActivo.codigo_cambio}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    {cambioActivo.titulo}
                  </h3>
                </div>

                <Link
                  href={`/plataforma/cambios/gestion/${cambioActivo.id_cambio}`}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Abrir expediente
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, fontSize: 12.5 }}>
                <div><strong>Tipo:</strong> {cambioActivo.tipo_cambio}</div>
                <div><strong>Responsable:</strong> {cambioActivo.responsable || "Sin asignar"}</div>
                <div><strong>Ventana inicio:</strong> {formatearFecha(cambioActivo.ventana_inicio)}</div>
                <div><strong>Ventana fin:</strong> {formatearFecha(cambioActivo.ventana_fin)}</div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 13 }}>
              No hay cambios en estado de ejecución activo asignados a tu equipo en este momento.
            </div>
          )}
        </div>

        {/* Integrantes del Equipo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Especialistas y técnicos asignados ({integrantes.length})
            </h2>
          </div>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Especialista</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Correo</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Cargo</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Rol en equipo</th>
                </tr>
              </thead>
              <tbody>
                {integrantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                      No hay integrantes asignados a este equipo resolutor.
                    </td>
                  </tr>
                ) : (
                  integrantes.map((i) => (
                    <tr key={i.id_usuario} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b" }}>
                        {i.nombre_completo}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#64748b" }}>{i.correo}</td>
                      <td style={{ padding: "10px 14px", color: "#334155" }}>{i.cargo || "Especialista"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: i.rol.startsWith("Tú") ? "#eff6ff" : "#f1f5f9",
                            color: i.rol.startsWith("Tú") ? "#1d4ed8" : "#475569",
                          }}
                        >
                          {i.rol}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial Reciente de Cambios */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
            Historial de cambios ejecutados por el equipo ({historial.length})
          </h2>

          <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Código RFC</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Título</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Tipo</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Responsable</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600 }}>Estado</th>
                  <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                      No se registran cambios históricos completados por este equipo.
                    </td>
                  </tr>
                ) : (
                  historial.map((h) => (
                    <tr key={h.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                        {h.codigo_cambio}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#1e293b", maxWidth: 320 }}>
                        {h.titulo}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 11.5, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#475569" }}>
                          {h.tipo_cambio}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "#475569" }}>{h.responsable || "—"}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: h.id_estado === 6 ? "#ecfdf5" : "#fef2f2",
                            color: h.id_estado === 6 ? "#065f46" : "#991b1b",
                          }}
                        >
                          {h.nombre_estado}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <Link
                          href={`/plataforma/cambios/gestion/${h.id_cambio}`}
                          style={{
                            padding: "4px 8px",
                            fontSize: 11.5,
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            color: "#1e293b",
                            textDecoration: "none",
                            backgroundColor: "#f8fafc",
                          }}
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
