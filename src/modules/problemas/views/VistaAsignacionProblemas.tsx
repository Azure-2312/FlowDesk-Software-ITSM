"use client";

import { useEffect, useMemo, useState } from "react";

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  estado_nombre: string;
  prioridad_nombre: string | null;
  id_usuario_asignado: number | null;
  asignado: string | null;
  id_departamento: number | null;
  departamento: string | null;
  id_prioridad: number | null;
  fecha_creacion: string;
}

interface Simple {
  id: number;
  nombre: string;
}

export default function VistaAsignacionProblemas() {
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [tecnicos, setTecnicos] = useState<Simple[]>([]);
  const [departamentos, setDepartamentos] = useState<Simple[]>([]);
  const [prioridades, setPrioridades] = useState<Simple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { id_usuario_asignado: string; id_departamento: string; id_prioridad: string }>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas/gestion/asignacion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setProblemas(Array.isArray(json?.problemas) ? json.problemas : []);
        setTecnicos(Array.isArray(json?.tecnicos) ? json.tecnicos : []);
        setDepartamentos(Array.isArray(json?.departamentos) ? json.departamentos : []);
        setPrioridades(Array.isArray(json?.prioridades) ? json.prioridades : []);
      } else setError(json.error ?? "No se pudo cargar la bandeja.");
    } catch {
      setError("Error de conexión al cargar la bandeja.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return problemas;
    return problemas.filter((p) =>
      [p.codigo_problema, p.titulo, p.asignado, p.departamento, p.prioridad_nombre]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [problemas, busqueda]);

  function setCampo(id: number, campo: "id_usuario_asignado" | "id_departamento" | "id_prioridad", valor: string) {
    setForm((prev) => {
      const actual = prev[id] ?? { id_usuario_asignado: "", id_departamento: "", id_prioridad: "" };
      return { ...prev, [id]: { ...actual, [campo]: valor } };
    });
  }

  async function asignar(idProblema: number) {
    setProcesando(idProblema);
    setError(null);
    setOk(null);
    const valores = form[idProblema] ?? { id_usuario_asignado: "", id_departamento: "", id_prioridad: "" };
    try {
      const res = await fetch("/api/problemas/gestion/asignacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_problema: idProblema,
          id_usuario_asignado: valores.id_usuario_asignado || undefined,
          id_departamento: valores.id_departamento || undefined,
          id_prioridad: valores.id_prioridad || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo asignar el problema.");
      else {
        setOk("Problema actualizado.");
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al asignar el problema.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Bandeja y asignación</h1>
        <p>Asigna responsable, área y prioridad a los problemas abiertos.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <input type="text" placeholder="Buscar por código, título, responsable o área..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 14, width: "100%", maxWidth: 420 }} />

      {cargando ? (
        <p>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay problemas abiertos.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtrados.map((p) => (
            <div key={p.id_problema} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 13.5 }}>{p.codigo_problema}</strong> · {p.titulo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    {p.estado_nombre} · {p.prioridad_nombre ?? "Sin prioridad"} · Responsable {p.asignado ?? "sin asignar"} · Área {p.departamento ?? "—"}
                  </div>
                </div>
                <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setAbierto(abierto === p.id_problema ? null : p.id_problema)}>
                  {abierto === p.id_problema ? "Cerrar" : "Asignar"}
                </button>
              </div>
              {abierto === p.id_problema && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Responsable
                    <select value={form[p.id_problema]?.id_usuario_asignado ?? ""} onChange={(e) => setCampo(p.id_problema, "id_usuario_asignado", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 220 }}>
                      <option value="">Selecciona...</option>
                      {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </select>
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Área
                    <select value={form[p.id_problema]?.id_departamento ?? ""} onChange={(e) => setCampo(p.id_problema, "id_departamento", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 180 }}>
                      <option value="">Sin cambio</option>
                      {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                    </select>
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Prioridad
                    <select value={form[p.id_problema]?.id_prioridad ?? ""} onChange={(e) => setCampo(p.id_problema, "id_prioridad", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }}>
                      <option value="">Sin cambio</option>
                      {prioridades.map((pr) => <option key={pr.id} value={pr.id}>{pr.nombre}</option>)}
                    </select>
                  </label>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === p.id_problema} onClick={() => asignar(p.id_problema)}>
                    Guardar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
