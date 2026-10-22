"use client";

import { useEffect, useState } from "react";

interface Modelo {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  version_modelo: string | null;
  riesgo_fijo: string | null;
  autorizacion_automatica: boolean | null;
  veces_usado: number | null;
  veces_exitoso: number | null;
  veces_fallido: number | null;
  umbral_tasa_fallo_pct: number | null;
  umbral_fallos_consecutivos: number | null;
  ultimo_uso: string | null;
  fecha_creacion: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  BORRADOR: { bg: "#fef3c7", fg: "#92400e" },
  PUBLICADO: { bg: "#dcfce7", fg: "#166534" },
  SUSPENDIDO: { bg: "#fee2e2", fg: "#b91c1c" },
  ARCHIVADO: { bg: "#e5e7eb", fg: "#374151" },
};

function tasa(m: Modelo) {
  const exitos = m.veces_exitoso ?? 0;
  const fallos = m.veces_fallido ?? 0;
  const total = exitos + fallos;
  return total > 0 ? Math.round((exitos / total) * 100) : null;
}

export default function VistaModelosGestion() {
  const [items, setItems] = useState<Modelo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", nombre: "", descripcion: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/gestor-cambios/modelos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los modelos.");
    } catch {
      setError("Error de conexión al cargar los modelos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function proponer() {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/gestor-cambios/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo proponer el modelo.");
      else {
        setOk(json.mensaje ?? "Modelo propuesto.");
        setForm({ codigo: "", nombre: "", descripcion: "" });
        setMostrarForm(false);
        await cargar();
      }
    } catch {
      setError("Error de conexión al proponer el modelo.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(idModelo: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/gestor-cambios/modelos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modelo: idModelo, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo cambiar el estado.");
      else {
        setOk(json.mensaje ?? "Estado actualizado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al cambiar el estado.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Modelos de cambio estándar</h1>
        <p>Consulta, propone y suspende modelos preautorizados, con sus métricas de éxito y umbrales de control.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 14 }}>
        <button className="boton-primario" style={{ width: "auto" }} onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Proponer nuevo modelo"}
        </button>
      </div>

      {mostrarForm && (
        <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
          <h2>Propuesta de modelo (borrador)</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Código
              <input type="text" value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 180 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151", flex: "1 1 280px" }}>
              Nombre
              <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
          </div>
          <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
            Descripción
            <textarea rows={3} value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={proponer}>
            {procesando ? "Guardando..." : "Registrar propuesta"}
          </button>
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay modelos de cambio estándar registrados.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Estado</th><th>Versión</th><th>Uso</th><th>Tasa de éxito</th><th>Umbrales</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => {
                const color = COLORES[m.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                const t = tasa(m);
                return (
                  <tr key={m.id_modelo}>
                    <td><strong>{m.codigo}</strong></td>
                    <td>{m.nombre}{m.descripcion && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{m.descripcion}</div>}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{m.estado}</span></td>
                    <td>{m.version_modelo ?? "—"}</td>
                    <td>{m.veces_usado ?? 0}</td>
                    <td>{t === null ? "—" : `${t}%`}</td>
                    <td style={{ fontSize: 11.5, color: "#6b7280" }}>
                      fallo {m.umbral_tasa_fallo_pct ?? "—"}% · consec. {m.umbral_fallos_consecutivos ?? "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {m.estado !== "PUBLICADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "PUBLICADO")}>Publicar</button>}
                        {m.estado !== "SUSPENDIDO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "SUSPENDIDO")}>Suspender</button>}
                        {m.estado !== "ARCHIVADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "ARCHIVADO")}>Archivar</button>}
                      </div>
                    </td>
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
