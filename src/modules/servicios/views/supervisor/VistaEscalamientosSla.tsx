"use client";

import { useEffect, useState } from "react";

interface Escalamiento {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  estado_nombre: string | null;
  prioridad_nombre: string | null;
  fecha_limite_sla: string;
  riesgo: "VENCIDO" | "EN_RIESGO";
  asignado_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaEscalamientosSla() {
  const [items, setItems] = useState<Escalamiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/servicios/sla/escalamientos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar los escalamientos.");
      } catch {
        setError("Error de conexión al cargar los escalamientos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Escalamientos y riesgos de SLA</h1>
        <p>Tickets de mi área vencidos o a punto de vencer, para intervenir a tiempo.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay tickets en riesgo ni vencidos en este momento.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Asignado</th>
                <th>Límite SLA</th>
                <th>Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id_ticket}>
                  <td><strong>{t.codigo_ticket}</strong></td>
                  <td>{t.titulo}</td>
                  <td>{t.prioridad_nombre ?? "—"}</td>
                  <td>{t.estado_nombre ?? "—"}</td>
                  <td>{t.asignado_nombre ?? "Sin asignar"}</td>
                  <td>{fechaHora(t.fecha_limite_sla)}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                        backgroundColor: t.riesgo === "VENCIDO" ? "#fee2e2" : "#fef3c7",
                        color: t.riesgo === "VENCIDO" ? "#b91c1c" : "#92400e",
                      }}
                    >
                      {t.riesgo === "VENCIDO" ? "VENCIDO" : "EN RIESGO"}
                    </span>
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
