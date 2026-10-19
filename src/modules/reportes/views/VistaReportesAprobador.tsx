"use client";

import { useEffect, useState } from "react";

interface Reportes {
  resumen: {
    total: number;
    aprobadas: number;
    rechazadas: number;
    observadas: number;
    tasa_aprobacion: number | null;
    horas_promedio: number | null;
  };
  porMes: { mes: string; total: number; aprobadas: number; rechazadas: number }[];
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: string | number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

export default function VistaReportesAprobador() {
  const [data, setData] = useState<Reportes | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/aprobador/reportes?_t=${Date.now()}`);
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
        <h1>Reportes de decisiones</h1>
        <p>Tiempo de respuesta y tasas de aprobación y rechazo.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Decisiones" valor={r.total} />
        <Kpi titulo="Tasa de aprobación" valor={r.tasa_aprobacion !== null ? `${r.tasa_aprobacion}%` : "—"} color={r.tasa_aprobacion !== null && r.tasa_aprobacion < 50 ? "#b45309" : "#15803d"} />
        <Kpi titulo="Aprobadas" valor={r.aprobadas} />
        <Kpi titulo="Rechazadas" valor={r.rechazadas} />
        <Kpi titulo="Observadas" valor={r.observadas} />
        <Kpi titulo="Respuesta prom. (h)" valor={r.horas_promedio ?? "—"} />
      </div>

      <div className="tarjeta-formulario">
        <h2>Decisiones por mes (últimos 6 meses)</h2>
        {data.porMes.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Sin decisiones en el periodo.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Mes</th><th style={{ textAlign: "right" }}>Total</th><th style={{ textAlign: "right" }}>Aprobadas</th><th style={{ textAlign: "right" }}>Rechazadas</th></tr>
            </thead>
            <tbody>
              {data.porMes.map((m) => (
                <tr key={m.mes}>
                  <td>{m.mes}</td>
                  <td style={{ textAlign: "right" }}>{m.total}</td>
                  <td style={{ textAlign: "right", color: "#15803d" }}>{m.aprobadas}</td>
                  <td style={{ textAlign: "right", color: m.rechazadas > 0 ? "#b91c1c" : undefined }}>{m.rechazadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
