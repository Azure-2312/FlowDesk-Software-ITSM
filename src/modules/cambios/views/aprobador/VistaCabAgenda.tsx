"use client";

import { useEffect, useState, FormEvent } from "react";

interface Reunion {
  id_reunion: number;
  titulo: string;
  fecha_reunion: string;
  tipo: string;
  estado: string;
  agenda: { id_cambio: number; codigo_cambio: string; titulo: string }[];
  acta: string | null;
  fecha_creacion: string;
  convocante_nombre: string | null;
}

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  ventana_inicio: string;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PROGRAMADA: { bg: "#dbeafe", fg: "#1e40af" },
  REALIZADA: { bg: "#dcfce7", fg: "#166534" },
  CANCELADA: { bg: "#e5e7eb", fg: "#374151" },
};

export default function VistaCabAgenda() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [tipo, setTipo] = useState("ORDINARIA");
  const [seleccion, setSeleccion] = useState<number[]>([]);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/cab/agenda?_t=${Date.now()}`);
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

  function alternar(idCambio: number) {
    setSeleccion((prev) => (prev.includes(idCambio) ? prev.filter((x) => x !== idCambio) : [...prev, idCambio]));
  }

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const agenda = cambios
        .filter((c) => seleccion.includes(c.id_cambio))
        .map((c) => ({ id_cambio: c.id_cambio, codigo_cambio: c.codigo_cambio, titulo: c.titulo }));
      const res = await fetch("/api/cambios/cab/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, fecha_reunion: fecha, tipo, agenda }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo programar la reunión.");
      else {
        setOk("Reunión programada.");
        setTitulo(""); setFecha(""); setTipo("ORDINARIA"); setSeleccion([]);
        await cargar();
      }
    } catch {
      setError("Error de conexión al programar la reunión.");
    } finally {
      setGuardando(false);
    }
  }

  async function actualizar(idReunion: number, estado: string, acta?: string) {
    setError(null);
    try {
      const res = await fetch("/api/cambios/cab/agenda", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_reunion: idReunion, estado, acta }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar la reunión.");
      else await cargar();
    } catch {
      setError("Error de conexión al actualizar la reunión.");
    }
  }

  function registrarActa(r: Reunion) {
    const acta = window.prompt("Acta de la reunión:", r.acta ?? "") ?? "";
    if (acta.trim().length === 0) return;
    actualizar(r.id_reunion, "REALIZADA", acta);
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Agenda y actas del CAB</h1>
        <p>Programa reuniones del comité, arma la agenda y registra el acta.</p>
      </div>

      <form onSubmit={crear} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nueva reunión</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Título
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Fecha y hora
            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Tipo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="ORDINARIA">Ordinaria</option>
              <option value="EXTRAORDINARIA">Extraordinaria</option>
              <option value="EMERGENCIA">Emergencia</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>Agenda (RFC a tratar)</div>
          <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
            {cambios.length === 0 ? (
              <span style={{ fontSize: 12.5, color: "#6b7280" }}>No hay RFC candidatas.</span>
            ) : (
              cambios.map((c) => (
                <label key={c.id_cambio} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, padding: "4px 2px" }}>
                  <input type="checkbox" checked={seleccion.includes(c.id_cambio)} onChange={() => alternar(c.id_cambio)} />
                  <strong>{c.codigo_cambio}</strong> · {c.titulo}
                </label>
              ))
            )}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>{guardando ? "Guardando..." : "Programar reunión"}</button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : reuniones.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          Aún no hay reuniones del CAB.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reuniones.map((r) => {
            const color = COLORES[r.estado] ?? COLORES.PROGRAMADA;
            return (
              <div key={r.id_reunion} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{r.titulo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {fechaHora(r.fecha_reunion)} · {r.tipo} · Convoca {r.convocante_nombre ?? "—"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{r.estado}</span>
                    {r.estado === "PROGRAMADA" && <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} onClick={() => registrarActa(r)}>Registrar acta</button>}
                    {r.estado === "PROGRAMADA" && <button className="boton-secundario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} onClick={() => actualizar(r.id_reunion, "CANCELADA")}>Cancelar</button>}
                  </div>
                </div>
                {Array.isArray(r.agenda) && r.agenda.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", fontSize: 12.5, color: "#374151" }}>
                    {r.agenda.map((a, i) => <li key={i}>• <strong>{a.codigo_cambio}</strong> {a.titulo}</li>)}
                  </ul>
                )}
                {r.acta && <p style={{ fontSize: 12.5, color: "#374151", marginTop: 10, whiteSpace: "pre-wrap" }}><strong>Acta:</strong> {r.acta}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
