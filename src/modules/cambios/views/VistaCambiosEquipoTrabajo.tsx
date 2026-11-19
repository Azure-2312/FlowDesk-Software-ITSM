"use client";

import Link from "next/link";
import { DatosEquipoTrabajo } from "@/modules/cambios/services/cambiosEquipoService";

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
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#f0fdf4",
              color: "#166534",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Gestión de Cambios · Trabajo Colaborativo (ITIL v4)
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipo de Trabajo & RFC Asignado
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Supervisión del equipo técnico, avance del cambio activo en curso y trazabilidad histórica de implementaciones.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/plataforma/cambios/nuevo" className="boton-primario" style={{ textDecoration: "none" }}>
            + Solicitar cambio
          </Link>
          <Link href="/plataforma/cambios/mis-cambios" className="boton-secundario" style={{ textDecoration: "none" }}>
            Mis cambios
          </Link>
        </div>
      </div>

      {/* 2. Sección: Cambio Activo Asignado */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          1. Cambio RFC Activo en Curso (1 por equipo)
        </h2>

        {cambioActivo ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #bfdbfe",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div>
                <span
                  style={{
                    backgroundColor: cambioActivo.color_estado,
                    color: "#ffffff",
                    padding: "3px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {cambioActivo.nombre_estado}
                </span>
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                  Tipo: {cambioActivo.tipo_cambio}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>
                  {cambioActivo.codigo_cambio} · {cambioActivo.titulo}
                </h3>
                {cambioActivo.descripcion && (
                  <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{cambioActivo.descripcion}</p>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <Link
                  href={`/plataforma/cambios/mis-cambios`}
                  className="boton-primario"
                  style={{ fontSize: 12, padding: "6px 14px", textDecoration: "none" }}
                >
                  Ver detalles de implementación →
                </Link>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Ventana de Inicio</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {formatearFecha(cambioActivo.ventana_inicio)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Ventana de Fin</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {formatearFecha(cambioActivo.ventana_fin)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>CI / Servicio Afectado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {cambioActivo.codigo_ci ? `${cambioActivo.codigo_ci} (${cambioActivo.nombre_ci})` : "Infraestructura General"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Responsable Asignado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {cambioActivo.responsable}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px dashed #cbd5e1",
              borderRadius: 12,
              padding: "36px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
              Sin equipo de cambio asignado actualmente
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
              No te encuentras asignado a ningún RFC activo en fase de planificación o implementación en este momento. Cuando se programe una intervención técnica, aparecerá aquí junto a su cronograma y plan de ejecución.
            </p>
          </div>
        )}
      </div>

      {/* 3. Sección: Integrantes del Equipo de Trabajo */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          2. Integrantes del Equipo ({nombreEquipo})
        </h2>

        {integrantes.length === 0 ? (
          <div style={{ padding: 18, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13 }}>
            No hay integrantes registrados en este departamento técnico.
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
                    {i.cargo || "Especialista Técnico"}
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

      {/* 4. Sección: Historial de Cambios Resueltos */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
          3. Historial de Cambios Realizados (Solo o en Equipo)
        </h2>

        {historial.length === 0 ? (
          <div style={{ padding: 18, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13 }}>
            Aún no se registran cambios cerrados o implementados por este equipo.
          </div>
        ) : (
          <div className="tarjeta-formulario" style={{ margin: 0, padding: 0, overflow: "hidden" }}>
            <table className="tabla" style={{ width: "100%", margin: 0 }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Ventana ejecutada</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((c) => (
                  <tr key={c.id_cambio}>
                    <td>
                      <span style={{ fontWeight: 700, color: "#1d4ed8" }}>{c.codigo_cambio}</span>
                    </td>
                    <td>{c.titulo}</td>
                    <td>{c.tipo_cambio}</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: c.color_estado,
                          color: "#ffffff",
                          padding: "2px 6px",
                          borderRadius: 8,
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {c.nombre_estado}
                      </span>
                    </td>
                    <td>{c.responsable}</td>
                    <td>{formatearFecha(c.ventana_fin || c.ventana_inicio)}</td>
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
