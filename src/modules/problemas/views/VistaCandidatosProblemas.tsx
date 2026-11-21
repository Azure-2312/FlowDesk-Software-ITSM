"use client";

import { useEffect, useState } from "react";

interface TicketRef {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  fecha: string | null;
}

interface Candidato {
  id_regla: number | null;
  regla: string | null;
  dimension: string;
  valor: string;
  total: number;
  tickets: TicketRef[];
}

interface Regla {
  id_regla: number;
  nombre: string;
  agrupar_por: string | null;
  umbral_incidentes: number | null;
  ventana_horas: number | null;
  activa: boolean;
}

interface Simple {
  id: number;
  nombre: string;
}

export default function VistaCandidatosProblemas() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [prioridades, setPrioridades] = useState<Simple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { titulo: string; descripcion: string; id_prioridad: string }>>({});

  // Subida manual de candidato a problema
  const [modalManual, setModalManual] = useState(false);
  const [manualTitulo, setManualTitulo] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualPrioridad, setManualPrioridad] = useState("");
  const [guardandoManual, setGuardandoManual] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas/gestion/candidatos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setCandidatos(Array.isArray(json?.candidatos) ? json.candidatos : []);
        setReglas(Array.isArray(json?.reglas) ? json.reglas : []);
        setPrioridades(Array.isArray(json?.prioridades) ? json.prioridades : []);
      } else setError(json.error ?? "No se pudieron cargar los candidatos.");
    } catch {
      setError("Error de conexión al cargar los candidatos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const claveDe = (c: Candidato) => `${c.dimension}:${c.valor}`;

  function setCampo(clave: string, campo: "titulo" | "descripcion" | "id_prioridad", valor: string) {
    setForm((prev) => {
      const actual = prev[clave] ?? { titulo: "", descripcion: "", id_prioridad: "" };
      return { ...prev, [clave]: { ...actual, [campo]: valor } };
    });
  }

  async function convertir(c: Candidato) {
    const clave = claveDe(c);
    setProcesando(clave);
    setError(null);
    setOk(null);
    const valores = form[clave] ?? { titulo: "", descripcion: "", id_prioridad: "" };
    try {
      const res = await fetch("/api/problemas/gestion/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: valores.titulo || `Problema recurrente: ${c.valor}`,
          descripcion: valores.descripcion || `Detectado por la regla "${c.regla ?? "automática"}" agrupando por ${c.dimension}.`,
          ids_tickets: c.tickets.map((t) => t.id_ticket),
          id_prioridad: valores.id_prioridad || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar el problema.");
      else {
        setOk(`Problema ${json.codigo_problema} registrado.`);
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar el problema.");
    } finally {
      setProcesando(null);
    }
  }

  async function subirCandidatoManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitulo.trim()) return;

    setGuardandoManual(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/problemas/gestion/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: manualTitulo.trim(),
          descripcion: manualDesc.trim() || "Candidato registrado manualmente por supervisión técnica.",
          ids_tickets: [],
          id_prioridad: manualPrioridad || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo registrar el candidato a problema.");
      } else {
        setOk(`Candidato registrado como Problema ${json.codigo_problema} exitosamente.`);
        setModalManual(false);
        setManualTitulo("");
        setManualDesc("");
        setManualPrioridad("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar candidato.");
    } finally {
      setGuardandoManual(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0 }}>Candidatos a problema</h1>
          <p style={{ margin: "4px 0 0" }}>Sugerencias de las reglas de umbral con alcance global: incidentes agrupados que superan el umbral configurado.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalManual(true)}
          className="boton-primario"
          style={{ width: "auto", fontSize: 13, padding: "8px 16px", cursor: "pointer" }}
        >
          + Subir candidato manual
        </button>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
            <h2 style={{ marginTop: 0 }}>Reglas de umbral activas</h2>
            {reglas.length === 0 ? (
              <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay reglas de umbral configuradas.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {reglas.map((r) => (
                  <span key={r.id_regla} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 999, background: r.activa ? "#dcfce7" : "#f1f5f9", color: r.activa ? "#166534" : "#6b7280" }}>
                    {r.nombre} · {r.agrupar_por ?? "servicio"} · ≥ {r.umbral_incidentes ?? 3} en {Math.round((r.ventana_horas ?? 720) / 24)} d
                  </span>
                ))}
              </div>
            )}
          </div>

          {candidatos.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No se detectaron grupos que superen el umbral.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {candidatos.map((c) => {
                const clave = claveDe(c);
                async function subirCandidatoManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitulo.trim()) return;

    setGuardandoManual(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/problemas/gestion/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: manualTitulo.trim(),
          descripcion: manualDesc.trim() || "Candidato registrado manualmente por supervisión técnica.",
          ids_tickets: [],
          id_prioridad: manualPrioridad || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo registrar el candidato a problema.");
      } else {
        setOk(`Candidato registrado como Problema ${json.codigo_problema} exitosamente.`);
        setModalManual(false);
        setManualTitulo("");
        setManualDesc("");
        setManualPrioridad("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar candidato.");
    } finally {
      setGuardandoManual(false);
    }
  }

  return (
                  <div key={clave} className="tarjeta-formulario" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <strong style={{ fontSize: 13.5 }}>{c.valor}</strong>
                        <span style={{ fontSize: 12, color: "#6b7280" }}> · {c.total} incidentes por {c.dimension}</span>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Regla: {c.regla ?? "automática"}</div>
                      </div>
                      <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setAbierto(abierto === clave ? null : clave)}>
                        {abierto === clave ? "Cerrar" : "Registrar problema"}
                      </button>
                    </div>
                    {abierto === clave && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 260px" }}>
                            Título
                            <input type="text" value={form[clave]?.titulo ?? ""} placeholder={`Problema recurrente: ${c.valor}`} onChange={(e) => setCampo(clave, "titulo", e.target.value)} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                          </label>
                          <label style={{ fontSize: 12, color: "#374151" }}>
                            Prioridad
                            <select value={form[clave]?.id_prioridad ?? ""} onChange={(e) => setCampo(clave, "id_prioridad", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }}>
                              <option value="">Sin definir</option>
                              {prioridades.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                          </label>
                        </div>
                        <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
                          Descripción
                          <textarea value={form[clave]?.descripcion ?? ""} onChange={(e) => setCampo(clave, "descripcion", e.target.value)} rows={3} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                        </label>
                        <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                          <div style={{ marginBottom: 4 }}>Incidentes que se vincularán:</div>
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {c.tickets.map((t) => <li key={t.id_ticket}>{t.codigo_ticket} · {t.titulo}</li>)}
                          </ul>
                        </div>
                        <button className="boton-primario" style={{ width: "auto", marginTop: 12 }} disabled={procesando === clave} onClick={() => convertir(c)}>
                          Registrar problema
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Subir Candidato Manual */}
      {modalManual && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, maxWidth: 540, width: "100%", padding: 24, boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
              Registrar Candidato a Problema Manualmente
            </h3>
            <form onSubmit={subirCandidatoManual} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Título del Candidato *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Latencia anómala recurrente en Microservicio Auth"
                  value={manualTitulo}
                  onChange={(e) => setManualTitulo(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Prioridad Estimada
                </label>
                <select
                  value={manualPrioridad}
                  onChange={(e) => setManualPrioridad(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, backgroundColor: "#ffffff" }}
                >
                  <option value="">-- Sin definir --</option>
                  {prioridades.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Descripción / Sospecha de Causa Raíz
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalle el comportamiento recurrente, patrones observados o motivos para abrir investigación formal..."
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalManual(false)}
                  style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#ffffff", fontSize: 13, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoManual}
                  style={{ padding: "8px 18px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {guardandoManual ? "Registrando..." : "Registrar Candidato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
