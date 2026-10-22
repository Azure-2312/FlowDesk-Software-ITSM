"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  descripcion: string;
  tipo_cambio: string;
  estado_nombre: string;
  justificacion: string;
  fecha_creacion: string;
  impacto_nombre: string | null;
  impacto_nivel: number | null;
  prioridad_nombre: string | null;
  prioridad_nivel: number | null;
  ci_codigo: string | null;
  ci_nombre: string | null;
  solicitante_nombre: string | null;
  evaluador_nombre: string | null;
  votos: number;
}

interface Evaluador {
  id_usuario: number;
  nombre: string;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaEvaluacionRfc() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/gestor-cambios/evaluacion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(Array.isArray(json?.cambios) ? json.cambios : []);
        setEvaluadores(Array.isArray(json?.evaluadores) ? json.evaluadores : []);
      } else setError(json.error ?? "No se pudo cargar la bandeja.");
    } catch {
      setError("Error de conexión al cargar la bandeja.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function accion(idCambio: number, cuerpo: Record<string, unknown>) {
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/gestor-cambios/evaluacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, ...cuerpo }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo procesar la acción.");
      else {
        setOk(json.mensaje ?? "Acción registrada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al procesar la acción.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Bandeja de RFC por evaluar</h1>
        <p>Asigna evaluador, revisa el riesgo y envía la RFC al circuito de autorización.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay RFC pendientes de evaluación.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => (
            <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 640 }}>
                  <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {c.tipo_cambio} · Impacto {c.impacto_nombre ?? "—"} · {c.prioridad_nombre ?? "—"} · Solicita {c.solicitante_nombre ?? "—"} · {fecha(c.fecha_creacion)}
                  </div>
                  {c.ci_nombre && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>CI afectado: {c.ci_codigo} · {c.ci_nombre}</div>}
                  <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>
                    Evaluador actual: {c.evaluador_nombre ?? "sin asignar"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <select
                    value={seleccion[c.id_cambio] ?? ""}
                    onChange={(e) => setSeleccion((prev) => ({ ...prev, [c.id_cambio]: e.target.value }))}
                    style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 12.5 }}
                  >
                    <option value="">Asignar evaluador...</option>
                    {evaluadores.map((e) => <option key={e.id_usuario} value={e.id_usuario}>{e.nombre}</option>)}
                  </select>
                  <button
                    className="boton-secundario"
                    style={{ width: "auto" }}
                    disabled={procesando === c.id_cambio || !seleccion[c.id_cambio]}
                    onClick={() => accion(c.id_cambio, { accion: "asignar", id_evaluador: Number(seleccion[c.id_cambio]) })}
                  >
                    Asignar
                  </button>
                  <button
                    className="boton-primario"
                    style={{ width: "auto" }}
                    disabled={procesando === c.id_cambio}
                    onClick={() => accion(c.id_cambio, { accion: "enviar" })}
                  >
                    Enviar a autorización
                  </button>
                  <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setExpandido(expandido === c.id_cambio ? null : c.id_cambio)}>
                    {expandido === c.id_cambio ? "Ocultar" : "Detalle"}
                  </button>
                </div>
              </div>
              {expandido === c.id_cambio && (
                <div style={{ marginTop: 12, fontSize: 12.5, color: "#374151", display: "grid", gap: 8 }}>
                  <div><strong>Descripción:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{c.descripcion}</p></div>
                  <div><strong>Justificación:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{c.justificacion}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
