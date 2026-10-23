"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  justificacion: string;
  plan_implementacion: string;
  plan_rollback: string;
  ventana_inicio: string;
  ventana_fin: string;
  fecha_creacion: string;
  impacto_nombre: string | null;
  impacto_nivel: number | null;
  prioridad_nombre: string | null;
  ci_codigo: string | null;
  ci_nombre: string | null;
  solicitante_nombre: string | null;
  es_excepcion: boolean;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaAprobacionesCambios() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/aprobaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los cambios.");
    } catch {
      setError("Error de conexión al cargar los cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(idCambio: number, decision: string) {
    const etiqueta = decision === "APROBADO_CON_CONDICIONES" ? "condiciones de la aprobación" : `comentario de la decisión (${decision})`;
    const comentario = window.prompt(`Ingresa el ${etiqueta}:`) ?? "";
    if (comentario.trim().length < 3) {
      setError("El comentario es obligatorio (mínimo 3 caracteres).");
      return;
    }
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cambios/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, decision, comentario }),
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
        <h1>Aprobaciones de cambios</h1>
        <p>Etapas Dirección y excepciones: aprobar, aprobar con condiciones, rechazar u observar.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay RFC pendientes de tu decisión.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => (
            <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ maxWidth: 620 }}>
                  <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                  {c.es_excepcion && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, backgroundColor: "#fef3c7", color: "#92400e" }}>EXCEPCIÓN</span>}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {c.tipo_cambio} · Impacto {c.impacto_nombre ?? "—"} · {c.prioridad_nombre ?? "—"} · Solicita {c.solicitante_nombre ?? "—"}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#374151", marginTop: 6 }}>
                    Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}
                  </div>
                  {c.ci_nombre && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>CI afectado: {c.ci_codigo} · {c.ci_nombre}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "APROBADO")}>Aprobar</button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "APROBADO_CON_CONDICIONES")}>Con condiciones</button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "OBSERVADO")}>Pedir información</button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "RECHAZADO")}>Rechazar</button>
                  <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setExpandido(expandido === c.id_cambio ? null : c.id_cambio)}>
                    {expandido === c.id_cambio ? "Ocultar" : "Detalle"}
                  </button>
                </div>
              </div>
              {expandido === c.id_cambio && (
                <div style={{ marginTop: 12, fontSize: 12.5, color: "#374151", display: "grid", gap: 8 }}>
                  <div><strong>Justificación:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{c.justificacion}</p></div>
                  <div><strong>Plan de implementación:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{c.plan_implementacion}</p></div>
                  <div><strong>Plan de rollback:</strong><p style={{ whiteSpace: "pre-wrap", margin: "4px 0 0" }}>{c.plan_rollback}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
