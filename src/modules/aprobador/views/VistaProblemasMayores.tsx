"use client";

import { useEffect, useState } from "react";

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  causa_raiz: string | null;
  workaround: string | null;
  solucion_definitiva: string | null;
  fecha_creacion: string;
  impacto_nombre: string | null;
  prioridad_nombre: string | null;
  estado_nombre: string | null;
  asignado_nombre: string | null;
}

export default function VistaProblemasMayores() {
  const [items, setItems] = useState<Problema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/aprobador/problemas?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los problemas.");
    } catch {
      setError("Error de conexión al cargar los problemas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(idProblema: number, decision: "APROBADO" | "RECHAZADO") {
    let riesgo = "";
    if (decision === "APROBADO") {
      riesgo = window.prompt("Describe el riesgo aceptado al autorizar el cierre:") ?? "";
      if (riesgo.trim().length < 3) {
        setError("Debes describir el riesgo aceptado.");
        return;
      }
    }
    const comentario = window.prompt("Comentario de la decisión:") ?? "";
    setProcesando(idProblema);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/aprobador/problemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_problema: idProblema, decision, riesgo_aceptado: riesgo, comentario }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la decisión.");
      else {
        setOk("Decisión registrada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la decisión.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Riesgo aceptado y cierre de problemas mayores</h1>
        <p>Autoriza el cierre de problemas de alto impacto asumiendo el riesgo residual.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay problemas mayores pendientes de cierre.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((p) => (
            <div key={p.id_problema} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 620 }}>
                  <strong style={{ fontSize: 14 }}>{p.codigo_problema} · {p.titulo}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    Impacto {p.impacto_nombre ?? "—"} · {p.prioridad_nombre ?? "—"} · Estado {p.estado_nombre ?? "—"} · Asignado {p.asignado_nombre ?? "—"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === p.id_problema} onClick={() => decidir(p.id_problema, "APROBADO")}>Aceptar riesgo y cerrar</button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === p.id_problema} onClick={() => decidir(p.id_problema, "RECHAZADO")}>Rechazar</button>
                  <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setExpandido(expandido === p.id_problema ? null : p.id_problema)}>
                    {expandido === p.id_problema ? "Ocultar" : "Detalle"}
                  </button>
                </div>
              </div>
              {expandido === p.id_problema && (
                <div style={{ marginTop: 12, fontSize: 12.5, color: "#374151", display: "grid", gap: 8 }}>
                  <div><strong>Descripción:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{p.descripcion}</p></div>
                  {p.causa_raiz && <div><strong>Causa raíz:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{p.causa_raiz}</p></div>}
                  {p.solucion_definitiva && <div><strong>Solución definitiva:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{p.solucion_definitiva}</p></div>}
                  {p.workaround && <div><strong>Workaround:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{p.workaround}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
