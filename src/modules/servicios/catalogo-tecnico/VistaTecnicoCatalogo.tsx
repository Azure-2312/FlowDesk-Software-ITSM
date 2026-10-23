"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ServicioCatalogo } from "@/types";

export default function PaginaCatalogoServicios() {
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [pestana, setPestana] = useState<"todos" | "incidentes" | "solicitudes">("todos");

  useEffect(() => {
    async function cargarCatalogo() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch("/api/tickets/catalogos");
        if (res.ok) {
          const data = await res.json();
          setServicios(data.servicios || []);
        } else {
          setError("No se pudo cargar el catálogo de servicios.");
        }
      } catch {
        setError("Error de conexión al cargar catálogo.");
      } finally {
        setCargando(false);
      }
    }
    cargarCatalogo();
  }, []);

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      if (pestana === "incidentes" && s.id_tipo_ticket !== 1) return false;
      if (pestana === "solicitudes" && s.id_tipo_ticket !== 2) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = s.codigo_servicio?.toLowerCase().includes(q);
        const matchNom = s.nombre?.toLowerCase().includes(q);
        const matchDesc = s.descripcion_comercial?.toLowerCase().includes(q);
        if (!matchCod && !matchNom && !matchDesc) return false;
      }

      return true;
    });
  }, [servicios, pestana, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Catálogo de servicios de TI (Consulta)
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Especificación de servicios tecnológicos ofrecidos, acuerdos de nivel de servicio y compuertas de aprobación
        </p>
      </div>

      {/* Pestañas y Buscador */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setPestana("todos")}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: pestana === "todos" ? 600 : 500,
              border: "none",
              backgroundColor: pestana === "todos" ? "#2563eb" : "#ffffff",
              color: pestana === "todos" ? "#ffffff" : "#475569",
              cursor: "pointer",
            }}
          >
            Todos ({servicios.length})
          </button>
          <button
            type="button"
            onClick={() => setPestana("incidentes")}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: pestana === "incidentes" ? 600 : 500,
              border: "none",
              backgroundColor: pestana === "incidentes" ? "#2563eb" : "#ffffff",
              color: pestana === "incidentes" ? "#ffffff" : "#475569",
              cursor: "pointer",
            }}
          >
            Incidentes
          </button>
          <button
            type="button"
            onClick={() => setPestana("solicitudes")}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: pestana === "solicitudes" ? 600 : 500,
              border: "none",
              backgroundColor: pestana === "solicitudes" ? "#2563eb" : "#ffffff",
              color: pestana === "solicitudes" ? "#ffffff" : "#475569",
              cursor: "pointer",
            }}
          >
            Solicitudes de servicio
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por código, nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: 340,
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        />
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando catálogo de servicios...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && serviciosFiltrados.length === 0 && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No se encontraron servicios
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Verifica el término ingresado o cambia la pestaña seleccionada.
          </p>
        </div>
      )}

      {!cargando && !error && serviciosFiltrados.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {serviciosFiltrados.map((s) => (
            <div
              key={s.id_servicio}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
                    {s.codigo_servicio}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: s.requiere_aprobacion ? "#fef3c7" : "#ecfdf5",
                      color: s.requiere_aprobacion ? "#92400e" : "#065f46",
                    }}
                  >
                    {s.requiere_aprobacion ? "Requiere Aprobación" : "Atención Directa"}
                  </span>
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                  {s.nombre}
                </h2>

                <p
                  style={{
                    fontSize: 12.5,
                    color: "#475569",
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {s.descripcion_comercial || s.entregable || "Servicio tecnológico institucional administrado por TI."}
                </p>
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  SLA: {s.sla_horas_resolucion ? `${s.sla_horas_resolucion}h` : "Por prioridad"}
                </span>

                <Link
                  href={`/plataforma/tickets/mesa/registrar?servicio=${s.id_servicio}`}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Registrar ticket
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
