"use client";

import { useEffect, useState } from "react";

interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  estado_editorial: string | null;
  fecha_creacion: string;
  codigo_problema: string | null;
  problema_titulo: string | null;
}

interface Pendiente {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  estado_nombre: string;
  es_error_conocido: boolean;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaConocimientoProblemas() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({ id_problema: "", titulo: "", contenido_markdown: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas/gestion/conocimiento?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setArticulos(Array.isArray(json?.articulos) ? json.articulos : []);
        setPendientes(Array.isArray(json?.pendientes) ? json.pendientes : []);
      } else setError(json.error ?? "No se pudo cargar el conocimiento derivado.");
    } catch {
      setError("Error de conexión al cargar el conocimiento derivado.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function generar() {
    if (!form.id_problema) {
      setError("Selecciona un problema.");
      return;
    }
    setGuardando(true);
    setError(null);
    setOk(null);
    const candidato = pendientes.find((p) => String(p.id_problema) === form.id_problema);
    try {
      const res = await fetch("/api/problemas/gestion/conocimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_problema: form.id_problema,
          titulo: form.titulo || candidato?.titulo,
          contenido_markdown: form.contenido_markdown || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo generar el artículo.");
      else {
        setOk(`Artículo ${json.codigo_articulo} creado en borrador.`);
        setForm({ id_problema: "", titulo: "", contenido_markdown: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al generar el artículo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Conocimiento derivado</h1>
        <p>Genera artículos de conocimiento a partir de problemas resueltos y errores conocidos.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Generar artículo desde problema</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 300px" }}>
            Problema resuelto / error conocido
            <select value={form.id_problema} onChange={(e) => setForm({ ...form, id_problema: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Selecciona...</option>
              {pendientes.map((p) => <option key={p.id_problema} value={p.id_problema}>{p.codigo_problema} · {p.titulo}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 260px" }}>
            Título del artículo
            <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
          Contenido (Markdown)
          <textarea value={form.contenido_markdown} onChange={(e) => setForm({ ...form, contenido_markdown: e.target.value })} rows={5} placeholder="Síntomas, causa raíz, solución y prevención..." style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
        </label>
        <button className="boton-primario" style={{ width: "auto", marginTop: 12 }} disabled={guardando} onClick={generar}>
          {guardando ? "Generando..." : "Generar artículo"}
        </button>
      </div>

      <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Pendientes de documentar</h2>
        {cargando ? (
          <p>Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay problemas resueltos sin artículo.</p>
        ) : (
          <table className="tabla-datos">
            <thead><tr><th>Código</th><th>Título</th><th>Estado</th><th>KEDB</th></tr></thead>
            <tbody>
              {pendientes.map((p) => (
                <tr key={p.id_problema}>
                  <td><strong>{p.codigo_problema}</strong></td>
                  <td>{p.titulo}</td>
                  <td>{p.estado_nombre}</td>
                  <td>{p.es_error_conocido ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tarjeta-formulario">
        <h2 style={{ marginTop: 0 }}>Artículos generados</h2>
        {articulos.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Aún no hay artículos derivados de problemas.</p>
        ) : (
          <table className="tabla-datos">
            <thead><tr><th>Código</th><th>Título</th><th>Estado</th><th>Problema</th><th>Creado</th></tr></thead>
            <tbody>
              {articulos.map((a) => (
                <tr key={a.id_articulo}>
                  <td><strong>{a.codigo_articulo}</strong></td>
                  <td>{a.titulo}</td>
                  <td>{a.estado_editorial ?? "—"}</td>
                  <td>{a.codigo_problema ?? "—"}</td>
                  <td>{fecha(a.fecha_creacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
