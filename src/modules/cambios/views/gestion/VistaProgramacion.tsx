"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  ventana_inicio: string | null;
  ventana_fin: string | null;
  fecha_creacion: string;
  ci_codigo: string | null;
  ci_nombre: string | null;
  responsable_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaProgramacion() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { inicio: string; fin: string }>>({});
  const [avisos, setAvisos] = useState<Record<number, string[]>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/gestor-cambios/programacion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudo cargar la programación.");
    } catch {
      setError("Error de conexión al cargar la programación.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function actualizar(id: number, campo: "inicio" | "fin", valor: string) {
    setForm((prev) => ({ ...prev, [id]: { inicio: prev[id]?.inicio ?? "", fin: prev[id]?.fin ?? "", [campo]: valor } }));
  }

  async function programar(idCambio: number) {
    const valores = form[idCambio];
    if (!valores?.inicio || !valores?.fin) {
      setError("Indica la ventana de inicio y fin.");
      return;
    }
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    setAvisos((prev) => ({ ...prev, [idCambio]: [] }));
    try {
      const res = await fetch("/api/perfiles/gestor-cambios/programacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, ventana_inicio: valores.inicio, ventana_fin: valores.fin }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo programar.");
      else {
        const mensajes: string[] = [];
        if (json.conflictos?.solapamiento?.length) mensajes.push(`Solapamiento con ${json.conflictos.solapamiento.length} RFC`);
        if (json.conflictos?.congelamiento?.length) mensajes.push(`Coincide con período de congelamiento: ${json.conflictos.congelamiento.map((x: any) => x.nombre).join(", ")}`);
        if (json.conflictos?.feriado?.length) mensajes.push(`Coincide con feriado: ${json.conflictos.feriado.map((x: any) => x.nombre).join(", ")}`);
        setAvisos((prev) => ({ ...prev, [idCambio]: mensajes }));
        setOk(json.mensaje ?? "RFC programada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al programar.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Programación de cambios autorizados</h1>
        <p>Asigna la ventana de ejecución a las RFC aprobadas y verifica conflictos de calendario.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay RFC autorizadas por programar.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => (
            <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0 }}>
              <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                {c.tipo_cambio} · {c.estado_nombre} · {c.ci_nombre ? `CI ${c.ci_codigo}` : "sin CI"} · Responsable {c.responsable_nombre ?? "—"}
              </div>
              <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
                Ventana actual: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 10 }}>
                <label style={{ fontSize: 12, color: "#374151" }}>
                  Inicio
                  <input type="datetime-local" value={form[c.id_cambio]?.inicio ?? ""} onChange={(e) => actualizar(c.id_cambio, "inicio", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </label>
                <label style={{ fontSize: 12, color: "#374151" }}>
                  Fin
                  <input type="datetime-local" value={form[c.id_cambio]?.fin ?? ""} onChange={(e) => actualizar(c.id_cambio, "fin", e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </label>
                <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => programar(c.id_cambio)}>
                  {procesando === c.id_cambio ? "Programando..." : "Programar"}
                </button>
              </div>
              {avisos[c.id_cambio]?.length > 0 && (
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 12.5, color: "#b45309" }}>
                  {avisos[c.id_cambio].map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
