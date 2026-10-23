"use client";

import { useEffect, useState } from "react";

interface Inexactitud {
  id_inexactitud: number;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  fecha_resolucion: string | null;
  codigo_ci: string | null;
  ci_nombre: string | null;
  reporta_nombre: string | null;
  asigna_nombre: string | null;
}

interface Ci {
  id_ci: number;
  codigo_ci: string;
  nombre: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  REPORTADA: { bg: "#fef3c7", fg: "#92400e" },
  EN_PROCESO: { bg: "#dbeafe", fg: "#1d4ed8" },
  RESUELTA: { bg: "#dcfce7", fg: "#166534" },
  DESCARTADA: { bg: "#e5e7eb", fg: "#374151" },
};

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaCmdbInexactitudes() {
  const [items, setItems] = useState<Inexactitud[]>([]);
  const [cis, setCis] = useState<Ci[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ id_ci: "", descripcion: "", id_usuario_asigna: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cmdb/inexactitudes?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(Array.isArray(json?.inexactitudes) ? json.inexactitudes : []);
        setCis(Array.isArray(json?.cis) ? json.cis : []);
        setUsuarios(Array.isArray(json?.usuarios) ? json.usuarios : []);
      } else setError(json.error ?? "No se pudieron cargar las inexactitudes.");
    } catch {
      setError("Error de conexión al cargar las inexactitudes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function reportar() {
    if (!form.id_ci || form.descripcion.trim().length < 5) {
      setError("Selecciona el CI y describe la inexactitud.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cmdb/inexactitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo reportar.");
      else {
        setOk(json.mensaje ?? "Inexactitud reportada.");
        setForm({ id_ci: "", descripcion: "", id_usuario_asigna: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al reportar.");
    } finally {
      setProcesando(false);
    }
  }

  async function resolver(idInexactitud: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cmdb/inexactitudes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_inexactitud: idInexactitud, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else {
        setOk(json.mensaje ?? "Inexactitud actualizada.");
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
        <h1>Inexactitudes reportadas</h1>
        <p>Atiende las tareas generadas por técnicos y usuarios sobre datos incorrectos de la CMDB.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Reportar inexactitud</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            CI
            <select value={form.id_ci} onChange={(e) => setForm((p) => ({ ...p, id_ci: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 240 }}>
              <option value="">Selecciona...</option>
              {cis.map((c) => <option key={c.id_ci} value={c.id_ci}>{c.codigo_ci} · {c.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Asignar a
            <select value={form.id_usuario_asigna} onChange={(e) => setForm((p) => ({ ...p, id_usuario_asigna: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 200 }}>
              <option value="">Sin asignar</option>
              {usuarios.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
            </select>
          </label>
        </div>
        <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
          Descripción
          <textarea rows={2} value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
        </label>
        <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={reportar}>{procesando ? "Guardando..." : "Reportar"}</button>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay inexactitudes registradas.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>CI</th><th>Descripción</th><th>Estado</th><th>Reporta</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map((i) => {
              const color = COLORES[i.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
              return (
                <tr key={i.id_inexactitud}>
                  <td><strong>{i.codigo_ci ?? "—"}</strong>{i.ci_nombre && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{i.ci_nombre}</div>}</td>
                  <td style={{ fontSize: 12.5 }}>{i.descripcion}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{i.estado}</span></td>
                  <td>{i.reporta_nombre ?? "—"}</td>
                  <td>{fechaHora(i.fecha_creacion)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["REPORTADA", "EN_PROCESO"].includes(i.estado) && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(i.id_inexactitud, "EN_PROCESO")}>En proceso</button>}
                      {i.estado !== "RESUELTA" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(i.id_inexactitud, "RESUELTA")}>Resolver</button>}
                      {i.estado !== "DESCARTADA" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(i.id_inexactitud, "DESCARTADA")}>Descartar</button>}
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
