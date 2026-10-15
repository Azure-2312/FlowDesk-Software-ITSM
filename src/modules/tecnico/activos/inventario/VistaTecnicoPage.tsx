"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface ActivoItem {
  id_activo: number;
  codigo_patrimonial: string;
  numero_serie: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  departamento_nombre?: string;
  custodio_nombre?: string;
  estado_activo: string;
  fecha_fin_garantia?: string;
}

export default function PaginaInventarioActivos() {
  const [activos, setActivos] = useState<ActivoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  async function cargarActivos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setActivos(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudo cargar el inventario de activos.");
      }
    } catch {
      setError("Error de conexión al cargar activos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarActivos();
  }, []);

  const activosFiltrados = useMemo(() => {
    return activos.filter((a) => {
      if (filtroTipo !== "TODOS" && a.tipo_activo !== filtroTipo) return false;
      if (filtroEstado !== "TODOS" && a.estado_activo !== filtroEstado) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = a.codigo_patrimonial?.toLowerCase().includes(q);
        const matchSer = a.numero_serie?.toLowerCase().includes(q);
        const matchMod = a.modelo?.toLowerCase().includes(q);
        const matchMar = a.marca?.toLowerCase().includes(q);
        const matchCus = a.custodio_nombre?.toLowerCase().includes(q);
        if (!matchCod && !matchSer && !matchMod && !matchMar && !matchCus) return false;
      }

      return true;
    });
  }, [activos, filtroTipo, filtroEstado, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Inventario de activos de TI
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Consulta de equipamiento tecnológico, custodios asignados y estado operativo ({activosFiltrados.length} activos)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarActivos}
          style={{
            padding: "8px 14px",
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por código patrimonial, serie, modelo o custodio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        />

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="TODOS">Todos los tipos</option>
          <option value="HARDWARE">Hardware</option>
          <option value="SOFTWARE">Software</option>
          <option value="RED">Red / Comunicaciones</option>
          <option value="TELEFONIA">Telefonía</option>
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="TODOS">Todos los estados</option>
          <option value="OPERATIVO">Operativo</option>
          <option value="EN_MANTENIMIENTO">En mantenimiento</option>
          <option value="DE_BAJA">De baja</option>
        </select>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando inventario de activos...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && activosFiltrados.length === 0 && (
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
            No se encontraron activos
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No hay registros que coincidan con los criterios de búsqueda aplicados.
          </p>
        </div>
      )}

      {!cargando && !error && activosFiltrados.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Marca / Modelo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Número de Serie</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Custodio Asignado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {activosFiltrados.map((a) => (
                <tr key={a.id_activo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {a.codigo_patrimonial}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {a.tipo_activo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 500 }}>
                    {a.marca} {a.modelo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontFamily: "monospace" }}>
                    {a.numero_serie || "-"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {a.custodio_nombre || <span style={{ color: "#94a3b8" }}>Sin custodio</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: a.estado_activo === "OPERATIVO" ? "#ecfdf5" : "#fef3c7",
                        color: a.estado_activo === "OPERATIVO" ? "#065f46" : "#92400e",
                      }}
                    >
                      {a.estado_activo}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/tecnico/mesa/registrar?activo=${a.codigo_patrimonial}`}
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#2563eb",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Reportar falla
                    </Link>
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
