"use client";

import { useEffect, useState } from "react";

interface Reunion {
  id_reunion: number;
  titulo: string;
  fecha_reunion: string;
  tipo: string;
  estado: string;
  agenda: any;
  acta: string | null;
  fecha_creacion: string;
  convocante_nombre: string | null;
}

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  ventana_inicio: string | null;
  ventana_fin: string | null;
  impacto_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PROGRAMADA: { bg: "#dbeafe", fg: "#1d4ed8" },
  REALIZADA: { bg: "#dcfce7", fg: "#166534" },
  CANCELADA: { bg: "#fee2e2", fg: "#b91c1c" },
};

export default function VistaCabAgendaGestion() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [form, setForm] = useState({ titulo: "", fecha_reunion: "", tipo: "ORDINARIA" });
  const [acta, setActa] = useState<{ id: number; texto: string } | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/gestor-cambios/cab/agenda?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setReuniones(Array.isArray(json?.reuniones) ? json.reuniones : []);
        setCambios(Array.isArray(json?.cambios) ? json.cambios : []);
      } else setError(json.error ?? "No se pudo cargar la agenda.");
    } catch {
      setError("Error de conexión al cargar la agenda.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function alternar(id: number) {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function convocar() {
    if (!form.titulo.trim() || !form.fecha_reunion) {
      setError("Indica el título y la fecha de la reunión.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const agenda = cambios.filter((c) => seleccionados.includes(c.id_cambio)).map((c) => ({ id_cambio: c.id_cambio, codigo: c.codigo_cambio, titulo: c.titulo }));
      const res = await fetch("/api/perfiles/gestor-cambios/cab/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, agenda }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo convocar la reunión.");
      else {
        setOk(json.mensaje ?? "Reunión convocada.");
        setForm({ titulo: "", fecha_reunion: "", tipo: "ORDINARIA" });
        setSeleccionados([]);
        await cargar();
      }
    } catch {
      setError("Error de conexión al convocar la reunión.");
    } finally {
      setProcesando(false);
    }
  }

  async function guardarActa() {
    if (!acta) return;
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/gestor-cambios/cab/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reunion: acta.id, acta: acta.texto, estado: "REALIZADA" }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo guardar el acta.");
      else {
        setOk(json.mensaje ?? "Acta guardada.");
        setActa(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al guardar el acta.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Convocatoria, agenda y actas del CAB</h1>
        <p>El Gestor de Cambios preside el comité: convoca reuniones, arma la agenda y registra las actas.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Nueva convocatoria</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input type="text" placeholder="Título de la reunión" value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} style={{ padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            <input type="datetime-local" value={form.fecha_reunion} onChange={(e) => setForm((p) => ({ ...p, fecha_reunion: e.target.value }))} style={{ padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={{ padding: "9px 11px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="ORDINARIA">Ordinaria</option>
              <option value="EXTRAORDINARIA">Extraordinaria</option>
              <option value="EMERGENCIA">Emergencia</option>
            </select>
          </div>

          <h3 style={{ marginTop: 16, fontSize: 13 }}>RFC para la agenda ({seleccionados.length} seleccionadas)</h3>
          <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
            {cambios.length === 0 ? (
              <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>No hay RFC en evaluación o aprobadas.</p>
            ) : (
              cambios.map((c) => (
                <label key={c.id_cambio} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, padding: "5px 4px", cursor: "pointer" }}>
                  <input type="checkbox" checked={seleccionados.includes(c.id_cambio)} onChange={() => alternar(c.id_cambio)} />
                  <span>
                    <strong>{c.codigo_cambio}</strong> · {c.titulo}
                    <span style={{ color: "#6b7280" }}> · {c.impacto_nombre ?? "sin impacto"}</span>
                  </span>
                </label>
              ))
            )}
          </div>

          <button className="boton-primario" style={{ marginTop: 12 }} disabled={procesando} onClick={convocar}>
            {procesando ? "Procesando..." : "Convocar reunión"}
          </button>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Reuniones registradas</h2>
          {cargando ? (
            <p style={{ fontSize: 13 }}>Cargando...</p>
          ) : reuniones.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Aún no hay reuniones del CAB.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {reuniones.map((r) => {
                const color = COLORES[r.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <div key={r.id_reunion} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>{r.titulo}</strong>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{r.estado}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                      {fechaHora(r.fecha_reunion)} · {r.tipo} · Convoca {r.convocante_nombre ?? "—"}
                    </div>
                    {Array.isArray(r.agenda) && r.agenda.length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12, color: "#374151" }}>
                        {r.agenda.map((a: any, i: number) => <li key={i}>{a.codigo ? `${a.codigo} · ${a.titulo}` : JSON.stringify(a)}</li>)}
                      </ul>
                    )}
                    {r.acta && <p style={{ fontSize: 12, color: "#374151", whiteSpace: "pre-wrap", marginTop: 6 }}>{r.acta}</p>}
                    <button className="boton-secundario" style={{ width: "auto", marginTop: 8 }} onClick={() => setActa({ id: r.id_reunion, texto: r.acta ?? "" })}>
                      {r.acta ? "Editar acta" : "Registrar acta"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {acta && (
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Acta de la reunión</h2>
          <textarea
            value={acta.texto}
            onChange={(e) => setActa((p) => (p ? { ...p, texto: e.target.value } : p))}
            rows={6}
            style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button className="boton-primario" style={{ width: "auto" }} disabled={procesando} onClick={guardarActa}>Guardar acta</button>
            <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setActa(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
