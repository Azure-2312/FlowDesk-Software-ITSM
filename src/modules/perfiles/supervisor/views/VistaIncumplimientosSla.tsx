"use client";

import { useEffect, useState } from "react";

interface Datos {
  total: number;
  porServicio: { servicio: string; vencidos: number }[];
  porTecnico: { tecnico: string; vencidos: number; aun_abiertos: number }[];
}

export default function VistaIncumplimientosSla() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/supervisor/sla/incumplimientos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los incumplimientos.");
      } catch {
        setError("Error de conexión al cargar los incumplimientos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Incumplimientos y causas</h1>
        <p>Análisis de tickets vencidos de mi área por servicio y por técnico.</p>
      </div>

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>Tickets vencidos</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: data.total > 0 ? "#b91c1c" : "#0f172a" }}>{data.total}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Por servicio</h2>
          {data.porServicio.length === 0 ? <p>Sin datos.</p> : (
            <table className="tabla-datos">
              <thead><tr><th>Servicio</th><th style={{ textAlign: "right" }}>Vencidos</th></tr></thead>
              <tbody>
                {data.porServicio.map((s) => (
                  <tr key={s.servicio}><td>{s.servicio}</td><td style={{ textAlign: "right" }}>{s.vencidos}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Por técnico</h2>
          {data.porTecnico.length === 0 ? <p>Sin datos.</p> : (
            <table className="tabla-datos">
              <thead><tr><th>Técnico</th><th style={{ textAlign: "right" }}>Vencidos</th><th style={{ textAlign: "right" }}>Abiertos</th></tr></thead>
              <tbody>
                {data.porTecnico.map((t) => (
                  <tr key={t.tecnico}>
                    <td>{t.tecnico}</td>
                    <td style={{ textAlign: "right", color: "#b91c1c" }}>{t.vencidos}</td>
                    <td style={{ textAlign: "right" }}>{t.aun_abiertos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
