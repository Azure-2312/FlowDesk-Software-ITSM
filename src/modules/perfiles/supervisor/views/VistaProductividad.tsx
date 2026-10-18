"use client";

import { useEffect, useState } from "react";

interface Fila {
  id_usuario: number;
  tecnico: string;
  resueltos: number;
  horas_promedio: number | null;
  csat_promedio: number | null;
  sla_incumplidos: number;
}

export default function VistaProductividad() {
  const [items, setItems] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/supervisor/reportes/productividad?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudo cargar la productividad.");
      } catch {
        setError("Error de conexión al cargar la productividad.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Productividad individual</h1>
        <p>Resueltos, tiempos, cumplimiento de SLA y satisfacción por técnico. Uso de gestión, no punitivo.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay técnicos asociados a mi área.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Técnico</th>
                <th style={{ textAlign: "right" }}>Resueltos</th>
                <th style={{ textAlign: "right" }}>Horas promedio</th>
                <th style={{ textAlign: "right" }}>SLA incumplidos</th>
                <th style={{ textAlign: "right" }}>CSAT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id_usuario}>
                  <td>{t.tecnico}</td>
                  <td style={{ textAlign: "right" }}>{t.resueltos}</td>
                  <td style={{ textAlign: "right" }}>{t.horas_promedio ?? "—"}</td>
                  <td style={{ textAlign: "right", color: t.sla_incumplidos > 0 ? "#b91c1c" : undefined }}>{t.sla_incumplidos}</td>
                  <td style={{ textAlign: "right" }}>{t.csat_promedio ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
