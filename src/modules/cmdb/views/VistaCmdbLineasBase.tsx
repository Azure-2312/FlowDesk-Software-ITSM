"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LineaBase {
  id_linea_base: number;
  nombre: string;
  descripcion: string | null;
  total_elementos: number;
  fecha_creacion: string;
  codigo_ci: string | null;
  ci_nombre: string | null;
  creador_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaCmdbLineasBase() {
  const [items, setItems] = useState<LineaBase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cmdb/lineas-base?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar las líneas base.");
    } catch {
      setError("Error de conexión al cargar las líneas base.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear() {
    if (form.nombre.trim().length < 3) {
      setError("Indica el nombre de la línea base.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cmdb/lineas-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo crear la línea base.");
      else {
        setOk(json.mensaje ?? "Línea base creada.");
        setForm({ nombre: "", descripcion: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al crear la línea base.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>Baselines CMDB</span>
            <h1 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#0f172a" }}>Líneas Base de Configuración (Baselines)</h1>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13 }}>
            Instantáneas inmutables del estado de la configuración para comparar y auditar cambios posteriores (ITIL v4 / SACM).
          </p>
        </div>
        <Link
          href="/plataforma/activos/cmdb"
          className="boton-secundario"
          style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          ← Volver a la CMDB
        </Link>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nueva línea base (CMDB completo)</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
            Nombre
            <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: "2 1 320px" }}>
            Descripción
            <input type="text" value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={procesando} onClick={crear}>{procesando ? "Guardando..." : "Crear línea base"}</button>
        </div>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay líneas base registradas.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>Nombre</th><th>Alcance</th><th>Elementos</th><th>Creada</th><th>Creador</th></tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l.id_linea_base}>
                <td><strong>{l.nombre}</strong>{l.descripcion && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{l.descripcion}</div>}</td>
                <td>{l.codigo_ci ? `${l.codigo_ci} · ${l.ci_nombre}` : "CMDB completo"}</td>
                <td>{l.total_elementos}</td>
                <td>{fechaHora(l.fecha_creacion)}</td>
                <td>{l.creador_nombre ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
