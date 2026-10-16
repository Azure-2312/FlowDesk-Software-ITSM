"use client";

import { useEffect, useState } from "react";

interface Mayor {
  id_incidente_mayor: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  severidad: string | null;
  estado: string | null;
  sala_virtual: string | null;
  comunicados: string[] | null;
  fecha_declaracion: string | null;
  fecha_cierre: string | null;
  id_problema: number | null;
  codigo_problema: string | null;
  declara: string | null;
}

interface Candidato {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  prioridad_nombre: string | null;
  estado_nombre: string;
}

interface Simple {
  id: number;
  nombre: string;
}

const SEVERIDADES = ["CRITICA", "ALTA", "MEDIA", "BAJA"];

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE");
}

export default function VistaMayoresProblemas() {
  const [mayores, setMayores] = useState<Mayor[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [departamentos, setDepartamentos] = useState<Simple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | "nuevo" | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [nuevo, setNuevo] = useState({ id_problema: "", titulo: "", descripcion: "", severidad: "ALTA", id_departamento: "", sala_virtual: "" });
  const [edicion, setEdicion] = useState<Record<number, { severidad: string; sala_virtual: string; comunicados: string }>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-problemas/mayores?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setMayores(Array.isArray(json?.mayores) ? json.mayores : []);
        setCandidatos(Array.isArray(json?.candidatos) ? json.candidatos : []);
        setDepartamentos(Array.isArray(json?.departamentos) ? json.departamentos : []);
      } else setError(json.error ?? "No se pudieron cargar los problemas mayores.");
    } catch {
      setError("Error de conexión al cargar los problemas mayores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function setCampo(id: number, campo: "severidad" | "sala_virtual" | "comunicados", valor: string) {
    setEdicion((prev) => {
      const actual = prev[id] ?? { severidad: "", sala_virtual: "", comunicados: "" };
      return { ...prev, [id]: { ...actual, [campo]: valor } };
    });
  }

  async function declarar() {
    setProcesando("nuevo");
    setError(null);
    setOk(null);
    try {
      const candidato = candidatos.find((c) => String(c.id_problema) === nuevo.id_problema);
      const res = await fetch("/api/gestor-problemas/mayores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_problema: nuevo.id_problema || undefined,
          titulo: nuevo.titulo || candidato?.titulo,
          descripcion: nuevo.descripcion || undefined,
          severidad: nuevo.severidad,
          id_departamento: nuevo.id_departamento || undefined,
          sala_virtual: nuevo.sala_virtual || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo declarar el problema mayor.");
      else {
        setOk(`Incidente mayor ${json.codigo} declarado.`);
        setNuevo({ id_problema: "", titulo: "", descripcion: "", severidad: "ALTA", id_departamento: "", sala_virtual: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al declarar el problema mayor.");
    } finally {
      setProcesando(null);
    }
  }

  async function actualizar(id: number, accion: "actualizar" | "cerrar") {
    setProcesando(id);
    setError(null);
    setOk(null);
    const valores = edicion[id] ?? { severidad: "", sala_virtual: "", comunicados: "" };
    try {
      const res = await fetch("/api/gestor-problemas/mayores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion,
          id_incidente_mayor: id,
          severidad: valores.severidad || undefined,
          sala_virtual: valores.sala_virtual || undefined,
          comunicados: valores.comunicados ? valores.comunicados.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar el incidente mayor.");
      else {
        setOk(accion === "cerrar" ? "Incidente mayor cerrado." : "Incidente mayor actualizado.");
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al actualizar el incidente mayor.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Problemas mayores y revisión</h1>
        <p>Declara problemas mayores, gestiona la sala virtual, los comunicados y el cierre con revisión.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Declarar problema mayor</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 280px" }}>
            Problema
            <select value={nuevo.id_problema} onChange={(e) => setNuevo({ ...nuevo, id_problema: e.target.value })} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Selecciona...</option>
              {candidatos.map((c) => <option key={c.id_problema} value={c.id_problema}>{c.codigo_problema} · {c.titulo}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Severidad
            <select value={nuevo.severidad} onChange={(e) => setNuevo({ ...nuevo, severidad: e.target.value })} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 140 }}>
              {SEVERIDADES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Área
            <select value={nuevo.id_departamento} onChange={(e) => setNuevo({ ...nuevo, id_departamento: e.target.value })} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 170 }}>
              <option value="">Sin definir</option>
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 220px" }}>
            Sala virtual
            <input type="text" value={nuevo.sala_virtual} onChange={(e) => setNuevo({ ...nuevo, sala_virtual: e.target.value })} placeholder="Enlace o sala" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === "nuevo"} onClick={declarar}>Declarar</button>
        </div>
        <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
          Descripción (opcional)
          <textarea value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} rows={2} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
        </label>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : mayores.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay problemas mayores registrados.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mayores.map((m) => (
            <div key={m.id_incidente_mayor} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 13.5 }}>{m.codigo}</strong> · {m.titulo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    {m.estado ?? "—"} · {m.severidad ?? "—"} · {m.codigo_problema ?? "sin problema"} · Declara {m.declara ?? "—"}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>
                    Declarado {fecha(m.fecha_declaracion)}{m.fecha_cierre ? ` · Cerrado ${fecha(m.fecha_cierre)}` : ""}
                  </div>
                </div>
                <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setAbierto(abierto === m.id_incidente_mayor ? null : m.id_incidente_mayor)}>
                  {abierto === m.id_incidente_mayor ? "Cerrar" : "Gestionar"}
                </button>
              </div>
              {m.comunicados && m.comunicados.length > 0 && (
                <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5 }}>
                  {m.comunicados.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              )}
              {abierto === m.id_incidente_mayor && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <label style={{ fontSize: 12, color: "#374151" }}>
                      Severidad
                      <select value={edicion[m.id_incidente_mayor]?.severidad ?? ""} onChange={(e) => setCampo(m.id_incidente_mayor, "severidad", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 140 }}>
                        <option value="">Sin cambio</option>
                        {SEVERIDADES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
                      Sala virtual
                      <input type="text" value={edicion[m.id_incidente_mayor]?.sala_virtual ?? ""} onChange={(e) => setCampo(m.id_incidente_mayor, "sala_virtual", e.target.value)} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                    </label>
                  </div>
                  <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
                    Comunicados (uno por línea)
                    <textarea value={edicion[m.id_incidente_mayor]?.comunicados ?? ""} onChange={(e) => setCampo(m.id_incidente_mayor, "comunicados", e.target.value)} rows={3} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                  </label>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === m.id_incidente_mayor} onClick={() => actualizar(m.id_incidente_mayor, "actualizar")}>Actualizar</button>
                    {(m.estado ?? "").toUpperCase() !== "CERRADO" && (
                      <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === m.id_incidente_mayor} onClick={() => actualizar(m.id_incidente_mayor, "cerrar")}>Cerrar incidente mayor</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
