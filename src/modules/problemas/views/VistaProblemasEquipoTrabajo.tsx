"use client";

import Link from "next/link";
import { DatosEquipoProblemas } from "@/modules/problemas/services/problemasEquipoService";

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
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
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
              fontWeight: 600,
            }}
          >
            Gestión de Problemas · Colaboración Técnica (ITIL v4)
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipo de Trabajo & Causa Raíz (RCA)
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Investigación colaborativa de incidentes recurrentes, errores conocidos y problemas en curso.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/plataforma/problemas/crear" className="boton-primario" style={{ textDecoration: "none" }}>
            + Registrar problema
          </Link>
          <Link href="/plataforma/problemas/mios" className="boton-secundario" style={{ textDecoration: "none" }}>
            Mis problemas
          </Link>
        </div>
      </div>

      {/* 2. Sección de Equipo */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          1. Equipo de Investigación Asignado {nombreEquipo ? `(${nombreEquipo})` : ""}
        </h2>

        {!perteneceAEquipo ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 12,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#334155", margin: "0 0 6px" }}>
              Sin equipo de investigación asignado
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 500, margin: "0 auto" }}>
              Tu usuario no se encuentra asignado a ningún grupo o departamento técnico en este momento.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {integrantes.map((i) => (
              <div
                key={i.id_usuario}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    backgroundColor: i.rol.includes("Tú") ? "#2563eb" : "#f1f5f9",
                    color: i.rol.includes("Tú") ? "#ffffff" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i.nombre_completo.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {i.nombre_completo}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {i.cargo || "Especialista TI"}
                  </div>
                  <div style={{ fontSize: 11, color: i.rol.includes("Tú") ? "#2563eb" : "#059669", fontWeight: 600, marginTop: 2 }}>
                    {i.rol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Sección: Problemas Activos en Curso */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          2. Problemas Activos en Análisis de Causa Raíz
        </h2>

        {problemasActivos.length === 0 ? (
          <div style={{ padding: 18, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13 }}>
            No hay problemas de investigación activos actualmente asignados a este equipo.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {problemasActivos.map((p) => (
              <div
                key={p.id_problema}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 18,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span
                      style={{
                        backgroundColor: p.color_estado,
                        color: "#ffffff",
                        padding: "2px 8px",
                        borderRadius: 10,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {p.estado_nombre}
                    </span>
                    <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                      Investigador: {p.tecnico_asignado}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "6px 0 2px" }}>
                      <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {p.codigo_problema} · {p.titulo}
                      </Link>
                    </h3>
                  </div>
                  <Link
                    href={`/plataforma/problemas/${p.id_problema}`}
                    className="boton-secundario"
                    style={{ fontSize: 12, padding: "5px 12px", textDecoration: "none" }}
                  >
                    Ver análisis RCA →
                  </Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", fontSize: 12 }}>
                  <div>
                    <strong style={{ color: "#475569" }}>Causa raíz: </strong>
                    <span style={{ color: p.causa_raiz ? "#0f172a" : "#94a3b8" }}>
                      {p.causa_raiz || "Pendiente de determinación"}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: "#475569" }}>Solución temporal (Workaround): </strong>
                    <span style={{ color: p.workaround ? "#059669" : "#94a3b8" }}>
                      {p.workaround || "Sin workaround documentado"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Sección: Historial de Problemas Resueltos */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          3. Historial de Problemas Resueltos en Equipo
        </h2>

        {historialResueltos.length === 0 ? (
          <div style={{ padding: 18, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13 }}>
            Aún no se registran problemas cerrados o resueltos por este equipo.
          </div>
        ) : (
          <div className="tarjeta-formulario" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
            <table className="tabla" style={{ width: "100%", margin: 0 }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Causa raíz documentada</th>
                  <th>Responsable</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historialResueltos.map((p) => (
                  <tr key={p.id_problema}>
                    <td>
                      <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}>
                        {p.codigo_problema}
                      </Link>
                    </td>
                    <td>{p.titulo}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: p.color_estado,
                          color: "#ffffff",
                          padding: "2px 6px",
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {p.estado_nombre}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.causa_raiz || "Solucionado"}
                    </td>
                    <td>{p.tecnico_asignado}</td>
                    <td>{formatearFecha(p.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
