"use client";

import { useEffect, useState, useMemo } from "react";

interface Decision {
  tipo: string;
  referencia: string;
  titulo: string;
  decision: string;
  comentario: string | null;
  fecha_decision: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  APROBADO: { bg: "#dcfce7", fg: "#166534" },
  RECHAZADO: { bg: "#fee2e2", fg: "#b91c1c" },
  OBSERVADO: { bg: "#fef3c7", fg: "#92400e" },
};

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function VistaHistorialAprobador() {
  const [items, setItems] = useState<Decision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState("TODOS");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/aprobador/historial?_t=${Date.now()}`);
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

  const filtrados = useMemo(() => (tipo === "TODOS" ? items : items.filter((i) => i.tipo === tipo)), [items, tipo]);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Historial de mis decisiones</h1>
        <p>RFC, dictámenes del ECAB, aprobaciones por monto y cierres de problemas.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}>
          <option value="TODOS">Todas las decisiones</option>
          <option value="RFC">Cambios (RFC)</option>
          <option value="ECAB">Comité de emergencia</option>
          <option value="MONTO">Bajas y renovaciones</option>
          <option value="PROBLEMA">Cierre de problemas</option>
        </select>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay decisiones registradas.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Referencia</th><th>Título</th><th>Decisión</th><th>Comentario</th></tr>
            </thead>
            <tbody>
              {filtrados.map((d, i) => {
                const color = COLORES[d.decision] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <tr key={i}>
                    <td>{fechaHora(d.fecha_decision)}</td>
                    <td>{d.tipo}</td>
                    <td><strong>{d.referencia}</strong></td>
                    <td>{d.titulo}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{d.decision}</span>
                    </td>
                    <td>{d.comentario ?? "—"}</td>
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
