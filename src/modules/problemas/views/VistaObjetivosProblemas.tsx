"use client";

import { useEffect, useState } from "react";

interface Objetivo {
  id_objetivo: number;
  id_prioridad: number | null;
  prioridad_nombre: string | null;
  color: string | null;
  nivel: number | null;
  primera_respuesta_horas: number | null;
  diagnostico_horas: number | null;
  resolucion_total_horas: number | null;
  descripcion_operativa: string | null;
  umbrales_alerta: unknown;
}

export default function VistaObjetivosProblemas() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { primera_respuesta_horas: string; diagnostico_horas: string; resolucion_total_horas: string; descripcion_operativa: string; umbrales_alerta: string }>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-problemas/objetivos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setObjetivos(Array.isArray(json?.objetivos) ? json.objetivos : []);
      else setError(json.error ?? "No se pudieron cargar los objetivos.");
    } catch {
      setError("Error de conexión al cargar los objetivos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function valores(o: Objetivo) {
    return form[o.id_objetivo] ?? {
      primera_respuesta_horas: o.primera_respuesta_horas != null ? String(o.primera_respuesta_horas) : "",
      diagnostico_horas: o.diagnostico_horas != null ? String(o.diagnostico_horas) : "",
      resolucion_total_horas: o.resolucion_total_horas != null ? String(o.resolucion_total_horas) : "",
      descripcion_operativa: o.descripcion_operativa ?? "",
      umbrales_alerta: o.umbrales_alerta != null ? JSON.stringify(o.umbrales_alerta) : "",
    };
  }

  function setCampo(id: number, campo: keyof ReturnType<typeof valores>, valor: string, base: Objetivo) {
    setForm((prev) => ({ ...prev, [id]: { ...valores(base), ...prev[id], [campo]: valor } }));
  }

  async function guardar(o: Objetivo) {
    setProcesando(o.id_objetivo);
    setError(null);
    setOk(null);
    const v = valores(o);
    let umbrales: unknown = undefined;
    if (v.umbrales_alerta.trim()) {
      try {
        umbrales = JSON.parse(v.umbrales_alerta);
      } catch {
        setError("Los umbrales de alerta deben ser JSON válido.");
        setProcesando(null);
        return;
      }
    }
    try {
      const res = await fetch("/api/gestor-problemas/objetivos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_objetivo: o.id_objetivo,
          primera_respuesta_horas: v.primera_respuesta_horas || null,
          diagnostico_horas: v.diagnostico_horas || null,
          resolucion_total_horas: v.resolucion_total_horas || null,
          descripcion_operativa: v.descripcion_operativa || null,
          umbrales_alerta: umbrales ?? null,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar el objetivo.");
      else {
        setOk("Objetivo actualizado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al actualizar el objetivo.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Objetivos de tiempo</h1>
        <p>Define los tiempos objetivo de primera respuesta, diagnóstico y resolución por prioridad.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : objetivos.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay objetivos de tiempo configurados.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {objetivos.map((o) => {
            const v = valores(o);
            return (
              <div key={o.id_objetivo} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: o.color ?? "#1d4ed8" }} />
                  <strong style={{ fontSize: 13.5 }}>{o.prioridad_nombre ?? `Prioridad ${o.id_prioridad ?? "—"}`}</strong>
                  {o.nivel != null && <span style={{ fontSize: 12, color: "#6b7280" }}>· nivel {o.nivel}</span>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Primera respuesta (h)
                    <input type="number" min={0} value={v.primera_respuesta_horas} onChange={(e) => setCampo(o.id_objetivo, "primera_respuesta_horas", e.target.value, o)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Diagnóstico (h)
                    <input type="number" min={0} value={v.diagnostico_horas} onChange={(e) => setCampo(o.id_objetivo, "diagnostico_horas", e.target.value, o)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Resolución total (h)
                    <input type="number" min={0} value={v.resolucion_total_horas} onChange={(e) => setCampo(o.id_objetivo, "resolucion_total_horas", e.target.value, o)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 150 }} />
                  </label>
                  <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
                    Descripción operativa
                    <input type="text" value={v.descripcion_operativa} onChange={(e) => setCampo(o.id_objetivo, "descripcion_operativa", e.target.value, o)} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                  </label>
                </div>
                <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
                  Umbrales de alerta (JSON)
                  <input type="text" value={v.umbrales_alerta} onChange={(e) => setCampo(o.id_objetivo, "umbrales_alerta", e.target.value, o)} placeholder='{"aviso":0.75,"critico":1}' style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </label>
                <button className="boton-primario" style={{ width: "auto", marginTop: 12 }} disabled={procesando === o.id_objetivo} onClick={() => guardar(o)}>
                  Guardar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
