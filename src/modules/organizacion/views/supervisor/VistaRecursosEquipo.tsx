"use client";

import { useEffect, useState, FormEvent } from "react";

interface Recurso {
  id_recurso: number;
  tipo: string;
  nombre: string;
  contenido: any;
  fecha_creacion: string;
  creador_nombre: string | null;
}

export default function VistaRecursosEquipo() {
  const [items, setItems] = useState<Recurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [tipo, setTipo] = useState("VISTA");
  const [nombre, setNombre] = useState("");
  const [detalle, setDetalle] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/supervisor/equipo/vistas?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los recursos.");
    } catch {
      setError("Error de conexión al cargar los recursos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/supervisor/equipo/vistas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nombre, contenido: { detalle } }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo crear el recurso.");
      else {
        setOk("Recurso creado.");
        setNombre("");
        setDetalle("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al crear el recurso.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!window.confirm("¿Eliminar este recurso del equipo?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/supervisor/equipo/vistas?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo eliminar.");
      else await cargar();
    } catch {
      setError("Error de conexión al eliminar.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Vistas y respuestas compartidas</h1>
        <p>Vistas guardadas y respuestas predefinidas que mi equipo puede reutilizar.</p>
      </div>

      <form onSubmit={crear} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nuevo recurso</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="VISTA">Vista guardada</option>
              <option value="RESPUESTA">Respuesta predefinida</option>
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: 1, minWidth: 200 }}>
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Tickets críticos del área" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: 2, minWidth: 240 }}>
            Detalle
            <input value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Descripción o texto de la respuesta" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
            {guardando ? "Creando..." : "Crear"}
          </button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          Aún no hay recursos compartidos.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Tipo</th><th>Nombre</th><th>Detalle</th><th>Creado por</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id_recurso}>
                  <td>{r.tipo === "VISTA" ? "Vista" : "Respuesta"}</td>
                  <td>{r.nombre}</td>
                  <td>{r.contenido?.detalle ?? "—"}</td>
                  <td>{r.creador_nombre ?? "—"}</td>
                  <td><button className="boton-secundario" style={{ width: "auto" }} onClick={() => eliminar(r.id_recurso)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
