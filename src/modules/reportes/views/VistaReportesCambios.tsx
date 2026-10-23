"use client";

import { useEffect, useState } from "react";

interface Resumen {
  total: number;
  exitosos: number;
  fallidos: number;
  emergencias: number;
  incidentes_inducidos: number;
  horas_ciclo_promedio: number | null;
  tasa_exito: number | null;
  cumplimiento_ventana: number | null;
}

interface PorTipo {
  tipo_cambio: string;
  total: number;
  exitosos: number;
  fallidos: number;
}

interface Datos {
  resumen: Resumen;
  porTipo: PorTipo[];
}

function Kpi({ titulo, valor, sufijo, color }: { titulo: string; valor: number | string; sufijo?: string; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>
        {valor}{sufijo && <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 3 }}>{sufijo}</span>}
      </div>
    </div>
  );
}

export default function VistaReportesCambios() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/reportes/cambios?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los reportes.");
      } catch {
        setError("Error de conexión al cargar los reportes.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  const r = data.resumen;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Reportes de cambios</h1>
        <p>Tasa de éxito, emergencias, tiempo de ciclo, incidentes inducidos y cumplimiento de ventana.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="RFC totales" valor={r.total} />
        <Kpi titulo="Exitosos" valor={r.exitosos} color="#166534" />
        <Kpi titulo="Fallidos" valor={r.fallidos} color={r.fallidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Emergencias" valor={r.emergencias} color={r.emergencias > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Tasa de éxito" valor={r.tasa_exito === null ? "—" : r.tasa_exito} sufijo={r.tasa_exito === null ? undefined : "%"} color="#166534" />
        <Kpi titulo="Cumplimiento de ventana" valor={r.cumplimiento_ventana === null ? "—" : r.cumplimiento_ventana} sufijo={r.cumplimiento_ventana === null ? undefined : "%"} />
        <Kpi titulo="Incidentes inducidos" valor={r.incidentes_inducidos} color={r.incidentes_inducidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Horas de ciclo prom." valor={r.horas_ciclo_promedio === null ? "—" : r.horas_ciclo_promedio} sufijo={r.horas_ciclo_promedio === null ? undefined : "h"} />
      </div>

      <div className="tarjeta-formulario" style={{ margin: 0 }}>
        <h2>Desempeño por tipo de cambio</h2>
        {data.porTipo.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin datos de cambios.</p>
        ) : (
          <table className="tabla-datos">
            <thead><tr><th>Tipo</th><th>Total</th><th>Exitosos</th><th>Fallidos</th><th>Tasa de éxito</th></tr></thead>
            <tbody>
              {data.porTipo.map((t) => {
                const cerrados = t.exitosos + t.fallidos;
                const tasaTipo = cerrados > 0 ? Math.round((t.exitosos / cerrados) * 100) : null;
                return (
                  <tr key={t.tipo_cambio}>
                    <td><strong>{t.tipo_cambio}</strong></td>
                    <td>{t.total}</td>
                    <td>{t.exitosos}</td>
                    <td>{t.fallidos}</td>
                    <td>{tasaTipo === null ? "—" : `${tasaTipo}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
