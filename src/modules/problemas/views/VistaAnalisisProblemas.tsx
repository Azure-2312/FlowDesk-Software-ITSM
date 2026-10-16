"use client";

import { useEffect, useState } from "react";

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  estado_nombre: string;
  causa_raiz: string | null;
  metodo_analisis: string | null;
  es_error_conocido: boolean;
}

interface Analisis {
  id_analisis: number;
  metodo: string;
  cinco_porques: string[] | null;
  ishikawa: Record<string, string[]> | null;
  linea_tiempo: { fecha: string; evento: string }[] | null;
  conclusion: string | null;
  autor: string | null;
  fecha_creacion: string;
}

const METODOS = [
  { valor: "5_WHYS", etiqueta: "5 porqués" },
  { valor: "ISHIKAWA", etiqueta: "Ishikawa (espina de pescado)" },
  { valor: "TIMELINE", etiqueta: "Línea de tiempo" },
  { valor: "COMBINADO", etiqueta: "Combinado" },
];

function lineas(v: string) {
  return v.split("\n").map((s) => s.trim()).filter(Boolean);
}

function ishikawaObjeto(v: string) {
  const obj: Record<string, string[]> = {};
  for (const linea of lineas(v)) {
    const idx = linea.indexOf(":");
    const clave = (idx >= 0 ? linea.slice(0, idx) : "General").trim() || "General";
    const valor = (idx >= 0 ? linea.slice(idx + 1) : linea).trim();
    if (!valor) continue;
    (obj[clave] ??= []).push(valor);
  }
  return obj;
}

function lineaTiempo(v: string) {
  return lineas(v).map((l) => {
    const idx = l.indexOf("|");
    return { fecha: (idx >= 0 ? l.slice(0, idx) : "").trim(), evento: (idx >= 0 ? l.slice(idx + 1) : l).trim() };
  });
}

export default function VistaAnalisisProblemas() {
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [analisis, setAnalisis] = useState<Analisis[]>([]);
  const [idProblema, setIdProblema] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [metodo, setMetodo] = useState("5_WHYS");
  const [porques, setPorques] = useState("");
  const [ishikawa, setIshikawa] = useState("");
  const [timeline, setTimeline] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [esErrorConocido, setEsErrorConocido] = useState(false);

  async function cargar(id: number | null) {
    setCargando(true);
    setError(null);
    try {
      const url = new URL("/api/gestor-problemas/analisis", window.location.origin);
      if (id) url.searchParams.set("id_problema", String(id));
      url.searchParams.set("_t", String(Date.now()));
      const res = await fetch(url.toString());
      const json = await res.json();
      if (res.ok) {
        setProblemas(Array.isArray(json?.problemas) ? json.problemas : []);
        setAnalisis(Array.isArray(json?.analisis) ? json.analisis : []);
      } else setError(json.error ?? "No se pudo cargar el análisis.");
    } catch {
      setError("Error de conexión al cargar el análisis.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(null); }, []);

  async function seleccionar(id: number) {
    setIdProblema(id);
    setOk(null);
    await cargar(id);
  }

  async function guardar() {
    if (!idProblema) {
      setError("Selecciona un problema.");
      return;
    }
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-problemas/analisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_problema: idProblema,
          metodo,
          cinco_porques: lineas(porques),
          ishikawa: ishikawaObjeto(ishikawa),
          linea_tiempo: lineaTiempo(timeline),
          conclusion,
          es_error_conocido: esErrorConocido,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo guardar el análisis.");
      else {
        setOk("Análisis guardado.");
        setPorques("");
        setIshikawa("");
        setTimeline("");
        setConclusion("");
        setEsErrorConocido(false);
        await cargar(idProblema);
      }
    } catch {
      setError("Error de conexión al guardar el análisis.");
    } finally {
      setGuardando(false);
    }
  }

  const seleccionado = problemas.find((p) => p.id_problema === idProblema) ?? null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Análisis de causa raíz</h1>
        <p>Aplica 5 porqués, Ishikawa y línea de tiempo; registra la conclusión y marca el error conocido.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#374151" }}>
          Problema
          <select value={idProblema ?? ""} onChange={(e) => e.target.value && seleccionar(Number(e.target.value))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 360, maxWidth: "100%" }}>
            <option value="">Selecciona un problema...</option>
            {problemas.map((p) => <option key={p.id_problema} value={p.id_problema}>{p.codigo_problema} · {p.titulo}</option>)}
          </select>
        </label>
        {seleccionado && (
          <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 8 }}>
            {seleccionado.estado_nombre} · Método actual {seleccionado.metodo_analisis ?? "—"} · Causa raíz {seleccionado.causa_raiz ?? "sin registrar"}
          </div>
        )}
      </div>

      {idProblema && (
        <>
          <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Nuevo análisis</h2>
            <label style={{ fontSize: 12, color: "#374151", display: "block", marginBottom: 10 }}>
              Método
              <select value={metodo} onChange={(e) => setMetodo(e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 260 }}>
                {METODOS.map((m) => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
              </select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              <label style={{ fontSize: 12, color: "#374151" }}>
                5 porqués (uno por línea)
                <textarea value={porques} onChange={(e) => setPorques(e.target.value)} rows={5} placeholder={"¿Por qué falló el servicio?\n¿Por qué ...?"} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
              </label>
              <label style={{ fontSize: 12, color: "#374151" }}>
                Ishikawa (Categoría: causa, una por línea)
                <textarea value={ishikawa} onChange={(e) => setIshikawa(e.target.value)} rows={5} placeholder={"Personas: falta de capacitación\nProcesos: sin checklist\nTecnología: disco degradado"} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
              </label>
              <label style={{ fontSize: 12, color: "#374151" }}>
                Línea de tiempo (fecha | evento, una por línea)
                <textarea value={timeline} onChange={(e) => setTimeline(e.target.value)} rows={5} placeholder={"2026-01-05 08:00 | Inicio de degradación\n2026-01-05 09:30 | Reporte de usuarios"} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
              </label>
            </div>
            <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 12 }}>
              Conclusión / causa raíz
              <textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={3} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#374151", marginTop: 12 }}>
              <input type="checkbox" checked={esErrorConocido} onChange={(e) => setEsErrorConocido(e.target.checked)} />
              Marcar como error conocido (KEDB)
            </label>
            <button className="boton-primario" style={{ width: "auto", marginTop: 12 }} disabled={guardando} onClick={guardar}>
              {guardando ? "Guardando..." : "Guardar análisis"}
            </button>
          </div>

          <div className="tarjeta-formulario">
            <h2 style={{ marginTop: 0 }}>Análisis registrados</h2>
            {cargando ? (
              <p>Cargando...</p>
            ) : analisis.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Este problema aún no tiene análisis.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analisis.map((a) => (
                  <div key={a.id_analisis} style={{ borderLeft: "3px solid #1d4ed8", paddingLeft: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.metodo} · {a.autor ?? "—"}</div>
                    <div style={{ fontSize: 11.5, color: "#6b7280" }}>{new Date(a.fecha_creacion).toLocaleString("es-PE")}</div>
                    {a.cinco_porques && a.cinco_porques.length > 0 && (
                      <ol style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                        {a.cinco_porques.map((p, i) => <li key={i}>{p}</li>)}
                      </ol>
                    )}
                    {a.ishikawa && Object.keys(a.ishikawa).length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                        {Object.entries(a.ishikawa).map(([cat, causas]) => (
                          <li key={cat}><strong>{cat}</strong>: {causas.join("; ")}</li>
                        ))}
                      </ul>
                    )}
                    {a.linea_tiempo && a.linea_tiempo.length > 0 && (
                      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                        {a.linea_tiempo.map((e, i) => <li key={i}><strong>{e.fecha}</strong> — {e.evento}</li>)}
                      </ul>
                    )}
                    {a.conclusion && <p style={{ margin: "6px 0 0", fontSize: 12.5 }}><strong>Conclusión:</strong> {a.conclusion}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
