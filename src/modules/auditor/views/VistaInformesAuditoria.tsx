"use client";

import { useEffect, useState, FormEvent } from "react";

interface Informe {
  id_informe: number;
  codigo_informe: string;
  titulo: string;
  periodo: string;
  hallazgos: string;
  recomendaciones: string | null;
  estado: string;
  fecha_creacion: string;
  fecha_cierre: string | null;
  auditor_nombre: string | null;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  BORRADOR: { bg: "#e5e7eb", fg: "#374151" },
  EMITIDO: { bg: "#dbeafe", fg: "#1e40af" },
  CERRADO: { bg: "#dcfce7", fg: "#166534" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaInformesAuditoria() {
  const [items, setItems] = useState<Informe[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [expandido, setExpandido] = useState<number | null>(null);

  const [titulo, setTitulo] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [hallazgos, setHallazgos] = useState("");
  const [recomendaciones, setRecomendaciones] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/auditor/informes?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los informes.");
    } catch {
      setError("Error de conexión al cargar los informes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/auditor/informes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, periodo, hallazgos, recomendaciones }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar el informe.");
      else {
        setOk("Informe registrado.");
        setTitulo(""); setPeriodo(""); setHallazgos(""); setRecomendaciones("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar el informe.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(idInforme: number, estado: string) {
    setError(null);
    try {
      const res = await fetch("/api/auditor/informes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_informe: idInforme, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar el informe.");
      else await cargar();
    } catch {
      setError("Error de conexión al actualizar el informe.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Informes de auditoría</h1>
        <p>Hallazgos, recomendaciones y seguimiento de la función de auditoría.</p>
      </div>

      <form onSubmit={crear} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nuevo informe</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Título
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Periodo
            <input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="2026-Q1" required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
        </div>
        <label style={{ display: "block", fontSize: 12, color: "#374151", marginTop: 12 }}>
          Hallazgos
          <textarea value={hallazgos} onChange={(e) => setHallazgos(e.target.value)} required rows={3} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontFamily: "inherit" }} />
        </label>
        <label style={{ display: "block", fontSize: 12, color: "#374151", marginTop: 12 }}>
          Recomendaciones
          <textarea value={recomendaciones} onChange={(e) => setRecomendaciones(e.target.value)} rows={2} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontFamily: "inherit" }} />
        </label>
        <div style={{ marginTop: 12 }}>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar informe"}
          </button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          Aún no hay informes de auditoría.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((i) => {
            const color = COLORES[i.estado] ?? COLORES.BORRADOR;
            return (
              <div key={i.id_informe} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{i.codigo_informe} · {i.titulo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      Periodo {i.periodo} · {i.auditor_nombre ?? "—"} · {fecha(i.fecha_creacion)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{i.estado}</span>
                    <button className="boton-secundario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} onClick={() => setExpandido(expandido === i.id_informe ? null : i.id_informe)}>
                      {expandido === i.id_informe ? "Ocultar" : "Ver detalle"}
                    </button>
                    {i.estado === "BORRADOR" && <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} onClick={() => cambiarEstado(i.id_informe, "EMITIDO")}>Emitir</button>}
                    {i.estado === "EMITIDO" && <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} onClick={() => cambiarEstado(i.id_informe, "CERRADO")}>Cerrar</button>}
                  </div>
                </div>
                {expandido === i.id_informe && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
                    <strong>Hallazgos:</strong>
                    <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{i.hallazgos}</p>
                    {i.recomendaciones && (
                      <>
                        <strong>Recomendaciones:</strong>
                        <p style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{i.recomendaciones}</p>
                      </>
                    )}
                    {i.fecha_cierre && <p style={{ color: "#6b7280", fontSize: 12 }}>Cerrado el {fecha(i.fecha_cierre)}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
