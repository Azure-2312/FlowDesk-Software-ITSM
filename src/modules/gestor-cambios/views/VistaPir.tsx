"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  resultado_pir: string | null;
  incidentes_inducidos: number | null;
  fecha_modificacion: string | null;
  fecha_creacion: string;
  dias_desde_cierre: number;
  responsable_nombre: string | null;
}

const PLAZO = 5;

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaPir() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const [form, setForm] = useState<Record<number, { resultado: string; incidentes: string }>>({});

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-cambios/pir?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudo cargar la PIR.");
    } catch {
      setError("Error de conexión al cargar la PIR.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function registrar(idCambio: number) {
    const valores = form[idCambio];
    if (!valores?.resultado || valores.resultado.trim().length < 10) {
      setError("El resultado de la PIR debe tener al menos 10 caracteres.");
      return;
    }
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-cambios/pir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, resultado: valores.resultado, incidentes_inducidos: Number(valores.incidentes) || 0 }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la PIR.");
      else {
        setOk(json.mensaje ?? "PIR registrada.");
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la PIR.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Revisión post-implementación (PIR)</h1>
        <p>Confirma resultados, registra incidentes inducidos y documenta lecciones tras el cierre del cambio.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay cambios cerrados que requieran PIR.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => {
            const dias = Math.round(Number(c.dias_desde_cierre));
            const vencida = !c.resultado_pir && dias > PLAZO;
            return (
              <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0, borderLeft: vencida ? "4px solid #b91c1c" : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ maxWidth: 640 }}>
                    <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {c.tipo_cambio} · {c.estado_nombre} · Responsable {c.responsable_nombre ?? "—"} · Cerrado {fecha(c.fecha_modificacion)}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 4, color: vencida ? "#b91c1c" : "#374151", fontWeight: vencida ? 600 : undefined }}>
                      {c.resultado_pir ? "PIR registrada" : `PIR pendiente (${dias} día(s) desde el cierre${vencida ? ", plazo excedido" : ""})`}
                    </div>
                    {c.resultado_pir && <p style={{ fontSize: 12.5, color: "#374151", whiteSpace: "pre-wrap", marginTop: 6 }}>{c.resultado_pir}</p>}
                    {c.incidentes_inducidos !== null && (
                      <div style={{ fontSize: 12, color: c.incidentes_inducidos > 0 ? "#b91c1c" : "#6b7280", marginTop: 4 }}>
                        Incidentes inducidos: {c.incidentes_inducidos}
                      </div>
                    )}
                  </div>
                  <button className="boton-secundario" style={{ width: "auto", height: "fit-content" }} onClick={() => setAbierto(abierto === c.id_cambio ? null : c.id_cambio)}>
                    {abierto === c.id_cambio ? "Cerrar" : c.resultado_pir ? "Actualizar PIR" : "Registrar PIR"}
                  </button>
                </div>
                {abierto === c.id_cambio && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                    <textarea
                      rows={4}
                      placeholder="Resultado de la revisión, cumplimiento de objetivos y lecciones aprendidas"
                      value={form[c.id_cambio]?.resultado ?? c.resultado_pir ?? ""}
                      onChange={(e) => setForm((prev) => ({ ...prev, [c.id_cambio]: { resultado: e.target.value, incidentes: prev[c.id_cambio]?.incidentes ?? String(c.incidentes_inducidos ?? 0) } }))}
                      style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                    />
                    <label style={{ fontSize: 12, color: "#374151", maxWidth: 220 }}>
                      Incidentes inducidos
                      <input
                        type="number"
                        min={0}
                        value={form[c.id_cambio]?.incidentes ?? String(c.incidentes_inducidos ?? 0)}
                        onChange={(e) => setForm((prev) => ({ ...prev, [c.id_cambio]: { resultado: prev[c.id_cambio]?.resultado ?? c.resultado_pir ?? "", incidentes: e.target.value } }))}
                        style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                      />
                    </label>
                    <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => registrar(c.id_cambio)}>
                      {procesando === c.id_cambio ? "Guardando..." : "Guardar PIR"}
                    </button>
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
