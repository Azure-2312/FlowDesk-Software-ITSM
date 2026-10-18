"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  id_estado: number;
  estado_nombre: string;
  ventana_inicio: string;
  ventana_fin: string;
  solicitante_nombre: string | null;
}

function aInputLocal(valor: string) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export default function VistaProgramacionCambios() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<{ id: number; inicio: string; fin: string } | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/supervisor/cambios/programar?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los cambios.");
    } catch {
      setError("Error de conexión al cargar los cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar() {
    if (!edicion) return;
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/supervisor/cambios/programar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: edicion.id, ventana_inicio: edicion.inicio, ventana_fin: edicion.fin }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo reprogramar el cambio.");
      else {
        setOk("Ventana de cambio actualizada.");
        setEdicion(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al reprogramar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Programación de implementaciones del equipo</h1>
        <p>Programa y reprograma cambios aprobados dentro de las ventanas permitidas.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay cambios aprobados por programar.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th><th>Título</th><th>Tipo</th><th>Estado</th>
                <th>Ventana inicio</th><th>Ventana fin</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id_cambio}>
                  <td><strong>{c.codigo_cambio}</strong></td>
                  <td>{c.titulo}</td>
                  <td>{c.tipo_cambio}</td>
                  <td>{c.estado_nombre}</td>
                  <td>{new Date(c.ventana_inicio).toLocaleString("es-PE")}</td>
                  <td>{new Date(c.ventana_fin).toLocaleString("es-PE")}</td>
                  <td>
                    <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setEdicion({ id: c.id_cambio, inicio: aInputLocal(c.ventana_inicio), fin: aInputLocal(c.ventana_fin) })}>
                      Reprogramar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {edicion && (
        <div className="tarjeta-formulario" style={{ marginTop: 16 }}>
          <h2>Reprogramar ventana</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Inicio
              <input type="datetime-local" value={edicion.inicio} onChange={(e) => setEdicion({ ...edicion, inicio: e.target.value })} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Fin
              <input type="datetime-local" value={edicion.fin} onChange={(e) => setEdicion({ ...edicion, fin: e.target.value })} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
            <button className="boton-primario" style={{ width: "auto" }} disabled={guardando} onClick={guardar}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setEdicion(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
