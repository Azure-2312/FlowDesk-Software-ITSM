"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  ventana_inicio: string;
  ventana_fin: string;
  impacto_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function esVigente(c: Cambio) {
  const ahora = Date.now();
  return ahora >= new Date(c.ventana_inicio).getTime() && ahora <= new Date(c.ventana_fin).getTime();
}

export default function VistaCambiosImpactoArea() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/gestor-area/cambios/impacto?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar los cambios.");
      } catch {
        setError("Error de conexión al cargar los cambios.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Cambios con interrupción para mi área</h1>
        <p>Mantenimientos programados o en curso que pueden afectar los servicios de mi departamento.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay cambios programados que afecten a mi área.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Título</th><th>Tipo</th><th>Impacto</th><th>Ventana</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id_cambio}>
                  <td><strong>{c.codigo_cambio}</strong></td>
                  <td>{c.titulo}</td>
                  <td>{c.tipo_cambio}</td>
                  <td>{c.impacto_nombre ?? "—"}</td>
                  <td>{fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: esVigente(c) ? "#fef3c7" : "#dbeafe", color: esVigente(c) ? "#92400e" : "#1e40af" }}>
                      {esVigente(c) ? "EN CURSO" : c.estado_nombre}
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
