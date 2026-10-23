"use client";

import { useEffect, useState, FormEvent } from "react";

interface Incidente {
  id_incidente_mayor: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  severidad: string;
  estado: string;
  sala_virtual: string | null;
  comunicados: { texto: string; fecha: string }[] | null;
  fecha_declaracion: string;
  fecha_cierre: string | null;
  codigo_ticket: string | null;
  declarado_por: string | null;
}

export default function VistaIncidentesMayores() {
  const [items, setItems] = useState<Incidente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [severidad, setSeveridad] = useState("P1");
  const [sala, setSala] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/incidentes-mayores?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los incidentes mayores.");
    } catch {
      setError("Error de conexión al cargar los incidentes mayores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function declarar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/tickets/incidentes-mayores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descripcion, severidad, sala_virtual: sala }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo declarar el incidente mayor.");
      else {
        setOk(`Incidente mayor ${json.incidente?.codigo ?? ""} declarado.`);
        setTitulo(""); setDescripcion(""); setSala("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al declarar.");
    } finally {
      setGuardando(false);
    }
  }

  async function actualizar(id: number, payload: any) {
    setError(null);
    try {
      const res = await fetch("/api/tickets/incidentes-mayores", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_incidente_mayor: id, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else await cargar();
    } catch {
      setError("Error de conexión al actualizar.");
    }
  }

  function comunicar(id: number) {
    const texto = window.prompt("Texto del comunicado:") ?? "";
    if (texto.trim()) actualizar(id, { comunicado: texto.trim() });
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Incidentes mayores</h1>
        <p>Declara, coordina, comunica y cierra incidentes mayores (sala de crisis).</p>
      </div>

      <form onSubmit={declarar} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Declarar incidente mayor</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: 2, minWidth: 220 }}>
            Título
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Caída del ERP corporativo" style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Severidad
            <select value={severidad} onChange={(e) => setSeveridad(e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: 1, minWidth: 180 }}>
            Sala virtual (URL)
            <input value={sala} onChange={(e) => setSala(e.target.value)} placeholder="https://..." style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <label style={{ display: "block", fontSize: 12, color: "#374151", marginTop: 10 }}>
          Descripción
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
        </label>
        <div style={{ marginTop: 12 }}>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
            {guardando ? "Declarando..." : "Declarar incidente mayor"}
          </button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay incidentes mayores registrados.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((im) => (
            <div key={im.id_incidente_mayor} className="tarjeta-formulario" style={{ margin: 0, borderLeft: im.estado === "ABIERTO" ? "4px solid #dc2626" : "4px solid #16a34a" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{im.codigo} · {im.titulo}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {im.severidad} · Declara {im.declarado_por ?? "—"} · {new Date(im.fecha_declaracion).toLocaleString("es-PE")}
                    {im.codigo_ticket ? ` · Ticket ${im.codigo_ticket}` : ""}
                  </div>
                  {im.sala_virtual && (
                    <div style={{ fontSize: 12.5, marginTop: 6 }}>
                      Sala: <a href={im.sala_virtual} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8" }}>{im.sala_virtual}</a>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, backgroundColor: im.estado === "ABIERTO" ? "#fee2e2" : im.estado === "MITIGADO" ? "#fef3c7" : "#dcfce7", color: im.estado === "ABIERTO" ? "#b91c1c" : im.estado === "MITIGADO" ? "#92400e" : "#166534" }}>
                    {im.estado}
                  </span>
                  <button className="boton-secundario" style={{ width: "auto" }} onClick={() => comunicar(im.id_incidente_mayor)}>Comunicar</button>
                  {im.estado !== "CERRADO" && (
                    <>
                      {im.estado === "ABIERTO" && (
                        <button className="boton-secundario" style={{ width: "auto" }} onClick={() => actualizar(im.id_incidente_mayor, { estado: "MITIGADO" })}>Mitigado</button>
                      )}
                      <button className="boton-primario" style={{ width: "auto" }} onClick={() => actualizar(im.id_incidente_mayor, { estado: "CERRADO" })}>Cerrar</button>
                    </>
                  )}
                </div>
              </div>
              {im.descripcion && <p style={{ fontSize: 12.5, color: "#374151", marginTop: 10, marginBottom: 0 }}>{im.descripcion}</p>}
              {im.comunicados && im.comunicados.length > 0 && (
                <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18, fontSize: 12, color: "#4b5563" }}>
                  {im.comunicados.map((c, i) => (
                    <li key={i}>{new Date(c.fecha).toLocaleString("es-PE")} — {c.texto}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
