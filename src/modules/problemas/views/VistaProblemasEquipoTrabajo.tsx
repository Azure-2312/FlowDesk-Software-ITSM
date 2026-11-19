"use client";

import Link from "next/link";
import { DatosEquipoProblemas } from "@/modules/problemas/services/problemasEquipoService";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface Props {
  datos: DatosEquipoProblemas;
}

function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { dateStyle: "short" });
}

export default function VistaProblemasEquipoTrabajo({ datos }: Props) {
  const { perteneceAEquipo, nombreEquipo, integrantes, problemasActivos, historialResueltos } = datos;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#fef3c7",
              color: "#92400e",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Problemas · Trabajo Colaborativo (ITIL v4)
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipo de Trabajo & Causa Raíz (RCA)
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Investigación técnica conjunta, análisis de causa raíz y soluciones de contingencia entre especialistas del departamento.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/plataforma/problemas/mios"
            className="boton-secundario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 16px" }}
          >
            Mis problemas
          </Link>
          <Link
            href="/plataforma/problemas/crear"
            className="boton-primario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 18px" }}
          >
            + Registrar problema
          </Link>
        </div>
      </div>

      {/* 2. Sección: Casos Activos de Investigación en Curso */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            1. Problemas Activos en Análisis de Causa Raíz ({nombreEquipo})
          </h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {problemasActivos.length} casos en investigación
          </span>
        </div>

        {problemasActivos.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 12,
              padding: "36px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
              Sin problemas activos en curso
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
              No hay incidentes mayores o casos de causa raíz bajo investigación activa en este departamento técnico. Puedes registrar uno nuevo o consultar la base de errores conocidos.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {problemasActivos.map((p) => (
              <div
                key={p.id_problema}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "20px 24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          backgroundColor: p.color_estado || "#d97706",
                          color: "#ffffff",
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.estado_nombre}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        Asignado a: <strong style={{ color: "#334155" }}>{p.tecnico_asignado}</strong>
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>·</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        Registrado: {formatearFecha(p.fecha_creacion)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>
                      <span style={{ fontFamily: "monospace", color: "#be185d", marginRight: 8 }}>{p.codigo_problema}</span>
                      {p.titulo}
                    </h3>

                    {p.descripcion && (
                      <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                        {p.descripcion}
                      </p>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/plataforma/problemas/${p.id_problema}`}
                      className="boton-primario"
                      style={{ fontSize: 12.5, padding: "7px 16px", textDecoration: "none", width: "auto" }}
                    >
                      Abrir expediente RCA →
                    </Link>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase" }}>
                      🔍 Causa Raíz Investigada
                    </div>
                    <div style={{ fontSize: 12.5, color: "#7f1d1d", marginTop: 4, lineHeight: 1.4 }}>
                      {p.causa_raiz || "Pendiente de identificar mediante análisis técnico."}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                      💡 Solución Temporal / Workaround
                    </div>
                    <div style={{ fontSize: 12.5, color: "#14532d", marginTop: 4, lineHeight: 1.4 }}>
                      {p.workaround || "Sin workaround provisional registrado."}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sección: Integrantes del Equipo de Investigación */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            2. Especialistas del Equipo ({nombreEquipo || "Soporte TI"})
          </h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {integrantes.length} especialistas registrados
          </span>
        </div>

        {integrantes.length === 0 ? (
          <div style={{ padding: 24, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, textAlign: "center" }}>
            No hay integrantes registrados en este departamento técnico.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {integrantes.map((i) => {
              const esUsuario = i.rol.includes("Tú");
              return (
                <div
                  key={i.id_usuario}
                  style={{
                    backgroundColor: "#ffffff",
                    border: esUsuario ? "2px solid #93c5fd" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      backgroundColor: esUsuario ? "#2563eb" : "#f1f5f9",
                      color: esUsuario ? "#ffffff" : "#334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {i.nombre_completo.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {i.nombre_completo}
                      </div>
                      {esUsuario && (
                        <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: 4 }}>
                          Tú
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                      {i.cargo || "Especialista RCA"}
                    </div>
                    <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>
                      {i.rol}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Sección: Historial de Problemas Resueltos */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            3. Historial de Problemas Resueltos o Cerrados
          </h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {historialResueltos.length} casos concluidos
          </span>
        </div>

        {historialResueltos.length === 0 ? (
          <div style={{ padding: 24, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, textAlign: "center" }}>
            Aún no se registran problemas resueltos o cerrados en este equipo técnico.
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <TablaDobleScroll minWidth={900}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Código</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Título del Problema</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Estado</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Causa Raíz Documentada</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Responsable</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historialResueltos.map((p) => (
                    <tr key={p.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, color: "#be185d" }}>
                        <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ color: "#be185d", textDecoration: "none" }}>
                          {p.codigo_problema}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 600 }}>
                        {p.titulo}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            backgroundColor: p.color_estado || "#15803d",
                            color: "#ffffff",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {p.estado_nombre}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#334155", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.causa_raiz || "Solución aplicada."}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        {p.tecnico_asignado}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                        {formatearFecha(p.fecha_creacion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TablaDobleScroll>
          </div>
        )}
      </div>
    </div>
  );
}
