"use client";

import { useEffect, useState } from "react";

interface Mantenimiento {
  id_mantenimiento: number;
  tipo: string;
  descripcion: string;
  proveedor: string | null;
  fecha_programada: string | null;
  fecha_ejecucion: string | null;
  costo: number | null;
  estado: string;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  responsable_nombre: string | null;
}

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
}

interface Garantia {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  fecha_fin_garantia: string;
  dias_restantes: number;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PROGRAMADO: { bg: "#dbeafe", fg: "#1d4ed8" },
  EN_PROCESO: { bg: "#fef3c7", fg: "#92400e" },
  COMPLETADO: { bg: "#dcfce7", fg: "#166534" },
  CANCELADO: { bg: "#e5e7eb", fg: "#374151" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaMantenimientoActivos() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ id_activo: "", tipo: "PREVENTIVO", descripcion: "", proveedor: "", fecha_programada: "", costo: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/mantenimiento?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setMantenimientos(Array.isArray(json?.mantenimientos) ? json.mantenimientos : []);
        setActivos(Array.isArray(json?.activos) ? json.activos : []);
        setGarantias(Array.isArray(json?.garantias) ? json.garantias : []);
      } else setError(json.error ?? "No se pudo cargar el mantenimiento.");
    } catch {
      setError("Error de conexión al cargar el mantenimiento.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function programar() {
    if (!form.id_activo || form.descripcion.trim().length < 5) {
      setError("Selecciona el activo y describe el mantenimiento.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/mantenimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id_activo: Number(form.id_activo) }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo programar.");
      else {
        setOk(json.mensaje ?? "Mantenimiento programado.");
        setForm({ id_activo: "", tipo: "PREVENTIVO", descripcion: "", proveedor: "", fecha_programada: "", costo: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al programar.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(idMantenimiento: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/mantenimiento", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_mantenimiento: idMantenimiento, estado, fecha_ejecucion: estado === "COMPLETADO" ? new Date().toISOString().slice(0, 10) : undefined }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else {
        setOk(json.mensaje ?? "Mantenimiento actualizado.");
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
        <h1>Mantenimiento y garantías</h1>
        <p>Programa mantenimientos preventivos y correctivos, y controla los vencimientos de garantía.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Programar mantenimiento</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Activo
            <select value={form.id_activo} onChange={(e) => setForm((p) => ({ ...p, id_activo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 220 }}>
              <option value="">Selecciona...</option>
              {activos.map((a) => <option key={a.id_activo} value={a.id_activo}>{a.codigo_patrimonial} · {a.tipo_activo} {a.marca}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Tipo
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="PREVENTIVO">Preventivo</option>
              <option value="CORRECTIVO">Correctivo</option>
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Fecha programada
            <input type="date" value={form.fecha_programada} onChange={(e) => setForm((p) => ({ ...p, fecha_programada: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Proveedor
            <input type="text" value={form.proveedor} onChange={(e) => setForm((p) => ({ ...p, proveedor: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Costo
            <input type="number" value={form.costo} onChange={(e) => setForm((p) => ({ ...p, costo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 120 }} />
          </label>
        </div>
        <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
          Descripción
          <textarea rows={2} value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
        </label>
        <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={programar}>{procesando ? "Guardando..." : "Programar"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div>
          <h2>Mantenimientos</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : mantenimientos.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>Sin mantenimientos registrados.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mantenimientos.map((m) => {
                const color = COLORES[m.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <div key={m.id_mantenimiento} className="tarjeta-formulario" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>{m.codigo_patrimonial} · {m.tipo}</strong>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{m.estado}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{m.descripcion}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      Programado {fecha(m.fecha_programada)} · Ejecutado {fecha(m.fecha_ejecucion)} · {m.proveedor ?? "sin proveedor"}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {m.estado === "PROGRAMADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_mantenimiento, "EN_PROCESO")}>Iniciar</button>}
                      {m.estado === "EN_PROCESO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_mantenimiento, "COMPLETADO")}>Completar</button>}
                      {["PROGRAMADO", "EN_PROCESO"].includes(m.estado) && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_mantenimiento, "CANCELADO")}>Cancelar</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2>Garantías por vencer</h2>
          {garantias.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>Sin garantías próximas a vencer.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {garantias.map((g) => (
                <div key={g.id_activo} className="tarjeta-formulario" style={{ margin: 0 }}>
                  <strong style={{ fontSize: 13 }}>{g.codigo_patrimonial} · {g.tipo_activo}</strong>
                  <div style={{ fontSize: 12, color: Number(g.dias_restantes) < 0 ? "#b91c1c" : "#b45309", marginTop: 3 }}>
                    {g.marca} {g.modelo} · vence {fecha(g.fecha_fin_garantia)} ({Math.round(Number(g.dias_restantes))} días)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
