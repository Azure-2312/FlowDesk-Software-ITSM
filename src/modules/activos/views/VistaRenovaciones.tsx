"use client";

import { useEffect, useState } from "react";

interface PorVencer {
  id_contrato: number;
  codigo: string;
  nombre: string;
  fecha_fin: string | null;
  monto: number | null;
  moneda: string | null;
  renovacion_automatica: boolean;
  dias_aviso: number;
  proveedor_nombre: string | null;
  dias_para_vencer: number;
}

interface Renovacion {
  id_renovacion: number;
  fecha_solicitud: string;
  monto_propuesto: number | null;
  estado: string;
  comentario: string | null;
  contrato_codigo: string;
  contrato_nombre: string;
  solicita_nombre: string | null;
}

interface Contrato {
  id_contrato: number;
  codigo: string;
  nombre: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  SOLICITADA: { bg: "#fef3c7", fg: "#92400e" },
  APROBADA: { bg: "#dbeafe", fg: "#1d4ed8" },
  RECHAZADA: { bg: "#fee2e2", fg: "#b91c1c" },
  EJECUTADA: { bg: "#dcfce7", fg: "#166534" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaRenovaciones() {
  const [porVencer, setPorVencer] = useState<PorVencer[]>([]);
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ id_contrato: "", monto_propuesto: "", comentario: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/renovaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setPorVencer(Array.isArray(json?.porVencer) ? json.porVencer : []);
        setRenovaciones(Array.isArray(json?.renovaciones) ? json.renovaciones : []);
        setContratos(Array.isArray(json?.contratos) ? json.contratos : []);
      } else setError(json.error ?? "No se pudieron cargar las renovaciones.");
    } catch {
      setError("Error de conexión al cargar las renovaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function solicitar() {
    if (!form.id_contrato) {
      setError("Selecciona el contrato a renovar.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/renovaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la solicitud.");
      else {
        setOk(json.mensaje ?? "Solicitud registrada.");
        setForm({ id_contrato: "", monto_propuesto: "", comentario: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la solicitud.");
    } finally {
      setProcesando(false);
    }
  }

  async function resolver(idRenovacion: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/renovaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_renovacion: idRenovacion, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else {
        setOk(json.mensaje ?? "Renovación actualizada.");
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
        <h1>Renovaciones y vencimientos</h1>
        <p>Genera solicitudes de renovación para contratos por vencer y registra su historial.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Solicitar renovación</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Contrato
            <select value={form.id_contrato} onChange={(e) => setForm((p) => ({ ...p, id_contrato: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 240 }}>
              <option value="">Selecciona...</option>
              {contratos.map((c) => <option key={c.id_contrato} value={c.id_contrato}>{c.codigo} · {c.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Monto propuesto
            <input type="number" value={form.monto_propuesto} onChange={(e) => setForm((p) => ({ ...p, monto_propuesto: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 150 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
            Comentario
            <input type="text" value={form.comentario} onChange={(e) => setForm((p) => ({ ...p, comentario: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={procesando} onClick={solicitar}>{procesando ? "Guardando..." : "Solicitar"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div>
          <h2>Contratos por vencer</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : porVencer.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>Sin contratos próximos a vencer.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {porVencer.map((c) => {
                const dias = Math.round(Number(c.dias_para_vencer));
                return (
                  <div key={c.id_contrato} className="tarjeta-formulario" style={{ margin: 0 }}>
                    <strong style={{ fontSize: 13 }}>{c.codigo} · {c.nombre}</strong>
                    <div style={{ fontSize: 12, color: dias < 0 ? "#b91c1c" : "#b45309", marginTop: 3 }}>
                      Vence {fecha(c.fecha_fin)} ({dias < 0 ? `hace ${-dias} días` : `en ${dias} días`}) {c.renovacion_automatica ? "· automática" : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{c.proveedor_nombre ?? "—"} · {c.monto === null ? "sin monto" : `${Number(c.monto).toLocaleString("es-PE", { minimumFractionDigits: 2 })} ${c.moneda ?? ""}`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2>Solicitudes de renovación</h2>
          {renovaciones.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>Sin solicitudes registradas.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {renovaciones.map((r) => {
                const color = COLORES[r.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <div key={r.id_renovacion} className="tarjeta-formulario" style={{ margin: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>{r.contrato_codigo} · {r.contrato_nombre}</strong>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{r.estado}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                      {fecha(r.fecha_solicitud)} · {r.solicita_nombre ?? "—"} · {r.monto_propuesto === null ? "sin monto" : Number(r.monto_propuesto).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                    </div>
                    {r.comentario && <div style={{ fontSize: 12, color: "#374151", marginTop: 2 }}>{r.comentario}</div>}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {r.estado === "SOLICITADA" && (
                        <>
                          <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(r.id_renovacion, "APROBADA")}>Aprobar</button>
                          <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(r.id_renovacion, "RECHAZADA")}>Rechazar</button>
                        </>
                      )}
                      {r.estado === "APROBADA" && <button className="boton-primario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => resolver(r.id_renovacion, "EJECUTADA")}>Marcar ejecutada</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
