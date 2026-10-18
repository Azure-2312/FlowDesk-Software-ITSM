"use client";

import { useEffect, useState } from "react";

interface Decision {
  id_cambio_aprobacion: number;
  id_cambio: number;
  decision: string;
  comentario: string;
  fecha_decision: string;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  APROBADO: { bg: "#dcfce7", fg: "#166534" },
  RECHAZADO: { bg: "#fee2e2", fg: "#b91c1c" },
  OBSERVADO: { bg: "#fef3c7", fg: "#92400e" },
};

export default function VistaHistorialDecisiones() {
  const [items, setItems] = useState<Decision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/gestor-area/aprobaciones/historial?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudo cargar el historial.");
      } catch {
        setError("Error de conexión al cargar el historial.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Historial de mis decisiones</h1>
        <p>Registro de las aprobaciones, observaciones y rechazos que he emitido sobre RFC.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          Aún no he registrado decisiones.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Fecha</th><th>RFC</th><th>Título</th><th>Decisión</th><th>Comentario</th></tr>
            </thead>
            <tbody>
              {items.map((d) => {
                const color = COLORES[d.decision] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <tr key={d.id_cambio_aprobacion}>
                    <td>{fechaHora(d.fecha_decision)}</td>
                    <td><strong>{d.codigo_cambio}</strong></td>
                    <td>{d.titulo}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>
                        {d.decision}
                      </span>
                    </td>
                    <td>{d.comentario}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
