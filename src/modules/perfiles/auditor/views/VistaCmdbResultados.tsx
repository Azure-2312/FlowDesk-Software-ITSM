"use client";

import { useEffect, useState } from "react";

interface Control {
  codigo: string;
  nombre: string;
  severidad: "ALTA" | "MEDIA" | "BAJA";
  total: number;
  muestra: Record<string, any>[];
}

const COLOR_SEVERIDAD: Record<string, { bg: string; fg: string }> = {
  ALTA: { bg: "#fee2e2", fg: "#b91c1c" },
  MEDIA: { bg: "#fef3c7", fg: "#92400e" },
  BAJA: { bg: "#e0e7ff", fg: "#3730a3" },
};

function descripcionMuestra(fila: Record<string, any>) {
  if (fila.codigo_ci) return `${fila.codigo_ci} · ${fila.nombre ?? ""}`.trim();
  if (fila.codigo_patrimonial) return `${fila.codigo_patrimonial} · ${fila.marca ?? ""} ${fila.modelo ?? ""}`.trim();
  return Object.values(fila).join(" · ");
}

export default function VistaCmdbResultados() {
  const [controles, setControles] = useState<Control[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/auditor/cmdb/resultados?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setControles(Array.isArray(json?.controles) ? json.controles : []);
        else setError(json.error ?? "No se pudieron cargar los resultados de CMDB.");
      } catch {
        setError("Error de conexión al cargar los resultados de CMDB.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;

  const totalInconsistencias = controles.reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Resultados de auditorías de CMDB</h1>
        <p>Controles de integridad sobre activos y elementos de configuración. Total de inconsistencias: <strong>{totalInconsistencias}</strong>.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {controles.map((c) => {
          const color = COLOR_SEVERIDAD[c.severidad] ?? COLOR_SEVERIDAD.BAJA;
          return (
            <div key={c.codigo} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 14 }}>{c.codigo} · {c.nombre}</strong>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{c.severidad}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c.total > 0 ? "#b91c1c" : "#15803d", marginTop: 8 }}>{c.total}</div>
              {c.muestra.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", fontSize: 12, color: "#374151", display: "flex", flexDirection: "column", gap: 4 }}>
                  {c.muestra.slice(0, 6).map((f, i) => (
                    <li key={i} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 3 }}>{descripcionMuestra(f)}</li>
                  ))}
                  {c.total > c.muestra.length && <li style={{ color: "#6b7280" }}>… y {c.total - c.muestra.length} más</li>}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
