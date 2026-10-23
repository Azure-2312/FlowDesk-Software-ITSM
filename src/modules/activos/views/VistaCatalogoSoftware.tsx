"use client";

import { useEffect, useState } from "react";

interface Software {
  id_software: number;
  nombre: string;
  fabricante: string | null;
  version: string | null;
  categoria: string | null;
  licencia_requerida: boolean;
  estado: string;
  fecha_aprobacion: string | null;
  aprueba_nombre: string | null;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  AUTORIZADO: { bg: "#dcfce7", fg: "#166534" },
  RESTRINGIDO: { bg: "#fef3c7", fg: "#92400e" },
  PROHIBIDO: { bg: "#fee2e2", fg: "#b91c1c" },
  OBSOLETO: { bg: "#e5e7eb", fg: "#374151" },
};

export default function VistaCatalogoSoftware() {
  const [items, setItems] = useState<Software[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", fabricante: "", version: "", categoria: "", licencia_requerida: false });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/licencias/catalogo-software?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudo cargar el catálogo.");
    } catch {
      setError("Error de conexión al cargar el catálogo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear() {
    if (form.nombre.trim().length < 3) {
      setError("Indica el nombre del software.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/licencias/catalogo-software", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar.");
      else {
        setOk(json.mensaje ?? "Software registrado.");
        setForm({ nombre: "", fabricante: "", version: "", categoria: "", licencia_requerida: false });
        setMostrarForm(false);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(idSoftware: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/licencias/catalogo-software", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_software: idSoftware, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else {
        setOk(json.mensaje ?? "Estado actualizado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al actualizar.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Catálogo de software autorizado</h1>
        <p>Registra el software permitido, su categoría y si requiere licencia; restringe o prohíbe el no autorizado.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 14 }}>
        <button className="boton-primario" style={{ width: "auto" }} onClick={() => setMostrarForm((v) => !v)}>{mostrarForm ? "Cancelar" : "Agregar software"}</button>
      </div>

      {mostrarForm && (
        <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
          <h2>Nuevo software autorizado</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
              Nombre
              <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Fabricante
              <input type="text" value={form.fabricante} onChange={(e) => setForm((p) => ({ ...p, fabricante: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Versión
              <input type="text" value={form.version} onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 120 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Categoría
              <input type="text" value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6, alignItems: "center", paddingBottom: 8 }}>
              <input type="checkbox" checked={form.licencia_requerida} onChange={(e) => setForm((p) => ({ ...p, licencia_requerida: e.target.checked }))} />
              Requiere licencia
            </label>
          </div>
          <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={crear}>{procesando ? "Guardando..." : "Registrar"}</button>
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>El catálogo está vacío.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>Software</th><th>Fabricante</th><th>Versión</th><th>Categoría</th><th>Licencia</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map((s) => {
              const color = COLORES[s.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
              return (
                <tr key={s.id_software}>
                  <td><strong>{s.nombre}</strong></td>
                  <td>{s.fabricante ?? "—"}</td>
                  <td>{s.version ?? "—"}</td>
                  <td>{s.categoria ?? "—"}</td>
                  <td>{s.licencia_requerida ? "Sí" : "No"}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{s.estado}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.estado !== "AUTORIZADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(s.id_software, "AUTORIZADO")}>Autorizar</button>}
                      {s.estado !== "RESTRINGIDO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(s.id_software, "RESTRINGIDO")}>Restringir</button>}
                      {s.estado !== "PROHIBIDO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(s.id_software, "PROHIBIDO")}>Prohibir</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
