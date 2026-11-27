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
  const { nombreEquipo, integrantes, problemasActivos, historialResueltos } = datos;

  return (
    <div className="vista-contenedor" style={{ gap: 20 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <div>
          <h1 className="titulo-pagina">
            Mi equipo de trabajo: {nombreEquipo}
          </h1>
          <p className="descripcion-pagina">
            Supervisión operativa de especialistas, diagnósticos de causa raíz y casos de problemas asignados a tu equipo.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/plataforma/problemas/equipos"
            className="boton-secundario"
          >
            Ver todos los equipos
          </Link>
          <Link
            href="/plataforma/problemas/mios"
            className="boton-secundario"
          >
            Mis problemas
          </Link>
        </div>
      </div>

      {/* 2. Integrantes del Equipo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Especialistas y técnicos asignados ({integrantes.length})
          </h2>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
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
                  <td colSpan={4} className="celda-vacia">
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

      {/* 3. Problemas Activos en Investigación */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Problemas activos asignados al equipo ({problemasActivos.length})
          </h2>
        </div>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Fecha</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Responsable</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {problemasActivos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="celda-vacia">
                    No hay problemas activos asignados a este equipo en este momento.
                  </td>
                </tr>
              ) : (
                problemasActivos.map((p) => (
                  <tr key={p.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                      {p.codigo_problema}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#1e293b", maxWidth: 320 }}>
                      {p.titulo}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>
                      {formatearFecha(p.fecha_creacion)}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>{p.tecnico_asignado || "Sin asignar"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                        }}
                      >
                        {p.estado_nombre}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <Link
                        href={`/plataforma/problemas/${p.id_problema}`}
                        className="boton-secundario boton-sm"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Historial de Problemas Resueltos */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
          Historial de problemas resueltos por el equipo ({historialResueltos.length})
        </h2>

        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Causa Raíz</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Fecha Cierre</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {historialResueltos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                    No se registran problemas históricos resueltos por este equipo.
                  </td>
                </tr>
              ) : (
                historialResueltos.map((h) => (
                  <tr key={h.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                      {h.codigo_problema}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#1e293b", maxWidth: 320 }}>
                      {h.titulo}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569", fontSize: 12 }}>
                      {h.causa_raiz ? h.causa_raiz.substring(0, 80) + "..." : "Documentada"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>
                      {formatearFecha(h.fecha_creacion)}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <Link
                        href={`/plataforma/problemas/${h.id_problema}`}
                        className="boton-secundario boton-sm"
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
  );
}
