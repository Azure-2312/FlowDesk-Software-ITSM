"use client";

import { useEffect, useState } from "react";

interface Reportes {
  departamento: string;
  resumen: {
    total: number;
    sla_cumplidos: number;
    sla_porcentaje: number | null;
    evaluados: number;
    csat_promedio: number | null;
    costo_referencial: number;
  };
  porServicio: {
    servicio: string;
    tickets: number;
    abiertos: number;
    vencidos: number;
  }[];
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: string | number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

export default function VistaReportesArea() {
  const [data, setData] = useState<Reportes | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-area/reportes?_t=${Date.now()}`);
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
        <h1>Reportes del área</h1>
        <p>Consumo por servicio, SLA percibido, satisfacción y costo referencial de {data.departamento}.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Tickets totales" valor={r.total} />
        <Kpi titulo="SLA percibido" valor={r.sla_porcentaje !== null ? `${r.sla_porcentaje}%` : "—"} color={r.sla_porcentaje !== null && r.sla_porcentaje < 90 ? "#b45309" : undefined} />
        <Kpi titulo="Satisfacción" valor={r.csat_promedio ?? "—"} />
        <Kpi titulo="Evaluados" valor={r.evaluados} />
        <Kpi titulo="Costo licencias / año" valor={`S/ ${r.costo_referencial.toLocaleString("es-PE")}`} />
      </div>

      <div className="tarjeta-formulario">
        <h2>Tickets por servicio</h2>
        {data.porServicio.length === 0 ? (
          <p>Sin datos para el periodo.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Servicio</th><th style={{ textAlign: "right" }}>Tickets</th><th style={{ textAlign: "right" }}>Abiertos</th><th style={{ textAlign: "right" }}>Vencidos</th></tr>
            </thead>
            <tbody>
              {data.porServicio.map((s) => (
                <tr key={s.servicio}>
                  <td>{s.servicio}</td>
                  <td style={{ textAlign: "right" }}>{s.tickets}</td>
                  <td style={{ textAlign: "right" }}>{s.abiertos}</td>
                  <td style={{ textAlign: "right", color: s.vencidos > 0 ? "#b91c1c" : undefined }}>{s.vencidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
