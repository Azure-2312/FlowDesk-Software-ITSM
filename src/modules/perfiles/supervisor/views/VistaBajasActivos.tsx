"use client";

import { useEffect, useState } from "react";

interface Solicitud {
  id_solicitud: number;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  solicitante_nombre: string | null;
}

export default function VistaBajasActivos() {
  const [items, setItems] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/supervisor/activos/bajas?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar las solicitudes.");
    } catch {
      setError("Error de conexión al cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(id: number, decision: "APROBAR" | "RECHAZAR") {
    const comentario = window.prompt("Comentario de la decisión (opcional):") ?? "";
    setProcesando(id);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/supervisor/activos/bajas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitud: id, decision, comentario }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la decisión.");
      else {
        setOk("Decisión registrada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la decisión.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Aprobación de bajas de mi área</h1>
        <p>Aprueba o rechaza las solicitudes de baja de activos de mi área técnica.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay solicitudes de baja registradas para mi área.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Activo</th><th>Tipo</th><th>Solicitante</th><th>Motivo</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id_solicitud}>
                  <td><strong>{s.codigo_patrimonial}</strong></td>
                  <td>{s.tipo_activo} {s.marca}</td>
                  <td>{s.solicitante_nombre ?? "—"}</td>
                  <td>{s.motivo}</td>
                  <td>{s.estado}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {s.estado === "PENDIENTE" ? (
                      <>
                        <button className="boton-primario" style={{ width: "auto", marginRight: 6 }} disabled={procesando === s.id_solicitud} onClick={() => decidir(s.id_solicitud, "APROBAR")}>Aprobar</button>
                        <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === s.id_solicitud} onClick={() => decidir(s.id_solicitud, "RECHAZAR")}>Rechazar</button>
                      </>
                    ) : (
                      <span style={{ color: "#6b7280" }}>—</span>
                    )}
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
