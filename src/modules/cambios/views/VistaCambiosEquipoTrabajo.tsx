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
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 28 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Cambios · Equipo Técnico ITIL v4
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipo de Trabajo & Cambios RFC Asignados
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Supervisión operativa de colaboradores asignados al departamento, cambio activo en ejecución e historial conjunto.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/plataforma/cambios/mis-cambios"
            className="boton-secundario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 16px" }}
          >
            Mis cambios
          </Link>
          <Link
            href="/plataforma/cambios/nuevo"
            className="boton-primario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 18px" }}
          >
            + Solicitar cambio
          </Link>
        </div>
      </div>

      {/* 2. Sección: Cambio Activo en Curso */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            1. Cambio RFC Activo Asignado al Equipo
          </h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {cambioActivo ? "1 cambio activo en curso" : "Sin ejecución activa"}
          </span>
        </div>

        {cambioActivo ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #bfdbfe",
              borderRadius: 12,
              padding: "20px 24px",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      backgroundColor: cambioActivo.color_estado || "#2563eb",
                      color: "#ffffff",
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {cambioActivo.nombre_estado}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                    Tipo: <strong style={{ color: "#334155" }}>{cambioActivo.tipo_cambio}</strong>
                  </span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>
                  <span style={{ fontFamily: "monospace", color: "#2563eb", marginRight: 8 }}>{cambioActivo.codigo_cambio}</span>
                  {cambioActivo.titulo}
                </h3>

                {cambioActivo.descripcion && (
                  <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0 0", lineHeight: 1.45 }}>
                    {cambioActivo.descripcion}
                  </p>
                )}
              </div>

              <div>
                <Link
                  href="/plataforma/cambios/mis-cambios"
                  className="boton-primario"
                  style={{ fontSize: 12.5, padding: "7px 16px", textDecoration: "none", width: "auto" }}
                >
                  Ver seguimiento RFC →
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                padding: "14px 18px",
                border: "1px solid #f1f5f9",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Ventana Inicio</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {formatearFecha(cambioActivo.ventana_inicio)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Ventana Fin</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {formatearFecha(cambioActivo.ventana_fin)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>CI / Componente Afectado</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                  {cambioActivo.codigo_ci ? `${cambioActivo.codigo_ci} (${cambioActivo.nombre_ci || "Activo"})` : "Infraestructura General"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Especialista Asignado</div>
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
              Sin cambio RFC asignado en este momento
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
              Tu equipo técnico no tiene asignada ninguna intervención en ventana operativa activa. Cuando un cambio sea aprobado por el CAB y programado, se desplegarán aquí su cronograma y tareas asignadas.
            </p>
          </div>
        )}
      </div>

      {/* 3. Sección: Integrantes del Departamento Técnico */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            2. Integrantes del Equipo ({nombreEquipo || "Soporte TI"})
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
                      {i.cargo || "Especialista Técnico"}
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

      {/* 4. Sección: Historial de Cambios Implementados */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            3. Historial de Cambios Cerrados o Implementados
          </h2>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {historial.length} implementaciones registradas
          </span>
        </div>

        {historial.length === 0 ? (
          <div style={{ padding: 24, backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", color: "#64748b", fontSize: 13, textAlign: "center" }}>
            Aún no se registran cambios cerrados o ejecutados en este equipo.
          </div>
        ) : (
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <TablaDobleScroll minWidth={900}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Código RFC</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Título del Cambio</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Tipo</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Estado</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Responsable</th>
                    <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 700 }}>Fecha Ejecución</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((c) => (
                    <tr key={c.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>
                        {c.codigo_cambio}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 600 }}>
                        {c.titulo}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>
                        {c.tipo_cambio}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            backgroundColor: c.color_estado || "#64748b",
                            color: "#ffffff",
                            padding: "3px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {c.nombre_estado}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#334155" }}>
                        {c.responsable}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                        {formatearFecha(c.ventana_fin || c.ventana_inicio)}
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
