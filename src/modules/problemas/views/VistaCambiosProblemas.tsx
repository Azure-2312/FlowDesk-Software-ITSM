"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string | null;
  id_estado: number | null;
  fecha_creacion: string;
  codigo_problema: string | null;
  problema_titulo: string | null;
}

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  estado_nombre: string;
}

const TIPOS = ["ESTANDAR", "NORMAL", "EMERGENCIA"];

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaCambiosProblemas() {
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    id_problema: "",
    titulo: "",
    descripcion: "",
    tipo_cambio: "NORMAL",
    justificacion: "",
    plan_implementacion: "",
    plan_rollback: "",
    ventana_inicio: "",
    ventana_fin: "",
  });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-problemas/cambios?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setCambios(Array.isArray(json?.cambios) ? json.cambios : []);
        setProblemas(Array.isArray(json?.problemas) ? json.problemas : []);
      } else setError(json.error ?? "No se pudieron cargar los cambios derivados.");
    } catch {
      setError("Error de conexión al cargar los cambios derivados.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear() {
    if (!form.id_problema) {
      setError("Selecciona un problema.");
      return;
    }
    setGuardando(true);
    setError(null);
    setOk(null);
    const candidato = problemas.find((p) => String(p.id_problema) === form.id_problema);
    try {
      const res = await fetch("/api/gestor-problemas/cambios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_problema: form.id_problema,
          titulo: form.titulo || `Cambio para resolver ${candidato?.codigo_problema ?? ""}`.trim(),
          descripcion: form.descripcion || undefined,
          tipo_cambio: form.tipo_cambio,
          justificacion: form.justificacion || undefined,
          plan_implementacion: form.plan_implementacion || undefined,
          plan_rollback: form.plan_rollback || undefined,
          ventana_inicio: form.ventana_inicio || undefined,
          ventana_fin: form.ventana_fin || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la solicitud de cambio.");
      else {
        setOk(`Solicitud ${json.codigo_cambio} registrada.`);
        setForm({ id_problema: "", titulo: "", descripcion: "", tipo_cambio: "NORMAL", justificacion: "", plan_implementacion: "", plan_rollback: "", ventana_inicio: "", ventana_fin: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la solicitud de cambio.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Solicitudes de cambio derivadas</h1>
        <p>Registra y consulta las RFC vinculadas a problemas para eliminar la causa raíz.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Nueva RFC desde problema</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 280px" }}>
            Problema
            <select value={form.id_problema} onChange={(e) => setForm({ ...form, id_problema: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Selecciona...</option>
              {problemas.map((p) => <option key={p.id_problema} value={p.id_problema}>{p.codigo_problema} · {p.titulo}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Tipo
            <select value={form.tipo_cambio} onChange={(e) => setForm({ ...form, tipo_cambio: e.target.value })} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 150 }}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
            Título
            <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 10 }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Ventana inicio
            <input type="datetime-local" value={form.ventana_inicio} onChange={(e) => setForm({ ...form, ventana_inicio: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Ventana fin
            <input type="datetime-local" value={form.ventana_fin} onChange={(e) => setForm({ ...form, ventana_fin: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10, marginTop: 10 }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Justificación
            <textarea value={form.justificacion} onChange={(e) => setForm({ ...form, justificacion: e.target.value })} rows={3} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Plan de implementación
            <textarea value={form.plan_implementacion} onChange={(e) => setForm({ ...form, plan_implementacion: e.target.value })} rows={3} placeholder="Por definir" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Plan de reversión
            <textarea value={form.plan_rollback} onChange={(e) => setForm({ ...form, plan_rollback: e.target.value })} rows={3} placeholder="Por definir" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <button className="boton-primario" style={{ width: "auto", marginTop: 12 }} disabled={guardando} onClick={crear}>
          {guardando ? "Registrando..." : "Registrar solicitud de cambio"}
        </button>
      </div>

      <div className="tarjeta-formulario">
        <h2 style={{ marginTop: 0 }}>RFC vinculadas a problemas</h2>
        {cargando ? (
          <p>Cargando...</p>
        ) : cambios.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Aún no hay solicitudes de cambio derivadas de problemas.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Título</th><th>Tipo</th><th>Problema</th><th>Creada</th></tr>
            </thead>
            <tbody>
              {cambios.map((c) => (
                <tr key={c.id_cambio}>
                  <td><strong>{c.codigo_cambio}</strong></td>
                  <td>{c.titulo}</td>
                  <td>{c.tipo_cambio ?? "—"}</td>
                  <td>{c.codigo_problema ?? "—"}</td>
                  <td>{fecha(c.fecha_creacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
