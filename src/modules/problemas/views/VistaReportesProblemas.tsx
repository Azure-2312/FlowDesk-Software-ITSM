"use client";

import { useEffect, useState } from "react";

interface Datos {
  resumen: {
    total: number;
    abiertos: number;
    cerrados: number;
    kedb: number;
    con_causa_raiz: number;
    dias_cierre_promedio: number | null;
    mayores_total: number;
    mayores_activos: number;
  };
  porEstado: { estado: string; total: number }[];
  porPrioridad: { prioridad: string; total: number }[];
  recurrentes: { valor: string; total: number }[];
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

export default function VistaReportesProblemas() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-problemas/reportes?_t=${Date.now()}`);
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
  const maxEstado = data.porEstado.reduce((m, e) => Math.max(m, Number(e.total)), 0);
  const maxPrioridad = data.porPrioridad.reduce((m, p) => Math.max(m, Number(p.total)), 0);
  const maxRecurrente = data.recurrentes.reduce((m, x) => Math.max(m, Number(x.total)), 0);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Reportes de problemas</h1>
        <p>Volumen por estado y prioridad, tiempo medio de cierre, errores conocidos y recurrencia por servicio.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Problemas totales" valor={r.total} />
        <Kpi titulo="Abiertos" valor={r.abiertos} color={r.abiertos > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Cerrados" valor={r.cerrados} color="#166534" />
        <Kpi titulo="Con causa raíz" valor={r.con_causa_raiz} />
        <Kpi titulo="Errores conocidos" valor={r.kedb} />
        <Kpi titulo="Días de cierre (prom.)" valor={r.dias_cierre_promedio ?? "—"} />
        <Kpi titulo="Problemas mayores" valor={r.mayores_total} />
        <Kpi titulo="Mayores activos" valor={r.mayores_activos} color={r.mayores_activos > 0 ? "#b91c1c" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2 style={{ marginTop: 0 }}>Por estado</h2>
          {data.porEstado.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin datos.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.porEstado.map((e) => (
                <div key={e.estado}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span>{e.estado}</span><span style={{ color: "#6b7280" }}>{e.total}</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
                    <div style={{ height: 6, width: `${maxEstado > 0 ? Math.round((Number(e.total) / maxEstado) * 100) : 0}%`, backgroundColor: "#1d4ed8", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2 style={{ marginTop: 0 }}>Por prioridad</h2>
          {data.porPrioridad.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin datos.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.porPrioridad.map((p) => (
                <div key={p.prioridad}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span>{p.prioridad}</span><span style={{ color: "#6b7280" }}>{p.total}</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
                    <div style={{ height: 6, width: `${maxPrioridad > 0 ? Math.round((Number(p.total) / maxPrioridad) * 100) : 0}%`, backgroundColor: "#b45309", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2 style={{ marginTop: 0 }}>Servicios con más incidentes (90 d)</h2>
          {data.recurrentes.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin incidentes en el periodo.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recurrentes.map((x) => (
                <div key={x.valor}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span>{x.valor}</span><span style={{ color: "#6b7280" }}>{x.total}</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
                    <div style={{ height: 6, width: `${maxRecurrente > 0 ? Math.round((Number(x.total) / maxRecurrente) * 100) : 0}%`, backgroundColor: "#0e7490", borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
