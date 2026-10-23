"use client";

import { useEffect, useState } from "react";

interface Grupo {
  valor: string;
  total: number;
  tickets: { id_ticket: number; codigo_ticket: string; titulo: string; fecha: string | null }[];
}

interface Datos {
  dimension: string;
  total_incidentes: number;
  grupos: Grupo[];
}

const DIMENSIONES = [
  { valor: "servicio", etiqueta: "Servicio" },
  { valor: "ci", etiqueta: "Elemento de configuración" },
  { valor: "categoria", etiqueta: "Categoría" },
  { valor: "resolucion", etiqueta: "Categoría de resolución" },
];

export default function VistaRecurrentesProblemas() {
  const [dimension, setDimension] = useState("servicio");
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/problemas/gestion/recurrentes?dimension=${dimension}&_t=${Date.now()}`);
        const json = await res.json();
        if (!activo) return;
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los recurrentes.");
      } catch {
        if (activo) setError("Error de conexión al cargar los recurrentes.");
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, [dimension]);

  const maxTotal = data?.grupos.reduce((m, g) => Math.max(m, g.total), 0) ?? 0;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Incidentes recurrentes</h1>
        <p>Agrupación de incidentes de los últimos 90 días para detectar patrones que ameritan un problema.</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#374151" }}>
          Agrupar por
          <select value={dimension} onChange={(e) => setDimension(e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 220 }}>
            {DIMENSIONES.map((d) => <option key={d.valor} value={d.valor}>{d.etiqueta}</option>)}
          </select>
        </label>
        {data && <span style={{ fontSize: 12.5, color: "#6b7280", paddingBottom: 10 }}>{data.total_incidentes} incidentes analizados</span>}
      </div>

      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : !data || data.grupos.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay incidentes en el periodo analizado.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.grupos.map((g) => (
            <div key={g.valor} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <strong style={{ fontSize: 13.5 }}>{g.valor}</strong>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>{g.total}</span>
              </div>
              <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 6 }}>
                <div style={{ height: 6, width: `${maxTotal > 0 ? Math.round((g.total / maxTotal) * 100) : 0}%`, backgroundColor: "#1d4ed8", borderRadius: 999 }} />
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, color: "#6b7280", cursor: "pointer" }}>Ver incidentes</summary>
                <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                  {g.tickets.map((t) => <li key={t.id_ticket}>{t.codigo_ticket} · {t.titulo}</li>)}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
